import dotenv from "dotenv"
import app from "./src/app.js"
import connectDB from "./src/config/db.js"
import { config } from "./src/config/config.js"

const startServer = async () => {
    // Load environment variables
    dotenv.config()
    await connectDB()

    const PORT = config.port || 5000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

startServer()
