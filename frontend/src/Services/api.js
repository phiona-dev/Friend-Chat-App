const API_BASE_URL = "http://localhost:5000/api";

//Generic API request function
const apiRequest = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json()
    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
};

//chat API functions
export const chatAPI = {
    //get all chats for a user
    getUserChats: async (userId) => {
        return await apiRequest(`/chats/${userId}`);
    },

    //get messages for a specific chat
    getChatMessages: async (chatId, page = 1, limit = 50) => {
        return await apiRequest(`/chats/messages/${chatId}?page=${page}&limit=${limit}`)
    },

    //create a new chat(when users match)
    createChat: async (participant1, participant2) => {
        return await apiRequest("/chats", {
            method: "POST",
            body: JSON.stringify({ participant1, participant2 }),
        });
    },

    //send a message
    sendMessage: async (chatId, senderId, content, messageType = "text") => {
        return await apiRequest(`/chats/${chatId}/messages`, {
            method: "POST",
            body: JSON.stringify({ senderId, content, messageType }),
        });
    },

    //mark messages as read
    markMessagesAsRead: async (chatId, userId) => {
        return await apiRequest(`/chats/${chatId}/read`, {
            method: "PUT",
            body: JSON.stringify({ userId }),
        });
    },
};

export const matchingAPI = {
    getPendingMatches: async (userId) => {
        return await apiRequest(`/matches/${userId}`);
    },

    acceptMatch: async (matchId, userId) => {
        return await apiRequest(`/matches/${matchId}/accept`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    },

    rejectMatch: async (matchId, userId) => {
        return await apiRequest(`/matches/${matchId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }
}

export const userAPI = {
  // Create or update user profile
  createProfile: async (profileData) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Get user profile by userId
  getProfile: async (userId) => {
    return await apiRequest(`/users/${userId}`);
  },
};