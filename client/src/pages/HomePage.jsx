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
import { Button, Input, DatePicker, Spinner } from "../components/ui"
import { formatPrice } from "../utils/currency"
import propertyService from "../services/api/property.service"

/**
 * Enhanced Home page component with modern UI elements and animations
 * Connected to backend API for real data
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
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [categories, setCategories] = useState({
        luxury: [],
        trending: [],
        popular: [],
    })

    // Fetch properties from backend
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true)
                // Fetch featured properties with limit=8 and sort by rating
                const response = await propertyService.getAllProperties({
                    limit: 8,
                    sort: "-rating",
                    approved: true,
                    available: true,
                })

                if (response && response.properties) {
                    setProperties(response.properties)

                    // Categorize properties
                    const luxuryProperties = response.properties.filter(
                        (p) => p.price >= 300
                    )
                    const trendingProperties = response.properties.filter(
                        (p) =>
                            p.createdAt &&
                            new Date(p.createdAt) >
                                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ) // Last 30 days
                    const popularProperties = response.properties.filter(
                        (p) => p.rating >= 4.7
                    )

                    setCategories({
                        luxury: luxuryProperties,
                        trending: trendingProperties,
                        popular: popularProperties,
                    })
                }
            } catch (err) {
                console.error("Error fetching properties:", err)
                setError("Failed to load properties. Please try again later.")

                // Fallback to sample data if API fails
                setProperties(sampleProperties)
                setCategories({
                    luxury: sampleProperties.filter(
                        (p) => p.category === "luxury"
                    ),
                    trending: sampleProperties.filter(
                        (p) => p.category === "trending"
                    ),
                    popular: sampleProperties.filter(
                        (p) => p.category === "popular"
                    ),
                })
            } finally {
                setLoading(false)
            }
        }

        fetchProperties()
    }, [])

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

    // Get filtered properties based on active tab
    const getFilteredProperties = () => {
        if (loading) return []

        if (activeTab === "all") {
            return properties
        } else {
            return categories[activeTab] || []
        }
    }

    // Filtered properties based on active tab
    const filteredProperties = getFilteredProperties()

    // Sample properties data as fallback
    const sampleProperties = [
        {
            _id: "sample1",
            title: "Luxury Beachfront Villa",
            location: { city: "Malibu", state: "California", country: "USA" },
            price: 350,
            rating: 4.9,
            images: [
                "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            ],
            bedrooms: 4,
            bathrooms: 3,
            category: "luxury",
            createdAt: new Date(
                Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
        },
        {
            _id: "sample2",
            title: "Modern Downtown Apartment",
            location: { city: "New York", state: "NY", country: "USA" },
            price: 180,
            rating: 4.7,
            images: [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1980&q=80",
            ],
            bedrooms: 2,
            bathrooms: 1,
            category: "trending",
            createdAt: new Date(
                Date.now() - 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
        },
        {
            _id: "sample3",
            title: "Cozy Mountain Cabin",
            location: { city: "Aspen", state: "Colorado", country: "USA" },
            price: 220,
            rating: 4.8,
            images: [
                "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
            ],
            bedrooms: 3,
            bathrooms: 2,
            category: "popular",
            createdAt: new Date(
                Date.now() - 45 * 24 * 60 * 60 * 1000
            ).toISOString(),
        },
        {
            _id: "sample4",
            title: "Oceanview Penthouse Suite",
            location: { city: "Miami", state: "Florida", country: "USA" },
            price: 420,
            rating: 4.9,
            images: [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            ],
            bedrooms: 3,
            bathrooms: 3,
            category: "luxury",
            createdAt: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
        },
        {
            _id: "sample5",
            title: "Charming Countryside Cottage",
            location: { city: "Cotswolds", state: "", country: "UK" },
            price: 195,
            rating: 4.8,
            images: [
                "https://images.unsplash.com/photo-1595877244574-e90ce41ce089?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            ],
            bedrooms: 2,
            bathrooms: 1,
            category: "trending",
            createdAt: new Date(
                Date.now() - 20 * 24 * 60 * 60 * 1000
            ).toISOString(),
        },
        {
            _id: "sample6",
            title: "Urban Loft with City Views",
            location: { city: "Chicago", state: "Illinois", country: "USA" },
            price: 210,
            rating: 4.7,
            images: [
                "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
            ],
            bedrooms: 1,
            bathrooms: 1,
            category: "popular",
            createdAt: new Date(
                Date.now() - 60 * 24 * 60 * 60 * 1000
            ).toISOString(),
        },
    ]

    // Popular destinations with counts from backend
    const destinations = [
        {
            name: "Beach Getaways",
            icon: <FaUmbrellaBeach />,
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80",
            count:
                properties.filter(
                    (p) =>
                        p.amenities?.beachAccess ||
                        (p.description &&
                            p.description.toLowerCase().includes("beach")) ||
                        (p.title && p.title.toLowerCase().includes("beach"))
                ).length || 243,
        },
        {
            name: "Mountain Retreats",
            icon: <FaMountain />,
            image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            count:
                properties.filter(
                    (p) =>
                        (p.description &&
                            p.description.toLowerCase().includes("mountain")) ||
                        (p.title && p.title.toLowerCase().includes("mountain"))
                ).length || 187,
        },
        {
            name: "City Escapes",
            icon: <FaCity />,
            image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2144&q=80",
            count:
                properties.filter(
                    (p) =>
                        p.propertyType === "Apartment" ||
                        (p.location?.city &&
                            [
                                "new york",
                                "los angeles",
                                "chicago",
                                "san francisco",
                                "london",
                                "paris",
                            ].includes(p.location.city.toLowerCase()))
                ).length || 321,
        },
        {
            name: "Countryside",
            icon: <FaTree />,
            image: "https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            count:
                properties.filter(
                    (p) =>
                        (p.description &&
                            p.description
                                .toLowerCase()
                                .includes("countryside")) ||
                        (p.title &&
                            p.title.toLowerCase().includes("countryside")) ||
                        p.propertyType === "Cottage" ||
                        p.propertyType === "Farm"
                ).length || 156,
        },
    ]

    return (
        <div className="flex flex-col">
            {/* Hero Section - Simplified */}
            <section className="relative min-h-[60vh] flex items-center bg-gradient-to-r from-primary-50 to-primary-100">
                <div className="container mx-auto px-4 py-12 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark-900 mb-4 font-heading">
                                Find your{" "}
                                <span className="text-primary-600">
                                    perfect stay
                                </span>
                            </h1>
                            <p className="text-lg text-dark-600 max-w-2xl mx-auto">
                                Discover unique places to stay around the world
                            </p>
                        </div>

                        {/* Search Form */}
                        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                            <form
                                onSubmit={handleSearch}
                                className="flex flex-col md:flex-row gap-3"
                            >
                                <div className="flex-1">
                                    <Input
                                        id="location"
                                        name="location"
                                        value={searchParams.location}
                                        onChange={handleInputChange}
                                        placeholder="Where are you going?"
                                        leftIcon={
                                            <FaMapMarkerAlt className="text-primary-500" />
                                        }
                                    />
                                </div>

                                <div className="flex-1">
                                    <DatePicker
                                        id="dateRange"
                                        startDate={searchParams.checkIn}
                                        endDate={searchParams.checkOut}
                                        selectsRange={true}
                                        onRangeChange={({
                                            startDate,
                                            endDate,
                                        }) =>
                                            setSearchParams((prev) => ({
                                                ...prev,
                                                checkIn: startDate,
                                                checkOut: endDate,
                                            }))
                                        }
                                        placeholder="Add dates"
                                        minDate={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                    />
                                </div>

                                <div className="flex-1 flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            id="guests"
                                            name="guests"
                                            type="number"
                                            min="1"
                                            value={searchParams.guests}
                                            onChange={handleInputChange}
                                            placeholder="Guests"
                                            leftIcon={
                                                <FaUsers className="text-primary-500" />
                                            }
                                        />
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
                            </form>

                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <span className="text-dark-500 text-sm">
                                    Popular:
                                </span>
                                <button
                                    type="button"
                                    className="text-sm text-dark-600 hover:text-primary-600 hover:underline transition-colors"
                                >
                                    Beach
                                </button>
                                <span className="text-dark-300">•</span>
                                <button
                                    type="button"
                                    className="text-sm text-dark-600 hover:text-primary-600 hover:underline transition-colors"
                                >
                                    Mountain
                                </button>
                                <span className="text-dark-300">•</span>
                                <button
                                    type="button"
                                    className="text-sm text-dark-600 hover:text-primary-600 hover:underline transition-colors"
                                >
                                    City
                                </button>
                                <span className="text-dark-300">•</span>
                                <button
                                    type="button"
                                    className="text-sm text-dark-600 hover:text-primary-600 hover:underline transition-colors"
                                >
                                    Countryside
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Destinations - Airbnb Style */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-dark-900">
                            Explore destinations
                        </h2>
                        <Link
                            to="/properties"
                            className="text-primary-600 font-medium hover:underline flex items-center"
                        >
                            Show all <FaAngleRight className="ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {destinations.map((destination, index) => (
                            <Link
                                key={index}
                                to={`/properties?category=${destination.name
                                    .toLowerCase()
                                    .replace(" ", "-")}`}
                                className="group"
                            >
                                <div className="rounded-lg overflow-hidden mb-2">
                                    <img
                                        src={destination.image}
                                        alt={destination.name}
                                        className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="font-medium text-dark-900 group-hover:text-primary-600">
                                    {destination.name}
                                </h3>
                                <p className="text-dark-500 text-sm">
                                    {destination.count} properties
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Properties Section - Airbnb Style */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-dark-900">
                            Places to stay
                        </h2>
                        <div className="flex items-center">
                            {/* Simple filter tabs */}
                            <div className="hidden md:flex border border-gray-200 rounded-full p-1 mr-4">
                                <button
                                    onClick={() => setActiveTab("all")}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                        activeTab === "all"
                                            ? "bg-dark-900 text-white"
                                            : "text-dark-600 hover:bg-gray-100"
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveTab("luxury")}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                        activeTab === "luxury"
                                            ? "bg-dark-900 text-white"
                                            : "text-dark-600 hover:bg-gray-100"
                                    }`}
                                >
                                    Luxury
                                </button>
                                <button
                                    onClick={() => setActiveTab("trending")}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                        activeTab === "trending"
                                            ? "bg-dark-900 text-white"
                                            : "text-dark-600 hover:bg-gray-100"
                                    }`}
                                >
                                    Trending
                                </button>
                                <button
                                    onClick={() => setActiveTab("popular")}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                        activeTab === "popular"
                                            ? "bg-dark-900 text-white"
                                            : "text-dark-600 hover:bg-gray-100"
                                    }`}
                                >
                                    Popular
                                </button>
                            </div>

                            <Link
                                to="/properties"
                                className="text-primary-600 font-medium hover:underline flex items-center"
                            >
                                Show all <FaAngleRight className="ml-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Mobile filter tabs */}
                    <div className="flex md:hidden overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                                activeTab === "all"
                                    ? "bg-dark-900 text-white"
                                    : "bg-gray-100 text-dark-600"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab("luxury")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                                activeTab === "luxury"
                                    ? "bg-dark-900 text-white"
                                    : "bg-gray-100 text-dark-600"
                            }`}
                        >
                            Luxury
                        </button>
                        <button
                            onClick={() => setActiveTab("trending")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                                activeTab === "trending"
                                    ? "bg-dark-900 text-white"
                                    : "bg-gray-100 text-dark-600"
                            }`}
                        >
                            Trending
                        </button>
                        <button
                            onClick={() => setActiveTab("popular")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                                activeTab === "popular"
                                    ? "bg-dark-900 text-white"
                                    : "bg-gray-100 text-dark-600"
                            }`}
                        >
                            Popular
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Spinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-10">
                            <p className="text-dark-500 mb-4">{error}</p>
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProperties.length === 0 ? (
                                <div className="col-span-full text-center py-10">
                                    <p className="text-dark-500">
                                        No properties found in this category.
                                    </p>
                                </div>
                            ) : (
                                filteredProperties.map((property) => (
                                    <Link
                                        key={property._id}
                                        to={`/properties/${property._id}`}
                                        className="group"
                                    >
                                        <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                                            <img
                                                src={
                                                    property.images &&
                                                    property.images.length > 0
                                                        ? property.images[0].url
                                                        : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                                                }
                                                alt={property.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <button
                                                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    // Favorite functionality would go here
                                                }}
                                            >
                                                <FaHeart className="text-gray-400 hover:text-accent-500" />
                                            </button>

                                            {property.createdAt &&
                                                new Date(property.createdAt) >
                                                    new Date(
                                                        Date.now() -
                                                            14 *
                                                                24 *
                                                                60 *
                                                                60 *
                                                                1000
                                                    ) && (
                                                    <div className="absolute top-3 left-3 bg-white text-dark-900 text-xs font-medium px-2 py-1 rounded-md">
                                                        New
                                                    </div>
                                                )}
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-dark-900 mb-1">
                                                    {property.title}
                                                </h3>
                                                <p className="text-dark-500 text-sm mb-1">
                                                    {property.location
                                                        ? `${
                                                              property.location
                                                                  .city
                                                          }${
                                                              property.location
                                                                  .state
                                                                  ? `, ${property.location.state}`
                                                                  : ""
                                                          }`
                                                        : "Location not specified"}
                                                </p>
                                                <p className="text-dark-500 text-sm mb-2">
                                                    {property.bedrooms || 0}{" "}
                                                    beds ·{" "}
                                                    {property.bathrooms || 0}{" "}
                                                    baths
                                                </p>
                                                <p className="font-medium">
                                                    <span className="text-dark-900">
                                                        {formatPrice(
                                                            property.price
                                                        )}
                                                    </span>
                                                    <span className="text-dark-500">
                                                        {" "}
                                                        night
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <FaStar className="text-warning-500 mr-1" />
                                                <span className="font-medium">
                                                    {property.rating
                                                        ? property.rating.toFixed(
                                                              1
                                                          )
                                                        : "4.5"}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works Section - Simplified */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-semibold text-dark-900 mb-8 text-center">
                        How it works
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                                <FaSearch size={20} />
                            </div>
                            <h3 className="text-lg font-medium mb-2">
                                Find the perfect place
                            </h3>
                            <p className="text-dark-500 text-sm">
                                Browse verified homes with accurate photos and
                                details
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                                <FaCalendarAlt size={20} />
                            </div>
                            <h3 className="text-lg font-medium mb-2">
                                Book with confidence
                            </h3>
                            <p className="text-dark-500 text-sm">
                                Secure payments, clear cancellation policies,
                                and no hidden fees
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                                <FaKey size={20} />
                            </div>
                            <h3 className="text-lg font-medium mb-2">
                                Enjoy your stay
                            </h3>
                            <p className="text-dark-500 text-sm">
                                24/7 customer support and local tips for a
                                memorable experience
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section - Simplified */}
            <section className="py-12 border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-semibold text-dark-900 mb-4">
                                Why guests love StayFinder
                            </h2>
                            <p className="text-dark-600 mb-6">
                                Join millions of happy travelers who have found
                                their perfect stay with us
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                                        <MdOutlineVerified size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-dark-900 mb-1">
                                            Verified listings
                                        </h3>
                                        <p className="text-dark-500 text-sm">
                                            All properties are carefully
                                            reviewed for quality and accuracy
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                                        <FaShieldAlt size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-dark-900 mb-1">
                                            Secure payments
                                        </h3>
                                        <p className="text-dark-500 text-sm">
                                            Your booking is protected with our
                                            secure payment system
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                                        <FaComments size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-dark-900 mb-1">
                                            24/7 support
                                        </h3>
                                        <p className="text-dark-500 text-sm">
                                            Our team is available around the
                                            clock to help with any issues
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80"
                                alt="Happy travelers"
                                className="rounded-lg shadow-md w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Airbnb Style */}
            <section className="py-16 bg-primary-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                                <h2 className="text-2xl md:text-3xl font-semibold text-dark-900 mb-4">
                                    Ready to start your journey?
                                </h2>
                                <p className="text-dark-600 mb-6">
                                    Find your perfect place to stay and create
                                    memories that last a lifetime
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        as={Link}
                                        to="/properties"
                                        variant="primary"
                                        className="group"
                                    >
                                        Explore stays
                                    </Button>
                                    <Button
                                        as={Link}
                                        to="/register"
                                        variant="outline"
                                    >
                                        Sign up
                                    </Button>
                                </div>
                            </div>
                            <div className="md:w-1/2 relative min-h-[250px]">
                                <img
                                    src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                                    alt="Travel destination"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage
