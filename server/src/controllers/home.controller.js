import BaseController from "./base.controller.js"

/**
 * Controller for home/root routes
 * Handles basic server information and status endpoints
 */
class HomeController extends BaseController {
    /**
     * Get basic server information
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getServerInfo(req, res) {
        const serverInfo = {
            message: "StayFinder API Server",
            version: "1.0.0",
            status: "running",
        }

        return this.sendSuccess(res, serverInfo, "Server information")
    }

    /**
     * Handle 404 Not Found errors
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    notFound(req, res) {
        return this.sendError(res, "Resource not found", 404)
    }
}

// Create and export a singleton instance
const homeController = new HomeController()

// Bind all methods to the instance to preserve 'this' context
Object.getOwnPropertyNames(HomeController.prototype)
    .filter((method) => method !== "constructor")
    .forEach((method) => {
        homeController[method] = homeController[method].bind(homeController)
    })

export default homeController
