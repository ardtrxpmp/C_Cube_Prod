import React, { useContext } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { AppContext } from '../context/AppContext';
import NetworkSelector from './NetworkSelector';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const AppTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  overflow-x: auto;
  
  @media (max-width: 768px) {
    justify-content: flex-start;
    padding: 0 0.5rem;
    -webkit-overflow-scrolling: touch;
    
    /* Hide scrollbar but keep functionality */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
  }
`;

const NavMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
    padding: 0;
    margin: 0;
    flex-wrap: nowrap;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const NavItem = styled.li`
  a {
    color: ${({ theme }) => theme.colors.text};
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
    white-space: nowrap;
    display: block;
    
    @media (max-width: 768px) {
      padding: 0.4rem 0.8rem;
      font-size: 0.9rem;
    }
    
    @media (max-width: 480px) {
      padding: 0.3rem 0.6rem;
      font-size: 0.8rem;
    }

    &:hover {
      background-color: ${({ theme }) => theme.colors.primary}33;
    }

    &.active {
      background-color: ${({ theme }) => theme.colors.primary};
      color: white;
    }
  }
`;

const ContentContainer = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 0.8rem;
  }
`;

const Footer = styled.footer`
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.mutedText};
`;

const OnlineIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  
  span {
    font-size: 0.875rem;
    margin-left: 0.5rem;
  }
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.isOnline ? 'green' : 'red'};
`;

const Layout = ({ children }) => {
  const location = useLocation();
  const { networkStatus } = useContext(AppContext);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show certain pages based on online/offline status
  const showBroadcastLink = true; // Will be shown regardless, but functionality is limited when offline

  return (
    <LayoutContainer>
      <Header>
        <style>{`
          @keyframes earth-swing {
            0% { transform: rotateY(0deg); }
            50% { transform: rotateY(30deg); }
            100% { transform: rotateY(0deg); }
          }
          .earth-spin {
            animation: earth-swing 6s ease-in-out infinite;
            transform-style: preserve-3d;
          }
        `}</style>
        <AppTitle>
          <img
            src="/logo8.png"
            alt="App Logo"
            className="earth-spin"
            style={{ width: '132px', height: '80px', marginTop: '0px', marginBottom: '0px', marginRight: '-20px', verticalAlign: 'middle' }}
          />
          Cube
        </AppTitle>
        <OnlineIndicator>
          <StatusDot isOnline={isOnline} />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </OnlineIndicator>
        <NetworkSelector />
        <Nav>
          <NavMenu>
            <NavItem>
              <NavLink to="/apps/resources" className={({ isActive }) => isActive ? 'active' : ''}>
                Resources
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/apps/wallet" className={({ isActive }) => isActive ? 'active' : ''}>
                Cold Wallet
              </NavLink>
            </NavItem>
            {showBroadcastLink && (
              <NavItem>
                <NavLink to="/apps/broadcast" className={({ isActive }) => isActive ? 'active' : ''}>
                  Broadcast
                </NavLink>
              </NavItem>
            )}
          </NavMenu>
        </Nav>
      </Header>
      <ContentContainer>{children}</ContentContainer>
      <Footer>
        <div>C-Cube v1.0.0</div>
        <div>Remember to keep your private keys offline and secure</div>
      </Footer>
    </LayoutContainer>
  );
};

export default Layout;
