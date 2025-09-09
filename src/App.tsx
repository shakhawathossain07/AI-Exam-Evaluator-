import { useState, Suspense, lazy } from 'react';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { AuthWrapper } from './components/AuthWrapper';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { LoadingSpinner } from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load heavy components
const ExamEvaluator = lazy(() => import('./components/ExamEvaluator').then(module => ({ default: module.ExamEvaluator })));
const ResultsHistory = lazy(() => import('./components/ResultsHistory').then(module => ({ default: module.ResultsHistory })));
const Analytics = lazy(() => import('./components/Analytics').then(module => ({ default: module.Analytics })));
const Settings = lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));
const IGCSEGenerator = lazy(() => import('./components/IGCSEGenerator').then(module => ({ default: module.IGCSEGenerator })));
const DebugSupabase = lazy(() => import('./components/DebugSupabase').then(module => ({ default: module.DebugSupabase })));

// Loading fallback component
function ComponentLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner message="Loading component..." />
    </div>
  );
}

export type NavigationTab = 'dashboard' | 'evaluate' | 'results' | 'analytics' | 'igcse-generator' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Check if debug mode is enabled via URL parameter
  const isDebugMode = new URLSearchParams(window.location.search).get('debug') === 'true';

  if (isDebugMode) {
    return (
      <Suspense fallback={<ComponentLoader />}>
        <DebugSupabase />
      </Suspense>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'evaluate':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ExamEvaluator />
          </Suspense>
        );
      case 'results':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ResultsHistory />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <Analytics />
          </Suspense>
        );
      case 'igcse-generator':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <IGCSEGenerator />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <Settings />
          </Suspense>
        );
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <ErrorBoundary>
      <AuthWrapper>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20 relative overflow-hidden">
          <BackgroundAnimation />
          <div className="relative z-10">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="max-w-7xl mx-auto px-4 py-8">
              {renderContent()}
            </main>
          </div>
        </div>
      </AuthWrapper>
    </ErrorBoundary>
  );
}

export default App;