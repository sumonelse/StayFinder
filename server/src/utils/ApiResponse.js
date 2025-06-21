class ApiResponse {
    constructor(res) {
        this.res = res
    }

    success(data, message = "Success", statusCode = 200) {
        return this.res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
        })
    }

    error(message, statusCode = 400, errors = null) {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString(),
        }

        // Add detailed errors if provided (for validation errors)
        if (errors) {
            response.errors = errors
        }

        return this.res.status(statusCode).json(response)
    }

    created(data, message = "Resource created successfully") {
        return this.success(data, message, 201)
    }

    updated(data, message = "Resource updated successfully") {
        return this.success(data, message, 200)
    }

    deleted(message = "Resource deleted successfully") {
        return this.success(null, message, 200)
    }

    notFound(message = "Resource not found") {
        return this.error(message, 404)
    }

    unauthorized(message = "Unauthorized access") {
        return this.error(message, 401)
    }

    forbidden(message = "Access forbidden") {
        return this.error(message, 403)
    }

    conflict(message = "Resource conflict") {
        return this.error(message, 409)
    }

    validation(message = "Validation failed", errors = []) {
        return this.error(message, 400, errors)
    }

    serverError(message = "Internal server error") {
        return this.error(message, 500)
    }
}

export default ApiResponse
