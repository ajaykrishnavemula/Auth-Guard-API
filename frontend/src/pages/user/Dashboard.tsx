import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, Loading, Alert } from '../../components/common';
import { User, Shield, Activity, Clock } from 'lucide-react';
import { type Activity as ActivityType } from '../../types';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      // TODO: Implement getActivities method in authService
      // const data = await authService.getActivities();
      // setActivities(data.slice(0, 5));
      setActivities([]);
    } catch (err: any) {
      setError('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      icon: User,
      label: 'Account Status',
      value: user?.isEmailVerified ? 'Verified' : 'Unverified',
      color: user?.isEmailVerified ? 'text-green-600' : 'text-yellow-600',
      bgColor: user?.isEmailVerified ? 'bg-green-100' : 'bg-yellow-100',
    },
    {
      icon: Shield,
      label: '2FA Status',
      value: user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled',
      color: user?.isTwoFactorEnabled ? 'text-green-600' : 'text-gray-600',
      bgColor: user?.isTwoFactorEnabled ? 'bg-green-100' : 'bg-gray-100',
    },
    {
      icon: Activity,
      label: 'Active Sessions',
      value: '1',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Clock,
      label: 'Last Login',
      value: user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your account</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Account Info */}
      <Card title="Account Information">
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Role</span>
            <span className="font-medium text-gray-900 capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Member Since</span>
            <span className="font-medium text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-600">Email Verified</span>
            <span
              className={`font-medium ${
                user?.isEmailVerified ? 'text-green-600' : 'text-yellow-600'
              }`}
            >
              {user?.isEmailVerified ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Activity" subtitle="Your last 5 account activities">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <Alert type="error" message={error} />
        ) : activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activities</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Activity className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.ipAddress}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;


