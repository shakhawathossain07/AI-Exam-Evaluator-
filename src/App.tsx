import { useState, Suspense, lazy } from 'react';
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
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
            <div className="absolute top-0 left-1/4 w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[400px] lg:h-[500px] bg-cyan-500/10 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[300px] lg:w-[400px] h-[250px] sm:h-[300px] lg:h-[400px] bg-blue-500/10 rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-[200px] sm:w-[250px] lg:w-[300px] h-[200px] sm:h-[250px] lg:h-[300px] bg-purple-500/5 rounded-full blur-[50px] sm:blur-[60px] lg:blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          <div className="relative z-10">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
              {renderContent()}
            </main>
          </div>
        </div>
      </AuthWrapper>
    </ErrorBoundary>
  );
}

export default App;