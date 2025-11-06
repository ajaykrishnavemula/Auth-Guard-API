import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import authService from '../services/auth.service';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { User, Save } from 'lucide-react';

interface ProfileForm {
  name: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  phoneNumber?: string;
}

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      bio: user?.profile?.bio || '',
      location: user?.profile?.location || '',
      website: user?.profile?.website || '',
      company: user?.profile?.company || '',
      jobTitle: user?.profile?.jobTitle || '',
      phoneNumber: user?.profile?.phoneNumber || '',
    }
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile({
        name: data.name,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
          location: data.location,
          website: data.website,
          company: data.company,
          jobTitle: data.jobTitle,
          phoneNumber: data.phoneNumber,
        }
      });
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
          <User className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Profile Form */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <Input
                label="Full Name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                error={errors.name?.message}
                disabled={isLoading}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  {...register('firstName')}
                  disabled={isLoading}
                />
                <Input
                  label="Last Name"
                  {...register('lastName')}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={user?.email}
                disabled
                className="bg-gray-50"
              />

              <Input
                label="Phone Number"
                type="tel"
                {...register('phoneNumber', {
                  pattern: {
                    value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                    message: 'Invalid phone number'
                  }
                })}
                error={errors.phoneNumber?.message}
                disabled={isLoading}
                placeholder="+1 (555) 123-4567"
              />

              <Input
                label="Location"
                {...register('location')}
                disabled={isLoading}
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
            <div className="space-y-4">
              <Input
                label="Company"
                {...register('company')}
                disabled={isLoading}
                placeholder="Your company name"
              />

              <Input
                label="Job Title"
                {...register('jobTitle')}
                disabled={isLoading}
                placeholder="Your job title"
              />

              <Input
                label="Website"
                type="url"
                {...register('website', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL (starting with http:// or https://)'
                  }
                })}
                error={errors.website?.message}
                disabled={isLoading}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full md:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Account Information */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Account ID</span>
            <span className="font-mono text-sm text-gray-900">{user?.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Role</span>
            <span className="font-medium text-gray-900 capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Email Verified</span>
            <span className={`font-medium ${user?.isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
              {user?.isEmailVerified ? 'Yes' : 'No'}
            </span>
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

export default Profile;


