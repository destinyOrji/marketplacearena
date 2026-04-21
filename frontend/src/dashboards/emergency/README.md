# Emergency Services Dashboard

A comprehensive dashboard for emergency service providers (ambulance, paramedic, fire, rescue services) to manage emergency bookings, respond to urgent requests, and track their operations.

## Features Implemented

### Core Infrastructure (Task 1) ✅
- Complete TypeScript type definitions
- WebSocket service for real-time communication
- API client with authentication
- Comprehensive API service modules
- Utility functions (formatting, validation, distance calculation)
- Routing structure with lazy loading

### Layout Components (Tasks 2-3) ✅
- Sidebar navigation with provider info
- Header with availability toggle
- Dashboard layout with WebSocket integration
- Responsive mobile design

### Key Components ✅
- **AvailabilityToggle**: Large prominent toggle for availability status
- **EmergencyBookingNotification**: Full-screen modal with countdown timer and sound alert
- **Sidebar**: Navigation with all dashboard sections
- **Header**: Availability toggle and notifications

### Pages Created ✅
- **DashboardHome**: Overview with stats and quick actions
- **ProfileOnboarding**: Profile completion (placeholder)
- **MyServices**: Service management (placeholder)
- **ActiveEmergency**: Current emergency view (placeholder)
- **BookingHistory**: Past bookings (placeholder)
- **EarningsPayments**: Payment tracking (placeholder)
- **CoverageAreas**: Coverage zone management (placeholder)
- **VehiclesEquipment**: Vehicle/equipment inventory (placeholder)
- **Analytics**: Performance metrics (placeholder)
- **Settings**: Account settings (placeholder)

## Project Structure

```
frontend/src/dashboards/emergency/
├── components/
│   ├── AvailabilityToggle.tsx
│   ├── DashboardLayout.tsx
│   ├── EmergencyBookingNotification.tsx
│   ├── Header.tsx
│   └── Sidebar.tsx
├── pages/
│   ├── ActiveEmergency.tsx
│   ├── Analytics.tsx
│   ├── BookingHistory.tsx
│   ├── CoverageAreas.tsx
│   ├── DashboardHome.tsx
│   ├── EarningsPayments.tsx
│   ├── MyServices.tsx
│   ├── ProfileOnboarding.tsx
│   ├── Settings.tsx
│   └── VehiclesEquipment.tsx
├── services/
│   ├── api.ts
│   ├── apiClient.ts
│   └── websocket.ts
├── types/
│   └── index.ts
├── utils/
│   ├── distance.ts
│   ├── formatting.ts
│   ├── index.ts
│   └── validation.ts
├── index.tsx
├── README.md
└── routes.tsx
```

## Next Steps

To complete the implementation:

1. **Implement detailed page functionality** - Expand placeholder pages with full features
2. **Add real-time emergency notifications** - Integrate WebSocket events
3. **Implement map integration** - Add Google Maps/Mapbox for location tracking
4. **Build service management** - Complete CRUD operations for services
5. **Add booking management** - Implement booking acceptance and status updates
6. **Create coverage area editor** - Interactive map for defining coverage zones
7. **Build vehicle management** - Complete vehicle and equipment inventory
8. **Implement analytics** - Add charts and performance visualizations

## Usage

```typescript
import EmergencyDashboard from './dashboards/emergency';

// In your app routing
<Route path="/emergency/*" element={<EmergencyDashboard />} />
```

## WebSocket Events

The dashboard listens for:
- `booking:new` - New emergency booking
- `booking:cancelled` - Booking cancelled
- `booking:timeout` - Booking acceptance timeout
- `notification:new` - New notification
- `provider:status-changed` - Provider status update

## API Endpoints

All API endpoints are configured in `services/api.ts`:
- Authentication
- Provider Profile
- Services CRUD
- Availability Management
- Bookings
- Payments
- Coverage Areas
- Vehicles & Equipment
- Analytics
- Notifications
- Settings
