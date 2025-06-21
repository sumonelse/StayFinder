import { createBrowserRouter, RouterProvider } from "react-router-dom"
import {
    MainLayout,
    DashboardLayout,
    AuthLayout,
    ErrorLayout,
    PrintLayout,
} from "../layouts"
import HomePage from "../pages/HomePage"
import LoginPage from "../pages/auth/LoginPage"
import RegisterPage from "../pages/auth/RegisterPage"
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "../pages/auth/ResetPasswordPage"
import PropertyListPage from "../pages/properties/PropertyListPage"
import PropertyDetailPage from "../pages/properties/PropertyDetailPage"
import BookingPage from "../pages/bookings/BookingPage"
import BookingListPage from "../pages/bookings/BookingListPage"
import BookingDetailPage from "../pages/bookings/BookingDetailPage"
import ProfilePage from "../pages/profile/ProfilePage"
import FavoritesPage from "../pages/profile/FavoritesPage"
import HostDashboardPage from "../pages/host/HostDashboardPage"
import HostPropertiesPage from "../pages/host/HostPropertiesPage"
import HostBookingsPage from "../pages/host/HostBookingsPage"
import PropertyFormPage from "../pages/host/PropertyFormPage"
import HostPropertyDetailPage from "../pages/host/HostPropertyDetailPage"

import NotFoundPage from "../pages/NotFoundPage"
import ProtectedRoute from "./ProtectedRoute"

const router = createBrowserRouter([
    // Main Layout - For public pages and user pages
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "register",
                element: <RegisterPage />,
            },
            {
                path: "forgot-password",
                element: <ForgotPasswordPage />,
            },
            {
                path: "reset-password",
                element: <ResetPasswordPage />,
            },
            {
                path: "properties",
                element: <PropertyListPage />,
            },
            {
                path: "properties/:id",
                element: <PropertyDetailPage />,
            },
            {
                path: "properties/:id/book",
                element: (
                    <ProtectedRoute>
                        <BookingPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "bookings",
                element: (
                    <ProtectedRoute>
                        <BookingListPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "bookings/:id",
                element: (
                    <ProtectedRoute>
                        <BookingDetailPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "profile",
                element: (
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "favorites",
                element: (
                    <ProtectedRoute>
                        <FavoritesPage />
                    </ProtectedRoute>
                ),
            },
        ],
    },

    // Auth Layout - For authentication pages
    // {
    //     path: "/",
    //     element: <AuthLayout />,
    //     children: [

    //     ],
    // },

    // Dashboard Layout - For host and admin pages
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
            {
                path: "properties",
                element: <HostPropertiesPage />,
            },
            {
                path: "bookings",
                element: <HostBookingsPage />,
            },
            {
                path: "properties/add",
                element: <PropertyFormPage />,
            },
            {
                path: "properties/:id/edit",
                element: <PropertyFormPage />,
            },
            {
                path: "properties/:id",
                element: <HostPropertyDetailPage />,
            },
        ],
    },

    // Print Layout - For printable pages
    {
        path: "/print",
        element: <PrintLayout />,
        children: [
            {
                path: "booking/:id",
                element: (
                    <ProtectedRoute>
                        <BookingDetailPage printMode={true} />
                    </ProtectedRoute>
                ),
            },
            // Add more printable pages as needed
        ],
    },

    // Error Layout - For error pages
    {
        path: "*",
        element: <ErrorLayout />,
        children: [
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
])

const AppRouter = () => {
    return <RouterProvider router={router} />
}

export default AppRouter
