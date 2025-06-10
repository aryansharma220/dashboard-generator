import { create } from 'zustand';

const useAppStore = create((set, get) => ({
      // App state
      currentStep: 'upload',
      
      // Data state
      rawData: null,
      processedData: null,
      columns: [],
      filename: '',
      
      // Dashboard config
      dashboardConfig: {
        title: 'My Dashboard',
        subtitle: '',
        charts: [],
        theme: 'light'
      },

      // AI and Analytics state
      aiInsights: null,
      analyzing: false,
      favorites: [],
      savedDashboards: [],
      recentActivity: [],
      notifications: [],
      
      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      
      setFileData: (data, filename) => set({ 
        rawData: data, 
        filename,
        columns: data.length > 0 ? Object.keys(data[0]) : []
      }),
      
      setProcessedData: (data) => set({ processedData: data }),
      
      updateDashboardConfig: (config) => set(state => ({
        dashboardConfig: { ...state.dashboardConfig, ...config }
      })),
      
      addChart: (chart) => set(state => ({
        dashboardConfig: {
          ...state.dashboardConfig,
          charts: [...state.dashboardConfig.charts, chart]
        }
      })),
      
      updateChart: (index, chart) => set(state => ({
        dashboardConfig: {
          ...state.dashboardConfig,
          charts: state.dashboardConfig.charts.map((c, i) => i === index ? { ...c, ...chart } : c)
        }
      })),
      
      removeChart: (index) => set(state => ({
        dashboardConfig: {
          ...state.dashboardConfig,
          charts: state.dashboardConfig.charts.filter((_, i) => i !== index)
        }
      })),
        reset: () => set({
        currentStep: 'upload',
        rawData: null,
        processedData: null,
        columns: [],
        filename: '',
        dashboardConfig: {
          title: 'My Dashboard',
          subtitle: '',
          charts: [],
          theme: 'light'
        },
        aiInsights: null,
        analyzing: false
      }),

      // AI and Analytics actions
      setAiInsights: (insights) => set({ aiInsights: insights }),
      setAnalyzing: (analyzing) => set({ analyzing }),
      
      // Favorites and saved dashboards
      addToFavorites: (item) => set(state => ({
        favorites: [...state.favorites, { ...item, id: Date.now(), timestamp: new Date().toISOString() }]
      })),
      
      removeFromFavorites: (id) => set(state => ({
        favorites: state.favorites.filter(item => item.id !== id)
      })),
      
      saveDashboard: (dashboard) => set(state => ({
        savedDashboards: [...state.savedDashboards, { ...dashboard, id: Date.now(), timestamp: new Date().toISOString() }]
      })),
      
      loadDashboard: (dashboard) => set({ dashboardConfig: dashboard }),
      
      // Activity tracking
      addActivity: (activity) => set(state => ({
        recentActivity: [{ ...activity, id: Date.now(), timestamp: new Date().toISOString() }, ...state.recentActivity.slice(0, 19)]
      })),

      // Notification system
      addNotification: (notification) => set(state => ({
        notifications: [
          ...state.notifications, 
          { 
            ...notification, 
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            autoHide: notification.autoHide !== false
          }
        ]
      })),

      removeNotification: (id) => set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      clearNotifications: () => set({ notifications: [] }),

      toggleTheme: () => set(state => ({
        dashboardConfig: {
          ...state.dashboardConfig,
          theme: state.dashboardConfig.theme === 'light' ? 'dark' : 'light'
        }
      }))
    }));

export default useAppStore;
