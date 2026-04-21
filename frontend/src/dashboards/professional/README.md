# Health Professionals Dashboard

This directory contains the complete implementation of the Health Professionals Dashboard, a comprehensive web-based interface for healthcare providers to manage their services, appointments, and business operations on the platform.

## Directory Structure

```
professional/
├── components/          # Reusable UI components
├── contexts/           # React Context providers for state management
├── pages/              # Page components for each dashboard section
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
├── routes.tsx          # Routing configuration
└── README.md           # This file
```

## Key Features

- **Profile Management**: Complete professional profile with credentials and certifications
- **Service Listings**: Create and manage healthcare service advertisements
- **Job Applications**: Browse and apply for job postings
- **Appointment Management**: Handle appointment requests and scheduling
- **Schedule & Availability**: Manage working hours and blocked dates
- **Payments & Earnings**: Track income and payment history
- **Analytics**: Performance metrics and business insights
- **Notifications**: Real-time alerts for important events

## Technology Stack

- **React 18** with TypeScript
- **React Router v6** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Context API** for state management
- **Zod** for validation
- **date-fns** for date handling

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running

### Installation

The professional dashboard is part of the main frontend application. No separate installation is required.

### Usage

The dashboard is accessible at `/professional/*` routes after authentication.

## State Management

The dashboard uses React Context API for state management:

- **AuthContext**: Manages authentication state and user session
- **NotificationContext**: Handles notifications and real-time updates

## API Integration

All API calls are centralized in the `services/` directory:

- `apiClient.ts`: Configured Axios instance with interceptors
- `api.ts`: API service functions organized by feature

## Type Safety

All data models and interfaces are defined in `types/index.ts` to ensure type safety throughout the application.

## Routing

Routes are configured in `routes.tsx` with lazy loading for optimal performance:

- `/professional/dashboard` - Dashboard home
- `/professional/profile` - Profile management
- `/professional/services` - Service listings
- `/professional/jobs` - Browse jobs
- `/professional/applications` - Job applications
- `/professional/appointments` - Appointments
- `/professional/schedule` - Schedule & availability
- `/professional/payments` - Payments & earnings
- `/professional/analytics` - Analytics
- `/professional/settings` - Settings

## Development Guidelines

1. **Component Structure**: Follow the existing component patterns from the patient dashboard
2. **Styling**: Use Tailwind CSS utility classes consistently
3. **Type Safety**: Always define TypeScript interfaces for props and data
4. **Error Handling**: Use the error handling utilities from `utils/errorHandling.ts`
5. **API Calls**: Use the centralized API services from `services/api.ts`
6. **Validation**: Use Zod schemas from `utils/validation.ts`

## Testing

Tests should be added in `__tests__/` directories following the pattern:

- Unit tests for components
- Integration tests for user flows
- API integration tests with mocked responses

## Contributing

When adding new features:

1. Create types in `types/index.ts`
2. Add API functions in `services/api.ts`
3. Create components in `components/`
4. Build pages in `pages/`
5. Update routes in `routes.tsx`
6. Export from index files

## Related Documentation

- [Requirements Document](../../../.kiro/specs/health-professionals-dashboard/requirements.md)
- [Design Document](../../../.kiro/specs/health-professionals-dashboard/design.md)
- [Implementation Tasks](../../../.kiro/specs/health-professionals-dashboard/tasks.md)
