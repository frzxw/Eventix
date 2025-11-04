import { User, Mail, Phone, MapPin, Calendar, Ticket, CreditCard, Bell, Shield, LogOut, Edit2, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { PhoneInput } from '../ui/phone-input';
import { CountrySelect } from '../ui/country-select';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../lib/utils';

export function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    phone: '81234567890',
    country: 'ID',
    city: 'Jakarta',
    birthDate: '1995-06-15',
  });

  const handleSave = () => {
    setIsEditing(false);
    // Handle save logic here
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2">My Profile</h1>
          <p className="text-[var(--text-secondary)]">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="relative rounded-3xl overflow-hidden">
              {/* Glass background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
              
              {/* Gradient accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)]/5 to-[var(--accent-500)]/5" />
              
              <div className="relative p-6 sm:p-8">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent-500)] rounded-full blur-2xl opacity-30" />
                    
                    {/* Avatar container */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent-500)] p-1">
                      <div className="w-full h-full rounded-full bg-[var(--background-primary)] flex items-center justify-center">
                        <User className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--text-secondary)]" />
                      </div>
                    </div>
                    
                    {/* Edit button */}
                    <button className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent-500)] shadow-lg hover:scale-110 transition-transform">
                      <Edit2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  
                  <h2 className="text-center mb-1">{formData.name}</h2>
                  <p className="text-[var(--text-secondary)] text-sm text-center">
                    Member since 2023
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <StatBox
                    icon={<Ticket className="w-5 h-5" />}
                    label="Tickets"
                    value="24"
                  />
                  <StatBox
                    icon={<Calendar className="w-5 h-5" />}
                    label="Events"
                    value="18"
                  />
                </div>
              </div>
            </div>

            {/* Spending Overview */}
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)]/5 to-[var(--accent-500)]/5" />
              
              <div className="relative p-6">
                <h3 className="mb-4">Spending Overview</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--text-secondary)]">This Month</span>
                      <span className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        {formatCurrency(2450000)}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--surface-glass)] rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--text-secondary)]">All Time</span>
                      <span className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        {formatCurrency(18750000)}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--surface-glass)] rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)]/5 to-[var(--accent-500)]/5" />
              
              <div className="relative p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3>Personal Information</h3>
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="glass-hover rounded-full"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="glass-hover rounded-full"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 text-white rounded-full"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[var(--text-secondary)]">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-[var(--surface-glass)]/50 border-[var(--border-glass)] rounded-xl"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-glass)]/30">
                        <User className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span>{formData.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[var(--text-secondary)]">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-[var(--surface-glass)]/50 border-[var(--border-glass)] rounded-xl"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-glass)]/30">
                        <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span>{formData.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[var(--text-secondary)]">Phone Number</Label>
                    {isEditing ? (
                      <PhoneInput
                        value={formData.phone}
                        defaultCountry={formData.country}
                        onChange={(phone, countryCode) => setFormData({ ...formData, phone, country: countryCode })}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-glass)]/30">
                        <Phone className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span>+{formData.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-[var(--text-secondary)]">Country</Label>
                    {isEditing ? (
                      <CountrySelect
                        value={formData.country}
                        onChange={(countryCode) => setFormData({ ...formData, country: countryCode })}
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-glass)]/30">
                        <MapPin className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span>{formData.country}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[var(--text-secondary)]">City</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-[var(--surface-glass)]/50 border-[var(--border-glass)] rounded-xl"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-glass)]/30">
                        <MapPin className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span>{formData.city}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="birthDate" className="text-[var(--text-secondary)]">Birth Date</Label>
                    {isEditing ? (
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="bg-[var(--surface-glass)]/50 border-[var(--border-glass)] rounded-xl"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-glass)]/30">
                        <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span>{new Date(formData.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)]/5 to-[var(--accent-500)]/5" />
              
              <div className="relative p-6 sm:p-8">
                <h3 className="mb-6">Preferences</h3>
                
                <div className="space-y-6">
                  <SettingItem
                    icon={<Bell className="w-5 h-5" />}
                    title="Email Notifications"
                    description="Receive updates about new events and promotions"
                  />
                  
                  <Separator className="bg-[var(--border-glass)]" />
                  
                  <SettingItem
                    icon={<Ticket className="w-5 h-5" />}
                    title="Event Reminders"
                    description="Get reminded 24 hours before your events"
                  />
                  
                  <Separator className="bg-[var(--border-glass)]" />
                  
                  <SettingItem
                    icon={<CreditCard className="w-5 h-5" />}
                    title="Save Payment Methods"
                    description="Securely save cards for faster checkout"
                  />
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)]/5 to-[var(--accent-500)]/5" />
              
              <div className="relative p-6 sm:p-8">
                <h3 className="mb-6">Account</h3>
                
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start glass-hover rounded-xl h-auto py-3"
                  >
                    <Shield className="w-5 h-5 mr-3 text-[var(--text-secondary)]" />
                    <div className="text-left">
                      <div>Security Settings</div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        Change password and enable 2FA
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start glass-hover rounded-xl h-auto py-3"
                    onClick={() => navigate('/my-tickets')}
                  >
                    <Ticket className="w-5 h-5 mr-3 text-[var(--text-secondary)]" />
                    <div className="text-left">
                      <div>My Tickets</div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        View all your purchased tickets
                      </div>
                    </div>
                  </Button>
                  
                  <Separator className="bg-[var(--border-glass)]" />
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start glass-hover rounded-xl h-auto py-3 text-red-400 hover:text-red-300"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div>Sign Out</div>
                      <div className="text-sm opacity-70">
                        Sign out from your account
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatBox({ icon, label, value }: StatBoxProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-[var(--surface-glass)]/50 border border-[var(--border-glass)]" />
      <div className="relative p-4 text-center">
        <div className="flex justify-center mb-2 text-[var(--primary-400)]">
          {icon}
        </div>
        <div className="mb-1" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          {value}
        </div>
        <div className="text-xs text-[var(--text-secondary)]">{label}</div>
      </div>
    </div>
  );
}

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SettingItem({ icon, title, description }: SettingItemProps) {
  const [enabled, setEnabled] = useState(true);
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-xl bg-[var(--surface-glass)]/50 text-[var(--primary-400)]">
          {icon}
        </div>
        <div>
          <div className="mb-1" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            {title}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            {description}
          </div>
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={setEnabled}
      />
    </div>
  );
}
