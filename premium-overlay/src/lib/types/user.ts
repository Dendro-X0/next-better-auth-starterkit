// User data types and utilities
export interface UserProfile {
  id: string
  username: string
  email: string
  name?: string
  phoneNumber?: string
  phoneNumberVerified?: boolean
  bio?: string
  avatar?: string
  location?: string
  website?: string
  createdAt: string
  updatedAt: string
  emailVerified: boolean
}

export interface UserSettings {
  hasPassword?: boolean;
  twoFactorEnabled: boolean
  backupCodes?: string[]
  trustedDevices: TrustedDevice[]
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface TrustedDevice {
  id: string
  name: string
  lastUsed: string
  userAgent: string
}

export interface NotificationSettings {
  email: {
    security: boolean
    marketing: boolean
    updates: boolean
  }
  push: {
    security: boolean
    mentions: boolean
    updates: boolean
  }
}

export interface PrivacySettings {
  profileVisibility: "public" | "private"
  showEmail: boolean
  showLocation: boolean
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// User data provider interface for backend integration
export interface UserDataProvider {
  getProfile(userId: string): Promise<{ profile?: UserProfile; error?: string }>
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<{ success: boolean; error?: string }>
  getSettings(userId: string): Promise<{ settings?: UserSettings; error?: string }>
  updateSettings(userId: string, data: Partial<UserSettings>): Promise<{ success: boolean; error?: string }>
  changePassword(userId: string, data: PasswordChangeData): Promise<{ success: boolean; error?: string }>
  uploadAvatar(userId: string, file: File): Promise<{ avatarUrl?: string; error?: string }>
  enable2FA(userId: string): Promise<{ qrCode?: string; backupCodes?: string[]; error?: string }>
  disable2FA(userId: string): Promise<{ success: boolean; error?: string }>
  generateBackupCodes(userId: string): Promise<{ codes?: string[]; error?: string }>
}

// Validation utilities
export const validateProfileData = (
  data: Partial<UserProfile>,
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}

  if (data.username && (data.username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(data.username))) {
    errors.username = "Username must be at least 3 characters and contain only letters, numbers, and underscores"
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address"
  }

  if (data.website && data.website && !/^https?:\/\/.+/.test(data.website)) {
    errors.website = "Website must be a valid URL starting with http:// or https://"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
