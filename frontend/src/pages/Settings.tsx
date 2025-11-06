import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import authService from '../services/auth.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Settings as SettingsIcon, Save, Bell, Palette, Globe } from 'lucide-react';

interface PreferencesForm {
  emailNotifications: boolean;
  marketingEmails: boolean;
  twoFactorMethod: 'app' | 'sms' | 'email';
  theme: 'light' | 'dark' | 'system';
}

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch } = useForm<PreferencesForm>({
    defaultValues: {
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      marketingEmails: user?.preferences?.marketingEmails ?? false,
      twoFactorMethod: user?.preferences?.twoFactorMethod || 'app',
      theme: user?.preferences?.theme || 'system',
    }
  });

  const theme = watch('theme');

  const onSubmit = async (data: PreferencesForm) => {
    setIsLoading(true);
    try {
      await authService.updatePreferences({
        preferences: {
          emailNotifications: data.emailNotifications,
          marketingEmails: data.marketingEmails,
          twoFactorMethod: data.twoFactorMethod,
          theme: data.theme,
        }
      });
      
      const updatedUser = await authService.getCurrentUser();
      updateUser(updatedUser);
      toast.success('Settings updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences</p>
        </div>
        <div className="p-3 bg-orange-100 rounded-lg">
          <SettingsIcon className="w-8 h-8 text-orange-600" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Notifications */}
        <Card>
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email notifications about your account activity</p>
              </div>
              <input
                type="checkbox"
                {...register('emailNotifications')}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Marketing Emails</p>
                <p className="text-sm text-gray-600">Receive emails about new features and updates</p>
              </div>
              <input
                type="checkbox"
                {...register('marketingEmails')}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>
          </div>
        </Card>

        {/* Appearance */}
        <Card>
          <div className="flex items-center mb-4">
            <Palette className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Theme Preference
              </label>
              <div className="grid grid-cols-3 gap-4">
                <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  theme === 'light' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value="light"
                    {...register('theme')}
                    className="sr-only"
                  />
                  <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg mb-2"></div>
                  <span className="text-sm font-medium text-gray-900">Light</span>
                </label>

                <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  theme === 'dark' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value="dark"
                    {...register('theme')}
                    className="sr-only"
                  />
                  <div className="w-12 h-12 bg-gray-900 border-2 border-gray-700 rounded-lg mb-2"></div>
                  <span className="text-sm font-medium text-gray-900">Dark</span>
                </label>

                <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  theme === 'system' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value="system"
                    {...register('theme')}
                    className="sr-only"
                  />
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-900 border-2 border-gray-400 rounded-lg mb-2"></div>
                  <span className="text-sm font-medium text-gray-900">System</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Security Preferences */}
        <Card>
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Security Preferences</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Two-Factor Authentication Method
              </label>
              <select
                {...register('twoFactorMethod')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="app">Authenticator App (Recommended)</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
              <p className="text-sm text-gray-600 mt-2">
                Choose your preferred method for two-factor authentication
              </p>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <SettingsIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="font-semibold text-blue-900">About Settings</h3>
            <p className="text-sm text-blue-700 mt-1">
              These settings control how you interact with the application. Changes are saved
              automatically and will take effect immediately.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;


