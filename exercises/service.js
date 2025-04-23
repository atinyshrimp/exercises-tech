// Separation of Concerns for Service Files Exercise
//
// This service file mixes general utility functions with business logic:
// 1. Contains both general API service functions and specific business operations
// 2. Mixes authentication logic with data fetching
// 3. Includes UI-related logic (alerts, redirects) within the service layer
// 4. Has inconsistent error handling patterns
//
// Your task: Refactor this to:
// 1. Separate general-purpose API functions from business logic
// 2. Remove UI-related code from the service layer
// 3. Create a clean, reusable service structure
// 4. Implement consistent error handling

// Create dedicated files for each concern

// src/services/apiClient.js
export const apiClient = {
  baseUrl: "/api",

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "API request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API GET error:", error);
      throw error;
    }
  },

  async post(endpoint, body) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API POST error:", error);
      throw error;
    }
  },

  async put(endpoint, body) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API PUT error:", error);
      throw error;
    }
  },
};

// src/services/authService.js
import { setToken, removeToken } from "../utils/auth";
import { apiClient } from "./apiClient";

export const authService = {
  async login(email, password) {
    try {
      const data = await apiClient.post("/auth/login", { email, password });
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return {
        success: true,
        user: data.user,
        isAdmin: data.user.isAdmin,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async register(userData) {
    try {
      const result = await apiClient.post("/auth/register", userData);
      return { success: true, user: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout() {
    removeToken();
    localStorage.removeItem("user");
    return { success: true };
  },
};

// src/services/userService.js
import { apiClient } from "./apiClient";

export const userService = {
  async getUserProfile() {
    try {
      const data = await apiClient.get("/user/profile");
      return { success: true, profile: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateUserProfile(profileData) {
    try {
      const data = await apiClient.put("/user/profile", profileData);

      // Update stored user data
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...currentUser,
            ...profileData,
          })
        );
      }

      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// Export all services
export { apiClient } from "./apiClient";
export { authService } from "./authService";
export { userService } from "./userService";
