import { createBrowserRouter, RouterProvider } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
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
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <NotFoundPage />,
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
            {
                path: "host",
                element: (
                    <ProtectedRoute requiredRole="host">
                        <HostDashboardPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "host/properties",
                element: (
                    <ProtectedRoute requiredRole="host">
                        <HostPropertiesPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "host/bookings",
                element: (
                    <ProtectedRoute requiredRole="host">
                        <HostBookingsPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "host/properties/add",
                element: (
                    <ProtectedRoute requiredRole="host">
                        <PropertyFormPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "host/properties/:id/edit",
                element: (
                    <ProtectedRoute requiredRole="host">
                        <PropertyFormPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "host/properties/:id",
                element: (
                    <ProtectedRoute requiredRole="host">
                        <HostPropertyDetailPage />
                    </ProtectedRoute>
                ),
            },
        ],
    },
])

const AppRouter = () => {
    return <RouterProvider router={router} />
}

export default AppRouter
