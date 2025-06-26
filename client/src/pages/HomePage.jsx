import { useState, useEffect, useContext } from "react"
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
    FaLocationArrow,
    FaHistory,
} from "react-icons/fa"
import { FiCompass } from "react-icons/fi"
import { RiVipCrownFill } from "react-icons/ri"
import { MdOutlineVerified, MdLocationOn, MdRecommend } from "react-icons/md"
import {
    Button,
    Input,
    DatePicker,
    Spinner,
    Alert,
    PropertyCardSkeleton,
} from "../components/ui"
import { formatPrice } from "../utils/currency"
import propertyService from "../services/api/property.service"
import AuthContext from "../context/AuthContext"

/**
 * Enhanced Home page component with Airbnb-inspired design
 * Using grey and black color scheme with primary color for important elements
 */
const HomePage = () => {
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)
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
        nearby: [],
        recommended: [],
        featured: [],
    })
    const [recentlyViewed, setRecentlyViewed] = useState([])
    const [userLocation, setUserLocation] = useState(null)
    const [locationError, setLocationError] = useState(null)
    const [locationLoading, setLocationLoading] = useState(false)

    // Get user's location for nearby stays
    useEffect(() => {
        const getUserLocation = () => {
            if (navigator.geolocation) {
                setLocationLoading(true)
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        })
                        setLocationLoading(false)
                    },
                    (error) => {
                        console.error("Error getting location:", error)
                        setLocationError(
                            "Unable to get your location. Nearby stays will not be personalized."
                        )
                        setLocationLoading(false)
                    },
                    { timeout: 10000 }
                )
            } else {
                setLocationError(
                    "Geolocation is not supported by your browser. Nearby stays will not be personalized."
                )
            }
        }

        getUserLocation()
    }, [])

    // Load recently viewed properties from localStorage
    useEffect(() => {
        const loadRecentlyViewed = () => {
            try {
                const recentlyViewedString = localStorage.getItem(
                    "recentlyViewedProperties"
                )
                if (recentlyViewedString) {
                    const recentlyViewedData = JSON.parse(recentlyViewedString)
                    setRecentlyViewed(recentlyViewedData)
                }
            } catch (error) {
                console.error(
                    "Error loading recently viewed properties:",
                    error
                )
            }
        }

        loadRecentlyViewed()
    }, [])

    // Fetch properties from backend
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true)
                // Fetch featured properties with limit=16 and sort by rating
                const response = await propertyService.getAllProperties({
                    limit: 16,
                    sort: "-avgRating",
                    isApproved: true,
                    isAvailable: true,
                })

                if (response && response.properties) {
                    setProperties(response.properties)

                    // Categorize properties
                    const luxuryProperties = response.properties
                        .filter((p) => p.price >= 300)
                        .slice(0, 8)

                    const trendingProperties = response.properties
                        .filter(
                            (p) =>
                                p.createdAt &&
                                new Date(p.createdAt) >
                                    new Date(
                                        Date.now() - 30 * 24 * 60 * 60 * 1000
                                    )
                        )
                        .slice(0, 8)

                    const popularProperties = response.properties
                        .filter((p) => p.avgRating >= 4.5 || p.reviewCount >= 5)
                        .slice(0, 8)

                    // Featured properties (those with featuredUntil date in the future)
                    const featuredProperties = response.properties
                        .filter(
                            (p) =>
                                p.featuredUntil &&
                                new Date(p.featuredUntil) > new Date()
                        )
                        .slice(0, 8)

                    // Set initial categories
                    setCategories({
                        luxury: luxuryProperties,
                        trending: trendingProperties,
                        popular: popularProperties,
                        featured: featuredProperties,
                        nearby: [],
                        recommended: [],
                    })

                    // Update destination counts based on real data
                    const updatedDestinations = [...destinations]

                    // Count properties in each destination
                    updatedDestinations.forEach((destination, index) => {
                        const count = response.properties.filter(
                            (p) =>
                                (p.address?.city &&
                                    p.address.city
                                        .toLowerCase()
                                        .includes(
                                            destination.searchTerm.toLowerCase()
                                        )) ||
                                (p.address?.state &&
                                    p.address.state
                                        .toLowerCase()
                                        .includes(
                                            destination.searchTerm.toLowerCase()
                                        )) ||
                                (p.title &&
                                    p.title
                                        .toLowerCase()
                                        .includes(
                                            destination.searchTerm.toLowerCase()
                                        )) ||
                                (p.description &&
                                    p.description
                                        .toLowerCase()
                                        .includes(
                                            destination.searchTerm.toLowerCase()
                                        ))
                        ).length
                    })

                    setDestinations(updatedDestinations)
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
                    featured: sampleProperties.filter(
                        (p) => p.category === "luxury"
                    ),
                    nearby: [],
                    recommended: [],
                })
            } finally {
                setLoading(false)
            }
        }

        fetchProperties()
    }, [])

    // Fetch nearby properties when user location is available
    useEffect(() => {
        const fetchNearbyProperties = async () => {
            if (!userLocation) return

            try {
                console.log(
                    "Fetching nearby properties with location:",
                    userLocation
                )
                const nearbyResponse =
                    await propertyService.getNearbyProperties({
                        lat: userLocation.lat,
                        lng: userLocation.lng,
                        distance: 50, // 50km radius
                        limit: 8,
                    })

                if (nearbyResponse && nearbyResponse.length > 0) {
                    console.log(
                        "Nearby properties found:",
                        nearbyResponse.length
                    )
                    setCategories((prev) => ({
                        ...prev,
                        nearby: nearbyResponse,
                    }))
                } else {
                    console.log("No nearby properties found")
                    // Don't show random properties if no nearby properties found
                    setCategories((prev) => ({
                        ...prev,
                        nearby: [],
                    }))
                }
            } catch (err) {
                console.error("Error fetching nearby properties:", err)

                // Don't show random properties if there's an error
                setCategories((prev) => ({
                    ...prev,
                    nearby: [],
                }))
            }
        }

        fetchNearbyProperties()
    }, [userLocation, properties])

    // Fetch recommended properties when user is logged in
    useEffect(() => {
        const fetchRecommendedProperties = async () => {
            if (!user || !user._id || properties.length === 0) return

            try {
                // In a real app, this would be a dedicated API endpoint for personalized recommendations
                // For now, we'll simulate recommendations by selecting properties that might match user preferences

                // Simulate user preferences based on property types and price ranges
                const userPreferences = {
                    priceRange: [100, 300], // Example price range
                    propertyTypes: ["apartment", "house", "villa"], // Example preferred property types
                    amenities: ["wifi", "pool", "kitchen"], // Example preferred amenities
                }

                // Filter properties based on simulated preferences
                let recommendedProps = properties.filter(
                    (p) =>
                        p.price >= userPreferences.priceRange[0] &&
                        p.price <= userPreferences.priceRange[1] &&
                        userPreferences.propertyTypes.includes(
                            p.type?.toLowerCase()
                        )
                )

                // If not enough properties match the criteria, add some random ones
                if (recommendedProps.length < 4) {
                    const randomProps = properties
                        .filter((p) => !recommendedProps.includes(p))
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 4 - recommendedProps.length)

                    recommendedProps = [...recommendedProps, ...randomProps]
                }

                // Limit to 4 properties and add a "match score" for UI display
                recommendedProps = recommendedProps.slice(0, 4).map((p) => ({
                    ...p,
                    matchScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-99%
                }))

                setCategories((prev) => ({
                    ...prev,
                    recommended: recommendedProps,
                }))
            } catch (err) {
                console.error("Error setting up recommended properties:", err)
            }
        }

        fetchRecommendedProperties()
    }, [user, properties])

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

    // Popular destinations in India with real locations
    const [destinations, setDestinations] = useState([
        {
            name: "Goa",
            icon: <FaUmbrellaBeach />,
            image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
            count: 0,
            searchTerm: "Goa",
        },
        {
            name: "Mumbai",
            icon: <FaCity />,
            image: "https://images.unsplash.com/photo-1562979314-bee7453e911c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
            count: 0,
            searchTerm: "Mumbai",
        },
        {
            name: "Shimla",
            icon: <FaMountain />,
            image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            count: 0,
            searchTerm: "Shimla",
        },
        {
            name: "Jaipur",
            icon: <FaHome />,
            image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            count: 0,
            searchTerm: "Jaipur",
        },
    ])

    return (
        <div className="flex flex-col">
            {/* Enhanced Hero Section */}
            <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        alt="Luxury vacation rental"
                        className="w-full h-full object-cover object-center animate-slow-zoom"
                    />
                </div>

                <div className="container mx-auto px-4 py-16 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        {/* Hero Content with Animation */}
                        <div className="text-center mb-10 animate-fade-in">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-heading leading-tight drop-shadow-md">
                                Find Your Dream{" "}
                                <span className="text-primary-400">
                                    Getaway
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 drop-shadow-md">
                                Discover unique places to stay and unforgettable
                                experiences around the world
                            </p>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
                                <div className="flex items-center gap-2">
                                    <FaShieldAlt className="text-primary-400 text-xl" />
                                    <span className="text-white font-medium">
                                        Verified Hosts
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaStar className="text-primary-400 text-xl" />
                                    <span className="text-white font-medium">
                                        4.8/5 Average Rating
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaUsers className="text-primary-400 text-xl" />
                                    <span className="text-white font-medium">
                                        10,000+ Happy Guests
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Search Form */}
                        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-5 max-w-4xl mx-auto backdrop-blur-sm bg-white/95 transform transition-all duration-500 hover:shadow-primary-500/20">
                            <form
                                onSubmit={handleSearch}
                                className="flex flex-col md:flex-row items-center gap-4"
                            >
                                <div className="flex-1 w-full md:w-auto">
                                    <label
                                        htmlFor="location"
                                        className="block text-sm font-semibold text-secondary-900 mb-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-primary-500" />
                                            <span>Where to?</span>
                                        </div>
                                    </label>
                                    <Input
                                        id="location"
                                        name="location"
                                        value={searchParams.location}
                                        onChange={handleInputChange}
                                        placeholder="Search destinations"
                                        className="border border-secondary-200 rounded-lg p-3 shadow-sm hover:border-primary-400 transition-all"
                                    />
                                </div>

                                <div className="flex-1 w-full md:w-auto">
                                    <label
                                        htmlFor="dateRange"
                                        className="block text-sm font-semibold text-secondary-900 mb-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-primary-500" />
                                            <span>When?</span>
                                        </div>
                                    </label>
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
                                        className="border border-secondary-200 rounded-lg p-3 shadow-sm hover:border-primary-400 transition-all w-full"
                                    />
                                </div>

                                <div className="flex-1 w-full md:w-auto">
                                    <label
                                        htmlFor="guests"
                                        className="block text-sm font-semibold text-secondary-900 mb-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FaUsers className="text-primary-500" />
                                            <span>Guests</span>
                                        </div>
                                    </label>
                                    <Input
                                        id="guests"
                                        name="guests"
                                        type="number"
                                        min="1"
                                        value={searchParams.guests}
                                        onChange={handleInputChange}
                                        placeholder="Add guests"
                                        className="border border-secondary-200 rounded-lg p-3 shadow-sm hover:border-primary-400 transition-all"
                                    />
                                </div>

                                <div className="mt-6 w-full md:w-auto">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full md:w-auto rounded-lg py-3 px-6 bg-primary-500 hover:bg-primary-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-lg font-medium"
                                    >
                                        <FaSearch className="text-lg" />
                                        <span>Search</span>
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Popular destinations tags */}
                        <div className="flex flex-wrap justify-center items-center gap-3 mt-8">
                            <span className="text-white font-medium">
                                Popular:
                            </span>
                            <button
                                type="button"
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-all backdrop-blur-sm border border-white/30 hover:border-white/50"
                                onClick={() => {
                                    setSearchParams((prev) => ({
                                        ...prev,
                                        location: "Beach",
                                    }))
                                    handleSearch({ preventDefault: () => {} })
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <FaUmbrellaBeach />
                                    <span>Beach</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-all backdrop-blur-sm border border-white/30 hover:border-white/50"
                                onClick={() => {
                                    setSearchParams((prev) => ({
                                        ...prev,
                                        location: "Mountain",
                                    }))
                                    handleSearch({ preventDefault: () => {} })
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <FaMountain />
                                    <span>Mountain</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-all backdrop-blur-sm border border-white/30 hover:border-white/50"
                                onClick={() => {
                                    setSearchParams((prev) => ({
                                        ...prev,
                                        location: "City",
                                    }))
                                    handleSearch({ preventDefault: () => {} })
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <FaCity />
                                    <span>City</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-all backdrop-blur-sm border border-white/30 hover:border-white/50"
                                onClick={() => {
                                    setSearchParams((prev) => ({
                                        ...prev,
                                        location: "Countryside",
                                    }))
                                    handleSearch({ preventDefault: () => {} })
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <FaTree />
                                    <span>Countryside</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stay Near You Section - Airbnb Style */}
            {categories.nearby && categories.nearby.length > 0 && (
                <section className="py-5 bg-white border-t border-secondary-200">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center">
                                <MdLocationOn className="text-secondary-900 text-2xl mr-2" />
                                <h2 className="text-2xl font-semibold text-secondary-900">
                                    Stays Near You
                                </h2>
                            </div>
                            <Link
                                to="/properties?sort=distance"
                                className="text-secondary-900 font-medium hover:text-primary-500 flex items-center transition-colors"
                            >
                                View all <FaAngleRight className="ml-1" />
                            </Link>
                        </div>

                        {locationLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <Spinner size="md" />
                                <span className="ml-2 text-secondary-500">
                                    Finding stays near you...
                                </span>
                            </div>
                        ) : locationError ? (
                            <div className="mb-6">
                                <Alert variant="info" className="mb-4">
                                    {locationError}
                                </Alert>
                                <div className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        className="mt-2"
                                        onClick={() => {
                                            setLocationError(null)
                                            setLocationLoading(true)
                                            navigator.geolocation.getCurrentPosition(
                                                (position) => {
                                                    setUserLocation({
                                                        lat: position.coords
                                                            .latitude,
                                                        lng: position.coords
                                                            .longitude,
                                                    })
                                                    setLocationLoading(false)
                                                },
                                                (error) => {
                                                    console.error(
                                                        "Error getting location:",
                                                        error
                                                    )
                                                    setLocationError(
                                                        "Unable to get your location. Nearby stays will not be personalized."
                                                    )
                                                    setLocationLoading(false)
                                                },
                                                { timeout: 10000 }
                                            )
                                        }}
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        ) : categories.nearby &&
                          categories.nearby.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {categories.nearby.map((property) => (
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
                                                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-md"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    // Favorite functionality would go here
                                                }}
                                            >
                                                <FaHeart className="text-secondary-400 hover:text-primary-500" />
                                            </button>

                                            <div className="absolute bottom-3 left-3 bg-secondary-900 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center">
                                                <FaLocationArrow className="mr-1.5" />
                                                {Math.round(property.distance)}{" "}
                                                km away
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between w-full">
                                                <h3 className="font-medium text-secondary-900 mb-1 line-clamp-1">
                                                    {property.title}
                                                </h3>
                                                <div className="flex items-center ml-2">
                                                    <FaStar className="text-secondary-900 mr-1" />
                                                    <span className="font-medium text-secondary-900">
                                                        {property.avgRating
                                                            ? property.avgRating.toFixed(
                                                                  1
                                                              )
                                                            : "4.5"}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-secondary-600 text-sm mb-1">
                                                {property.address
                                                    ? `${
                                                          property.address.city
                                                      }${
                                                          property.address.state
                                                              ? `, ${property.address.state}`
                                                              : ""
                                                      }`
                                                    : "Location not specified"}
                                            </p>
                                            <p className="text-secondary-600 text-sm mb-2">
                                                {property.bedrooms || 0} beds ·{" "}
                                                {property.bathrooms || 0} baths
                                            </p>
                                            <p className="font-medium">
                                                <span className="text-secondary-900 font-semibold">
                                                    {formatPrice(
                                                        property.price
                                                    )}
                                                </span>
                                                <span className="text-secondary-600">
                                                    {" "}
                                                    night
                                                </span>
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-white rounded-xl border border-secondary-200">
                                <MdLocationOn className="text-secondary-400 text-5xl mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-secondary-900 mb-2">
                                    No properties available near you
                                </h3>
                                <p className="text-secondary-600 mb-4 max-w-md mx-auto">
                                    We couldn't find any available properties in
                                    your area. Try exploring our featured
                                    properties or check back later.
                                </p>
                                <Button
                                    variant="primary"
                                    className="bg-secondary-900 hover:bg-secondary-800"
                                    onClick={() => setActiveTab("featured")}
                                >
                                    Explore Featured Stays
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Loading indicator for nearby properties - Airbnb Style */}
            {locationLoading && (
                <section className="py-12 bg-white border-t border-secondary-200">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-center items-center py-10">
                            <Spinner size="md" />
                            <span className="ml-2 text-secondary-600 font-medium">
                                Finding stays near you...
                            </span>
                        </div>
                    </div>
                </section>
            )}

            {/* Location Permission Request - Airbnb Style */}
            {!categories.nearby?.length && !locationLoading && (
                <section className="py-12 bg-white border-t border-secondary-200">
                    <div className="container mx-auto px-4">
                        <div className="text-center py-10 bg-white rounded-xl border border-secondary-200 max-w-2xl mx-auto">
                            <MdLocationOn className="text-secondary-400 text-5xl mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-secondary-900 mb-3">
                                {locationError
                                    ? "Location access needed"
                                    : userLocation
                                    ? "No properties available near you"
                                    : "Find properties near you"}
                            </h3>
                            <p className="text-secondary-600 mb-6 max-w-md mx-auto">
                                {locationError
                                    ? "Allow location access to see properties near you. We use your location only to find relevant stays in your area."
                                    : userLocation
                                    ? "We couldn't find any properties in your area. Try exploring our other destinations or adjusting your search criteria."
                                    : "Click the button below to search for available properties near your current location."}
                            </p>
                            <Button
                                variant="primary"
                                className="bg-secondary-900 hover:bg-secondary-800 px-6 py-3"
                                onClick={() => {
                                    setLocationError(null)
                                    setLocationLoading(true)
                                    navigator.geolocation.getCurrentPosition(
                                        (position) => {
                                            setUserLocation({
                                                lat: position.coords.latitude,
                                                lng: position.coords.longitude,
                                            })
                                            setLocationLoading(false)
                                        },
                                        (error) => {
                                            console.error(
                                                "Error getting location:",
                                                error
                                            )
                                            setLocationError(
                                                "Unable to get your location. Nearby stays will not be personalized."
                                            )
                                            setLocationLoading(false)
                                        },
                                        { timeout: 10000 }
                                    )
                                }}
                            >
                                {locationError
                                    ? "Allow Location Access"
                                    : "Search Nearby Properties"}
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Properties Section - Airbnb Style */}
            <section className="pb-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-semibold text-secondary-900">
                            Places to stay
                        </h2>
                        <div className="flex items-center">
                            <Link
                                to="/properties"
                                className="text-secondary-900 font-medium hover:text-primary-500 flex items-center transition-colors"
                            >
                                Show all <FaAngleRight className="ml-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Category tabs - Airbnb style */}
                    <div className="flex overflow-x-auto pb-4 mb-6 gap-8 no-scrollbar border-b border-secondary-200">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`pb-2 whitespace-nowrap transition-colors flex flex-col items-center ${
                                activeTab === "all"
                                    ? "text-secondary-900 border-b-2 border-secondary-900 -mb-px font-medium"
                                    : "text-secondary-500 hover:text-secondary-800"
                            }`}
                        >
                            <span className="text-2xl mb-1">🏠</span>
                            <span>All</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("luxury")}
                            className={`pb-2 whitespace-nowrap transition-colors flex flex-col items-center ${
                                activeTab === "luxury"
                                    ? "text-secondary-900 border-b-2 border-secondary-900 -mb-px font-medium"
                                    : "text-secondary-500 hover:text-secondary-800"
                            }`}
                        >
                            <span className="text-2xl mb-1">✨</span>
                            <span>Luxury</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("trending")}
                            className={`pb-2 whitespace-nowrap transition-colors flex flex-col items-center ${
                                activeTab === "trending"
                                    ? "text-secondary-900 border-b-2 border-secondary-900 -mb-px font-medium"
                                    : "text-secondary-500 hover:text-secondary-800"
                            }`}
                        >
                            <span className="text-2xl mb-1">🔥</span>
                            <span>Trending</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("popular")}
                            className={`pb-2 whitespace-nowrap transition-colors flex flex-col items-center ${
                                activeTab === "popular"
                                    ? "text-secondary-900 border-b-2 border-secondary-900 -mb-px font-medium"
                                    : "text-secondary-500 hover:text-secondary-800"
                            }`}
                        >
                            <span className="text-2xl mb-1">👍</span>
                            <span>Popular</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("featured")}
                            className={`pb-2 whitespace-nowrap transition-colors flex flex-col items-center ${
                                activeTab === "featured"
                                    ? "text-secondary-900 border-b-2 border-secondary-900 -mb-px font-medium"
                                    : "text-secondary-500 hover:text-secondary-800"
                            }`}
                        >
                            <span className="text-2xl mb-1">⭐</span>
                            <span>Featured</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, index) => (
                                    <PropertyCardSkeleton key={index} />
                                ))}
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10">
                            <p className="text-secondary-500 mb-4">{error}</p>
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
                                    <p className="text-secondary-500">
                                        No properties found in this category.
                                    </p>
                                </div>
                            ) : (
                                filteredProperties.map((property) => (
                                    <Link
                                        key={property._id}
                                        to={`/properties/${property._id}`}
                                        className="group"
                                        onClick={() => {
                                            // Add to recently viewed
                                            const recentlyViewed = JSON.parse(
                                                localStorage.getItem(
                                                    "recentlyViewedProperties"
                                                ) || "[]"
                                            )
                                            const exists = recentlyViewed.find(
                                                (p) => p._id === property._id
                                            )
                                            if (!exists) {
                                                const updatedRecentlyViewed = [
                                                    {
                                                        _id: property._id,
                                                        title: property.title,
                                                        price: property.price,
                                                        images: property.images,
                                                        address:
                                                            property.address,
                                                        bedrooms:
                                                            property.bedrooms,
                                                        bathrooms:
                                                            property.bathrooms,
                                                        avgRating:
                                                            property.avgRating,
                                                        viewedAt:
                                                            new Date().toISOString(),
                                                    },
                                                    ...recentlyViewed.slice(
                                                        0,
                                                        3
                                                    ), // Keep only the 4 most recent
                                                ]
                                                localStorage.setItem(
                                                    "recentlyViewedProperties",
                                                    JSON.stringify(
                                                        updatedRecentlyViewed
                                                    )
                                                )
                                            }
                                        }}
                                    >
                                        {/* Property Card - Airbnb Style */}
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
                                                <FaHeart className="text-secondary-400 hover:text-primary-500" />
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
                                                    <div className="absolute top-3 left-3 bg-secondary-900 text-white text-xs font-medium px-2 py-1 rounded-md">
                                                        New
                                                    </div>
                                                )}

                                            {property.featuredUntil &&
                                                new Date(
                                                    property.featuredUntil
                                                ) > new Date() && (
                                                    <div className="absolute bottom-3 left-3 bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center">
                                                        <RiVipCrownFill className="mr-1" />
                                                        Featured
                                                    </div>
                                                )}
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center justify-between w-full">
                                                    <h3 className="font-medium text-secondary-900 mb-1 line-clamp-1">
                                                        {property.title}
                                                    </h3>
                                                    <div className="flex items-center ml-2">
                                                        <FaStar className="text-secondary-900 mr-1" />
                                                        <span className="font-medium text-secondary-900">
                                                            {property.avgRating
                                                                ? property.avgRating.toFixed(
                                                                      1
                                                                  )
                                                                : "4.5"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-secondary-600 text-sm mb-1">
                                                    {property.address
                                                        ? `${
                                                              property.address
                                                                  .city
                                                          }${
                                                              property.address
                                                                  .state
                                                                  ? `, ${property.address.state}`
                                                                  : ""
                                                          }`
                                                        : "Location not specified"}
                                                </p>
                                                <p className="text-secondary-600 text-sm mb-2">
                                                    {property.bedrooms || 0}{" "}
                                                    beds ·{" "}
                                                    {property.bathrooms || 0}{" "}
                                                    baths
                                                </p>
                                                <p className="font-medium">
                                                    <span className="text-secondary-900 font-semibold">
                                                        {formatPrice(
                                                            property.price
                                                        )}
                                                    </span>
                                                    <span className="text-secondary-600">
                                                        {" "}
                                                        night
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Recently Viewed Section - Airbnb Style */}
            {recentlyViewed && recentlyViewed.length > 0 && (
                <section className="py-12 bg-white border-t border-secondary-200">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center">
                                <FaHistory className="text-secondary-900 text-xl mr-2" />
                                <h2 className="text-2xl font-semibold text-secondary-900">
                                    Recently Viewed
                                </h2>
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.removeItem(
                                        "recentlyViewedProperties"
                                    )
                                    setRecentlyViewed([])
                                }}
                                className="text-secondary-600 hover:text-secondary-900 text-sm font-medium transition-colors"
                            >
                                Clear history
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recentlyViewed.map((property) => (
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
                                        <div className="absolute bottom-3 right-3 bg-secondary-900 text-white text-xs font-medium px-2 py-1 rounded-md">
                                            {new Date(
                                                property.viewedAt
                                            ).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between w-full">
                                            <h3 className="font-medium text-secondary-900 mb-1 line-clamp-1">
                                                {property.title}
                                            </h3>
                                            {property.avgRating && (
                                                <div className="flex items-center ml-2">
                                                    <FaStar className="text-secondary-900 mr-1" />
                                                    <span className="font-medium text-secondary-900">
                                                        {property.avgRating.toFixed(
                                                            1
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-secondary-600 text-sm mb-1">
                                            {property.address
                                                ? `${property.address.city}${
                                                      property.address.state
                                                          ? `, ${property.address.state}`
                                                          : ""
                                                  }`
                                                : "Location not specified"}
                                        </p>
                                        <p className="font-medium">
                                            <span className="text-secondary-900 font-semibold">
                                                {formatPrice(property.price)}
                                            </span>
                                            <span className="text-secondary-600">
                                                {" "}
                                                night
                                            </span>
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Recommended For You Section - Airbnb Style */}
            {user &&
                categories.recommended &&
                categories.recommended.length > 0 && (
                    <section className="py-12 bg-white border-t border-secondary-200">
                        <div className="container mx-auto px-4">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center">
                                    <MdRecommend className="text-secondary-900 text-2xl mr-2" />
                                    <h2 className="text-2xl font-semibold text-secondary-900">
                                        Recommended For You
                                    </h2>
                                </div>
                                <Link
                                    to="/properties"
                                    className="text-secondary-900 font-medium hover:text-primary-500 flex items-center transition-colors"
                                >
                                    View all <FaAngleRight className="ml-1" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {categories.recommended.map((property) => (
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
                                                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-md"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    // Favorite functionality would go here
                                                }}
                                            >
                                                <FaHeart className="text-secondary-400 hover:text-primary-500" />
                                            </button>

                                            <div className="absolute bottom-3 left-3 bg-secondary-900 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center">
                                                <MdRecommend className="mr-1" />
                                                Recommended
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between w-full">
                                                <h3 className="font-medium text-secondary-900 mb-1 line-clamp-1">
                                                    {property.title}
                                                </h3>
                                                <div className="flex items-center ml-2">
                                                    <FaStar className="text-secondary-900 mr-1" />
                                                    <span className="font-medium text-secondary-900">
                                                        {property.avgRating
                                                            ? property.avgRating.toFixed(
                                                                  1
                                                              )
                                                            : "4.5"}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-secondary-600 text-sm mb-1">
                                                {property.address
                                                    ? `${
                                                          property.address.city
                                                      }${
                                                          property.address.state
                                                              ? `, ${property.address.state}`
                                                              : ""
                                                      }`
                                                    : "Location not specified"}
                                            </p>
                                            <p className="text-secondary-600 text-sm mb-2">
                                                {property.bedrooms || 0} beds ·{" "}
                                                {property.bathrooms || 0} baths
                                            </p>
                                            <p className="font-medium">
                                                <span className="text-secondary-900 font-semibold">
                                                    {formatPrice(
                                                        property.price
                                                    )}
                                                </span>
                                                <span className="text-secondary-600">
                                                    {" "}
                                                    night
                                                </span>
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

            {/* Featured Destinations Section - Airbnb Style */}
            <section className="py-16 bg-white border-t border-secondary-200">
                <div className="container mx-auto px-4">
                    <div className="mb-10">
                        <h2 className="text-3xl font-semibold text-secondary-900 mb-2">
                            Explore Popular Destinations
                        </h2>
                        <p className="text-secondary-600 text-lg">
                            Discover amazing stays in India's most beloved
                            destinations
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {destinations.map((destination, index) => (
                            <Link
                                key={index}
                                to={`/properties?search=${destination.searchTerm}`}
                                className="group"
                            >
                                <div className="relative rounded-2xl overflow-hidden aspect-square mb-3">
                                    <img
                                        src={destination.image}
                                        alt={destination.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-xl mr-2">
                                        {destination.icon}
                                    </span>
                                    <div>
                                        <h3 className="text-lg font-medium text-secondary-900">
                                            {destination.name}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-10 flex justify-center">
                        <Link
                            to="/properties"
                            className="inline-flex items-center px-6 py-3 bg-secondary-900 text-white font-medium rounded-lg hover:bg-secondary-800 transition-colors duration-300"
                        >
                            Explore All Destinations
                            <FaArrowRight className="ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section - Airbnb Style */}
            <section className="py-16 bg-white border-t border-secondary-200">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-semibold text-secondary-900 mb-4">
                                Why guests love StayFinder
                            </h2>
                            <p className="text-secondary-600 text-lg mb-8">
                                Join millions of happy travelers who have found
                                their perfect stay with us
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-full bg-secondary-100 text-secondary-900 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                                        <MdOutlineVerified size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-secondary-900 text-lg mb-2">
                                            Verified listings
                                        </h3>
                                        <p className="text-secondary-600">
                                            All properties are carefully
                                            reviewed for quality and accuracy
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-full bg-secondary-100 text-secondary-900 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                                        <FaShieldAlt size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-secondary-900 text-lg mb-2">
                                            Secure payments
                                        </h3>
                                        <p className="text-secondary-600">
                                            Your booking is protected with our
                                            secure payment system
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-full bg-secondary-100 text-secondary-900 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                                        <FaComments size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-secondary-900 text-lg mb-2">
                                            24/7 support
                                        </h3>
                                        <p className="text-secondary-600">
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
                                className="rounded-2xl w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Airbnb Style */}
            <section className="py-16 bg-secondary-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden border border-secondary-200">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                                <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-4">
                                    Ready to start your journey?
                                </h2>
                                <p className="text-secondary-600 mb-8">
                                    Find your perfect place to stay and create
                                    memories that last a lifetime
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        as={Link}
                                        to="/properties"
                                        variant="primary"
                                        className="bg-secondary-900 hover:bg-secondary-800 px-6 py-3"
                                    >
                                        Explore stays
                                    </Button>
                                    <Button
                                        as={Link}
                                        to="/register"
                                        variant="outline"
                                        className="border-secondary-300 text-secondary-900 hover:bg-secondary-100 px-6 py-3"
                                    >
                                        Sign up
                                    </Button>
                                </div>
                            </div>
                            <div className="md:w-1/2 relative min-h-[300px]">
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
