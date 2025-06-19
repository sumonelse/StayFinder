import { useState, useEffect, useRef } from "react"
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import {
    FaUserCircle,
    FaBars,
    FaTimes,
    FaHome,
    FaCalendarAlt,
    FaHeart,
    FaSignOutAlt,
    FaChevronDown,
    FaSearch,
} from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../ui"

/**
 * Enhanced Header component with modern styling and animations
 */
const Header = () => {
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isSearchExpanded, setIsSearchExpanded] = useState(false)

    const userMenuRef = useRef(null)
    const mobileMenuRef = useRef(null)
    const userButtonRef = useRef(null)
    const mobileButtonRef = useRef(null)
    const searchInputRef = useRef(null)

    // Handle scroll effect for transparent header on homepage
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close user menu when clicking outside
            if (
                isUserMenuOpen &&
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target) &&
                userButtonRef.current &&
                !userButtonRef.current.contains(event.target)
            ) {
                setIsUserMenuOpen(false)
            }

            // Close mobile menu when clicking outside
            if (
                isMenuOpen &&
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                mobileButtonRef.current &&
                !mobileButtonRef.current.contains(event.target)
            ) {
                setIsMenuOpen(false)
            }
        }

        // Close menus when pressing escape key
        const handleEscKey = (event) => {
            if (event.key === "Escape") {
                setIsUserMenuOpen(false)
                setIsMenuOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscKey)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEscKey)
        }
    }, [isUserMenuOpen, isMenuOpen])

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false)
    }, [location.pathname])

    const isHomePage = location.pathname === "/"
    const headerClass =
        isHomePage && !isScrolled
            ? "absolute top-0 left-0 right-0 z-50 transition-all duration-300"
            : "bg-white shadow-md sticky top-0 z-50 transition-all duration-300"

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
    const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen)
    const closeMenus = () => {
        setIsMenuOpen(false)
        setIsUserMenuOpen(false)
    }

    const handleLogout = () => {
        logout()
        closeMenus()
        navigate("/")
    }

    return (
        <header className={headerClass}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link
                        to="/"
                        className={`text-2xl font-bold font-heading ${
                            isHomePage && !isScrolled
                                ? "text-white"
                                : "text-primary-600"
                        } transition-colors duration-300 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg`}
                        onClick={closeMenus}
                    >
                        StayFinder
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Search Bar */}
                        <div
                            className={`relative transition-all duration-300 ${
                                isSearchExpanded ? "w-64" : "w-40"
                            }`}
                        >
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch
                                    className={`${
                                        isHomePage && !isScrolled
                                            ? "text-white"
                                            : "text-secondary-400"
                                    }`}
                                />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search stays..."
                                className={`w-full py-2 pl-10 pr-4 rounded-full text-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                                    isHomePage && !isScrolled
                                        ? "bg-white/10 text-white placeholder-white/70 focus:bg-white/20 focus:ring-white"
                                        : "bg-secondary-100 text-secondary-800 placeholder-secondary-500 focus:bg-white focus:ring-primary-500 border border-secondary-200"
                                }`}
                                onFocus={() => setIsSearchExpanded(true)}
                                onBlur={() => setIsSearchExpanded(false)}
                            />
                        </div>

                        <nav className="flex space-x-6">
                            <NavLink
                                to="/properties"
                                className={({ isActive }) =>
                                    isActive
                                        ? `font-medium ${
                                              isHomePage && !isScrolled
                                                  ? "text-white font-semibold"
                                                  : "text-primary-600"
                                          } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1`
                                        : `${
                                              isHomePage && !isScrolled
                                                  ? "text-white"
                                                  : "text-secondary-600"
                                          } hover:text-primary-500 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1`
                                }
                            >
                                Properties
                            </NavLink>
                            {isAuthenticated && (
                                <NavLink
                                    to="/bookings"
                                    className={({ isActive }) =>
                                        isActive
                                            ? `font-medium ${
                                                  isHomePage && !isScrolled
                                                      ? "text-white font-semibold"
                                                      : "text-primary-600"
                                              } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1`
                                            : `${
                                                  isHomePage && !isScrolled
                                                      ? "text-white"
                                                      : "text-secondary-600"
                                              } hover:text-primary-500 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1`
                                    }
                                >
                                    My Bookings
                                </NavLink>
                            )}
                            {isAuthenticated && user?.role === "host" && (
                                <NavLink
                                    to="/host"
                                    className={({ isActive }) =>
                                        isActive
                                            ? `font-medium ${
                                                  isHomePage && !isScrolled
                                                      ? "text-white font-semibold"
                                                      : "text-primary-600"
                                              } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1`
                                            : `${
                                                  isHomePage && !isScrolled
                                                      ? "text-white"
                                                      : "text-secondary-600"
                                              } hover:text-primary-500 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1`
                                    }
                                >
                                    Host Dashboard
                                </NavLink>
                            )}
                        </nav>
                    </div>

                    {/* User Menu (Desktop) */}
                    <div className="hidden md:block relative">
                        {isAuthenticated ? (
                            <div>
                                <button
                                    ref={userButtonRef}
                                    onClick={toggleUserMenu}
                                    className={`flex items-center space-x-2 ${
                                        isHomePage && !isScrolled
                                            ? "text-white"
                                            : "text-secondary-700"
                                    } hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors duration-200 rounded-full p-1 hover:bg-white/10`}
                                    aria-expanded={isUserMenuOpen}
                                    aria-haspopup="true"
                                >
                                    <span className="font-medium">
                                        {user.name}
                                    </span>
                                    <div className="relative">
                                        {user.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={user.name}
                                                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm">
                                                <FaUserCircle className="w-6 h-6 text-primary-600" />
                                            </div>
                                        )}
                                    </div>
                                    <FaChevronDown
                                        className={`transition-transform duration-200 ${
                                            isUserMenuOpen ? "rotate-180" : ""
                                        }`}
                                        size={12}
                                    />
                                </button>

                                {isUserMenuOpen && (
                                    <div
                                        ref={userMenuRef}
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-10 border border-secondary-100 overflow-hidden animate-scaleIn origin-top-right"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu-button"
                                    >
                                        <div className="px-4 py-2 border-b border-secondary-100">
                                            <p className="text-sm text-secondary-500">
                                                Signed in as
                                            </p>
                                            <p className="font-medium text-secondary-900 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="flex items-center px-4 py-2 text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                                            onClick={closeMenus}
                                            role="menuitem"
                                        >
                                            <FaUserCircle className="mr-2" />
                                            <span>Profile</span>
                                        </Link>
                                        <Link
                                            to="/favorites"
                                            className="flex items-center px-4 py-2 text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                                            onClick={closeMenus}
                                            role="menuitem"
                                        >
                                            <FaHeart className="mr-2" />
                                            <span>Favorites</span>
                                        </Link>
                                        <Link
                                            to="/bookings"
                                            className="flex items-center px-4 py-2 text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                                            onClick={closeMenus}
                                            role="menuitem"
                                        >
                                            <FaCalendarAlt className="mr-2" />
                                            <span>My Bookings</span>
                                        </Link>
                                        <div className="border-t border-secondary-100 mt-1 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full text-left px-4 py-2 text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                                                role="menuitem"
                                            >
                                                <FaSignOutAlt className="mr-2" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex space-x-3">
                                <Link
                                    to="/login"
                                    className={`btn ${
                                        isHomePage && !isScrolled
                                            ? "btn-ghost text-white hover:bg-white/10"
                                            : "btn-secondary"
                                    }`}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className={`btn ${
                                        isHomePage && !isScrolled
                                            ? "btn-outline bg-white text-primary-600 hover:bg-white/90 border-white"
                                            : "btn-primary"
                                    }`}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        ref={mobileButtonRef}
                        className={`md:hidden ${
                            isHomePage && !isScrolled
                                ? "text-white"
                                : "text-secondary-600"
                        } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 p-2 rounded-lg`}
                        onClick={toggleMenu}
                        aria-expanded={isMenuOpen}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-controls="mobile-menu"
                    >
                        {isMenuOpen ? (
                            <FaTimes size={24} />
                        ) : (
                            <FaBars size={24} />
                        )}
                    </button>
                </div>

                {/* Mobile Menu - Slide in from the side */}
                <div
                    id="mobile-menu"
                    ref={mobileMenuRef}
                    className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                        isMenuOpen ? "translate-x-0" : "translate-x-full"
                    } md:hidden`}
                    aria-hidden={!isMenuOpen}
                >
                    <div className="flex justify-between items-center p-4 border-b border-secondary-100">
                        <h2 className="text-xl font-bold text-primary-600">
                            Menu
                        </h2>
                        <button
                            onClick={toggleMenu}
                            className="text-secondary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 p-2 rounded-lg"
                            aria-label="Close menu"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>

                    <div className="p-4">
                        {/* Mobile Search */}
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-secondary-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search stays..."
                                className="w-full py-3 pl-10 pr-4 rounded-lg text-sm bg-secondary-100 text-secondary-800 placeholder-secondary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 border border-secondary-200"
                            />
                        </div>

                        {isAuthenticated && (
                            <div className="flex items-center space-x-3 mb-6 p-3 bg-secondary-50 rounded-xl">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm">
                                        <FaUserCircle className="w-8 h-8 text-primary-600" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-secondary-900">
                                        {user.name}
                                    </p>
                                    <p className="text-sm text-secondary-500 truncate max-w-[180px]">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        <nav className="flex flex-col space-y-1">
                            <NavLink
                                to="/properties"
                                className={({ isActive }) =>
                                    `flex items-center p-3 rounded-lg ${
                                        isActive
                                            ? "bg-primary-50 text-primary-600 font-medium"
                                            : "text-secondary-600 hover:bg-secondary-50"
                                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`
                                }
                                onClick={closeMenus}
                            >
                                <FaHome className="mr-3 text-lg" />
                                <span>Properties</span>
                            </NavLink>

                            {isAuthenticated && (
                                <>
                                    <NavLink
                                        to="/bookings"
                                        className={({ isActive }) =>
                                            `flex items-center p-3 rounded-lg ${
                                                isActive
                                                    ? "bg-primary-50 text-primary-600 font-medium"
                                                    : "text-secondary-600 hover:bg-secondary-50"
                                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`
                                        }
                                        onClick={closeMenus}
                                    >
                                        <FaCalendarAlt className="mr-3 text-lg" />
                                        <span>My Bookings</span>
                                    </NavLink>

                                    {user.role === "host" && (
                                        <NavLink
                                            to="/host"
                                            className={({ isActive }) =>
                                                `flex items-center p-3 rounded-lg ${
                                                    isActive
                                                        ? "bg-primary-50 text-primary-600 font-medium"
                                                        : "text-secondary-600 hover:bg-secondary-50"
                                                } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`
                                            }
                                            onClick={closeMenus}
                                        >
                                            <FaHome className="mr-3 text-lg" />
                                            <span>Host Dashboard</span>
                                        </NavLink>
                                    )}

                                    <NavLink
                                        to="/profile"
                                        className={({ isActive }) =>
                                            `flex items-center p-3 rounded-lg ${
                                                isActive
                                                    ? "bg-primary-50 text-primary-600 font-medium"
                                                    : "text-secondary-600 hover:bg-secondary-50"
                                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`
                                        }
                                        onClick={closeMenus}
                                    >
                                        <FaUserCircle className="mr-3 text-lg" />
                                        <span>Profile</span>
                                    </NavLink>

                                    <NavLink
                                        to="/favorites"
                                        className={({ isActive }) =>
                                            `flex items-center p-3 rounded-lg ${
                                                isActive
                                                    ? "bg-primary-50 text-primary-600 font-medium"
                                                    : "text-secondary-600 hover:bg-secondary-50"
                                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`
                                        }
                                        onClick={closeMenus}
                                    >
                                        <FaHeart className="mr-3 text-lg" />
                                        <span>Favorites</span>
                                    </NavLink>
                                </>
                            )}
                        </nav>

                        <div className="mt-8 pt-4 border-t border-secondary-100">
                            {isAuthenticated ? (
                                <Button
                                    variant="outline"
                                    fullWidth
                                    leftIcon={<FaSignOutAlt />}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            ) : (
                                <div className="flex flex-col space-y-3">
                                    <Link
                                        to="/login"
                                        className="btn btn-secondary w-full"
                                        onClick={closeMenus}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn btn-primary w-full"
                                        onClick={closeMenus}
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Overlay for mobile menu */}
                {isMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={toggleMenu}
                        aria-hidden="true"
                    />
                )}
            </div>
        </header>
    )
}

export default Header
