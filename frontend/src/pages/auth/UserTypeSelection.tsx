import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserTypeSelection: React.FC = () => {
  const navigate = useNavigate();

  const userTypes = [
    {
      type: 'patient',
      title: 'Patient',
      description: 'Find and book appointments with healthcare professionals',
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      type: 'professional',
      title: 'Professional',
      description: 'Manage your schedule and connect with patients',
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.20.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
        </svg>
      ),
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
      hoverColor: 'hover:bg-teal-100',
    },
    {
      type: 'gym-physio',
      title: 'Gym & Physiotherapy',
      description: 'Manage your gym or physiotherapy center and connect with clients',
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
        </svg>
      ),
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
    },
    {
      type: 'hospital',
      title: 'Hospital',
      description: "Manage your hospital's services and connect with patients",
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
        </svg>
      ),
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
    },
    {
      type: 'ambulance',
      title: 'Ambulance',
      description: 'Manage ambulance services and respond to emergencies',
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 18.5a1.5 1.5 0 01-1.5-1.5 1.5 1.5 0 011.5-1.5 1.5 1.5 0 011.5 1.5 1.5 1.5 0 01-1.5 1.5m1.5-9l1.96 2.5H17V9.5m-11 9A1.5 1.5 0 014.5 17 1.5 1.5 0 016 15.5 1.5 1.5 0 017.5 17 1.5 1.5 0 016 18.5M20 8h-3V4H3c-1.11 0-2 .89-2 2v11h2a3 3 0 003 3 3 3 0 003-3h6a3 3 0 003 3 3 3 0 003-3h2v-5l-3-4z"/>
        </svg>
      ),
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
    },
  ];

  const handleUserTypeSelect = (type: string) => {
    // Navigate to registration page based on user type
    if (type === 'patient') {
      navigate('/register');
    } else if (type === 'professional') {
      navigate('/register/professional');
    } else if (type === 'gym-physio') {
      navigate('/register/gym-physio');
    } else if (type === 'hospital') {
      navigate('/register/hospital');
    } else if (type === 'ambulance') {
      navigate('/register/ambulance');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="/logo512.png" 
                alt="Health Market Arena Logo" 
                className="w-16 h-16 rounded-2xl shadow-lg"
              />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome to Health Market Arena
            </h1>
            <p className="text-lg text-gray-600">
              Choose your user type to get started
            </p>
          </div>

          {/* User Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
            {userTypes.map((userType) => {
              return (
                <button
                  key={userType.type}
                  onClick={() => handleUserTypeSelect(userType.type)}
                  className={`${userType.bgColor} ${userType.hoverColor} rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-blue-200 text-center`}
                >
                  <div className={`flex justify-center mb-4 ${userType.color}`}>
                    {userType.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {userType.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {userType.description}
                  </p>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="/about" className="hover:text-blue-600 transition-colors">
                About Us
              </a>
              <a href="/contact" className="hover:text-blue-600 transition-colors">
                Contact
              </a>
              <a href="/privacy" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </a>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 Health Market Arena. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserTypeSelection;
