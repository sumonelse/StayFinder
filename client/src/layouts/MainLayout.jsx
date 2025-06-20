import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import { FaArrowUp, FaCookieBite, FaTimes } from "react-icons/fa"

/**
 * Enhanced main layout component with improved structure, scroll behavior,
 * cookie consent, and loading transitions
 */
const MainLayout = () => {
    const location = useLocation()
    const [showScrollButton, setShowScrollButton] = useState(false)
    const [showCookieConsent, setShowCookieConsent] = useState(true)
    const [pageTransition, setPageTransition] = useState(false)

    // Scroll to top on route change and trigger page transition
    useEffect(() => {
        window.scrollTo(0, 0)
        setPageTransition(true)
        const timer = setTimeout(() => setPageTransition(false), 300)
        return () => clearTimeout(timer)
    }, [location.pathname])

    // Show/hide scroll button based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollButton(window.scrollY > 300)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Check if cookie consent was previously accepted
    useEffect(() => {
        const consentGiven = localStorage.getItem("cookieConsent") === "true"
        setShowCookieConsent(!consentGiven)
    }, [])

    // Handle cookie consent
    const acceptCookies = () => {
        localStorage.setItem("cookieConsent", "true")
        setShowCookieConsent(false)
    }

    // Determine if current page is homepage
    const isHomePage = location.pathname === "/"

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary-50">
            <Header />

            {/* Main content with page transition */}
            <main
                className={`flex-grow ${!isHomePage ? "pt-1" : "pb-0"} ${
                    pageTransition ? "opacity-0" : "opacity-100"
                } transition-opacity duration-300`}
            >
                <Outlet />
            </main>

            <Footer />

            {/* Scroll to top button with animation */}
            {showScrollButton && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 z-40 opacity-80 hover:opacity-100 hover:transform hover:scale-110 animate-fadeIn"
                    aria-label="Scroll to top"
                >
                    <FaArrowUp className="h-5 w-5" />
                </button>
            )}

            {/* Cookie consent banner */}
            {showCookieConsent && (
                <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50 animate-slideInRight">
                    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                        <div className="p-2 rounded-lg bg-primary-600 shadow-lg sm:p-3">
                            <div className="flex items-center justify-between flex-wrap">
                                <div className="flex-1 flex items-center">
                                    <span className="flex p-2 rounded-lg bg-primary-800">
                                        <FaCookieBite className="h-6 w-6 text-white" />
                                    </span>
                                    <p className="ml-3 font-medium text-white truncate">
                                        <span className="md:hidden">
                                            We use cookies for better
                                            experience.
                                        </span>
                                        <span className="hidden md:inline">
                                            We use cookies to enhance your
                                            browsing experience and analyze our
                                            traffic.
                                        </span>
                                    </p>
                                </div>
                                <div className="flex-shrink-0 flex items-center">
                                    <button
                                        onClick={acceptCookies}
                                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 focus:ring-white"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() =>
                                            setShowCookieConsent(false)
                                        }
                                        className="ml-3 flex items-center justify-center p-2 rounded-md text-white hover:text-primary-100 focus:outline-none focus:ring-2 focus:ring-white"
                                    >
                                        <FaTimes className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Page loading indicator (optional) */}
            <div
                className={`fixed top-0 left-0 right-0 h-1 bg-primary-600 transition-transform duration-300 ease-out z-50 ${
                    pageTransition
                        ? "transform-none"
                        : "transform -translate-x-full"
                }`}
            />
        </div>
    )
}

export default MainLayout
