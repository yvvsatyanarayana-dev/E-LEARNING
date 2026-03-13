// src/utils/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem("token");
        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);

            if (response.status === 401) {
                // Handle unauthorized (e.g., redirect to login)
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
                throw new Error("Unauthorized");
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Something went wrong");
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: "GET" });
    },

    post(endpoint, data, options = {}) {
        return this.request(endpoint, { ...options, method: "POST", body: JSON.stringify(data) });
    },

    patch(endpoint, data, options = {}) {
        return this.request(endpoint, { ...options, method: "PATCH", body: JSON.stringify(data) });
    },

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: "DELETE" });
    },

    async upload(endpoint, file) {
        const token = localStorage.getItem("token");
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers,
                body: formData
            });

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
                throw new Error("Unauthorized");
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Upload failed");
            }

            return await response.json();
        } catch (error) {
            console.error(`API Upload Error (${endpoint}):`, error);
            throw error;
        }
    },

    async download(endpoint, options = {}) {
        const token = localStorage.getItem("token");
        const headers = { ...options.headers };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                method: "GET",
                headers
            });

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
                throw new Error("Unauthorized");
            }

            if (!response.ok) {
                throw new Error("Download failed");
            }

            return await response.blob();
        } catch (error) {
            console.error(`API Download Error (${endpoint}):`, error);
            throw error;
        }
    }
};


export default api;
