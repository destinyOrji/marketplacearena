// Emergency Services Dashboard Entry Point

import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmergencyRoutes from './routes';

const EmergencyDashboard: React.FC = () => {
  return (
    <>
      <EmergencyRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default EmergencyDashboard;
