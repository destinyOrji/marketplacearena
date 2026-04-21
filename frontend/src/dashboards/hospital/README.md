# Hospital Dashboard

A comprehensive dashboard for healthcare facilities to manage their presence on the marketplace platform.

## Features

### 1. Hospital Profile Management
- Complete hospital registration and onboarding
- Profile editing with facility details
- Logo and facility image uploads
- Operating hours management
- Specializations and certifications

### 2. Job Vacancy Management
- Create and publish job vacancies
- Edit and update existing vacancies
- Manage vacancy status (draft, active, paused, closed, filled)
- Track views and applications
- Set application deadlines
- Define salary ranges and benefits

### 3. Application Review & Hiring
- View all applications across vacancies
- Filter applications by status
- Review professional profiles
- Access resumes and cover letters
- Update application status
- Send job offers
- Track hiring pipeline

### 4. Billing & Payments
- View payment history
- Download invoices
- Track subscription usage
- Manage payment methods

### 5. Subscription Management
- View current subscription plan
- Compare available plans
- Track job posting limits
- Monitor renewal dates
- Manage auto-renewal settings

## Pages

- **Dashboard** (`/hospital/dashboard`) - Overview with stats and quick actions
- **Profile** (`/hospital/profile`) - Hospital profile management
- **Onboarding** (`/hospital/onboarding`) - Complete initial setup
- **Vacancies** (`/hospital/vacancies`) - List all job vacancies
- **Vacancy Form** (`/hospital/vacancies/new`, `/hospital/vacancies/:id/edit`) - Create/edit vacancy
- **Vacancy Detail** (`/hospital/vacancies/:id`) - View vacancy details and stats
- **Applications** (`/hospital/applications`) - List all applications
- **Application Detail** (`/hospital/applications/:id`) - Review application details
- **Billing** (`/hospital/billing`) - Payment history
- **Subscription** (`/hospital/subscription`) - Manage subscription plan

## Tech Stack

- **React 19** with TypeScript
- **React Router** for navigation
- **React Hook Form** for form management
- **Zod** for validation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **React Icons** for icons
- **React Toastify** for notifications
- **date-fns** for date formatting

## Project Structure

```
hospital/
├── components/
│   └── DashboardLayout.tsx      # Main layout with sidebar
├── contexts/
│   └── HospitalContext.tsx      # Global state management
├── pages/
│   ├── Dashboard.tsx            # Dashboard home
│   ├── Profile.tsx              # Profile management
│   ├── Onboarding.tsx           # Onboarding wizard
│   ├── Vacancies.tsx            # Vacancies list
│   ├── VacancyForm.tsx          # Create/edit vacancy
│   ├── VacancyDetail.tsx        # Vacancy details
│   ├── Applications.tsx         # Applications list
│   ├── ApplicationDetail.tsx    # Application details
│   ├── Billing.tsx              # Payment history
│   └── Subscription.tsx         # Subscription management
├── services/
│   └── api.ts                   # API service layer
├── types/
│   └── index.ts                 # TypeScript interfaces
├── index.tsx                    # Main entry point
├── routes.tsx                   # Route configuration
└── README.md                    # This file
```

## API Integration

The dashboard integrates with the backend API at `/api/v1/hospital/`:

### Hospital Endpoints
- `POST /register/` - Register new hospital
- `POST /verify-email/` - Verify email
- `GET /profile/` - Get hospital profile
- `PUT /profile/update/` - Update profile
- `POST /onboarding/` - Complete onboarding
- `POST /upload-image/` - Upload images
- `GET /dashboard-stats/` - Get dashboard statistics

### Vacancy Endpoints
- `GET /vacancies/` - List vacancies
- `POST /vacancies/create/` - Create vacancy
- `GET /vacancies/:id/` - Get vacancy details
- `PUT /vacancies/:id/update/` - Update vacancy
- `PATCH /vacancies/:id/status/` - Update status
- `DELETE /vacancies/:id/delete/` - Delete vacancy
- `GET /vacancies/:id/applications/` - Get applications
- `GET /vacancies/:id/stats/` - Get statistics

### Application Endpoints
- `GET /applications/` - List applications
- `GET /applications/:id/` - Get application details
- `PATCH /applications/:id/status/` - Update status
- `POST /applications/:id/review/` - Review application
- `POST /applications/:id/send-offer/` - Send job offer
- `GET /applications/stats/` - Get statistics

### Billing Endpoints
- `GET /billing/subscription/` - Get subscription
- `POST /billing/subscribe/` - Subscribe to plan
- `GET /billing/payments/` - List payments
- `GET /billing/payments/:id/` - Get payment details
- `POST /billing/payments/initiate/` - Initiate payment
- `GET /billing/usage/` - Get usage statistics

## Usage

### Installation

The dashboard is part of the main frontend application. No separate installation required.

### Configuration

Set the API base URL in your environment:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### Authentication

The dashboard requires authentication. Users must log in with hospital role credentials. The auth token is stored in localStorage and automatically included in API requests.

### Navigation

Access the hospital dashboard at `/hospital/*` routes. The sidebar provides navigation to all major sections.

## Development

### Adding New Pages

1. Create page component in `pages/`
2. Add route to `routes.tsx`
3. Update navigation in `DashboardLayout.tsx` if needed

### Adding New API Endpoints

1. Add method to `services/api.ts`
2. Update types in `types/index.ts` if needed
3. Use in components with error handling

### Styling

The dashboard uses Tailwind CSS. Common patterns:
- Cards: `bg-white shadow rounded-lg p-6`
- Buttons: `px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium`
- Forms: `block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`

## Future Enhancements

- Real-time notifications
- Advanced analytics dashboard
- Bulk actions for applications
- Interview scheduling
- Candidate messaging
- Document verification
- Performance reports
- Mobile app integration
