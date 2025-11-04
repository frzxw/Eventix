/**
 * Azure Functions API Service Layer
 * Handles all HTTP communication with Azure Functions backend
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API, AUTH, ENVIRONMENT } from '../constants';
import { logger } from './logger';

// Request interceptor for adding auth tokens
type RequestConfig = AxiosRequestConfig & {
  _retry?: number;
};

class AzureApiClient {
  private client: AxiosInstance;
  private requestCount = 0;
  private circuitBreakerOpen = false;
  private circuitBreakerFailures = 0;
  private lastCircuitBreakerCheck = Date.now();

  constructor() {
    this.client = axios.create({
      baseURL: API.BASE_URL,
      timeout: API.TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0',
        'X-Platform': 'web',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const token = this.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: unknown) => Promise.reject(error)
    );

    // Response interceptor - handle auth errors and retries
    this.client.interceptors.response.use(
      (response: unknown) => {
        // Reset circuit breaker on success
        this.circuitBreakerFailures = 0;
        return response;
      },
      async (error: unknown) => {
        const axiosError = error as AxiosError;
        const config = axiosError.config as RequestConfig;

        // Check circuit breaker
        if (this.isCircuitBreakerOpen()) {
          const circuitBreakerError = new Error('Service temporarily unavailable. Circuit breaker is open.');
          logger.error('Circuit breaker open', { error: circuitBreakerError });
          return Promise.reject(circuitBreakerError);
        }

        // Track failures for circuit breaker
        this.circuitBreakerFailures++;
        if (this.circuitBreakerFailures >= API.CIRCUIT_BREAKER_THRESHOLD) {
          this.circuitBreakerOpen = true;
          this.lastCircuitBreakerCheck = Date.now();
          logger.warn('Circuit breaker opened due to multiple failures');
        }

        // Handle 401 Unauthorized - refresh token
        if (axiosError.response?.status === 401 && !(config?._retry)) {
          config._retry = 1;
          
          const refreshToken = this.getRefreshToken();
          if (refreshToken) {
            try {
              const response = await this.client.post('/auth/refresh', {
                refreshToken,
              });
              
              const { token, refreshToken: newRefreshToken } = response.data;
              this.setAuthToken(token);
              this.setRefreshToken(newRefreshToken);
              
              // Retry original request
              if (config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(config);
            } catch (refreshError) {
              // Refresh failed, clear tokens and redirect to login
              this.clearAuthTokens();
              window.location.href = '/auth/login';
              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token, redirect to login
            window.location.href = '/auth/login';
          }
        }

        // Retry on network errors or 5xx errors
        const retryCount = config?._retry ?? 0;
        const isNetworkError = (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ENOTFOUND');
        const isServerError = (axiosError.response?.status ?? 0) >= 500;
        
        if (retryCount < API.RETRY_ATTEMPTS && (isNetworkError || isServerError)) {
          config._retry = retryCount + 1;
          const delay = API.RETRY_DELAY_MS * Math.pow(2, (config._retry ?? 1) - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  // ==================== Auth Token Management ====================

  private getAuthToken(): string | null {
    return localStorage.getItem(AUTH.TOKEN_STORAGE_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(AUTH.REFRESH_TOKEN_STORAGE_KEY);
  }

  private setAuthToken(token: string): void {
    localStorage.setItem(AUTH.TOKEN_STORAGE_KEY, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(AUTH.REFRESH_TOKEN_STORAGE_KEY, token);
  }

  private clearAuthTokens(): void {
    localStorage.removeItem(AUTH.TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH.REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH.USER_STORAGE_KEY);
  }

  // ==================== Circuit Breaker ====================

  private isCircuitBreakerOpen(): boolean {
    if (!this.circuitBreakerOpen) return false;

    // Check if timeout has passed to attempt reset
    const timeSinceOpen = Date.now() - this.lastCircuitBreakerCheck;
    if (timeSinceOpen > API.CIRCUIT_BREAKER_TIMEOUT_MS) {
      this.circuitBreakerOpen = false;
      this.circuitBreakerFailures = 0;
      logger.info('Circuit breaker reset');
      return false;
    }

    return true;
  }

  // ==================== API Methods ====================

  // -------- Authentication --------
  async signup(email: string, password: string, firstName: string, lastName: string) {
    const response = await this.client.post('/auth/signup', {
      email,
      password,
      firstName,
      lastName,
    });
    
    const { token, refreshToken, user } = response.data;
    this.setAuthToken(token);
    this.setRefreshToken(refreshToken);
    localStorage.setItem(AUTH.USER_STORAGE_KEY, JSON.stringify(user));
    
    logger.info('User signed up successfully', { userId: user.id });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    
    const { token, refreshToken, user } = response.data;
    this.setAuthToken(token);
    this.setRefreshToken(refreshToken);
    localStorage.setItem(AUTH.USER_STORAGE_KEY, JSON.stringify(user));
    
    logger.info('User logged in successfully', { userId: user.id });
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      logger.warn('Logout API failed, clearing local tokens');
    }
    
    this.clearAuthTokens();
  }

  async verifyEmail(token: string) {
    const response = await this.client.post('/auth/verify-email', { token });
    logger.info('Email verified successfully');
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email });
    logger.info('Password reset email sent', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.client.post('/auth/reset-password', {
      token,
      newPassword,
    });
    logger.info('Password reset successfully');
    return response.data;
  }

  // -------- Events --------
  async getEvents(params?: {
    category?: string;
    city?: string;
    date?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const response = await this.client.get('/events', { params });
    logger.debug('Events fetched', { count: response.data.events?.length });
    return response.data;
  }

  async getEventById(eventId: string) {
    const response = await this.client.get(`/events/${eventId}`);
    logger.debug('Event fetched', { eventId });
    return response.data;
  }

  async getFeaturedEvents() {
    const response = await this.client.get('/events/featured');
    logger.debug('Featured events fetched', { count: response.data.events?.length });
    return response.data;
  }

  async searchEvents(query: string) {
    const response = await this.client.get('/events/search', {
      params: { q: query },
    });
    logger.debug('Events searched', { query, count: response.data.events?.length });
    return response.data;
  }

  // -------- Orders --------
  async createOrder(eventId: string, tickets: any[], attendeeInfo: any) {
    const response = await this.client.post('/orders/create', {
      eventId,
      tickets,
      attendeeInfo,
    });
    
    logger.info('Order created', { orderId: response.data.orderId });
    return response.data;
  }

  async confirmOrder(orderId: string, paymentReference: string) {
    const response = await this.client.post(`/orders/${orderId}/confirm`, {
      paymentReference,
    });
    
    logger.info('Order confirmed', { orderId });
    return response.data;
  }

  async getOrder(orderId: string) {
    const response = await this.client.get(`/orders/${orderId}`);
    return response.data;
  }

  async getMyOrders(params?: { status?: string; page?: number }) {
    const response = await this.client.get('/orders/my-orders', { params });
    logger.debug('Orders fetched', { count: response.data.orders?.length });
    return response.data;
  }

  async cancelOrder(orderId: string, reason?: string) {
    const response = await this.client.post(`/orders/${orderId}/cancel`, { reason });
    logger.info('Order cancelled', { orderId });
    return response.data;
  }

  // -------- Tickets --------
  async getMyTickets(params?: { page?: number; limit?: number }) {
    const response = await this.client.get('/tickets/my-tickets', { params });
    logger.debug('Tickets fetched', { count: response.data.tickets?.length });
    return response.data;
  }

  async getTicketById(ticketId: string) {
    const response = await this.client.get(`/tickets/${ticketId}`);
    return response.data;
  }

  async downloadTicketPDF(ticketId: string) {
    const response = await this.client.get(`/tickets/${ticketId}/download`, {
      responseType: 'blob',
    });
    logger.info('Ticket PDF downloaded', { ticketId });
    return response.data;
  }

  async transferTicket(ticketId: string, toEmail: string) {
    const response = await this.client.post(`/tickets/${ticketId}/transfer`, {
      toEmail,
    });
    
    logger.info('Ticket transferred', { ticketId, toEmail });
    return response.data;
  }

  // -------- User Profile --------
  async getProfile() {
    const response = await this.client.get('/users/profile');
    return response.data;
  }

  async updateProfile(updates: any) {
    const response = await this.client.put('/users/profile', updates);
    logger.info('Profile updated');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.client.post('/users/change-password', {
      currentPassword,
      newPassword,
    });
    logger.info('Password changed');
    return response.data;
  }

  // -------- File Upload --------
  async uploadImage(file: File, container: 'events' | 'qr-codes') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('container', container);

    const response = await this.client.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    logger.info('Image uploaded', { fileName: file.name, url: response.data.url });
    return response.data;
  }

  // -------- Health Check --------
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      logger.error('Health check failed', { error });
      throw error;
    }
  }

  // ==================== Utility Methods ====================

  getClient() {
    return this.client;
  }

  setBaseURL(url: string) {
    this.client.defaults.baseURL = url;
  }
}

// Export singleton instance
export const azureApi = new AzureApiClient();
