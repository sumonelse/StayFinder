import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./context/AuthContext"
import AppRouter from "./routes"
import { ToastContainer, ModalContainer } from "./components/ui"

// Create a client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
        },
    },
})

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AppRouter />
                <ToastContainer />
                <ModalContainer />
            </AuthProvider>
        </QueryClientProvider>
    )
}

export default App
