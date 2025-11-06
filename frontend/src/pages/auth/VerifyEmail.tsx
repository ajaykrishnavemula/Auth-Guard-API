import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authService from '../../services/auth.service';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { CheckCircle, XCircle, Mail } from 'lucide-react';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await authService.verifyEmail(verificationToken);
      setStatus('success');
      setMessage(response.message || 'Email verified successfully!');
      toast.success('Email verified successfully!');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to verify email');
      toast.error('Failed to verify email');
    }
  };

  const handleResendVerification = async () => {
    const email = prompt('Please enter your email address:');
    if (!email) return;

    try {
      await authService.resendVerification(email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    }
  };

  if (status === 'loading') {
    return (
      <div className="w-full max-w-md">
        <div className="text-center">
          <Loading size="lg" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Verifying Email...</h2>
          <p className="text-gray-600 mt-2">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h2>
          <p className="text-gray-600 mb-8">{message}</p>
          <Button
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h2>
        <p className="text-gray-600 mb-8">{message}</p>
        
        <div className="space-y-4">
          <Button
            onClick={handleResendVerification}
            variant="secondary"
            className="w-full"
          >
            <Mail className="w-4 h-4 mr-2" />
            Resend Verification Email
          </Button>
          
          <Link
            to="/login"
            className="block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;


