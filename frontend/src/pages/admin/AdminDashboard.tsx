import { useState, useEffect } from 'react';
import { Card, Loading, Alert } from '../../components/common';
import { Users, UserCheck, UserPlus, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { type AdminStats } from '../../types';

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Implement getAdminStats in a service
      // const data = await adminService.getStats();
      // setStats(data);
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
        failedLoginAttempts: 0,
        twoFactorEnabled: 0,
        emailVerified: 0,
      });
    } catch (err: any) {
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: UserCheck,
      label: 'Active Users',
      value: stats?.activeUsers || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: UserPlus,
      label: 'New This Month',
      value: stats?.newUsersThisMonth || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Shield,
      label: '2FA Enabled',
      value: stats?.twoFactorEnabled || 0,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      icon: UserCheck,
      label: 'Email Verified',
      value: stats?.emailVerified || 0,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
    {
      icon: AlertTriangle,
      label: 'Failed Logins',
      value: stats?.failedLoginAttempts || 0,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  if (isLoading) {
    return <Loading size="lg" text="Loading dashboard..." />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of system statistics and user metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Growth Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="New Users Today">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{stats?.newUsersToday || 0}</p>
              <p className="text-sm text-gray-600">Registered today</p>
            </div>
          </div>
        </Card>

        <Card title="New Users This Week">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{stats?.newUsersThisWeek || 0}</p>
              <p className="text-sm text-gray-600">Registered this week</p>
            </div>
          </div>
        </Card>

        <Card title="New Users This Month">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">{stats?.newUsersThisMonth || 0}</p>
              <p className="text-sm text-gray-600">Registered this month</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Overview */}
      <Card title="Security Overview">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Users with 2FA enabled</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600">{stats?.twoFactorEnabled || 0}</p>
              <p className="text-sm text-gray-600">
                {stats?.totalUsers
                  ? `${Math.round((stats.twoFactorEnabled / stats.totalUsers) * 100)}%`
                  : '0%'}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Verification</p>
              <p className="text-sm text-gray-600">Users with verified emails</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-600">{stats?.emailVerified || 0}</p>
              <p className="text-sm text-gray-600">
                {stats?.totalUsers
                  ? `${Math.round((stats.emailVerified / stats.totalUsers) * 100)}%`
                  : '0%'}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Failed Login Attempts</p>
              <p className="text-sm text-gray-600">Recent failed authentication attempts</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{stats?.failedLoginAttempts || 0}</p>
              <p className="text-sm text-gray-600">Last 24 hours</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;


