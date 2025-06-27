# State Management

This document explains the state management approach used in the StayFinder frontend application.

## Overview

StayFinder uses a combination of state management techniques to handle different types of state:

1. **Local Component State**: For component-specific state
2. **React Context**: For global application state
3. **TanStack Query**: For server state management
4. **React Hook Form**: For form state management

## State Categories

The application state is divided into several categories:

### UI State

UI state includes information about the user interface, such as:

-   Modal visibility
-   Sidebar open/closed state
-   Active tabs
-   Loading indicators
-   Toast notifications

UI state is typically managed using local component state or React Context for global UI elements.

### Authentication State

Authentication state includes information about the current user and authentication status:

-   User data (name, email, role, etc.)
-   Authentication status (logged in/out)
-   JWT token

Authentication state is managed using React Context to make it available throughout the application.

### Server State

Server state includes data fetched from the API:

-   Property listings
-   Booking data
-   User profiles
-   Reviews

Server state is managed using TanStack Query to handle caching, refetching, and synchronization with the server.

### Form State

Form state includes the values and validation state of forms:

-   Input values
-   Validation errors
-   Form submission state

Form state is managed using React Hook Form for efficient form handling.

## React Context

### AuthContext

The `AuthContext` provides authentication state and functions throughout the application:

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react"
import {
    loginUser,
    registerUser,
    getCurrentUser,
    logoutUser,
} from "../services/authService"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Load user from local storage on initial render
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = localStorage.getItem("token")
                if (token) {
                    const userData = await getCurrentUser()
                    setUser(userData)
                    setIsAuthenticated(true)
                }
            } catch (error) {
                localStorage.removeItem("token")
            } finally {
                setIsLoading(false)
            }
        }

        loadUser()
    }, [])

    // Login function
    const login = async (credentials) => {
        setIsLoading(true)
        try {
            const { token, user } = await loginUser(credentials)
            localStorage.setItem("token", token)
            setUser(user)
            setIsAuthenticated(true)
            return user
        } finally {
            setIsLoading(false)
        }
    }

    // Register function
    const register = async (userData) => {
        setIsLoading(true)
        try {
            const result = await registerUser(userData)
            return result
        } finally {
            setIsLoading(false)
        }
    }

    // Logout function
    const logout = () => {
        localStorage.removeItem("token")
        setUser(null)
        setIsAuthenticated(false)
        logoutUser()
    }

    // Update user function
    const updateUser = (userData) => {
        setUser(userData)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
```

Usage:

```jsx
import { useAuth } from "../context/AuthContext"

function ProfilePage() {
    const { user, isAuthenticated, logout } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to="/login" />
    }

    return (
        <div>
            <h1>Welcome, {user.name}</h1>
            <button onClick={logout}>Logout</button>
        </div>
    )
}
```

### UIContext

The `UIContext` provides global UI state and functions:

```jsx
// src/context/UIContext.jsx
import { createContext, useContext, useState } from "react"

const UIContext = createContext()

export const UIProvider = ({ children }) => {
    const [modals, setModals] = useState({})
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Open modal
    const openModal = (modalId, data = {}) => {
        setModals((prev) => ({
            ...prev,
            [modalId]: { isOpen: true, data },
        }))
    }

    // Close modal
    const closeModal = (modalId) => {
        setModals((prev) => ({
            ...prev,
            [modalId]: { isOpen: false, data: {} },
        }))
    }

    // Toggle sidebar
    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev)
    }

    return (
        <UIContext.Provider
            value={{
                modals,
                openModal,
                closeModal,
                sidebarOpen,
                toggleSidebar,
            }}
        >
            {children}
        </UIContext.Provider>
    )
}

export const useUI = () => useContext(UIContext)
```

Usage:

```jsx
import { useUI } from "../context/UIContext"

function PropertyCard({ property }) {
    const { openModal } = useUI()

    const handleBookNow = () => {
        openModal("booking", { property })
    }

    return (
        <div className="card">
            <h2>{property.title}</h2>
            <button onClick={handleBookNow}>Book Now</button>
        </div>
    )
}
```

## TanStack Query

TanStack Query (formerly React Query) is used for server state management. It provides caching, background refetching, and other features that make it ideal for managing server state.

### Query Setup

```jsx
// src/services/queryClient.js
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
        },
    },
})
```

### Query Hooks

```jsx
// src/hooks/useProperties.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
} from "../services/propertyService"

// Get all properties
export const useProperties = (filters = {}) => {
    return useQuery({
        queryKey: ["properties", filters],
        queryFn: () => getProperties(filters),
    })
}

// Get a single property
export const useProperty = (id) => {
    return useQuery({
        queryKey: ["property", id],
        queryFn: () => getProperty(id),
        enabled: !!id,
    })
}

// Create a property
export const useCreateProperty = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createProperty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["properties"] })
        },
    })
}

// Update a property
export const useUpdateProperty = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateProperty,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["properties"] })
            queryClient.invalidateQueries({ queryKey: ["property", data._id] })
        },
    })
}

// Delete a property
export const useDeleteProperty = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteProperty,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["properties"] })
            queryClient.invalidateQueries({ queryKey: ["property", variables] })
        },
    })
}
```

Usage:

```jsx
import { useProperties, useProperty } from "../hooks/useProperties"

function PropertyListPage() {
    const [filters, setFilters] = useState({})
    const { data, isLoading, error } = useProperties(filters)

    if (isLoading) return <LoadingSpinner />
    if (error) return <ErrorMessage error={error} />

    return (
        <div>
            <FilterForm filters={filters} onChange={setFilters} />
            <PropertyList properties={data.properties} />
        </div>
    )
}

function PropertyDetailPage() {
    const { id } = useParams()
    const { data, isLoading, error } = useProperty(id)

    if (isLoading) return <LoadingSpinner />
    if (error) return <ErrorMessage error={error} />

    return <PropertyDetail property={data.property} />
}
```

## React Hook Form

React Hook Form is used for form state management. It provides a performant and flexible way to handle forms with minimal re-renders.

```jsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Form validation schema
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data) => {
        try {
            await login(data)
            navigate("/dashboard")
        } catch (error) {
            // Handle error
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" {...register("email")} />
                {errors.email && <p>{errors.email.message}</p>}
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    {...register("password")}
                />
                {errors.password && <p>{errors.password.message}</p>}
            </div>

            <button type="submit">Login</button>
        </form>
    )
}
```

## State Management Best Practices

1. **Use the Right Tool for the Job**:

    - Local state for component-specific state
    - Context for global state
    - TanStack Query for server state
    - React Hook Form for form state

2. **Keep State Minimal**:

    - Only store what you need
    - Derive state when possible

3. **Normalize Server Data**:

    - Avoid deeply nested state
    - Use IDs to reference related entities

4. **Optimize Renders**:

    - Use memoization (useMemo, useCallback)
    - Split contexts to avoid unnecessary re-renders

5. **Handle Loading and Error States**:

    - Always account for loading and error states
    - Provide feedback to users

6. **Persist Important State**:
    - Use localStorage for state that should persist across sessions
    - Consider using a library like redux-persist for more complex persistence needs
