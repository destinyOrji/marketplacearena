/**
 * Settings Page
 * Main settings page with tabbed interface
 */
import React, { useState } from 'react';
import { FiSettings, FiMail, FiCreditCard, FiUsers, FiLock, FiFileText } from 'react-icons/fi';
import SystemSettings from './SystemSettings';
import EmailTemplates from './EmailTemplates';
import PaymentSettings from './PaymentSettings';
import AdminUsers from './AdminUsers';
import RolesPermissions from './RolesPermissions';
import AuditLogs from './AuditLogs';

type TabType = 'system' | 'email' | 'payment' | 'admins' | 'roles' | 'audit';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('system');

  const tabs = [
    { id: 'system' as TabType, label: 'System Settings', icon: FiSettings },
    { id: 'email' as TabType, label: 'Email Templates', icon: FiMail },
    { id: 'payment' as TabType, label: 'Payment Settings', icon: FiCreditCard },
    { id: 'admins' as TabType, label: 'Admin Users', icon: FiUsers },
    { id: 'roles' as TabType, label: 'Roles & Permissions', icon: FiLock },
    { id: 'audit' as TabType, label: 'Audit Logs', icon: FiFileText }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'system':
        return <SystemSettings />;
      case 'email':
        return <EmailTemplates />;
      case 'payment':
        return <PaymentSettings />;
      case 'admins':
        return <AdminUsers />;
      case 'roles':
        return <RolesPermissions />;
      case 'audit':
        return <AuditLogs />;
      default:
        return <SystemSettings />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default Settings;
