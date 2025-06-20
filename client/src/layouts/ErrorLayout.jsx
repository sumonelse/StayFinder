import { Link, Outlet } from "react-router-dom"
import { FaHome, FaArrowLeft } from "react-icons/fa"

/**
 * Error layout for 404, 500 and other error pages
 * Provides a clean interface for error states with helpful navigation
 */
const ErrorLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-secondary-50">
            {/* Simple header */}
            <header className="bg-white shadow-sm py-4">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <Link
                            to="/"
                            className="text-2xl font-bold text-primary-600 font-heading hover:opacity-90 transition-opacity"
                        >
                            StayFinder
                        </Link>
                        <div className="flex space-x-4">
                            <Link
                                to="/"
                                className="flex items-center text-secondary-600 hover:text-primary-600 transition-colors"
                            >
                                <FaHome className="mr-2" />
                                <span>Home</span>
                            </Link>
                            <button
                                onClick={() => window.history.back()}
                                className="flex items-center text-secondary-600 hover:text-primary-600 transition-colors"
                            >
                                <FaArrowLeft className="mr-2" />
                                <span>Go Back</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-lg text-center">
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
                                to="/help"
                                className="text-secondary-600 hover:text-primary-600 text-sm"
                            >
                                Help Center
                            </Link>
                            <Link
                                to="/contact"
                                className="text-secondary-600 hover:text-primary-600 text-sm"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Decorative elements */}
            <div className="fixed top-0 left-0 w-full h-full bg-pattern opacity-5 pointer-events-none z-0" />
        </div>
    )
}

export default ErrorLayout
