'use client';

import { useState } from 'react';
import { Share2, Link, Mail, Download, Users, X, Copy, Check } from 'lucide-react';
import useAppStore from '../lib/store';

export default function CollaborationPanel({ isOpen, onClose }) {
  const { dashboardConfig } = useAppStore();
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedShareMethod, setSelectedShareMethod] = useState('link');

  const generateShareUrl = () => {
    // Simulate generating a shareable URL
    const url = `${window.location.origin}/shared/${Date.now()}`;
    setShareUrl(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = `Dashboard: ${dashboardConfig.title}`;
    const body = `Check out this dashboard: ${shareUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-xl shadow-2xl w-full max-w-lg mx-4 ${
        dashboardConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b ${
          dashboardConfig.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <Share2 className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className={`text-lg font-semibold ${
              dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Share Dashboard
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`${
              dashboardConfig.theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {/* Share Method Selection */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                dashboardConfig.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Share Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'link', name: 'Link', icon: Link },
                  { id: 'email', name: 'Email', icon: Mail },
                  { id: 'export', name: 'Export', icon: Download }
                ].map(method => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedShareMethod(method.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedShareMethod === method.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : dashboardConfig.theme === 'dark'
                            ? 'border-gray-600 hover:border-gray-500'
                            : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${
                        selectedShareMethod === method.id ? 'text-blue-600' : 
                        dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <span className={`text-xs ${
                        selectedShareMethod === method.id ? 'text-blue-600 font-medium' : 
                        dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {method.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Share Content */}
            {selectedShareMethod === 'link' && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className={`text-sm font-medium ${
                    dashboardConfig.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Shareable Link
                  </label>
                  {!shareUrl && (
                    <button
                      onClick={generateShareUrl}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Generate Link
                    </button>
                  )}
                </div>
                {shareUrl && (
                  <div className="relative">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm ${
                        dashboardConfig.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      onClick={() => copyToClipboard(shareUrl)}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                        copied ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {selectedShareMethod === 'email' && (
              <div>
                <p className={`text-sm mb-3 ${
                  dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Share via email with default mail client
                </p>
                <button
                  onClick={shareViaEmail}
                  disabled={!shareUrl}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Open Email Client
                </button>
                {!shareUrl && (
                  <p className={`text-xs mt-2 ${
                    dashboardConfig.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    Generate a link first to enable email sharing
                  </p>
                )}
              </div>
            )}

            {selectedShareMethod === 'export' && (
              <div>
                <p className={`text-sm mb-3 ${
                  dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Export dashboard for sharing
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {['PNG', 'PDF', 'HTML'].map(format => (
                    <button
                      key={format}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        dashboardConfig.theme === 'dark'
                          ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      Export {format}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Permissions */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                dashboardConfig.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Access Permissions
              </label>
              <div className="space-y-2">
                {[
                  { id: 'view', name: 'View Only', desc: 'Recipients can view the dashboard' },
                  { id: 'comment', name: 'Comment', desc: 'Recipients can view and comment' },
                  { id: 'edit', name: 'Edit', desc: 'Recipients can modify the dashboard' }
                ].map(permission => (
                  <label key={permission.id} className="flex items-start">
                    <input
                      type="radio"
                      name="permission"
                      value={permission.id}
                      defaultChecked={permission.id === 'view'}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className={`text-sm font-medium ${
                        dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {permission.name}
                      </span>
                      <p className={`text-xs ${
                        dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {permission.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 transition-colors ${
                dashboardConfig.theme === 'dark' 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!shareUrl) generateShareUrl();
                // Additional sharing logic here
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Share Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
