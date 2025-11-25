import { wrapPromise } from '../utils/loaderManager';

const API_BASE_URL = "http://localhost:5001/api";

// Generic API request function (wrapped so the global loader reflects network activity)
const apiRequest = async (endpoint, options = {}) => {
    try {
        const response = await wrapPromise(fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            },
            ...options,
        }));

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
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

export const postsAPI = {
    create: async (data) => {
        // JSON create (text-only)
        return await apiRequest('/posts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    createWithImage: async (formData) => {
        try {
            const res = await wrapPromise(fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                body: formData // browser sets multipart boundary
            }));
            if (!res.ok) throw new Error('Failed to create post');
            return await res.json();
        } catch (err) { throw err; }
    },
    list: async (page=1, limit=20, q, tag, category) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (q) params.append('q', q);
        if (tag) params.append('tag', tag);
        if (category) params.append('category', category);
        return await apiRequest(`/posts?${params.toString()}`);
    },
    get: async (id) => {
        return await apiRequest(`/posts/${id}`);
    },
    toggleLike: async (id, userId) => {
        return await apiRequest(`/posts/${id}/like`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    },
    addComment: async (id, data) => {
        return await apiRequest(`/posts/${id}/comments`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    ,
    report: async (id, data) => {
        return await apiRequest(`/posts/${id}/report`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};