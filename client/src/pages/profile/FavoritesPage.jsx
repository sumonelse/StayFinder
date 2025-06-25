import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { FaHeart, FaSearch } from "react-icons/fa"
import { authService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import PropertyCard from "../../components/properties/PropertyCard"

/**
 * Favorites page component
 * Displays a list of the user's favorite properties
 */
const FavoritesPage = () => {
    const { removeFromFavorites } = useAuth()
    const [searchTerm, setSearchTerm] = useState("")

    // Fetch user favorites
    const {
        data: favorites,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["favorites"],
        queryFn: () => authService.getFavorites(),
    })

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
    }

    // Filter favorites by search term
    const filteredFavorites = favorites
        ? favorites.filter(
              (property) =>
                  property.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  property.address.city
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  property.address.country
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
          )
        : []

    // Handle remove from favorites
    const handleRemoveFromFavorites = async (propertyId) => {
        try {
            await removeFromFavorites(propertyId)
            refetch() // Refresh the favorites list
        } catch (err) {
            console.error("Error removing from favorites:", err)
        }
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Your Favorites</h1>
                <div className="animate-pulse">
                    <div className="h-12 bg-secondary-200 rounded mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-secondary-200 rounded-lg h-64"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (isError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Your Favorites</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>
                        Error loading favorites:{" "}
                        {error?.message || "Please try again later."}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Your Favorites</h1>

                <div className="mt-4 md:mt-0 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-secondary-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search your favorites..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
                    />
                </div>
            </div>

            {/* No favorites message */}
            {favorites?.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <FaHeart className="text-red-500 text-4xl" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                        You don't have any favorites yet
                    </h2>
                    <p className="text-secondary-600 mb-6">
                        Start exploring properties and save your favorites!
                    </p>
                    <Link
                        to="/properties"
                        className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
                    >
                        Find properties
                    </Link>
                </div>
            )}

            {/* Favorites list */}
            {favorites?.length > 0 && (
                <>
                    {/* Search results count */}
                    {searchTerm && (
                        <p className="mb-4 text-secondary-600">
                            Found {filteredFavorites.length} properties matching
                            "{searchTerm}"
                        </p>
                    )}

                    {/* No search results message */}
                    {searchTerm && filteredFavorites.length === 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <p className="text-secondary-600">
                                No favorites match your search. Try a different
                                term.
                            </p>
                        </div>
                    )}

                    {/* Property grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFavorites.map((property) => (
                            <PropertyCard
                                key={property._id}
                                property={{
                                    ...property,
                                    isFavorite: true,
                                }}
                                onToggleFavorite={handleRemoveFromFavorites}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default FavoritesPage
