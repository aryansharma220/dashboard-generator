'use client';

import useAppStore from '../lib/store';
import FileUpload from '../components/FileUpload';
import DashboardConfig from '../components/DashboardConfig';
import DashboardView from '../components/DashboardView';
import NotificationToast from '../components/NotificationToast';

export default function Home() {
  const { currentStep, notifications, removeNotification } = useAppStore();

  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return <FileUpload />;
      case 'configure':
        return <DashboardConfig />;
      case 'dashboard':
        return <DashboardView />;
      default:
        return <FileUpload />;
    }
  };

  return (
    <>
      {renderStep()}
      <NotificationToast 
        notifications={notifications} 
        onDismiss={removeNotification} 
      />
    </>
  );
}
