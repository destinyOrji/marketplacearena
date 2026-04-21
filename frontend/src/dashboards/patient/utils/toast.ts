import { toast, ToastOptions, TypeOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...defaultOptions, ...options });
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...defaultOptions, ...options });
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast.info(message, { ...defaultOptions, ...options });
};

export const showWarningToast = (message: string, options?: ToastOptions) => {
  toast.warning(message, { ...defaultOptions, ...options });
};

export const showToast = (message: string, type: TypeOptions = 'info', options?: ToastOptions) => {
  toast(message, { ...defaultOptions, type, ...options });
};

export const showAppointmentReminder = (message: string) => {
  toast.info(message, {
    ...defaultOptions,
    autoClose: 10000,
  });
};

export const showPaymentSuccess = (message: string) => {
  toast.success(message, {
    ...defaultOptions,
  });
};

export const showSystemNotification = (message: string) => {
  toast.info(message, {
    ...defaultOptions,
  });
};

export default {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  warning: showWarningToast,
  appointmentReminder: showAppointmentReminder,
  paymentSuccess: showPaymentSuccess,
  systemNotification: showSystemNotification,
};
