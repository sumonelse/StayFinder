import ApiResponse from "../utils/ApiResponse.js"

const errorHandler = (err, req, res, next) => {
    const apiResponse = new ApiResponse(res)
    console.error(`[${new Date().toISOString()}] Error: ${err.stack}`)

    apiResponse.error(
        err.message || "Internal Server Error",
        err.statusCode || 500
    )
}

export default errorHandler
