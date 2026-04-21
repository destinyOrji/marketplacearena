# Patient Dashboard Pages

This directory contains all the page components for the patient dashboard.

## Implemented Pages

### Login Page (`Login.tsx`)

Patient-specific login page with the following features:

- Email and password authentication
- Password visibility toggle
- Error handling with user-friendly messages
- Loading states during authentication
- Link to forgot password page
- Link to registration page
- Redirects to `/patient/dashboard` on successful login
- Responsive design with healthcare-themed illustration

**Route:** `/patient/login`

**Features:**
- Integrates with AuthContext for authentication
- Stores JWT token and user data in localStorage
- Displays validation errors from the API
- Clean, modern UI matching the platform design system

### Forgot Password Page (`ForgotPassword.tsx`)

Password reset request page with the following features:

- Email input for password reset
- Sends reset link via API
- Success confirmation screen
- Error handling
- Option to resend email
- Back to login link
- Responsive design

**Route:** `/patient/forgot-password`

**Features:**
- Calls `authApi.forgotPassword()` endpoint
- Shows success message after sending reset link
- Allows user to resend the email
- Clean, user-friendly interface

## Usage

```tsx
import { Login, ForgotPassword } from './dashboards/patient/pages';

// In your router
<Route path="/patient/login" element={<Login />} />
<Route path="/patient/forgot-password" element={<ForgotPassword />} />
```

## Authentication Flow

1. User enters email and password on Login page
2. Form submits to `authApi.login(email, password)`
3. On success:
   - JWT token stored in localStorage
   - User data stored in localStorage
   - AuthContext updated with authenticated state
   - User redirected to `/patient/dashboard`
4. On error:
   - Error message displayed to user
   - User can retry or use forgot password

## Dependencies

- React Router DOM (navigation)
- AuthContext (authentication state management)
- authApi (API calls)
- Tailwind CSS (styling)

## Next Steps

- Implement patient registration page
- Create protected routes for dashboard
- Add email verification flow
- Implement password reset page (for the reset link)
