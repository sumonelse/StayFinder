# Routing

This document explains the routing system used in the StayFinder frontend application.

## Overview

StayFinder uses React Router v7 for client-side routing. The routing configuration is defined in `src/routes/index.jsx`.

## Route Structure

The application routes are organized into several groups based on the layout they use:

1. **Main Layout Routes**: Public pages and user pages
2. **Dashboard Layout Routes**: Host and admin pages
3. **Auth Layout Routes**: Authentication pages
4. **Print Layout Routes**: Printable pages
5. **Error Layout Routes**: Error pages

## Route Configuration

The route configuration is defined using the `createBrowserRouter` function from React Router:

```jsx
const router = createBrowserRouter([
    // Main Layout Routes
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "properties",
                element: <PropertyListPage />,
            },
            // More routes...
        ],
    },

    // Dashboard Layout Routes
    {
        path: "/host",
        element: (
            <ProtectedRoute requiredRole="host">
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <HostDashboardPage />,
            },
            // More routes...
        ],
    },

    // More route groups...
])
```

## Protected Routes

Some routes in the application are protected and require authentication or specific user roles. These routes are wrapped in the `ProtectedRoute` component:

```jsx
<ProtectedRoute requiredRole="host">
    <HostDashboardPage />
</ProtectedRoute>
```

The `ProtectedRoute` component checks if the user is authenticated and has the required role. If not, it redirects to the login page.

## Route Parameters

Some routes in the application use parameters to identify specific resources:

```jsx
{
  path: "properties/:id",
  element: <PropertyDetailPage />
}
```

These parameters can be accessed in the component using the `useParams` hook:

```jsx
import { useParams } from "react-router-dom"

function PropertyDetailPage() {
    const { id } = useParams()
    // Use the id to fetch the property
}
```

## Navigation

Navigation in the application is handled using the `Link` and `NavLink` components from React Router:

```jsx
import { Link, NavLink } from "react-router-dom"

function Navigation() {
    return (
        <nav>
            <Link to="/">Home</Link>
            <NavLink
                to="/properties"
                className={({ isActive }) => (isActive ? "active" : "")}
            >
                Properties
            </NavLink>
        </nav>
    )
}
```

For programmatic navigation, the application uses the `useNavigate` hook:

```jsx
import { useNavigate } from "react-router-dom"

function LoginForm() {
    const navigate = useNavigate()

    const handleLogin = async (data) => {
        // Login logic
        navigate("/dashboard")
    }
}
```

## Lazy Loading

To improve performance, the application uses lazy loading for route components:

```jsx
import { lazy, Suspense } from "react";

const PropertyDetailPage = lazy(() => import("../pages/properties/PropertyDetailPage"));

// In the route configuration
{
  path: "properties/:id",
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <PropertyDetailPage />
    </Suspense>
  )
}
```

This ensures that the code for a page is only loaded when the user navigates to that page.

## Route Groups

The application routes are organized into the following groups:

### Public Routes

-   `/`: Home page
-   `/properties`: Property listing page
-   `/properties/:id`: Property detail page
-   `/properties/:id/reviews`: Property reviews page

### Authentication Routes

-   `/login`: Login page
-   `/register`: Registration page
-   `/forgot-password`: Forgot password page
-   `/reset-password`: Reset password page

### User Routes

-   `/profile`: User profile page
-   `/favorites`: User favorites page
-   `/bookings`: User bookings page
-   `/bookings/:id`: Booking detail page
-   `/reviews/add`: Add review page

### Host Routes

-   `/host`: Host dashboard page
-   `/host/properties`: Host properties page
-   `/host/bookings`: Host bookings page
-   `/host/properties/add`: Add property page
-   `/host/properties/:id/edit`: Edit property page
-   `/host/properties/:id`: Host property detail page

### Admin Routes

-   `/admin`: Admin dashboard page
-   `/admin/properties`: Admin properties page

### Print Routes

-   `/print/booking/:id`: Printable booking detail page

### Error Routes

-   `*`: Not found page
