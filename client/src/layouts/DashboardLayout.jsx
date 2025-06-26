import { useState, useEffect } from "react"
import { Outlet, useLocation, Link, NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
    FaHome,
    FaCalendarAlt,
    FaChartBar,
    FaUsers,
    FaCog,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaUserCircle,
    FaChevronDown,
    FaChevronRight,
    FaList,
    FaPlus,
    FaComments,
    FaBell,
    FaSearch,
} from "react-icons/fa"

/**
 * Dashboard Layout component for host and admin interfaces
 * Provides a sidebar navigation and responsive design
 * Redesigned with Airbnb-style grey/black color scheme
 */
const DashboardLayout = () => {
    const { user, logout } = useAuth()
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const [activeSubmenu, setActiveSubmenu] = useState(null)
    const [notifications, setNotifications] = useState([
        { id: 1, text: "New booking request", isRead: false },
        { id: 2, text: "Message from guest", isRead: false },
    ])
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileSidebarOpen(false)
    }, [location.pathname])

    // Handle window resize for responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false)
            } else {
                setIsSidebarOpen(true)
            }
        }

        window.addEventListener("resize", handleResize)
        handleResize() // Initial check

        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen)
    }

    const toggleSubmenu = (menu) => {
        setActiveSubmenu(activeSubmenu === menu ? null : menu)
    }

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen)
    }

    const markAllNotificationsAsRead = () => {
        setNotifications(
            notifications.map((notification) => ({
                ...notification,
                isRead: true,
            }))
        )
    }

    const unreadNotificationsCount = notifications.filter(
        (notification) => !notification.isRead
    ).length

    // Navigation items based on user role
    const getNavItems = () => {
        if (user?.role === "admin") {
            return [
                {
                    label: "Dashboard",
                    icon: <FaChartBar />,
                    path: "/admin",
                    exact: true,
                },
                {
                    label: "Properties",
                    icon: <FaHome />,
                    path: "/admin/properties",
                },
                {
                    label: "Bookings",
                    icon: <FaCalendarAlt />,
                    path: "/admin/bookings",
                },
                {
                    label: "Users",
                    icon: <FaUsers />,
                    path: "/admin/users",
                },
                {
                    label: "Reviews",
                    icon: <FaComments />,
                    path: "/admin/reviews",
                },
                {
                    label: "Settings",
                    icon: <FaCog />,
                    path: "/admin/settings",
                },
            ]
        } else {
            return [
                {
                    label: "Dashboard",
                    icon: <FaChartBar />,
                    path: "/host",
                    exact: true,
                },
                {
                    label: "Properties",
                    icon: <FaHome />,
                    submenu: [
                        { label: "All Properties", path: "/host/properties" },
                        { label: "Add Property", path: "/host/properties/add" },
                    ],
                },
                {
                    label: "Bookings",
                    icon: <FaCalendarAlt />,
                    submenu: [
                        { label: "All Bookings", path: "/host/bookings" },
                        {
                            label: "Pending Requests",
                            path: "/host/bookings/pending",
                        },
                    ],
                },
                {
                    label: "Reviews",
                    icon: <FaComments />,
                    path: "/host/reviews",
                },
                {
                    label: "Settings",
                    icon: <FaCog />,
                    path: "/host/settings",
                },
            ]
        }
    }

    const navItems = getNavItems()

    const isSubmenuActive = (submenuItems) => {
        return submenuItems.some((item) => location.pathname === item.path)
    }

    return (
        <div className="flex h-screen bg-secondary-50">
            {/* Sidebar - Desktop */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-secondary-900 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } ${
                    isMobileSidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-800">
                        <Link
                            to="/"
                            className="flex items-center space-x-2 font-bold text-xl text-white"
                        >
                            <span>StayFinder</span>
                        </Link>
                        <button
                            onClick={toggleMobileSidebar}
                            className="p-2 rounded-md text-secondary-400 hover:text-white lg:hidden"
                            aria-label="Close sidebar"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className="p-4 border-b border-secondary-800">
                        <div className="flex items-center space-x-3">
                            {user?.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-secondary-700"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-secondary-700 flex items-center justify-center">
                                    <FaUserCircle className="text-secondary-300 text-xl" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-secondary-400 truncate">
                                    {user?.role === "admin"
                                        ? "Administrator"
                                        : "Host"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <div key={item.label}>
                                {item.submenu ? (
                                    <div className="mb-1">
                                        <button
                                            onClick={() =>
                                                toggleSubmenu(item.label)
                                            }
                                            className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                                isSubmenuActive(item.submenu)
                                                    ? "bg-secondary-800 text-white"
                                                    : "text-secondary-300 hover:bg-secondary-800 hover:text-white"
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <span className="mr-3 text-lg">
                                                    {item.icon}
                                                </span>
                                                <span>{item.label}</span>
                                            </div>
                                            {activeSubmenu === item.label ? (
                                                <FaChevronDown className="text-xs" />
                                            ) : (
                                                <FaChevronRight className="text-xs" />
                                            )}
                                        </button>
                                        {activeSubmenu === item.label && (
                                            <div className="mt-1 ml-6 space-y-1">
                                                {item.submenu.map((subItem) => (
                                                    <NavLink
                                                        key={subItem.label}
                                                        to={subItem.path}
                                                        className={({
                                                            isActive,
                                                        }) =>
                                                            `block px-3 py-2 text-sm rounded-md ${
                                                                isActive
                                                                    ? "bg-secondary-700 text-white font-medium"
                                                                    : "text-secondary-400 hover:bg-secondary-800 hover:text-white"
                                                            }`
                                                        }
                                                    >
                                                        {subItem.label}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        end={item.exact}
                                        className={({ isActive }) =>
                                            `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                                isActive
                                                    ? "bg-secondary-800 text-white"
                                                    : "text-secondary-300 hover:bg-secondary-800 hover:text-white"
                                            }`
                                        }
                                    >
                                        <span className="mr-3 text-lg">
                                            {item.icon}
                                        </span>
                                        <span>{item.label}</span>
                                    </NavLink>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-secondary-800">
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium text-secondary-300 rounded-md hover:bg-secondary-800 hover:text-white transition-colors duration-200"
                        >
                            <FaSignOutAlt className="mr-3" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <header className="bg-white border-b border-secondary-200 shadow-sm">
                    <div className="flex items-center justify-between h-16 px-4">
                        <div className="flex items-center">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-md text-secondary-500 hover:bg-secondary-100 lg:mr-2 hidden lg:block"
                                aria-label={
                                    isSidebarOpen
                                        ? "Collapse sidebar"
                                        : "Expand sidebar"
                                }
                            >
                                <FaBars />
                            </button>
                            <button
                                onClick={toggleMobileSidebar}
                                className="p-2 rounded-md text-secondary-500 hover:bg-secondary-100 lg:hidden"
                                aria-label="Open sidebar"
                            >
                                <FaBars />
                            </button>
                            <h1 className="ml-2 text-xl font-semibold text-secondary-900">
                                {user?.role === "admin"
                                    ? "Admin Dashboard"
                                    : "Host Dashboard"}
                            </h1>
                        </div>

                        {/* Search bar */}
                        <div className="hidden md:flex items-center max-w-md w-full mx-4">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-secondary-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg bg-secondary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={toggleNotifications}
                                    className="p-2 rounded-full text-secondary-600 hover:bg-secondary-100 relative"
                                    aria-label="Notifications"
                                >
                                    <FaBell />
                                    {unreadNotificationsCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-primary-500 rounded-full">
                                            {unreadNotificationsCount}
                                        </span>
                                    )}
                                </button>

                                {isNotificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-secondary-200 z-50 overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-3 bg-secondary-50 border-b border-secondary-200">
                                            <h3 className="font-medium text-secondary-900">
                                                Notifications
                                            </h3>
                                            <button
                                                onClick={
                                                    markAllNotificationsAsRead
                                                }
                                                className="text-xs text-primary-500 hover:text-primary-600"
                                            >
                                                Mark all as read
                                            </button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                <div>
                                                    {notifications.map(
                                                        (notification) => (
                                                            <div
                                                                key={
                                                                    notification.id
                                                                }
                                                                className={`px-4 py-3 border-b border-secondary-100 hover:bg-secondary-50 ${
                                                                    !notification.isRead
                                                                        ? "bg-secondary-50"
                                                                        : ""
                                                                }`}
                                                            >
                                                                <p
                                                                    className={`text-sm ${
                                                                        !notification.isRead
                                                                            ? "font-medium text-secondary-900"
                                                                            : "text-secondary-600"
                                                                    }`}
                                                                >
                                                                    {
                                                                        notification.text
                                                                    }
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-6 text-center text-secondary-500">
                                                    No notifications
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-4 py-2 border-t border-secondary-200 bg-secondary-50">
                                            <Link
                                                to="/host/notifications"
                                                className="block text-center text-sm text-primary-500 hover:text-primary-600"
                                                onClick={() =>
                                                    setIsNotificationsOpen(
                                                        false
                                                    )
                                                }
                                            >
                                                View all notifications
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="relative">
                                <Link
                                    to="/host/properties/add"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors duration-200"
                                >
                                    <FaPlus className="mr-2" />
                                    <span>Add Property</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-secondary-50 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile sidebar backdrop */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-secondary-900 bg-opacity-50 z-40 lg:hidden"
                    onClick={toggleMobileSidebar}
                    aria-hidden="true"
                />
            )}
        </div>
    )
}

export default DashboardLayout
