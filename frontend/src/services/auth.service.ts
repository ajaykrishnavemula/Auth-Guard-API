import api from './api';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ApiResponse,
  PasswordResetData,
  ChangePasswordData,
  UpdateProfileData,
  UpdatePreferencesData,
  TwoFactorSetupResponse,
} from '../types';

class AuthService {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/verify-email', { token });
    return response.data;
  }

  // Resend verification email
  async resendVerification(email: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/resend-verification', { email });
    return response.data;
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/forgot-password', { email });
    return response.data;
  }

  // Reset password
  async resetPassword(data: PasswordResetData): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/reset-password', data);
    return response.data;
  }

  // Change password
  async changePassword(data: ChangePasswordData): Promise<ApiResponse> {
    const response = await api.patch<ApiResponse>('/auth/change-password', data);
    return response.data;
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ success: boolean; user: User }>('/auth/me');
    return response.data.user;
  }

  // Update profile
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.patch<{ success: boolean; user: User }>('/auth/update-profile', data);
    return response.data.user;
  }

  // Update preferences
  async updatePreferences(data: UpdatePreferencesData): Promise<ApiResponse> {
    const response = await api.patch<ApiResponse>('/auth/update-preferences', data);
    return response.data;
  }

  // Setup 2FA
  async setupTwoFactor(): Promise<TwoFactorSetupResponse> {
    const response = await api.post<TwoFactorSetupResponse>('/auth/setup-2fa');
    return response.data;
  }

  // Verify 2FA
  async verifyTwoFactor(email: string, token: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/verify-2fa', { email, token });
    return response.data;
  }

  // Disable 2FA
  async disableTwoFactor(token: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/disable-2fa', { token });
    return response.data;
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await api.post<{ success: boolean; token: string; refreshToken: string }>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
    };
  }

  // OAuth login
  initiateGoogleLogin(): void {
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  }

  initiateGithubLogin(): void {
    window.location.href = `${api.defaults.baseURL}/auth/github`;
  }

  // Store auth data
  storeAuthData(token: string, refreshToken: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();


