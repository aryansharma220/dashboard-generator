'use client';

import { useState } from 'react';
import { Settings, Key, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import useAppStore from '../lib/store';

export default function APIKeyConfig() {
  const { dashboardConfig } = useAppStore();
  const [showConfig, setShowConfig] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [keyStatus, setKeyStatus] = useState('unconfigured'); // unconfigured, valid, invalid
  const [showKey, setShowKey] = useState(false);

  const isDark = dashboardConfig.theme === 'dark';

  const validateKey = () => {
    if (!apiKey || apiKey === 'your_api_key_here') {
      setKeyStatus('invalid');
      return;
    }
    
    // Basic validation - keys should start with AIza and be reasonable length
    if (apiKey.startsWith('AIza') && apiKey.length > 20) {
      setKeyStatus('valid');
      // Store in localStorage for demo purposes
      localStorage.setItem('gemini_api_key', apiKey);
      window.location.reload(); // Reload to apply the key
    } else {
      setKeyStatus('invalid');
    }
  };

  const clearKey = () => {
    setApiKey('');
    setKeyStatus('unconfigured');
    localStorage.removeItem('gemini_api_key');
    window.location.reload();
  };

  // Check if key is already configured
  useState(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey && storedKey !== 'demo-key') {
      setApiKey(storedKey);
      setKeyStatus('valid');
    }
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfig(!showConfig)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
          isDark 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-white text-gray-600 hover:bg-gray-50'
        } shadow-lg hover:shadow-xl hover:scale-105`}
      >
        <Settings className="h-4 w-4" />
        <span className="text-sm font-medium">AI Settings</span>
        {keyStatus === 'valid' && <CheckCircle className="h-4 w-4 text-green-500" />}
        {keyStatus === 'invalid' && <AlertCircle className="h-4 w-4 text-red-500" />}
      </button>

      {showConfig && (
        <div className={`absolute top-full right-0 mt-2 w-96 rounded-2xl shadow-2xl border z-50 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <Key className="h-4 w-4 text-white" />
              </div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Gemini API Configuration
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className={`w-full px-3 py-2 border rounded-lg text-sm transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-xs ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                <p>• Get your API key from Google AI Studio</p>
                <p>• Free tier includes generous usage limits</p>
                <p>• Keys are stored locally in your browser</p>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center text-xs ${
                    isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                  } transition-colors`}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Get API Key
                </a>
                
                <div className="flex space-x-2">
                  {keyStatus === 'valid' && (
                    <button
                      onClick={clearKey}
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={validateKey}
                    className="px-3 py-1 text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  >
                    Save
                  </button>
                </div>
              </div>

              {keyStatus === 'invalid' && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div className="text-xs text-red-700">
                    <p className="font-medium">Invalid API Key</p>
                    <p>Please check your key and try again. Keys should start with "AIza".</p>
                  </div>
                </div>
              )}

              {keyStatus === 'valid' && (
                <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-xs text-green-700">
                    <p className="font-medium">API Key Configured</p>
                    <p>AI features are now enabled for intelligent insights and recommendations.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
