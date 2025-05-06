export interface Branch {
  id: string;
  name: string;
  address: string;
}

export interface UserPreferences {
  language: 'en' | 'fr' | 'es';
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  jobTitle?: string;
  profileImage?: string;
  role: string;
  branch?: Branch;
  preferences?: UserPreferences;
}