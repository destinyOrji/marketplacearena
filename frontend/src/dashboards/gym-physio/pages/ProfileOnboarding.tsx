import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfileOnboarding: React.FC = () => {
  const { gymPhysio } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Business Profile</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <p className="text-gray-900">{gymPhysio?.businessName || 'Not set'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
            <p className="text-gray-900 capitalize">{gymPhysio?.businessType || 'Not set'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
            <p className="text-gray-900">{gymPhysio?.specialization || 'Not set'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Years in Business</label>
            <p className="text-gray-900">{gymPhysio?.yearsInBusiness || 0} years</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              gymPhysio?.isVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {gymPhysio?.isVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
        </div>
        
        <button className="mt-6 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileOnboarding;
