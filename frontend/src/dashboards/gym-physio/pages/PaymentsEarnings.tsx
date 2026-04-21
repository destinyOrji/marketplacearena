import React from 'react';

const PaymentsEarnings: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Payments & Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">$0.00</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600">Pending Payments</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">$0.00</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">$0.00</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
        <p className="text-gray-600 text-center py-8">No transactions yet</p>
      </div>
    </div>
  );
};

export default PaymentsEarnings;
