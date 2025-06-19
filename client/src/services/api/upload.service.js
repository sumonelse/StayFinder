import api from "./axios"

/**
 * Service for handling image uploads
 */
const uploadService = {
    /**
     * Upload a single image
     * @param {File} file - The file to upload
     * @returns {Promise<Object>} - Upload result
     */
    async uploadSingleImage(file) {
        try {
            const formData = new FormData()
            formData.append("image", file)

            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }

            const response = await api.post("/uploads/single", formData, config)
            return response
        } catch (error) {
            throw error
        }
    },

    /**
     * Upload multiple images
     * @param {Array<File>} files - Array of files to upload
     * @returns {Promise<Object>} - Upload results
     */
    async uploadMultipleImages(files) {
        try {
            const formData = new FormData()

            files.forEach((file) => {
                formData.append("images", file)
            })

            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }

            const response = await api.post(
                "/uploads/multiple",
                formData,
                config
            )
            return response
        } catch (error) {
            throw error
        }
    },

    /**
     * Upload a single property image (host/admin only)
     * @param {File} file - The file to upload
     * @returns {Promise<Object>} - Upload result
     */
    async uploadPropertyImage(file) {
        try {
            const formData = new FormData()
            formData.append("image", file)
            formData.append("folder", "properties")

            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }

            const response = await api.post(
                "/uploads/property/single",
                formData,
                config
            )
            return response
        } catch (error) {
            throw error
        }
    },

    /**
     * Upload multiple property images (host/admin only)
     * @param {Array<File>} files - Array of files to upload
     * @returns {Promise<Object>} - Upload results
     */
    async uploadPropertyImages(files) {
        try {
            const formData = new FormData()

            files.forEach((file) => {
                formData.append("images", file)
            })

            formData.append("folder", "properties")

            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }

            const response = await api.post(
                "/uploads/property/multiple",
                formData,
                config
            )
            return response
        } catch (error) {
            throw error
        }
    },
}

export default uploadService
