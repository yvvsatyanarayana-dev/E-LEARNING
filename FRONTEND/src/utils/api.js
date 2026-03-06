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
};

export default api;
