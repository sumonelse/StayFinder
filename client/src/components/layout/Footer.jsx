import { Link } from "react-router-dom"
import {
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaLinkedin,
    FaMapMarkerAlt,
    FaEnvelope,
    FaPhone,
    FaHeart,
} from "react-icons/fa"

/**
 * Enhanced Footer component with modern styling and better organization
 */
const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-secondary-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                {/* Newsletter Section */}
                <div className="bg-primary-900 rounded-xl p-8 mb-12 shadow-lg transform -translate-y-20">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-6 md:mb-0 md:mr-8">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Subscribe to our newsletter
                            </h3>
                            <p className="text-primary-100">
                                Get the latest updates on new properties and
                                travel tips
                            </p>
                        </div>
                        <div className="w-full md:w-auto">
                            <form className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 bg-primary-800 text-white placeholder-primary-300 border border-primary-700"
                                />
                                <button
                                    type="submit"
                                    className="btn bg-white text-primary-700 hover:bg-primary-50 px-6"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Company Info */}
                    <div>
                        <Link to="/" className="inline-block">
                            <h3 className="text-2xl font-bold text-white mb-4 font-heading">
                                StayFinder
                            </h3>
                        </Link>
                        <p className="text-secondary-300 mb-6">
                            Find your perfect stay anywhere in the world. From
                            cozy apartments to luxury villas, we've got you
                            covered.
                        </p>
                        <div className="space-y-3 text-secondary-300">
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="mt-1 mr-3 text-primary-400" />
                                <span>
                                    123 Booking Street, Travel City, TC 10100
                                </span>
                            </div>
                            <div className="flex items-center">
                                <FaEnvelope className="mr-3 text-primary-400" />
                                <span>contact@stayfinder.com</span>
                            </div>
                            <div className="flex items-center">
                                <FaPhone className="mr-3 text-primary-400" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white border-b border-secondary-700 pb-2">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/"
                                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 flex items-center"
                                >
                                    <span className="mr-2">›</span> Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/properties"
                                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 flex items-center"
                                >
                                    <span className="mr-2">›</span> Properties
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/login"
                                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 flex items-center"
                                >
                                    <span className="mr-2">›</span> Login
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/register"
                                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 flex items-center"
                                >
                                    <span className="mr-2">›</span> Sign Up
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Host Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white border-b border-secondary-700 pb-2">
                            For Hosts
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/host"
                                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 flex items-center"
                                >
                                    <span className="mr-2">›</span> Host
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/host/properties"
                                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 flex items-center"
                                >
                                    <span className="mr-2">›</span> Manage
                                    Properties
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/host/bookings"
                                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 flex items-center"
                                >
                                    <span className="mr-2">›</span> Manage
                                    Bookings
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/host/properties/add"
                                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 flex items-center"
                                >
                                    <span className="mr-2">›</span> Add Property
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white border-b border-secondary-700 pb-2">
                            Support
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="#"
                                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 flex items-center"
                                >
                                    <span className="mr-2">›</span> Help Center
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 flex items-center"
                                >
                                    <span className="mr-2">›</span> Contact Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 flex items-center"
                                >
                                    <span className="mr-2">›</span> Privacy
                                    Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 flex items-center"
                                >
                                    <span className="mr-2">›</span> Terms of
                                    Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Social Media and Copyright */}
                <div className="border-t border-secondary-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex space-x-4 mb-4 md:mb-0">
                        <a
                            href="#"
                            className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-secondary-300 hover:bg-primary-600 hover:text-white transition-all duration-300"
                            aria-label="Facebook"
                        >
                            <FaFacebook size={18} />
                        </a>
                        <a
                            href="#"
                            className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-secondary-300 hover:bg-primary-600 hover:text-white transition-all duration-300"
                            aria-label="Twitter"
                        >
                            <FaTwitter size={18} />
                        </a>
                        <a
                            href="#"
                            className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-secondary-300 hover:bg-primary-600 hover:text-white transition-all duration-300"
                            aria-label="Instagram"
                        >
                            <FaInstagram size={18} />
                        </a>
                        <a
                            href="#"
                            className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-secondary-300 hover:bg-primary-600 hover:text-white transition-all duration-300"
                            aria-label="LinkedIn"
                        >
                            <FaLinkedin size={18} />
                        </a>
                    </div>
                    <p className="text-secondary-400 text-center">
                        &copy; {currentYear} StayFinder. All rights reserved.
                        Made with{" "}
                        <FaHeart
                            className="inline-block text-accent-500 mx-1"
                            size={14}
                        />{" "}
                        for travelers worldwide.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
