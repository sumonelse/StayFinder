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
    FaBuilding,
    FaCompass,
    FaCog,
    FaUser,
} from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../ui"

/**
 * Enhanced Header component with improved visual hierarchy and modern styling
 */
const Header = () => {
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const userMenuRef = useRef(null)
    const mobileMenuRef = useRef(null)
    const userButtonRef = useRef(null)
    const mobileButtonRef = useRef(null)
    const searchInputRef = useRef(null)
    const searchContainerRef = useRef(null)

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

            // Close search when clicking outside
            if (
                isSearchOpen &&
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)
            ) {
                setIsSearchOpen(false)
            }
        }

        // Close menus when pressing escape key
        const handleEscKey = (event) => {
            if (event.key === "Escape") {
                setIsUserMenuOpen(false)
                setIsMenuOpen(false)
                setIsSearchOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscKey)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEscKey)
        }
    }, [isUserMenuOpen, isMenuOpen, isSearchOpen])

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false)
    }, [location.pathname])

    // Focus search input when search is opened
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isSearchOpen])

    const isHomePage = location.pathname === "/"
    const headerClass =
        isHomePage && !isScrolled
            ? "absolute top-0 left-0 right-0 z-50 transition-all duration-300 navbar-scroll-transition"
            : "bg-white shadow-lg sticky top-0 z-50 transition-all duration-300 border-b border-secondary-100 navbar-scroll-transition navbar-glass"

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
    const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen)
    const toggleSearch = () => setIsSearchOpen(!isSearchOpen)

    const closeMenus = () => {
        setIsMenuOpen(false)
        setIsUserMenuOpen(false)
        setIsSearchOpen(false)
    }

    const handleLogout = () => {
        logout()
        closeMenus()
        navigate("/")
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(
                `/properties?search=${encodeURIComponent(searchQuery.trim())}`
            )
            setIsSearchOpen(false)
            setSearchQuery("")
        }
    }

    return (
        <header className={headerClass}>
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo with subtle brand element and animation */}
                    <Link
                        to="/"
                        className="flex items-center group logo-hover"
                        onClick={closeMenus}
                        aria-label="StayFinder Home"
                    >
                        <div
                            className={`mr-2 flex items-center justify-center w-10 h-10 rounded-lg ${
                                isHomePage && !isScrolled
                                    ? "bg-white/20 text-white"
                                    : "bg-primary-50 text-primary-600"
                            } transition-colors duration-300 group-hover:scale-105`}
                        >
                            <FaCompass className="w-5 h-5" />
                        </div>
                        <span
                            className={`text-2xl font-bold font-heading ${
                                isHomePage && !isScrolled
                                    ? "text-white"
                                    : "text-primary-600"
                            } transition-colors duration-300 group-hover:opacity-90`}
                        >
                            StayFinder
                        </span>
                    </Link>

                    {/* Desktop Navigation - Centered */}
                    <div className="hidden md:flex items-center justify-center flex-1 mx-4">
                        {/* Main Navigation Links - Improved visual hierarchy with hover effects */}
                        <nav className="flex items-center space-x-6">
                            <NavLink
                                to="/properties"
                                className={({ isActive }) =>
                                    isActive
                                        ? `flex items-center font-medium px-3 py-2 rounded-lg ${
                                              isHomePage && !isScrolled
                                                  ? "bg-white/20 text-white"
                                                  : "bg-primary-50 text-primary-600"
                                          } transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 nav-link-hover nav-link-active`
                                        : `flex items-center px-3 py-2 rounded-lg ${
                                              isHomePage && !isScrolled
                                                  ? "text-white hover:bg-white/10"
                                                  : "text-secondary-700 hover:bg-secondary-50 hover:text-primary-600"
                                          } transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 nav-link-hover`
                                }
                            >
                                <FaBuilding className="mr-1.5 text-sm" />
                                <span>Properties</span>
                            </NavLink>

                            {isAuthenticated && (
                                <NavLink
                                    to="/bookings"
                                    className={({ isActive }) =>
                                        isActive
                                            ? `flex items-center font-medium px-3 py-2 rounded-lg ${
                                                  isHomePage && !isScrolled
                                                      ? "bg-white/20 text-white"
                                                      : "bg-primary-50 text-primary-600"
                                              } transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 nav-link-hover nav-link-active`
                                            : `flex items-center px-3 py-2 rounded-lg ${
                                                  isHomePage && !isScrolled
                                                      ? "text-white hover:bg-white/10"
                                                      : "text-secondary-700 hover:bg-secondary-50 hover:text-primary-600"
                                              } transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 nav-link-hover`
                                    }
                                >
                                    <FaCalendarAlt className="mr-1.5 text-sm" />
                                    <span>Bookings</span>
                                </NavLink>
                            )}
                        </nav>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center space-x-3">
                        {/* Search Button */}
                        <div className="relative" ref={searchContainerRef}>
                            <button
                                onClick={toggleSearch}
                                className={`p-2.5 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                                    isHomePage && !isScrolled
                                        ? "text-white hover:bg-white/10"
                                        : "text-secondary-700 hover:bg-secondary-50"
                                } ${isSearchOpen ? "bg-secondary-100" : ""}`}
                                aria-label="Search"
                            >
                                <FaSearch size={16} />
                            </button>

                            {/* Search Popup */}
                            {isSearchOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg py-3 px-4 z-10 border border-secondary-100 dropdown-animation">
                                    <form onSubmit={handleSearchSubmit}>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaSearch
                                                    className="text-secondary-400"
                                                    size={14}
                                                />
                                            </div>
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                placeholder="Search properties, locations..."
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full py-2.5 pl-10 pr-4 rounded-lg text-sm bg-secondary-50 text-secondary-800 placeholder-secondary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 border border-secondary-200"
                                            />
                                            <button
                                                type="submit"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-600 hover:text-primary-700"
                                                aria-label="Submit search"
                                            >
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="text-xs text-secondary-500">
                                                Popular:
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery("beach")
                                                    searchInputRef.current.focus()
                                                }}
                                                className="text-xs px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200"
                                            >
                                                Beach
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery("mountain")
                                                    searchInputRef.current.focus()
                                                }}
                                                className="text-xs px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200"
                                            >
                                                Mountain
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery("cabin")
                                                    searchInputRef.current.focus()
                                                }}
                                                className="text-xs px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200"
                                            >
                                                Cabin
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* User Menu (Desktop) - Enhanced and Reorganized */}
                        {isAuthenticated ? (
                            <div>
                                <button
                                    ref={userButtonRef}
                                    onClick={toggleUserMenu}
                                    className={`flex items-center space-x-2 ${
                                        isHomePage && !isScrolled
                                            ? "text-white"
                                            : "text-secondary-700"
                                    } hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors duration-200 rounded-full p-1.5 ${
                                        isHomePage && !isScrolled
                                            ? "hover:bg-white/10"
                                            : "hover:bg-secondary-50"
                                    } dropdown-indicator ${
                                        isUserMenuOpen ? "active" : ""
                                    } focus-ring`}
                                    aria-expanded={isUserMenuOpen}
                                    aria-haspopup="true"
                                >
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
                                        className={`transition-transform duration-200 ml-1 ${
                                            isUserMenuOpen ? "rotate-180" : ""
                                        } ${
                                            isHomePage && !isScrolled
                                                ? "text-white/70"
                                                : "text-secondary-400"
                                        }`}
                                        size={12}
                                    />
                                </button>

                                {isUserMenuOpen && (
                                    <div
                                        ref={userMenuRef}
                                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 z-10 border border-secondary-100 overflow-hidden dropdown-animation"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu-button"
                                    >
                                        <div className="px-4 py-3 border-b border-secondary-100 bg-secondary-50">
                                            <p className="text-xs text-secondary-500 uppercase tracking-wider font-medium mb-1">
                                                Signed in as
                                            </p>
                                            <div className="flex items-center">
                                                <div className="mr-3">
                                                    {user.profilePicture ? (
                                                        <img
                                                            src={
                                                                user.profilePicture
                                                            }
                                                            alt={user.name}
                                                            className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center border border-white shadow-sm">
                                                            <FaUserCircle className="w-5 h-5 text-primary-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-secondary-900 truncate">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-secondary-500 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dashboard Section */}
                                        {user?.role === "host" && (
                                            <div className="py-1">
                                                <h3 className="px-4 py-1 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                                                    Dashboard
                                                </h3>
                                                <Link
                                                    to="/host"
                                                    className="flex items-center px-4 py-2.5 text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                                                    onClick={closeMenus}
                                                    role="menuitem"
                                                >
                                                    <FaHome className="mr-3 text-secondary-400" />
                                                    <span>Host Dashboard</span>
                                                </Link>
                                                <Link
                                                    to="/host/properties"
                                                    className="flex items-center px-4 py-2.5 text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                                                    onClick={closeMenus}
                                                    role="menuitem"
                                                >
                                                    <FaBuilding className="mr-3 text-secondary-400" />
                                                    <span>My Properties</span>
                                                </Link>
                                            </div>
                                        )}

                                        {/* User Section */}
                                        <div className="py-1">
                                            <h3 className="px-4 py-1 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                                                Account
                                            </h3>
                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2.5 text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                                                onClick={closeMenus}
                                                role="menuitem"
                                            >
                                                <FaUser className="mr-3 text-secondary-400" />
                                                <span>Profile</span>
                                            </Link>
                                            <Link
                                                to="/bookings"
                                                className="flex items-center px-4 py-2.5 text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                                                onClick={closeMenus}
                                                role="menuitem"
                                            >
                                                <FaCalendarAlt className="mr-3 text-secondary-400" />
                                                <span>My Bookings</span>
                                            </Link>
                                            <Link
                                                to="/favorites"
                                                className="flex items-center px-4 py-2.5 text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                                                onClick={closeMenus}
                                                role="menuitem"
                                            >
                                                <FaHeart className="mr-3 text-secondary-400" />
                                                <span>Favorites</span>
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="flex items-center px-4 py-2.5 text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                                                onClick={closeMenus}
                                                role="menuitem"
                                            >
                                                <FaCog className="mr-3 text-secondary-400" />
                                                <span>Settings</span>
                                            </Link>
                                        </div>

                                        <div className="border-t border-secondary-100 mt-1 pt-1 bg-secondary-50">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full text-left px-4 py-2.5 text-secondary-700 hover:bg-secondary-100 hover:text-primary-600 focus:outline-none focus:bg-secondary-100 focus:text-primary-600"
                                                role="menuitem"
                                            >
                                                <FaSignOutAlt className="mr-3 text-secondary-400" />
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
                                    className={`btn btn-sm ${
                                        isHomePage && !isScrolled
                                            ? "bg-white/10 text-white hover:bg-white/20 focus:ring-white"
                                            : "btn-secondary"
                                    }`}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className={`btn btn-sm ${
                                        isHomePage && !isScrolled
                                            ? "bg-white text-primary-600 hover:bg-white/90 border-white"
                                            : "btn-primary"
                                    }`}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button - Enhanced */}
                    <div className="md:hidden flex items-center space-x-2">
                        {/* Mobile Search Button */}
                        <button
                            onClick={toggleSearch}
                            className={`p-2 rounded-lg ${
                                isHomePage && !isScrolled
                                    ? "text-white bg-white/10 hover:bg-white/20"
                                    : "text-secondary-600 bg-secondary-50 hover:bg-secondary-100"
                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors duration-200`}
                            aria-label="Search"
                        >
                            <FaSearch size={18} />
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            ref={mobileButtonRef}
                            className={`${
                                isHomePage && !isScrolled
                                    ? "text-white bg-white/10 hover:bg-white/20"
                                    : "text-secondary-600 bg-secondary-50 hover:bg-secondary-100"
                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 p-2 rounded-lg transition-colors duration-200`}
                            onClick={toggleMenu}
                            aria-expanded={isMenuOpen}
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            aria-controls="mobile-menu"
                        >
                            {isMenuOpen ? (
                                <FaTimes size={18} />
                            ) : (
                                <FaBars size={18} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Overlay */}
                {isSearchOpen && (
                    <div className="md:hidden mt-3 px-2 pb-3 animate-fadeIn">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative"
                        >
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch
                                    className="text-secondary-400"
                                    size={14}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Search properties, locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-2.5 pl-10 pr-12 rounded-lg text-sm bg-secondary-50 text-secondary-800 placeholder-secondary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 border border-secondary-200"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setIsSearchOpen(false)}
                                    className="p-2 text-secondary-400 hover:text-secondary-600"
                                    aria-label="Close search"
                                >
                                    <FaTimes size={16} />
                                </button>
                                <button
                                    type="submit"
                                    className="p-2 text-primary-600 hover:text-primary-700"
                                    aria-label="Submit search"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Mobile Menu - Enhanced with better visual hierarchy */}
                <div
                    id="mobile-menu"
                    ref={mobileMenuRef}
                    className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                        isMenuOpen
                            ? "translate-x-0 mobile-menu-animation"
                            : "translate-x-full"
                    } md:hidden overflow-y-auto scrollbar-thin`}
                    aria-hidden={!isMenuOpen}
                >
                    <div className="flex justify-between items-center p-4 border-b border-secondary-100 bg-primary-50">
                        <Link
                            to="/"
                            className="flex items-center"
                            onClick={closeMenus}
                        >
                            <div className="mr-2 flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 text-primary-600">
                                <FaCompass className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-primary-600 font-heading">
                                StayFinder
                            </h2>
                        </Link>
                        <button
                            onClick={toggleMenu}
                            className="text-secondary-600 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 p-2 rounded-lg transition-colors duration-200"
                            aria-label="Close menu"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <div className="p-4">
                        {/* Mobile Search - Enhanced */}
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch
                                    className="text-secondary-400"
                                    size={14}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Search stays..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-3 pl-10 pr-4 rounded-lg text-sm bg-secondary-50 text-secondary-800 placeholder-secondary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 border border-secondary-200"
                            />
                            <button
                                onClick={handleSearchSubmit}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-600 hover:text-primary-700"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* User Profile Card - Enhanced */}
                        {isAuthenticated && (
                            <div className="flex items-center space-x-3 mb-6 p-4 bg-secondary-50 rounded-xl border border-secondary-100">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm">
                                        <FaUserCircle className="w-8 h-8 text-primary-600" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-secondary-900 mb-0.5">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-secondary-500 truncate max-w-[180px] mb-1">
                                        {user.email}
                                    </p>
                                    <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                                        {user.role === "host"
                                            ? "Host"
                                            : "Guest"}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Navigation Links - Enhanced with better visual hierarchy */}
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2 px-2">
                                Main Navigation
                            </h3>
                            <nav className="flex flex-col space-y-1 bg-secondary-50 rounded-xl overflow-hidden">
                                <NavLink
                                    to="/properties"
                                    className={({ isActive }) =>
                                        `flex items-center p-3 ${
                                            isActive
                                                ? "bg-primary-50 text-primary-600 font-medium border-l-4 border-primary-500"
                                                : "text-secondary-700 hover:bg-secondary-100 border-l-4 border-transparent"
                                        } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors duration-200`
                                    }
                                    onClick={closeMenus}
                                >
                                    <FaBuilding className="mr-3 text-lg" />
                                    <span>Properties</span>
                                </NavLink>

                                {isAuthenticated && (
                                    <NavLink
                                        to="/bookings"
                                        className={({ isActive }) =>
                                            `flex items-center p-3 ${
                                                isActive
                                                    ? "bg-primary-50 text-primary-600 font-medium border-l-4 border-primary-500"
                                                    : "text-secondary-700 hover:bg-secondary-100 border-l-4 border-transparent"
                                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors duration-200`
                                        }
                                        onClick={closeMenus}
                                    >
                                        <FaCalendarAlt className="mr-3 text-lg" />
                                        <span>My Bookings</span>
                                    </NavLink>
                                )}
                            </nav>
                        </div>

                        {/* Dashboard Section - Only for hosts */}
                        {isAuthenticated && user?.role === "host" && (
                            <div className="mb-6">
                                <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2 px-2">
                                    Dashboard
                                </h3>
                                <nav className="flex flex-col space-y-1 bg-secondary-50 rounded-xl overflow-hidden">
                                    <NavLink
                                        to="/host"
                                        className={({ isActive }) =>
                                            `flex items-center p-3 ${
                                                isActive
                                                    ? "bg-primary-50 text-primary-600 font-medium border-l-4 border-primary-500"
                                                    : "text-secondary-700 hover:bg-secondary-100 border-l-4 border-transparent"
                                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors duration-200`
                                        }
                                        onClick={closeMenus}
                                    >
                                        <FaHome className="mr-3 text-lg" />
                                        <span>Host Dashboard</span>
                                    </NavLink>

                                    <NavLink
                                        to="/host/properties"
                                        className={({ isActive }) =>
                                            `flex items-center p-3 ${
                                                isActive
                                                    ? "bg-primary-50 text-primary-600 font-medium border-l-4 border-primary-500"
                                                    : "text-secondary-700 hover:bg-secondary-100 border-l-4 border-transparent"
                                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors duration-200`
                                        }
                                        onClick={closeMenus}
                                    >
                                        <FaBuilding className="mr-3 text-lg" />
                                        <span>My Properties</span>
                                    </NavLink>
                                </nav>
                            </div>
                        )}

                        {/* Account Section */}
                        {isAuthenticated && (
                            <div className="mb-6">
                                <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2 px-2">
                                    Account
                                </h3>
                                <nav className="flex flex-col space-y-1 bg-secondary-50 rounded-xl overflow-hidden">
                                    <NavLink
                                        to="/profile"
                                        className={({ isActive }) =>
                                            `flex items-center p-3 ${
                                                isActive
                                                    ? "bg-primary-50 text-primary-600 font-medium border-l-4 border-primary-500"
                                                    : "text-secondary-700 hover:bg-secondary-100 border-l-4 border-transparent"
                                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors duration-200`
                                        }
                                        onClick={closeMenus}
                                    >
                                        <FaUser className="mr-3 text-lg" />
                                        <span>Profile</span>
                                    </NavLink>

                                    <NavLink
                                        to="/favorites"
                                        className={({ isActive }) =>
                                            `flex items-center p-3 ${
                                                isActive
                                                    ? "bg-primary-50 text-primary-600 font-medium border-l-4 border-primary-500"
                                                    : "text-secondary-700 hover:bg-secondary-100 border-l-4 border-transparent"
                                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors duration-200`
                                        }
                                        onClick={closeMenus}
                                    >
                                        <FaHeart className="mr-3 text-lg" />
                                        <span>Favorites</span>
                                    </NavLink>

                                    <NavLink
                                        to="/settings"
                                        className={({ isActive }) =>
                                            `flex items-center p-3 ${
                                                isActive
                                                    ? "bg-primary-50 text-primary-600 font-medium border-l-4 border-primary-500"
                                                    : "text-secondary-700 hover:bg-secondary-100 border-l-4 border-transparent"
                                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors duration-200`
                                        }
                                        onClick={closeMenus}
                                    >
                                        <FaCog className="mr-3 text-lg" />
                                        <span>Settings</span>
                                    </NavLink>
                                </nav>
                            </div>
                        )}

                        <div className="mt-8 pt-4 border-t border-secondary-100">
                            {isAuthenticated ? (
                                <Button
                                    variant="outline"
                                    fullWidth
                                    leftIcon={<FaSignOutAlt />}
                                    onClick={handleLogout}
                                    className="py-3"
                                >
                                    Logout
                                </Button>
                            ) : (
                                <div className="flex flex-col space-y-3">
                                    <Link
                                        to="/login"
                                        className="btn btn-secondary w-full py-3"
                                        onClick={closeMenus}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn btn-primary w-full py-3"
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
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm"
                        onClick={toggleMenu}
                        aria-hidden="true"
                    />
                )}
            </div>
        </header>
    )
}

export default Header
