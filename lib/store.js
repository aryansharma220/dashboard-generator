import { create } from 'zustand';

const useAppStore = create((set, get) => ({
      // App state
      currentStep: 'upload',
      
      // Data state
      rawData: null,
      processedData: null,
      columns: [],
      filename: '',
      
      // AI Analysis state
      aiAnalysis: null,
      aiInsights: null,
      isAnalyzing: false,
      analysisError: null,
      
      // Dashboard config
      dashboardConfig: {
        title: 'My Dashboard',
        subtitle: '',
        charts: [],
        theme: 'light'
      },
      
      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      
      setFileData: (data, filename) => set({ 
        rawData: data, 
        filename,
        columns: data.length > 0 ? Object.keys(data[0]) : []
      }),
        setProcessedData: (data) => set({ processedData: data }),
      
      // AI Analysis actions
      setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setAiAnalysis: (analysis) => set({ aiAnalysis: analysis, analysisError: null }),
      setAiInsights: (insights) => set({ aiInsights: insights }),
      setAnalysisError: (error) => set({ analysisError: error, isAnalyzing: false }),
      
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
        aiAnalysis: null,
        aiInsights: null,
        isAnalyzing: false,
        analysisError: null,
        dashboardConfig: {
          title: 'My Dashboard',
          subtitle: '',
          charts: [],
          theme: 'light'
        }
      }),
        toggleTheme: () => set(state => ({
        dashboardConfig: {
          ...state.dashboardConfig,
          theme: state.dashboardConfig.theme === 'light' ? 'dark' : 'light'
        }
      }))
    }));

export default useAppStore;
