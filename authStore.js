import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await api.post('/auth/login', { email, password })
          const { token, data } = res.data
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ user: data, token, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Login failed' }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true })
        try {
          const res = await api.post('/auth/register', { name, email, password })
          const { token, data } = res.data
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ user: data, token, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Registration failed' }
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout') } catch {}
        delete api.defaults.headers.common['Authorization']
        set({ user: null, token: null, isAuthenticated: false })
      },

      refreshUser: async () => {
        try {
          const res = await api.get('/auth/me')
          set({ user: res.data.data })
        } catch {
          get().logout()
        }
      },

      toggleSaveCollege: async (collegeId) => {
        try {
          const res = await api.post(`/users/save-college/${collegeId}`)
          const { saved } = res.data
          set((state) => ({
            user: {
              ...state.user,
              savedColleges: saved
                ? [...(state.user.savedColleges || []), collegeId]
                : (state.user.savedColleges || []).filter(id => id !== collegeId && id?._id !== collegeId),
            }
          }))
          return saved
        } catch (err) {
          throw new Error(err.response?.data?.message || 'Failed to save college')
        }
      },
    }),
    {
      name: 'edu-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
        }
      },
    }
  )
)
