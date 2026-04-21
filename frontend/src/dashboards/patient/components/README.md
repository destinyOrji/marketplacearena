# Patient Dashboard Components

## ProtectedRoute

A route guard component that ensures only authenticated users can access protected dashboard pages.

### Features

- Checks authentication status from AuthContext
- Shows loading spinner while verifying authentication
- Redirects unauthenticated users to login page
- Preserves the intended destination URL for post-login redirect

### Usage

```tsx
import { ProtectedRoute } from './dashboards/patient/components';
import DashboardHome from './dashboards/patient/pages/DashboardHome';

<Route 
  path="/patient/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardHome />
    </ProtectedRoute>
  } 
/>
```

### How it works

1. The component uses the `useAuth` hook to access authentication state
2. While `loading` is true, it displays a loading spinner
3. If `isAuthenticated` is false, it redirects to `/patient/login`
4. The current location is saved in state for redirect after login
5. If authenticated, it renders the child components

### Protected Routes

The following routes are currently protected:

- `/patient/dashboard` - Main dashboard home
- `/patient/dashboard/home` - Dashboard home (alias)

Additional protected routes will be added as more dashboard pages are implemented.
