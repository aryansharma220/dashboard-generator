'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X, Sparkles, AlertCircle, Info } from 'lucide-react';

export default function NotificationToast({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onDismiss }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(notification.id), 300);
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'ai':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'ai':
        return 'bg-purple-50 border-purple-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`min-w-80 max-w-md p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    } ${getBackgroundColor()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-gray-700">
            {notification.message}
          </p>
          {notification.details && (
            <div className="mt-2 space-y-1">
              {notification.details.map((detail, index) => (
                <p key={index} className="text-xs text-gray-600 flex items-center">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                  {detail}
                </p>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(notification.id), 300);
          }}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/50 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      {/* Progress bar for auto-hide */}
      {notification.autoHide && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-purple-600 h-1 rounded-full transition-all duration-75 ease-linear"
            style={{
              animation: `shrink ${notification.duration || 5000}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
}

// Add CSS for the progress bar animation
const style = `
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = style;
  document.head.appendChild(styleElement);
}
