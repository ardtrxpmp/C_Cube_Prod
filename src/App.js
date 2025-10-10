import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from './styles/GlobalStyle';
import Layout from './components/Layout';
import { AppProvider } from './context/AppContext';
import EnvironmentDetection from './utils/EnvironmentDetection';
import WebWarningBanner from './components/WebWarningBanner';
import Header from './components/Header_New';

// Import pages
import WelcomeScreen from './pages/WelcomeScreen';
import SetupWallet from './pages/SetupWallet';
import ColdWallet from './pages/ColdWallet';
import Broadcast from './pages/Broadcast';
import Resources from './pages/Resources';
import Landing from './pages/Landing_New';
import Content from './pages/Content';
import Learn from './pages/Learn';
import AITutor from './pages/AITutor';
import Playground from './pages/Playground';
import TokenLaunch from './pages/TokenLaunch';
import AboutUs from './pages/AboutUs';
import Community from './pages/Community';
import FAQ from './pages/FAQ_Fixed';
import ComingSoon from './pages/ComingSoon';
import Downloads from './pages/Downloads';
import SecurityPrompt from './components/SecurityPrompt';

// Navigation wrapper component that can use useNavigate
function AppContent() {
  const navigate = useNavigate();
  
  // Navigation handler using React Router
  const handlePageNavigation = (page) => {
    const routeMap = {
      'landing': '/',
      'about-us': '/about',
      'about': '/about',  
      'community': '/community',
      'learn': '/learn',
      'content': '/learn',
      'ai-tutor': '/ai-tutor',
      'earn': '/ai-tutor',
      'playground': '/playground',
      'launch-token': '/launch-token',
      'faq': '/faq',
      'downloads': '/downloads',
      'apps': '/apps',
      'c-cube': '/apps',
      'coming-soon': '/coming-soon'
    };

    const route = routeMap[page] || '/';
    navigate(route);
  };

  return (
    <Routes>
      {/* Website routes with proper URLs */}
      <Route path="/" element={
        <>
          <Header currentPage="landing" onNavigate={handlePageNavigation} />
          <Landing onAppSelect={handlePageNavigation} onNavigate={handlePageNavigation} />
        </>
      } />
      <Route path="/learn" element={
        <>
          <Header currentPage="content" onNavigate={handlePageNavigation} />
          <Learn onNavigate={handlePageNavigation} />
        </>
      } />
      <Route path="/about" element={
        <>
          <Header currentPage="about" onNavigate={handlePageNavigation} />
          <AboutUs onNavigate={handlePageNavigation} />
        </>
      } />
      <Route path="/community" element={
        <>
          <Header currentPage="community" onNavigate={handlePageNavigation} />
          <Community onNavigate={handlePageNavigation} />
        </>
      } />
      <Route path="/faq" element={
        <>
          <Header currentPage="faq" onNavigate={handlePageNavigation} />
          <FAQ onNavigate={handlePageNavigation} />
        </>
      } />
      <Route path="/downloads" element={
        <>
          <Header currentPage="downloads" onNavigate={handlePageNavigation} />
          <Downloads onNavigate={handlePageNavigation} />
        </>
      } />
      <Route path="/coming-soon" element={
        <>
          <Header currentPage="coming-soon" onNavigate={handlePageNavigation} />
          <ComingSoon onNavigate={handlePageNavigation} />
        </>
      } />

      {/* C-Cube app routes */}
      <Route path="/apps/*" element={<CCubeAppRoutes />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Separate component for C-Cube app routes
function CCubeAppRoutes() {
  const [isSetup, setIsSetup] = useState(false);
  const [isSecurityPromptAcknowledged, setIsSecurityPromptAcknowledged] = useState(false);
  const [hasInitialChoice, setHasInitialChoice] = useState(false);
  const [isWebEnvironment, setIsWebEnvironment] = useState(false);

  useEffect(() => {
    const envInfo = EnvironmentDetection.getEnvironmentInfo();
    setIsWebEnvironment(envInfo.isWeb);
    
    const hasSetupWallet = localStorage.getItem('walletSetup');
    if (hasSetupWallet === 'true') {
      setIsSetup(true);
    }
    
    const walletAction = localStorage.getItem('walletAction');
    if (walletAction === 'create' || walletAction === 'recover') {
      setHasInitialChoice(true);
    }
  }, []);

  if (!isSecurityPromptAcknowledged) {
    return (
      <ThemeProvider theme={theme}>
        <SecurityPrompt onAcknowledge={() => setIsSecurityPromptAcknowledged(true)} />
      </ThemeProvider>
    );
  }

  return (
    <AppProvider>
      {isWebEnvironment && <WebWarningBanner />}
      <Layout>
        <Routes>
          <Route path="/resources" element={<Resources />} />
          <Route path="/broadcast" element={<Broadcast />} />
          <Route path="/wallet" element={<ColdWallet />} />
          <Route path="/" element={
            isSetup ? <ColdWallet /> : 
            hasInitialChoice ? <SetupWallet onSetupComplete={() => setIsSetup(true)} /> : 
            <WelcomeScreen />
          } />
        </Routes>
      </Layout>
    </AppProvider>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // Start with landing page
  const [isWebEnvironment, setIsWebEnvironment] = useState(false);
  
  // C-Cube wallet state
  const [isSetup, setIsSetup] = useState(false);
  const [isSecurityPromptAcknowledged, setIsSecurityPromptAcknowledged] = useState(false);
  const [hasInitialChoice, setHasInitialChoice] = useState(false);

  useEffect(() => {
    const envInfo = EnvironmentDetection.getEnvironmentInfo();
    setIsWebEnvironment(envInfo.isWeb);
    
    // Check if the user has already set up the wallet (only for C-Cube app)
    const hasSetupWallet = localStorage.getItem('walletSetup');
    if (hasSetupWallet === 'true') {
      setIsSetup(true);
    }
    
    // Check if user has made an initial wallet choice
    const walletAction = localStorage.getItem('walletAction');
    if (walletAction === 'create' || walletAction === 'recover') {
      setHasInitialChoice(true);
    }
    
    // Log environment info for debugging
    console.log('Environment:', envInfo);
  }, []);

  const handlePageNavigation = (page) => {
    console.log('Navigation requested to:', page);
    
    // Map page names to actual routes
    const routeMap = {
      'landing': '/',
      'about-us': '/about',
      'about': '/about',
      'community': '/community',
      'learn': '/learn',
      'content': '/learn',
      'ai-tutor': '/ai-tutor',
      'earn': '/ai-tutor',
      'playground': '/playground',
      'faq': '/faq',
      'downloads': '/downloads',
      'apps': '/apps',
      'c-cube': '/apps',
      'coming-soon': '/coming-soon',
      'launch-token': '/launch-token'
    };

    const route = routeMap[page] || '/';
    console.log('Navigating to route:', route);
    
    // Use window.location to navigate to the actual URL
    window.location.href = route;
  };

  // Render C-Cube wallet app with its original logic
  const renderCCubeApp = (currentPath) => {
    // Handle initial security prompt for C-Cube
    if (!isSecurityPromptAcknowledged) {
      return (
        <ThemeProvider theme={theme}>
          <SecurityPrompt onAcknowledge={() => setIsSecurityPromptAcknowledged(true)} />
        </ThemeProvider>
      );
    }

    return (
      <AppProvider>
        {isWebEnvironment && <WebWarningBanner />}
        <Layout>
          {isSetup ? (
            // Wallet is already set up, show main app based on route
            <>
              {currentPath === '/apps/resources' && <Resources />}
              {currentPath === '/apps/broadcast' && <Broadcast />}
              {(currentPath === '/apps/wallet' || currentPath === '/apps') && <ColdWallet />}
            </>
          ) : hasInitialChoice ? (
            // User has chosen create/recover, but hasn't completed setup
            <SetupWallet onSetupComplete={() => setIsSetup(true)} />
          ) : (
            // User needs to choose between create and recover
            <WelcomeScreen />
          )}
        </Layout>
      </AppProvider>
    );
  };

  // Render website structure for main pages
  const renderWebsitePages = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing onAppSelect={handlePageNavigation} onNavigate={handlePageNavigation} />;
      case 'content':
        return <Learn onNavigate={handlePageNavigation} />;
      case 'about':
        return <AboutUs onNavigate={handlePageNavigation} />;
      case 'community':
        return <Community onNavigate={handlePageNavigation} />;
      case 'faq':
        return <FAQ onNavigate={handlePageNavigation} />;
      case 'downloads':
        return <Downloads onNavigate={handlePageNavigation} />;
      case 'coming-soon':
        return <ComingSoon onNavigate={handlePageNavigation} />;
      case 'c-cube':
        return renderCCubeApp();
      default:
        return <Landing onAppSelect={handlePageNavigation} onNavigate={handlePageNavigation} />;
    }
  };

  // Main website with proper URL routing
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Routes>
          {/* Website routes with proper URLs */}
          <Route path="/" element={
            <>
              <Header currentPage="landing" onNavigate={handlePageNavigation} />
              <Landing onAppSelect={handlePageNavigation} onNavigate={handlePageNavigation} />
            </>
          } />
          <Route path="/learn" element={
            <>
              <Header currentPage="content" onNavigate={handlePageNavigation} />
              <Learn onNavigate={handlePageNavigation} />
            </>
          } />
          <Route path="/ai-tutor" element={
            <AITutor onNavigate={handlePageNavigation} />
          } />
          <Route path="/playground" element={
            <Playground onNavigate={handlePageNavigation} />
          } />
          <Route path="/launch-token" element={
            <TokenLaunch onNavigate={handlePageNavigation} />
          } />
          <Route path="/about" element={
            <>
              <Header currentPage="about" onNavigate={handlePageNavigation} />
              <AboutUs onNavigate={handlePageNavigation} />
            </>
          } />
          <Route path="/community" element={
            <>
              <Header currentPage="community" onNavigate={handlePageNavigation} />
              <Community onNavigate={handlePageNavigation} />
            </>
          } />
          <Route path="/faq" element={
            <>
              <Header currentPage="faq" onNavigate={handlePageNavigation} />
              <FAQ onNavigate={handlePageNavigation} />
            </>
          } />
          <Route path="/downloads" element={
            <>
              <Header currentPage="downloads" onNavigate={handlePageNavigation} />
              <Downloads onNavigate={handlePageNavigation} />
            </>
          } />
          {/* C-Cube wallet app routes */}
          <Route path="/apps" element={renderCCubeApp('/apps')} />
          <Route path="/apps/wallet" element={renderCCubeApp('/apps/wallet')} />
          <Route path="/apps/resources" element={renderCCubeApp('/apps/resources')} />
          <Route path="/apps/broadcast" element={renderCCubeApp('/apps/broadcast')} />
          
          <Route path="/coming-soon" element={
            <>
              <Header currentPage="coming-soon" onNavigate={handlePageNavigation} />
              <ComingSoon onNavigate={handlePageNavigation} />
            </>
          } />
          
          {/* Legacy C-Cube app routes (without header) */}
          <Route path="/c-cube/*" element={renderCCubeApp('/c-cube')} />
          
          {/* Fallback to home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
