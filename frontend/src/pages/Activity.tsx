import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import { Activity as ActivityIcon, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import type { Activity } from '../types';

const ActivityPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failure'>('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ success: boolean; activities: Activity[] }>('/user/activity');
      setActivities(response.data.activities);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch activities');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityIcon = (severity: Activity['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: Activity['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const getStatusIcon = (status: Activity['status']) => {
    return status === 'success' 
      ? <CheckCircle className="w-4 h-4 text-green-600" />
      : <XCircle className="w-4 h-4 text-red-600" />;
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.status === filter;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600 mt-1">View your account activity and security events</p>
        </div>
        <div className="p-3 bg-purple-100 rounded-lg">
          <ActivityIcon className="w-8 h-8 text-purple-600" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{activities.length}</p>
            <p className="text-sm text-gray-600 mt-1">Total Activities</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {activities.filter(a => a.status === 'success').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Successful</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">
              {activities.filter(a => a.status === 'failure').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Failed</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setFilter('failure')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'failure'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Failed
            </button>
          </div>
        </div>
      </Card>

      {/* Activity List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <ActivityIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No activities found</p>
            </div>
          </Card>
        ) : (
          filteredActivities.map((activity) => (
            <Card key={activity.id} className={`border ${getSeverityColor(activity.severity)}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(activity.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{activity.action}</h3>
                        {getStatusIcon(activity.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatDate(activity.timestamp)}
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">IP Address:</span>
                          <span className="font-mono text-gray-900">{activity.ipAddress}</span>
                        </div>
                        {activity.location && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Location:</span>
                            <span className="text-gray-900">{activity.location}</span>
                          </div>
                        )}
                        {activity.details && Object.keys(activity.details).length > 0 && (
                          <div className="mt-2 p-2 bg-white bg-opacity-50 rounded border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Details:</p>
                            <pre className="text-xs text-gray-700 overflow-x-auto">
                              {JSON.stringify(activity.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      activity.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="font-semibold text-blue-900">About Activity Logs</h3>
            <p className="text-sm text-blue-700 mt-1">
              Activity logs help you monitor your account security. Review them regularly to ensure
              all activities are authorized. If you notice any suspicious activity, change your
              password immediately and enable two-factor authentication.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActivityPage;


