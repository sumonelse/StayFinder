import { Outlet, useLocation } from "react-router-dom"
import { useEffect } from "react"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

/**
 * Enhanced main layout component with improved structure and scroll behavior
 */
const MainLayout = () => {
    const location = useLocation()

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    // Determine if current page is homepage
    const isHomePage = location.pathname === "/"

    return (
        <div className="flex flex-col min-h-screen bg-secondary-50">
            <Header />
            <main className={`flex-grow ${!isHomePage ? "pt-1" : "pb-0"}`}>
                <Outlet />
            </main>
            <Footer />

            {/* Scroll to top button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-6 right-6 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-40 opacity-80 hover:opacity-100"
                aria-label="Scroll to top"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                    />
                </svg>
            </button>
        </div>
    )
}

export default MainLayout
