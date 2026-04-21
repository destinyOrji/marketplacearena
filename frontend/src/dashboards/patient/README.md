# Patient Dashboard

This directory contains the patient-facing dashboard for the healthcare marketplace platform.

## Directory Structure

```
patient/
├── components/       # Reusable UI components
├── contexts/         # React Context providers (Auth, Notifications, etc.)
├── hooks/            # Custom React hooks
├── pages/            # Page components (Dashboard, Appointments, etc.)
├── services/         # API client and service functions
├── types/            # TypeScript type definitions
└── utils/            # Utility functions and helpers
```

## Dependencies

- **react-router-dom**: Client-side routing
- **axios**: HTTP client for API requests
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation
- **date-fns**: Date manipulation and formatting
- **react-toastify**: Toast notifications

## API Client

The API client is configured with:
- Base URL from environment variable `REACT_APP_API_URL`
- Automatic JWT token injection for authenticated requests
- Response interceptors for error handling
- Automatic redirect to login on 401 errors

## Getting Started

1. Ensure all dependencies are installed: `npm install`
2. Set up environment variables in `.env` file
3. Import components and services as needed

## Usage Example

```typescript
import { api } from './services';
import { User } from './types';

// Fetch user profile
const fetchProfile = async () => {
  try {
    const response = await api.patient.getProfile();
    const user: User = response.data.data;
    console.log(user);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
};
```
