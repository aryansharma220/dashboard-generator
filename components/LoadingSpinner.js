'use client';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className={`${sizes[size]} border-4 border-purple-200 rounded-full animate-spin`}></div>
        <div className={`absolute top-0 left-0 ${sizes[size]} border-4 border-transparent border-t-purple-600 rounded-full animate-spin`}></div>
      </div>
      {text && (
        <p className="mt-3 text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
}
