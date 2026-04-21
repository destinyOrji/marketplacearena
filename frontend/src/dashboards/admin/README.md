# Admin Dashboard

## Authentication System

The admin authentication system has been implemented with the following components:

### Components

1. **AuthService** (`services/authService.ts`)
   - Handles all authentication API calls
   - Manages JWT token storage and refresh
   - Provides session management utilities
   - Implements automatic token refresh via axios interceptors

2. **AdminAuthContext** (`contexts/AdminAuthContext.tsx`)
   - React context for managing authentication state
   - Provides `login`, `logout`, and `checkAuth` methods
   - Manages admin profile data
   - Handles loading states

3. **Login Page** (`pages/Login.tsx`)
   - Admin login form with validation
   - Email and password fields with icons
   - Error handling and display
   - Loading states during authentication
   - Automatic redirect after successful login

4. **ProtectedRoute** (`components/ProtectedRoute.tsx`)
   - Wrapper component for protected routes
   - Checks authentication status
   - Redirects to login if not authenticated
   - Preserves intended destination URL

### Usage

#### Wrapping Your App

```tsx
import { AdminAuthProvider } from './contexts/AdminAuthContext';

function App() {
  return (
    <AdminAuthProvider>
      {/* Your routes */}
    </AdminAuthProvider>
  );
}
```

#### Using Authentication in Components

```tsx
import { useAdminAuth } from '../contexts/AdminAuthContext';

function MyComponent() {
  const { admin, isAuthenticated, logout } = useAdminAuth();
  
  return (
    <div>
      <p>Welcome, {admin?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### Protecting Routes

```tsx
import { ProtectedRoute } from './components';

<Route 
  path="/admin/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } 
/>
```

### API Endpoints

The authentication system connects to the following backend endpoints:

- `POST /api/v1/admin/auth/login/` - Admin login
- `POST /api/v1/admin/auth/logout/` - Admin logout
- `POST /api/v1/token/refresh/` - Refresh access token

### Environment Variables

Configure the API base URL in `.env`:

```
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

### Features

- ✅ JWT token-based authentication
- ✅ Automatic token refresh
- ✅ Session persistence via localStorage
- ✅ Protected routes with redirect
- ✅ Form validation
- ✅ Error handling and display
- ✅ Loading states
- ✅ Secure logout with token cleanup
- ✅ Session expiry handling

### Security

- Tokens are stored in localStorage
- Automatic token refresh before expiry
- Axios interceptors handle 401 responses
- Logout clears all stored credentials
- Protected routes verify authentication status

## Next Steps

The authentication system is complete and ready for use. The next phase will implement:
- Overview dashboard with analytics (Phase 4)
- Patient management features (Phase 5)
- Professional management features (Phase 6)
- And more...
