import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import {
    MainLayout,
    DashboardLayout,
    AuthLayout,
    ErrorLayout,
    PrintLayout,
} from "../layouts"
import { LoadingFallback } from "../components/ui"
import ProtectedRoute from "./ProtectedRoute"

// Lazy load page components
// Home and frequently accessed pages
const HomePage = lazy(() => import("../pages/HomePage"))
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"))

// Auth pages
const LoginPage = lazy(() => import("../pages/auth/LoginPage"))
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"))
const ForgotPasswordPage = lazy(() =>
    import("../pages/auth/ForgotPasswordPage")
)
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"))

// Property pages
const PropertyListPage = lazy(() =>
    import("../pages/properties/PropertyListPage")
)
const PropertyDetailPage = lazy(() =>
    import("../pages/properties/PropertyDetailPage")
)
const PropertyReviewsPage = lazy(() =>
    import("../pages/properties/PropertyReviewsPage")
)

// Booking pages
const BookingPage = lazy(() => import("../pages/bookings/BookingPage"))
const BookingListPage = lazy(() => import("../pages/bookings/BookingListPage"))
const BookingDetailPage = lazy(() =>
    import("../pages/bookings/BookingDetailPage")
)

// Review pages
const AddReviewPage = lazy(() => import("../pages/reviews/AddReviewPage"))

// Profile pages
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"))
const FavoritesPage = lazy(() => import("../pages/profile/FavoritesPage"))

// Host pages
const HostDashboardPage = lazy(() => import("../pages/host/HostDashboardPage"))
const HostPropertiesPage = lazy(() =>
    import("../pages/host/HostPropertiesPage")
)
const HostBookingsPage = lazy(() => import("../pages/host/HostBookingsPage"))
const PropertyFormPage = lazy(() => import("../pages/host/PropertyFormPage"))
const HostPropertyDetailPage = lazy(() =>
    import("../pages/host/HostPropertyDetailPage")
)

// Admin pages
const AdminDashboardPage = lazy(() =>
    import("../pages/admin/AdminDashboardPage")
)
const AdminPropertiesPage = lazy(() =>
    import("../pages/admin/AdminPropertiesPage")
)

const router = createBrowserRouter([
    // Main Layout - For public pages and user pages
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <HomePage />
                    </Suspense>
                ),
            },
            {
                path: "login",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <LoginPage />
                    </Suspense>
                ),
            },
            {
                path: "register",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <RegisterPage />
                    </Suspense>
                ),
            },
            {
                path: "forgot-password",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <ForgotPasswordPage />
                    </Suspense>
                ),
            },
            {
                path: "reset-password",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <ResetPasswordPage />
                    </Suspense>
                ),
            },
            {
                path: "properties",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <PropertyListPage />
                    </Suspense>
                ),
            },
            {
                path: "properties/:id",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <PropertyDetailPage />
                    </Suspense>
                ),
            },
            {
                path: "properties/:id/reviews",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <PropertyReviewsPage />
                    </Suspense>
                ),
            },
            {
                path: "reviews/add",
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                            <AddReviewPage />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "properties/:id/book",
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                            <BookingPage />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "bookings",
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                            <BookingListPage />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "bookings/:id",
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                            <BookingDetailPage />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "profile",
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                            <ProfilePage />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "favorites",
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                            <FavoritesPage />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
        ],
    },

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
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <HostDashboardPage />
                    </Suspense>
                ),
            },
            {
                path: "properties",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <HostPropertiesPage />
                    </Suspense>
                ),
            },
            {
                path: "bookings",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <HostBookingsPage />
                    </Suspense>
                ),
            },
            {
                path: "properties/add",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <PropertyFormPage />
                    </Suspense>
                ),
            },
            {
                path: "properties/:id/edit",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <PropertyFormPage />
                    </Suspense>
                ),
            },
            {
                path: "properties/:id",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <HostPropertyDetailPage />
                    </Suspense>
                ),
            },
        ],
    },

    // Admin Layout - For admin pages
    {
        path: "/admin",
        element: (
            <ProtectedRoute requiredRole="admin">
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <AdminDashboardPage />
                    </Suspense>
                ),
            },
            {
                path: "properties",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <AdminPropertiesPage />
                    </Suspense>
                ),
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
                        <Suspense fallback={<LoadingFallback />}>
                            <BookingDetailPage printMode={true} />
                        </Suspense>
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
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <NotFoundPage />
                    </Suspense>
                ),
            },
        ],
    },
])

const AppRouter = () => {
    return <RouterProvider router={router} />
}

export default AppRouter
