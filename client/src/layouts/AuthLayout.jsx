import { Link, Outlet } from "react-router-dom"
import { FaHome } from "react-icons/fa"

/**
 * Authentication layout for login, registration and password reset pages
 * Provides a clean, focused interface for authentication flows
 */
const AuthLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-secondary-50">
            {/* Simple header with logo */}
            <header className="bg-white shadow-sm py-4">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <Link
                            to="/"
                            className="text-2xl font-bold text-primary-600 font-heading hover:opacity-90 transition-opacity"
                        >
                            StayFinder
                        </Link>
                        <Link
                            to="/"
                            className="flex items-center text-secondary-600 hover:text-primary-600 transition-colors"
                        >
                            <FaHome className="mr-2" />
                            <span>Back to Home</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </main>

            {/* Simple footer */}
            <footer className="py-6 bg-white border-t border-secondary-200">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-secondary-600 text-sm">
                            &copy; {new Date().getFullYear()} StayFinder. All
                            rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link
                                to="/terms"
                                className="text-secondary-600 hover:text-primary-600 text-sm"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                to="/privacy"
                                className="text-secondary-600 hover:text-primary-600 text-sm"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/help"
                                className="text-secondary-600 hover:text-primary-600 text-sm"
                            >
                                Help Center
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Decorative elements */}
            <div className="fixed top-0 right-0 w-1/3 h-full bg-gradient-to-b from-primary-50 to-transparent opacity-50 pointer-events-none z-0" />
            <div className="fixed bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-accent-50 to-transparent opacity-50 pointer-events-none z-0" />
        </div>
    )
}

export default AuthLayout
