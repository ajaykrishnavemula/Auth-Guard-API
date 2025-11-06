import { useState, useEffect } from 'react';
import { Card, Loading, Alert } from '../../components/common';
import { TrendingUp, Users, Activity, Shield } from 'lucide-react';

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // TODO: Implement getAnalytics in admin service
      // const data = await adminService.getAnalytics();
      setIsLoading(false);
    } catch (err: any) {
      setError('Failed to load analytics');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading analytics..." />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Detailed insights and trends</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-green-600">0%</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-purple-600">0</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">2FA Adoption</p>
              <p className="text-2xl font-bold text-indigo-600">0%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <Card title="User Growth">
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chart visualization coming soon</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Login Activity">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization coming soon</p>
          </div>
        </Card>

        <Card title="Security Events">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization coming soon</p>
          </div>
        </Card>
      </div>

      {/* Top Statistics */}
      <Card title="Key Metrics">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Average Session Duration</p>
              <p className="text-sm text-gray-600">Time users spend logged in</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">0 min</p>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Login Success Rate</p>
              <p className="text-sm text-gray-600">Successful vs failed login attempts</p>
            </div>
            <p className="text-2xl font-bold text-green-600">0%</p>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Password Reset Requests</p>
              <p className="text-sm text-gray-600">Last 30 days</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">0</p>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Security Incidents</p>
              <p className="text-sm text-gray-600">Critical and high severity events</p>
            </div>
            <p className="text-2xl font-bold text-red-600">0</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;


