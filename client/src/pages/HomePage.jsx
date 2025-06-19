import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
    FaSearch,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaUsers,
    FaStar,
    FaArrowRight,
    FaHeart,
    FaHome,
    FaKey,
    FaComments,
    FaShieldAlt,
    FaGlobe,
    FaUmbrellaBeach,
    FaMountain,
    FaCity,
    FaTree,
    FaChevronDown,
    FaFilter,
    FaAngleRight,
    FaMinus,
    FaPlus,
} from "react-icons/fa"
import { FiTrendingUp } from "react-icons/fi"
import { IoIosRocket } from "react-icons/io"
import { RiVipCrownFill } from "react-icons/ri"
import { MdExplore, MdOutlineVerified } from "react-icons/md"
import { Button, Input, DatePicker } from "../components/ui"

/**
 * Enhanced Home page component with modern UI elements and animations
 */
const HomePage = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useState({
        location: "",
        checkIn: "",
        checkOut: "",
        guests: 1,
    })
    const [isVisible, setIsVisible] = useState(false)
    const [activeTab, setActiveTab] = useState("all")

    // Animation on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsVisible(true)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setSearchParams((prev) => ({ ...prev, [name]: value }))
    }

    const handleSearch = (e) => {
        e.preventDefault()
        const queryParams = new URLSearchParams()

        if (searchParams.location) {
            queryParams.append("location", searchParams.location)
        }
        if (searchParams.checkIn) {
            queryParams.append("checkIn", searchParams.checkIn)
        }
        if (searchParams.checkOut) {
            queryParams.append("checkOut", searchParams.checkOut)
        }
        if (searchParams.guests) {
            queryParams.append("guests", searchParams.guests)
        }

        navigate(`/properties?${queryParams.toString()}`)
    }

    // Sample featured properties data
    const featuredProperties = [
        {
            id: 1,
            title: "Luxury Beachfront Villa",
            location: "Malibu, California",
            price: 350,
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            beds: 4,
            baths: 3,
            category: "luxury",
            isNew: true,
        },
        {
            id: 2,
            title: "Modern Downtown Apartment",
            location: "New York, NY",
            price: 180,
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1980&q=80",
            beds: 2,
            baths: 1,
            category: "trending",
            isNew: false,
        },
        {
            id: 3,
            title: "Cozy Mountain Cabin",
            location: "Aspen, Colorado",
            price: 220,
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
            beds: 3,
            baths: 2,
            category: "popular",
            isNew: false,
        },
        {
            id: 4,
            title: "Oceanview Penthouse Suite",
            location: "Miami, Florida",
            price: 420,
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            beds: 3,
            baths: 3,
            category: "luxury",
            isNew: true,
        },
        {
            id: 5,
            title: "Charming Countryside Cottage",
            location: "Cotswolds, UK",
            price: 195,
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1595877244574-e90ce41ce089?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            beds: 2,
            baths: 1,
            category: "trending",
            isNew: false,
        },
        {
            id: 6,
            title: "Urban Loft with City Views",
            location: "Chicago, Illinois",
            price: 210,
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
            beds: 1,
            baths: 1,
            category: "popular",
            isNew: false,
        },
    ]

    // Filter properties based on active tab
    const filteredProperties =
        activeTab === "all"
            ? featuredProperties
            : featuredProperties.filter(
                  (property) => property.category === activeTab
              )

    // Popular destinations
    const destinations = [
        {
            name: "Beach Getaways",
            icon: <FaUmbrellaBeach />,
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80",
            count: 243,
        },
        {
            name: "Mountain Retreats",
            icon: <FaMountain />,
            image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            count: 187,
        },
        {
            name: "City Escapes",
            icon: <FaCity />,
            image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2144&q=80",
            count: 321,
        },
        {
            name: "Countryside",
            icon: <FaTree />,
            image: "https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            count: 156,
        },
    ]

    // Format price with currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(price)
    }

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center noise-container">
                <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 via-dark-900/80 to-primary-900/80 z-10"></div>
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        alt="Beautiful vacation rental"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="container mx-auto px-4 relative z-20 pt-20">
                    <div className="max-w-3xl">
                        <div className="inline-block mb-6 animate-fadeIn">
                            <span className="badge bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-medium">
                                Find your next adventure
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-heading leading-tight animate-fadeIn">
                            <span className="text-gradient">Discover</span> Your
                            Perfect Stay Anywhere in the World
                        </h1>
                        <p className="text-xl text-white/90 mb-10 animate-fadeIn animation-delay-200">
                            Explore unique accommodations from cozy apartments
                            to luxury villas with our curated selection of
                            properties
                        </p>

                        {/* Search Form */}
                        <div className="glass rounded-3xl shadow-glass-card p-1 animate-fadeIn animation-delay-400">
                            <form
                                onSubmit={handleSearch}
                                className="bg-white rounded-2xl p-6 shadow-inner"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <Input
                                            id="location"
                                            name="location"
                                            value={searchParams.location}
                                            onChange={handleInputChange}
                                            placeholder="Destination, city, or address"
                                            label="Where to?"
                                            leftIcon={
                                                <FaMapMarkerAlt className="text-primary-500" />
                                            }
                                        />
                                    </div>

                                    <div>
                                        <DatePicker
                                            id="checkIn"
                                            label="Check In"
                                            value={searchParams.checkIn}
                                            onChange={(date) =>
                                                setSearchParams((prev) => ({
                                                    ...prev,
                                                    checkIn: date,
                                                }))
                                            }
                                            placeholder="Select date"
                                            minDate={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                        />
                                    </div>

                                    <div>
                                        <DatePicker
                                            id="checkOut"
                                            label="Check Out"
                                            value={searchParams.checkOut}
                                            onChange={(date) =>
                                                setSearchParams((prev) => ({
                                                    ...prev,
                                                    checkOut: date,
                                                }))
                                            }
                                            placeholder="Select date"
                                            minDate={
                                                searchParams.checkIn ||
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="guests"
                                            className="form-label flex items-center"
                                        >
                                            <FaUsers className="mr-2 text-primary-500" />
                                            <span>Guests</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <div className="flex items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSearchParams(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    guests: Math.max(
                                                                        1,
                                                                        parseInt(
                                                                            prev.guests
                                                                        ) - 1
                                                                    ),
                                                                })
                                                            )
                                                        }
                                                        className="absolute left-0 top-0 bottom-0 px-3 text-secondary-600 hover:text-primary-600 focus:outline-none disabled:opacity-50"
                                                        disabled={
                                                            searchParams.guests <=
                                                            1
                                                        }
                                                        aria-label="Decrease guests"
                                                    >
                                                        <FaMinus size={12} />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        id="guests"
                                                        name="guests"
                                                        min="1"
                                                        value={
                                                            searchParams.guests
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="input-field text-center"
                                                        aria-label="Number of guests"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSearchParams(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    guests:
                                                                        parseInt(
                                                                            prev.guests
                                                                        ) + 1,
                                                                })
                                                            )
                                                        }
                                                        className="absolute right-0 top-0 bottom-0 px-3 text-secondary-600 hover:text-primary-600 focus:outline-none"
                                                        aria-label="Increase guests"
                                                    >
                                                        <FaPlus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                className="h-full py-3 px-6"
                                                leftIcon={<FaSearch />}
                                            >
                                                Search
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-secondary-100">
                                    <span className="text-secondary-600 text-sm font-medium">
                                        Popular filters:
                                    </span>
                                    <button
                                        type="button"
                                        className="badge badge-secondary hover:bg-secondary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                                        aria-label="Filter by beach access"
                                    >
                                        <FaUmbrellaBeach className="mr-1.5" />
                                        Beach access
                                    </button>
                                    <button
                                        type="button"
                                        className="badge badge-secondary hover:bg-secondary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                                        aria-label="Filter by entire homes"
                                    >
                                        <FaHome className="mr-1.5" /> Entire
                                        homes
                                    </button>
                                    <button
                                        type="button"
                                        className="badge badge-secondary hover:bg-secondary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                                        aria-label="Filter by family-friendly properties"
                                    >
                                        <FaUsers className="mr-1.5" />
                                        Family-friendly
                                    </button>
                                    <button
                                        type="button"
                                        className="badge badge-secondary hover:bg-secondary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                                        aria-label="Show more filters"
                                    >
                                        <FaFilter className="mr-1.5" /> More
                                        filters
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
                    <div className="w-10 h-14 rounded-full glass flex items-center justify-center">
                        <FaChevronDown className="text-white animate-pulse-slow" />
                    </div>
                </div>
            </section>

            {/* Popular Destinations */}
            <section className="section-padding bg-dark-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-2">
                                Popular Destinations
                            </h2>
                            <p className="text-dark-600">
                                Discover the most sought-after locations for
                                your next trip
                            </p>
                        </div>
                        <Link
                            to="/properties"
                            className="flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors mt-4 md:mt-0"
                        >
                            Explore all destinations{" "}
                            <FaArrowRight className="ml-2" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {destinations.map((destination, index) => (
                            <Link
                                key={index}
                                to={`/properties?category=${destination.name
                                    .toLowerCase()
                                    .replace(" ", "-")}`}
                                className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-card hover-lift"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/40 to-transparent z-10"></div>
                                <img
                                    src={destination.image}
                                    alt={destination.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                                    <div className="flex items-center mb-2">
                                        <div className="w-12 h-12 rounded-full glass flex items-center justify-center mr-3 group-hover:bg-primary-500 transition-colors">
                                            {destination.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                {destination.name}
                                            </h3>
                                            <p className="text-white/80 text-sm">
                                                {destination.count} properties
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-white/90 text-sm">
                                            Explore amazing stays
                                        </span>
                                        <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                                            <FaAngleRight className="text-white" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Properties Section */}
            <section className="section-padding">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-2">
                                Featured Properties
                            </h2>
                            <p className="text-dark-600">
                                Handpicked accommodations for your perfect
                                getaway
                            </p>
                        </div>
                        <Button
                            as={Link}
                            to="/properties"
                            variant="ghost"
                            className="mt-4 md:mt-0"
                            rightIcon={<FaArrowRight />}
                        >
                            View all properties
                        </Button>
                    </div>

                    {/* Property Category Tabs */}
                    <div className="flex flex-wrap gap-2 mb-8 border-b border-dark-200">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                                activeTab === "all"
                                    ? "text-primary-600 border-b-2 border-primary-500"
                                    : "text-dark-600 hover:text-primary-600"
                            }`}
                        >
                            All Properties
                        </button>
                        <button
                            onClick={() => setActiveTab("luxury")}
                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center ${
                                activeTab === "luxury"
                                    ? "text-primary-600 border-b-2 border-primary-500"
                                    : "text-dark-600 hover:text-primary-600"
                            }`}
                        >
                            <RiVipCrownFill className="mr-2" /> Luxury
                        </button>
                        <button
                            onClick={() => setActiveTab("trending")}
                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center ${
                                activeTab === "trending"
                                    ? "text-primary-600 border-b-2 border-primary-500"
                                    : "text-dark-600 hover:text-primary-600"
                            }`}
                        >
                            <FiTrendingUp className="mr-2" /> Trending
                        </button>
                        <button
                            onClick={() => setActiveTab("popular")}
                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center ${
                                activeTab === "popular"
                                    ? "text-primary-600 border-b-2 border-primary-500"
                                    : "text-dark-600 hover:text-primary-600"
                            }`}
                        >
                            <IoIosRocket className="mr-2" /> Popular
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProperties.map((property) => (
                            <div
                                key={property.id}
                                className="card group overflow-hidden card-hover"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={property.image}
                                        alt={property.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <button className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2.5 rounded-full shadow-md transition-colors">
                                        <FaHeart className="text-dark-400 hover:text-accent-500" />
                                    </button>

                                    {/* Price Badge */}
                                    <div className="absolute bottom-4 left-4 bg-dark-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium">
                                        {formatPrice(property.price)}
                                        <span className="text-sm font-normal ml-1 text-white/80">
                                            /night
                                        </span>
                                    </div>

                                    {/* New Badge */}
                                    {property.isNew && (
                                        <div className="absolute top-4 left-4 bg-accent-500 text-white text-xs uppercase tracking-wider py-1.5 px-3 rounded-lg font-medium">
                                            New
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-semibold text-dark-900 group-hover:text-primary-600 transition-colors">
                                            {property.title}
                                        </h3>
                                        <div className="flex items-center bg-primary-50 px-2 py-1 rounded-lg">
                                            <FaStar className="text-warning-500 mr-1" />
                                            <span className="font-medium">
                                                {property.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-dark-600 mb-4 flex items-center">
                                        <FaMapMarkerAlt className="mr-2 text-primary-500" />
                                        {property.location}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-dark-600 text-sm">
                                            <span className="mr-4 flex items-center">
                                                <FaHome className="mr-1 text-primary-500" />{" "}
                                                {property.beds} beds
                                            </span>
                                            <span className="flex items-center">
                                                <FaUsers className="mr-1 text-primary-500" />{" "}
                                                {property.baths} baths
                                            </span>
                                        </div>
                                        <Link
                                            to={`/properties/${property.id}`}
                                            className="text-primary-600 font-medium hover:text-primary-700 text-sm flex items-center"
                                        >
                                            Details{" "}
                                            <FaAngleRight className="ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="section-padding bg-gradient-primary text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-noise opacity-5"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                            How StayFinder Works
                        </h2>
                        <p className="text-xl text-white/80">
                            Finding and booking your perfect accommodation has
                            never been easier
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-white/20 z-0"></div>

                        <div className="relative z-10 text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover-lift">
                            <div className="bg-white text-primary-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-highlight">
                                <FaSearch size={30} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4">
                                Search
                            </h3>
                            <p className="text-white/80 leading-relaxed">
                                Find the perfect place from our wide selection
                                of properties with advanced filters and search
                                options.
                            </p>
                        </div>
                        <div className="relative z-10 text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover-lift">
                            <div className="bg-white text-primary-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-highlight">
                                <FaCalendarAlt size={30} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4">
                                Book
                            </h3>
                            <p className="text-white/80 leading-relaxed">
                                Book your stay with our secure and easy booking
                                system. Instant confirmation and no hidden fees.
                            </p>
                        </div>
                        <div className="relative z-10 text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover-lift">
                            <div className="bg-white text-primary-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-highlight">
                                <FaKey size={30} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4">
                                Enjoy
                            </h3>
                            <p className="text-white/80 leading-relaxed">
                                Enjoy your stay and create unforgettable
                                memories with 24/7 customer support during your
                                trip.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="section-padding">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark-900 mb-6">
                            Why Choose{" "}
                            <span className="text-gradient">StayFinder</span>
                        </h2>
                        <p className="text-xl text-dark-600">
                            We're committed to making your travel experience
                            exceptional from start to finish
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="card p-8 text-center hover-glow transition-all duration-300">
                            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-6">
                                <MdExplore size={28} />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-dark-900">
                                Global Selection
                            </h3>
                            <p className="text-dark-600">
                                Thousands of properties in top destinations
                                around the world, carefully curated for quality
                            </p>
                        </div>
                        <div className="card p-8 text-center hover-glow transition-all duration-300">
                            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-6">
                                <FaShieldAlt size={28} />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-dark-900">
                                Secure Booking
                            </h3>
                            <p className="text-dark-600">
                                Secure payment system and verified property
                                listings with advanced encryption technology
                            </p>
                        </div>
                        <div className="card p-8 text-center hover-glow transition-all duration-300">
                            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-6">
                                <MdOutlineVerified size={28} />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-dark-900">
                                Quality Stays
                            </h3>
                            <p className="text-dark-600">
                                Carefully selected properties that meet our
                                quality standards with verified reviews
                            </p>
                        </div>
                        <div className="card p-8 text-center hover-glow transition-all duration-300">
                            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-6">
                                <FaComments size={28} />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-dark-900">
                                24/7 Support
                            </h3>
                            <p className="text-dark-600">
                                Customer support available around the clock for
                                any questions or assistance during your stay
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-dark-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-noise opacity-5"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                            Ready to Find Your Perfect Stay?
                        </h2>
                        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                            Join thousands of satisfied travelers who found
                            their ideal accommodations with StayFinder
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Button
                                as={Link}
                                to="/properties"
                                variant="primary"
                                size="lg"
                                className="group"
                                rightIcon={
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                }
                            >
                                Browse Properties
                            </Button>
                            <Button
                                as={Link}
                                to="/register"
                                variant="outline"
                                size="lg"
                                className="border-white text-white hover:bg-white/10"
                            >
                                Sign Up Now
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage
