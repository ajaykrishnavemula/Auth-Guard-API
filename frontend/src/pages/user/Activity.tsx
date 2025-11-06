import { useState, useEffect } from 'react';
import { Card, Loading, Alert } from '../../components/common';
import { Activity as ActivityIcon, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { type Activity as ActivityType } from '../../types';

const ActivityPage = () => {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      // TODO: Implement getActivities in authService
      // const data = await authService.getActivities();
      // setActivities(data);
      setActivities([]);
    } catch (err: any) {
      setError('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-green-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-gray-600 mt-2">View all your account activities and security events</p>
      </div>

      <Card>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <Alert type="error" message={error} />
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <ActivityIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No activities found</p>
            <p className="text-gray-400 text-sm mt-2">
              Your account activities will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getSeverityColor(activity.severity)}`}>
                  {getSeverityIcon(activity.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>IP: {activity.ipAddress}</span>
                        {activity.location && <span>Location: {activity.location}</span>}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        activity.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
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

export default ActivityPage;


