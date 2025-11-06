import { useState } from 'react';
import { Card, Input, Button, Alert, Modal } from '../../components/common';
import authService from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { Shield, Lock, Smartphone, Key } from 'lucide-react';

const Security = () => {
  const { user, updateUser } = useAuthStore();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setIsPasswordLoading(true);

    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setIs2FALoading(true);
    setTwoFAError('');

    try {
      const response = await authService.setupTwoFactor();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setIs2FAModalOpen(true);
    } catch (err: any) {
      setTwoFAError(err.response?.data?.message || 'Failed to setup 2FA.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setTwoFAError('Please enter a valid 6-digit code');
      return;
    }

    setIs2FALoading(true);
    setTwoFAError('');

    try {
      await authService.verifyTwoFactor(user?.email || '', verificationCode);
      const updatedUser = await authService.getCurrentUser();
      updateUser(updatedUser);
      setIs2FAModalOpen(false);
      setVerificationCode('');
    } catch (err: any) {
      setTwoFAError(err.response?.data?.message || 'Invalid verification code.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication?')) {
      return;
    }

    setIs2FALoading(true);

    try {
      await authService.disableTwoFactor(verificationCode);
      const updatedUser = await authService.getCurrentUser();
      updateUser(updatedUser);
    } catch (err: any) {
      setTwoFAError(err.response?.data?.message || 'Failed to disable 2FA.');
    } finally {
      setIs2FALoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account security and authentication</p>
      </div>

      {/* Change Password */}
      <Card title="Change Password" subtitle="Update your password regularly for better security">
        {passwordError && (
          <Alert type="error" message={passwordError} onClose={() => setPasswordError('')} className="mb-4" />
        )}
        {passwordSuccess && (
          <Alert type="success" message={passwordSuccess} onClose={() => setPasswordSuccess('')} className="mb-4" />
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Enter current password"
            required
            disabled={isPasswordLoading}
          />

          <Input
            label="New Password"
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder="At least 8 characters"
            required
            disabled={isPasswordLoading}
            helperText="Must be at least 8 characters long"
          />

          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Re-enter new password"
            required
            disabled={isPasswordLoading}
          />

          <div className="flex justify-end">
            <Button type="submit" isLoading={isPasswordLoading}>
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Two-Factor Authentication */}
      <Card
        title="Two-Factor Authentication"
        subtitle="Add an extra layer of security to your account"
      >
        {twoFAError && (
          <Alert type="error" message={twoFAError} onClose={() => setTwoFAError('')} className="mb-4" />
        )}

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${user?.isTwoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Smartphone className={`w-6 h-6 ${user?.isTwoFactorEnabled ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <p className="font-medium text-gray-900">2FA Status</p>
              <p className={`text-sm ${user?.isTwoFactorEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          {user?.isTwoFactorEnabled ? (
            <Button
              variant="danger"
              onClick={handleDisable2FA}
              isLoading={is2FALoading}
            >
              Disable 2FA
            </Button>
          ) : (
            <Button onClick={handleSetup2FA} isLoading={is2FALoading}>
              <Shield className="w-4 h-4 mr-2" />
              Enable 2FA
            </Button>
          )}
        </div>
      </Card>

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        title="Setup Two-Factor Authentication"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            {qrCode && (
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Or enter this code manually:</p>
            <code className="block text-center font-mono text-lg font-semibold text-gray-900 break-all">
              {secret}
            </code>
          </div>

          {twoFAError && <Alert type="error" message={twoFAError} />}

          <Input
            label="Verification Code"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIs2FAModalOpen(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify2FA}
              isLoading={is2FALoading}
              fullWidth
            >
              <Key className="w-4 h-4 mr-2" />
              Verify & Enable
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Security;


