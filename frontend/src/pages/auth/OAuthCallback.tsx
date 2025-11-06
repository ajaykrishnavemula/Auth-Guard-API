import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Loading from '../../components/common/Loading';
import { XCircle } from 'lucide-react';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const userStr = searchParams.get('user');
    const errorMsg = searchParams.get('error');

    if (errorMsg) {
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        login(user, token, refreshToken || '');
        toast.success('Successfully logged in!');
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to process authentication data');
        toast.error('Failed to process authentication data');
      }
    } else {
      setError('Missing authentication data');
      toast.error('Missing authentication data');
    }
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentication Failed</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center">
        <Loading size="lg" />
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Completing Authentication...</h2>
        <p className="text-gray-600 mt-2">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;


