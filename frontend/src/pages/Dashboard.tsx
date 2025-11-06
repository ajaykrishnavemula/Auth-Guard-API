import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Card from '../components/common/Card';
import { 
  User, 
  Shield, 
  Activity, 
  Settings,
  Mail,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const quickStats = [
    {
      title: 'Account Status',
      value: user?.isEmailVerified ? 'Verified' : 'Unverified',
      icon: user?.isEmailVerified ? CheckCircle : XCircle,
      color: user?.isEmailVerified ? 'text-green-600' : 'text-yellow-600',
      bgColor: user?.isEmailVerified ? 'bg-green-100' : 'bg-yellow-100',
    },
    {
      title: '2FA Status',
      value: user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled',
      icon: Shield,
      color: user?.isTwoFactorEnabled ? 'text-green-600' : 'text-gray-600',
      bgColor: user?.isTwoFactorEnabled ? 'bg-green-100' : 'bg-gray-100',
    },
    {
      title: 'Last Login',
      value: user?.lastLogin 
        ? new Date(user.lastLogin).toLocaleDateString()
        : 'N/A',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Account Role',
      value: user?.role === 'admin' ? 'Administrator' : 'User',
      icon: User,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const quickActions = [
    {
      title: 'Edit Profile',
      description: 'Update your personal information',
      icon: User,
      link: '/profile',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Security Settings',
      description: 'Manage passwords and 2FA',
      icon: Shield,
      link: '/security',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Activity Log',
      description: 'View your account activity',
      icon: Activity,
      link: '/activity',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Account Settings',
      description: 'Configure your preferences',
      icon: Settings,
      link: '/settings',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {greeting}, {user?.name}!
        </h1>
        <p className="text-blue-100">
          Welcome back to your dashboard. Here's an overview of your account.
        </p>
      </div>

      {/* Email Verification Alert */}
      {!user?.isEmailVerified && (
        <Card className="border-yellow-200 bg-yellow-50">
          <div className="flex items-start">
            <Mail className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Verify Your Email</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please verify your email address to access all features.
              </p>
              <button className="mt-2 text-sm font-medium text-yellow-900 hover:text-yellow-800 underline">
                Resend verification email
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg ${action.bgColor}`}>
                      <Icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Account Info */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Name</span>
            <span className="font-medium text-gray-900">{user?.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Role</span>
            <span className="font-medium text-gray-900 capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Member Since</span>
            <span className="font-medium text-gray-900">
              {user?.createdAt 
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'N/A'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;


