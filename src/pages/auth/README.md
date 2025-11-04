# Authentication Pages

Complete authentication system for Eventix with glassmorphic design.

## Pages

### 1. Login Page (`/auth/login`)
- Email and password login
- Show/hide password toggle
- Remember me checkbox
- Social login options (Google, Facebook, Apple)
- Link to signup and forgot password
- Form validation

**Features:**
- Glassmorphic design with animated backgrounds
- Social authentication placeholders
- Accessible form controls
- Smooth animations and transitions

### 2. Sign Up Page (`/auth/signup`)
- Full name (first & last)
- Email address
- Phone number with country selector
- Password with strength indicator
- Confirm password with match validation
- Terms and conditions checkbox
- Social signup options

**Features:**
- Real-time password strength meter (4 levels)
- Password match validation
- Visual feedback for all inputs
- Responsive grid layout
- Phone input with international support

### 3. Forgot Password Page (`/auth/forgot-password`)
- Email input to receive reset link
- Success state with instructions
- Resend email option
- Back to login link

**Features:**
- Two-state UI (form → success)
- Clear instructions
- Email resend functionality
- Animated transitions

### 4. Reset Password Page (`/auth/reset-password`)
- New password input
- Confirm password input
- Password strength indicator
- Password requirements checklist
- Success state after reset

**Features:**
- Token-based validation (from URL params)
- Real-time password requirements validation
- Visual password strength meter
- Auto-redirect to login on success
- Error handling for invalid/expired tokens

### 5. Verify Email Page (`/auth/verify-email`)
- Email verification instructions
- Resend verification email (with cooldown)
- Change email option
- Auto-verification via token

**Features:**
- Three states: pending → verifying → verified
- Countdown timer for resend (60 seconds)
- Email passed via location state or URL param
- Clear step-by-step instructions

## Navigation

All authentication pages include a **"Back to Events"** button in the top-left corner:

- **Fixed position** - Always visible during scroll
- **Glassmorphic style** - Matches the design system
- **Responsive** - Shows icon only on mobile, full text on desktop
- **Returns to homepage** - Allows users to continue browsing events without completing auth
- **Smooth transitions** - Consistent hover and click effects

This ensures users never feel "trapped" in the authentication flow and can easily return to discovering and booking tickets.

## Design System

All authentication pages follow the Eventix glassmorphic design system:

- **Glass panels** with backdrop blur
- **Gradient backgrounds** with animated blobs
- **Consistent spacing** and typography
- **Smooth animations** using Motion (Framer Motion)
- **Semantic tokens** for colors and effects
- **Accessibility** features (ARIA labels, keyboard navigation)
- **Fixed back button** for easy navigation

## Routes

```tsx
/auth/login              - Login page
/auth/signup             - Sign up page
/auth/forgot-password    - Forgot password page
/auth/reset-password     - Reset password page (with ?token=xxx)
/auth/verify-email       - Email verification page
```

## Component Features

### Common Elements
- Social login buttons (Google, Facebook, Apple)
- Password visibility toggle
- Form validation with error messages
- Loading states
- Toast notifications
- Responsive design

### Security Features
- Password strength validation
- Email format validation
- Token-based password reset
- Email verification
- Terms and conditions agreement

## Integration Notes

The authentication pages are:
- **Standalone** - No header/footer (clean auth experience)
- **Animated** - Page transitions using Motion
- **Accessible** - ARIA labels and keyboard navigation
- **Responsive** - Mobile-first design
- **Mock Implementation** - Ready for backend integration

## Future Enhancements

- [ ] Connect to real authentication API
- [ ] Add OAuth providers (Google, Facebook, Apple)
- [ ] Implement session management
- [ ] Add two-factor authentication (2FA)
- [ ] Add biometric authentication
- [ ] Remember device option
- [ ] Account lockout after failed attempts
- [ ] Email verification reminders
- [ ] Password expiration policies
