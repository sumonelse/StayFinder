import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import { FaArrowUp } from "react-icons/fa"

/**
 * Enhanced main layout component with improved structure, scroll behavior,
 * and loading transitions
 */
const MainLayout = () => {
    const location = useLocation()
    const [showScrollButton, setShowScrollButton] = useState(false)
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
