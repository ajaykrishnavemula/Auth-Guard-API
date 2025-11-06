import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import authService from '../services/auth.service';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Shield, Lock, Smartphone, Key, AlertTriangle } from 'lucide-react';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Security = () => {
  const { user, updateUser } = useAuthStore();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ChangePasswordForm>();
  const newPassword = watch('newPassword');

  const onChangePassword = async (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully!');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSetup2FA = async () => {
    setIsSettingUp2FA(true);
    try {
      const response = await authService.setupTwoFactor();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setShow2FAModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to setup 2FA');
    } finally {
      setIsSettingUp2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      await authService.verifyTwoFactor(user?.email || '', verificationCode);
      const updatedUser = await authService.getCurrentUser();
      updateUser(updatedUser);
      toast.success('Two-factor authentication enabled!');
      setShow2FAModal(false);
      setVerificationCode('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    }
  };

  const handleDisable2FA = async () => {
    const code = prompt('Enter your 2FA code to disable:');
    if (!code) return;

    try {
      await authService.disableTwoFactor(code);
      const updatedUser = await authService.getCurrentUser();
      updateUser(updatedUser);
      toast.success('Two-factor authentication disabled');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account security and authentication</p>
        </div>
        <div className="p-3 bg-green-100 rounded-lg">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
      </div>

      {/* Security Status */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Status</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${user?.isEmailVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Key className={`w-5 h-5 ${user?.isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Email Verification</p>
                <p className="text-sm text-gray-600">
                  {user?.isEmailVerified ? 'Your email is verified' : 'Please verify your email'}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.isEmailVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user?.isEmailVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${user?.isTwoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Smartphone className={`w-5 h-5 ${user?.isTwoFactorEnabled ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">
                  {user?.isTwoFactorEnabled ? 'Extra security is enabled' : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.isTwoFactorEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card>
        <div className="flex items-center mb-4">
          <Lock className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </div>
        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            {...register('currentPassword', {
              required: 'Current password is required'
            })}
            error={errors.currentPassword?.message}
            disabled={isChangingPassword}
          />

          <Input
            label="New Password"
            type="password"
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: 'Password must contain uppercase, lowercase, number, and special character'
              }
            })}
            error={errors.newPassword?.message}
            disabled={isChangingPassword}
          />

          <Input
            label="Confirm New Password"
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === newPassword || 'Passwords do not match'
            })}
            error={errors.confirmPassword?.message}
            disabled={isChangingPassword}
          />

          <Button
            type="submit"
            isLoading={isChangingPassword}
          >
            Change Password
          </Button>
        </form>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <div className="flex items-center mb-4">
          <Smartphone className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Add an extra layer of security to your account by enabling two-factor authentication.
        </p>
        {user?.isTwoFactorEnabled ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Two-factor authentication is currently enabled on your account.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={handleDisable2FA}
            >
              Disable 2FA
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleSetup2FA}
            isLoading={isSettingUp2FA}
          >
            Enable 2FA
          </Button>
        )}
      </Card>

      {/* Security Recommendations */}
      <Card>
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Security Recommendations</h2>
        </div>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✓</span>
            <span className="text-gray-700">Use a strong, unique password</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✓</span>
            <span className="text-gray-700">Enable two-factor authentication</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✓</span>
            <span className="text-gray-700">Verify your email address</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✓</span>
            <span className="text-gray-700">Review your account activity regularly</span>
          </li>
        </ul>
      </Card>

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        title="Setup Two-Factor Authentication"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
          {qrCode && (
            <div className="flex justify-center">
              <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
            </div>
          )}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Or enter this code manually:</p>
            <code className="text-sm font-mono text-gray-900">{secret}</code>
          </div>
          <Input
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
          />
          <div className="flex gap-3">
            <Button
              onClick={handleVerify2FA}
              className="flex-1"
            >
              Verify & Enable
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShow2FAModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Security;


