import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import Login from '../pages/Login';
import BrowseServices from '../pages/BrowseServices';
import EmergencyServices from '../pages/EmergencyServices';
import Payments from '../pages/Payments';
import Feedback from '../pages/Feedback';
import ProfileSettings from '../pages/ProfileSettings';
import * as api from '../services/api';

// Mock the API module
jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

// Mock toast notifications
jest.mock('../utils/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn(),
  showWarningToast: jest.fn(),
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

(global.navigator as any).geolocation = mockGeolocation;

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          {component}
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('User Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Registration and Login Flow', () => {
    it('should allow user to login with valid credentials', async () => {
      const mockUser = {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male' as const,
        address: '123 Main St',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+0987654321',
          relationship: 'Spouse',
        },
        createdAt: new Date(),
        verified: true,
      };

      mockedApi.authApi.login.mockResolvedValue({
        data: {
          data: {
            user: mockUser,
            token: 'mock-token-123',
          },
          success: true,
        },
      } as any);

      renderWithProviders(<Login />);

      // Fill in login form
      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedApi.authApi.login).toHaveBeenCalledWith('john@example.com', 'Password123');
        expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard');
      });
    });

    it('should display error message on login failure', async () => {
      mockedApi.authApi.login.mockRejectedValue({
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      });

      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('2. Service Browsing and Booking Flow', () => {
    const mockServices = [
      {
        id: '1',
        name: 'Dr. Smith',
        type: 'doctor' as const,
        specialty: 'Cardiology',
        location: 'New York',
        rating: 4.5,
        reviewCount: 120,
        availability: true,
        photo: '/doctor1.jpg',
        price: 100,
      },
      {
        id: '2',
        name: 'Dr. Johnson',
        type: 'doctor' as const,
        specialty: 'Pediatrics',
        location: 'Boston',
        rating: 4.8,
        reviewCount: 95,
        availability: true,
        photo: '/doctor2.jpg',
        price: 120,
      },
    ];

    it('should display services and allow filtering', async () => {
      mockedApi.servicesApi.getServices.mockResolvedValue({
        data: {
          data: {
            data: mockServices,
            total: 2,
            page: 1,
            pageSize: 12,
            totalPages: 1,
          },
          success: true,
        },
      } as any);

      renderWithProviders(<BrowseServices />);

      await waitFor(() => {
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
        expect(screen.getByText('Dr. Johnson')).toBeInTheDocument();
      });

      // Test search functionality
      const searchInput = screen.getByPlaceholderText(/search by name/i);
      fireEvent.change(searchInput, { target: { value: 'Smith' } });

      await waitFor(() => {
        expect(mockedApi.servicesApi.getServices).toHaveBeenCalled();
      });
    });

    it('should navigate to booking page when Book Now is clicked', async () => {
      mockedApi.servicesApi.getServices.mockResolvedValue({
        data: {
          data: {
            data: mockServices,
            total: 2,
            page: 1,
            pageSize: 12,
            totalPages: 1,
          },
          success: true,
        },
      } as any);

      renderWithProviders(<BrowseServices />);

      await waitFor(() => {
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      });

      const bookButtons = screen.getAllByText(/book now/i);
      fireEvent.click(bookButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/patient/book-consultation'));
    });

    it('should show empty state when no services found', async () => {
      mockedApi.servicesApi.getServices.mockResolvedValue({
        data: {
          data: {
            data: [],
            total: 0,
            page: 1,
            pageSize: 12,
            totalPages: 0,
          },
          success: true,
        },
      } as any);

      renderWithProviders(<BrowseServices />);

      await waitFor(() => {
        expect(screen.getByText(/no services found/i)).toBeInTheDocument();
      });
    });
  });

  describe('3. Emergency Ambulance Booking Flow', () => {
    const mockAmbulances = [
      {
        id: '1',
        name: 'City Ambulance Service',
        vehicleNumber: 'AMB-001',
        distance: 2.5,
        estimatedArrival: 10,
        rating: 4.7,
        price: 50,
      },
      {
        id: '2',
        name: 'Quick Response Ambulance',
        vehicleNumber: 'AMB-002',
        distance: 3.2,
        estimatedArrival: 15,
        rating: 4.5,
        price: 45,
      },
    ];

    it('should detect user location and allow emergency booking', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        });
      });

      mockedApi.emergencyApi.getAmbulances.mockResolvedValue({
        data: {
          data: mockAmbulances,
          success: true,
        },
      } as any);

      renderWithProviders(<EmergencyServices />);

      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      });

      // Fill emergency form
      const emergencyTypeSelect = screen.getByRole('combobox', { name: /emergency type/i });
      const conditionTextarea = screen.getByPlaceholderText(/briefly describe/i);
      const contactInput = screen.getByPlaceholderText(/enter your phone number/i);

      fireEvent.change(emergencyTypeSelect, { target: { value: 'Cardiac Emergency' } });
      fireEvent.change(conditionTextarea, { target: { value: 'Chest pain and difficulty breathing' } });
      fireEvent.change(contactInput, { target: { value: '+1234567890' } });

      const searchButton = screen.getByText(/search for available ambulances/i);
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockedApi.emergencyApi.getAmbulances).toHaveBeenCalled();
      });
    });

    it('should book ambulance and show tracking', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        });
      });

      mockedApi.emergencyApi.getAmbulances.mockResolvedValue({
        data: {
          data: mockAmbulances,
          success: true,
        },
      } as any);

      mockedApi.emergencyApi.bookAmbulance.mockResolvedValue({
        data: {
          data: {
            id: 'booking-123',
            ambulance: mockAmbulances[0],
            estimatedArrival: 10,
            driverName: 'John Driver',
            driverPhone: '+1234567890',
            vehicleNumber: 'AMB-001',
          },
          success: true,
        },
      } as any);

      renderWithProviders(<EmergencyServices />);

      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      });

      // Fill and submit form
      const emergencyTypeSelect = screen.getByRole('combobox', { name: /emergency type/i });
      const conditionTextarea = screen.getByPlaceholderText(/briefly describe/i);
      const contactInput = screen.getByPlaceholderText(/enter your phone number/i);

      fireEvent.change(emergencyTypeSelect, { target: { value: 'Cardiac Emergency' } });
      fireEvent.change(conditionTextarea, { target: { value: 'Chest pain' } });
      fireEvent.change(contactInput, { target: { value: '+1234567890' } });

      const searchButton = screen.getByText(/search for available ambulances/i);
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('City Ambulance Service')).toBeInTheDocument();
      });
    });
  });

  describe('4. Payment Processing Flow', () => {
    const mockPayments = [
      {
        id: '1',
        date: new Date('2024-01-15'),
        service: 'Consultation with Dr. Smith',
        amount: 100,
        status: 'completed' as const,
        method: 'Credit Card',
        receiptUrl: '/receipts/1.pdf',
      },
      {
        id: '2',
        date: new Date('2024-01-20'),
        service: 'Lab Tests',
        amount: 50,
        status: 'pending' as const,
        method: 'Bank Transfer',
      },
    ];

    it('should display payment history', async () => {
      mockedApi.paymentsApi.getPayments.mockResolvedValue({
        data: {
          data: {
            data: mockPayments,
            total: 2,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          },
          success: true,
        },
      } as any);

      renderWithProviders(<Payments />);

      await waitFor(() => {
        expect(screen.getByText('Consultation with Dr. Smith')).toBeInTheDocument();
        expect(screen.getByText('Lab Tests')).toBeInTheDocument();
      });
    });

    it('should filter payments by status', async () => {
      mockedApi.paymentsApi.getPayments.mockResolvedValue({
        data: {
          data: {
            data: mockPayments.filter(p => p.status === 'completed'),
            total: 1,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          },
          success: true,
        },
      } as any);

      renderWithProviders(<Payments />);

      const statusFilter = screen.getByRole('combobox', { name: /filter by status/i });
      fireEvent.change(statusFilter, { target: { value: 'completed' } });

      await waitFor(() => {
        expect(mockedApi.paymentsApi.getPayments).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'completed' })
        );
      });
    });

    it('should download receipt for completed payment', async () => {
      mockedApi.paymentsApi.getPayments.mockResolvedValue({
        data: {
          data: {
            data: mockPayments,
            total: 2,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          },
          success: true,
        },
      } as any);

      mockedApi.paymentsApi.getReceipt.mockResolvedValue({
        data: {
          data: {
            receiptUrl: '/receipts/1.pdf',
          },
          success: true,
        },
      } as any);

      const mockWindowOpen = jest.spyOn(window, 'open').mockImplementation();

      renderWithProviders(<Payments />);

      await waitFor(() => {
        expect(screen.getByText('Consultation with Dr. Smith')).toBeInTheDocument();
      });

      const receiptButtons = screen.getAllByText(/receipt/i);
      fireEvent.click(receiptButtons[0]);

      await waitFor(() => {
        expect(mockedApi.paymentsApi.getReceipt).toHaveBeenCalledWith('1');
        expect(mockWindowOpen).toHaveBeenCalledWith('/receipts/1.pdf', '_blank');
      });

      mockWindowOpen.mockRestore();
    });
  });

  describe('5. Feedback Submission Flow', () => {
    const mockAppointments = [
      {
        id: '1',
        provider: {
          id: '1',
          name: 'Dr. Smith',
          type: 'doctor' as const,
          specialty: 'Cardiology',
          location: 'New York',
          rating: 4.5,
          reviewCount: 120,
          availability: true,
          photo: '/doctor1.jpg',
          price: 100,
        },
        date: new Date('2024-01-15'),
        time: '10:00 AM',
        type: 'video' as const,
        status: 'completed' as const,
      },
    ];

    it('should display pending feedback appointments', async () => {
      mockedApi.appointmentsApi.getAppointments.mockResolvedValue({
        data: {
          data: {
            data: mockAppointments,
            total: 1,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          },
          success: true,
        },
      } as any);

      renderWithProviders(<Feedback />);

      await waitFor(() => {
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
        expect(screen.getByText(/provide feedback/i)).toBeInTheDocument();
      });
    });

    it('should submit feedback successfully', async () => {
      mockedApi.appointmentsApi.getAppointments.mockResolvedValue({
        data: {
          data: {
            data: mockAppointments,
            total: 1,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          },
          success: true,
        },
      } as any);

      mockedApi.feedbackApi.submitFeedback.mockResolvedValue({
        data: {
          data: {
            id: 'feedback-1',
            rating: 5,
            review: 'Excellent service',
          },
          success: true,
        },
      } as any);

      renderWithProviders(<Feedback />);

      await waitFor(() => {
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      });

      // Click provide feedback button
      const provideFeedbackButton = screen.getByText(/provide feedback/i);
      fireEvent.click(provideFeedbackButton);

      await waitFor(() => {
        expect(screen.getByText(/your review/i)).toBeInTheDocument();
      });

      // Fill feedback form
      const reviewTextarea = screen.getByPlaceholderText(/share your experience/i);
      fireEvent.change(reviewTextarea, { target: { value: 'Excellent service and very professional' } });

      // Submit feedback
      const submitButton = screen.getByRole('button', { name: /submit feedback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedApi.feedbackApi.submitFeedback).toHaveBeenCalledWith(
          expect.objectContaining({
            appointmentId: '1',
            review: 'Excellent service and very professional',
          })
        );
      });
    });
  });

  describe('6. Profile Updates Flow', () => {
    const mockUser = {
      id: '1',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male' as const,
      address: '123 Main St',
      profilePhoto: '/profile.jpg',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+0987654321',
        relationship: 'Spouse',
      },
      createdAt: new Date(),
      verified: true,
    };

    it('should display current profile information', async () => {
      renderWithProviders(<ProfileSettings />);

      await waitFor(() => {
        // Profile tab should be active by default
        expect(screen.getByText(/profile information/i)).toBeInTheDocument();
      });
    });

    it('should update profile successfully', async () => {
      mockedApi.patientApi.updateProfile.mockResolvedValue({
        data: {
          data: {
            ...mockUser,
            fullName: 'John Updated Doe',
          },
          success: true,
        },
      } as any);

      renderWithProviders(<ProfileSettings />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/full name/i);
        expect(nameInput).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'John Updated Doe' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockedApi.patientApi.updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: 'John Updated Doe',
          })
        );
      });
    });

    it('should change password successfully', async () => {
      mockedApi.patientApi.changePassword.mockResolvedValue({
        data: {
          data: null,
          success: true,
        },
      } as any);

      renderWithProviders(<ProfileSettings />);

      // Switch to password tab
      const passwordTab = screen.getByText(/^password$/i);
      fireEvent.click(passwordTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      });

      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/^new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'OldPassword123' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123' } });

      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      fireEvent.click(changePasswordButton);

      await waitFor(() => {
        expect(mockedApi.patientApi.changePassword).toHaveBeenCalledWith(
          'OldPassword123',
          'NewPassword123'
        );
      });
    });

    it('should update notification preferences', async () => {
      renderWithProviders(<ProfileSettings />);

      // Switch to notifications tab
      const notificationsTab = screen.getByText(/^notifications$/i);
      fireEvent.click(notificationsTab);

      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeInTheDocument();
      });

      // Toggle email notifications
      const emailToggle = screen.getByText(/email notifications/i).closest('label')?.querySelector('input');
      if (emailToggle) {
        fireEvent.click(emailToggle);
      }

      const savePreferencesButton = screen.getByRole('button', { name: /save preferences/i });
      fireEvent.click(savePreferencesButton);

      await waitFor(() => {
        // Verify preferences were updated
        expect(screen.getByText(/notification preferences/i)).toBeInTheDocument();
      });
    });
  });
});
