# StayFinder Layouts

This directory contains the layout components used throughout the StayFinder application. Each layout serves a specific purpose and provides a consistent structure for different sections of the application.

## Available Layouts

### MainLayout

-   **Purpose**: Primary layout for public pages and general user pages
-   **Features**:
    -   Responsive header with navigation
    -   Footer with site information
    -   Scroll-to-top button that appears when scrolling
    -   Page transition animations
    -   Loading indicator

### DashboardLayout

-   **Purpose**: Specialized layout for host and admin interfaces
-   **Features**:
    -   Collapsible sidebar navigation
    -   Responsive design with mobile-friendly navigation
    -   User profile information
    -   Notifications system
    -   Quick action buttons
    -   Role-based navigation items

### AuthLayout

-   **Purpose**: Clean, focused layout for authentication pages
-   **Features**:
    -   Simplified header and footer
    -   Centered content for login/registration forms
    -   Decorative background elements
    -   Back to home navigation

### ErrorLayout

-   **Purpose**: Layout for error pages (404, 500, etc.)
-   **Features**:
    -   Clear navigation options to help users recover
    -   Simple, distraction-free design
    -   Go back button
    -   Home navigation

### PrintLayout

-   **Purpose**: Optimized layout for printable content
-   **Features**:
    -   Print-specific styling
    -   Automatic print dialog trigger
    -   Clean design for printed documents
    -   Screen-only controls that don't appear in print

## Usage

Import layouts from the layouts directory:

```jsx
import {
    MainLayout,
    DashboardLayout,
    AuthLayout,
    ErrorLayout,
    PrintLayout,
} from "../layouts"
```

Use them in your router configuration:

```jsx
const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            // Routes that should use the main layout
        ],
    },
    {
        path: "/host",
        element: <DashboardLayout />,
        children: [
            // Routes that should use the dashboard layout
        ],
    },
    // etc.
])
```

## Customization

Each layout can be customized by modifying the respective component file. Common customizations include:

-   Changing color schemes
-   Adjusting spacing and padding
-   Adding or removing features
-   Modifying navigation items
-   Changing transition animations
