# Frontend Setup Guide

This guide will help you set up the StayFinder frontend for development.

## Prerequisites

Before you begin, make sure you have the following installed:

-   Node.js (v18 or later)
-   npm (v9 or later)

## Installation

1. Clone the repository (if you haven't already):

```bash
git clone <repository-url>
cd StayFinder/client
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the client directory with the following variables:

```
VITE_API_URL=http://localhost:5000/api
VITE_MAPS_API_KEY=your_maps_api_key
```

Replace the placeholder values with your actual configuration.

## Running the Application

### Development Mode

To run the application in development mode with hot reloading:

```bash
npm run dev
```

The application will start on port 5173 by default. You can access it at:

```
http://localhost:5173
```

### Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `dist` directory with the compiled assets.

### Previewing the Production Build

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

The frontend project is organized as follows:

```
client/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── constants/       # Application constants
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Page layout components
│   ├── pages/           # Page components
│   ├── routes/          # Routing configuration
│   ├── services/        # API service functions
│   ├── styles/          # Global styles
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main application component
│   ├── index.css        # Global CSS
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## Key Features

### Component Library

The application uses a custom component library built with Tailwind CSS. These components are located in the `src/components` directory.

### Routing

Routing is handled by React Router v7. The route configuration is defined in `src/routes/index.jsx`.

### State Management

The application uses a combination of:

-   React Context for global state (authentication, UI state)
-   TanStack Query for server state management
-   React Hook Form for form state management

### API Integration

API calls are organized in service modules in the `src/services` directory. These services use Axios for HTTP requests.

### Authentication

Authentication is managed through the AuthContext provider in `src/context/AuthContext.jsx`. It handles:

-   User login/registration
-   Token storage and renewal
-   Protected routes

## Customization

### Styling

The application uses Tailwind CSS for styling. You can customize the design by modifying:

-   `tailwind.config.js` for theme customization
-   `src/styles` for global styles
-   Component-level styles using Tailwind classes

### Environment Variables

You can add additional environment variables in the `.env` file. Make sure to prefix them with `VITE_` to make them accessible in the application.

## Troubleshooting

### API Connection Issues

If the frontend cannot connect to the backend:

1. Ensure the backend server is running
2. Check that the `VITE_API_URL` in your `.env` file is correct
3. Verify that CORS is properly configured on the backend

### Build Issues

If you encounter issues during the build process:

1. Clear the `node_modules` directory and reinstall dependencies
2. Update Node.js and npm to the latest versions
3. Check for errors in the console output

## Next Steps

Once your frontend is set up and running, you can:

1. Explore the [Component Structure](./component-structure.md)
2. Learn about [State Management](./state-management.md)
3. Understand the [Routing Configuration](./routing.md)
