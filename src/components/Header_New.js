import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import CCubeLogo from './CyFoCubeLogo';
import backgroundImage from '../assets/images/Bakgrd3.png';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  left: 0px;
  z-index: 10;

  a {
    text-decoration: none !important;
    border: none !important;
    outline: none !important;
    
    &:hover,
    &:focus,
    &:active,
    &:visited {
      text-decoration: none !important;
      border: none !important;
      outline: none !important;
    }
  }

  @media (max-width: 1400px) and (min-width: 769px) {
    display: none;
  }

  @media (max-width: 768px) {
    display: flex;
    position: absolute;
    left: 0px;
    right: auto;
    z-index: 10;
    transform: scale(0.7);
  }
`;

const LogoText = styled.span`
  /* Removed - now handled by CCubeLogo component */
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(10, 10, 10, 0.98);
    backdrop-filter: blur(20px);
    flex-direction: column;
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const NavItem = styled(Link)`
  background: none;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  padding: 10px 16px;
  margin: 0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  text-decoration: none;
  display: inline-block;

  &:hover {
    background: linear-gradient(135deg, #8b7355, #1a1a1a);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(139, 115, 85, 0.1);
  }

  &.active {
    background: linear-gradient(135deg, #a68660, #000000);
    color: white;
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: left;
    padding: 12px 16px;
    margin: 0;
    display: block;
  }
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  padding: 10px 16px;
  margin: 0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: linear-gradient(135deg, #8b7355, #1a1a1a);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(139, 115, 85, 0.1);
  }

  &.active {
    background: linear-gradient(135deg, #a68660, #000000);
    color: white;
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: left;
    padding: 12px 16px;
    margin: 0;
    display: block;
  }
`;

const AppsDropdown = styled.div`
  position: relative;
  
  @media (max-width: 768px) {
    width: 100%;
    display: block;
    margin: 0;
    padding: 0;
  }
`;

const AppsDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(10, 10, 10, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 0;
  min-width: 280px;
  margin-top: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    position: static;
    background: rgba(255, 255, 255, 0.05);
    margin: 8px 0 8px 0;
    box-shadow: none;
    border-radius: 8px;
    padding: 8px 0;
    width: 100%;
    left: auto;
    right: auto;
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  padding: 8px 16px;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 400;
  transition: all 0.3s ease;
  margin: 2px 8px;
  border-radius: 8px;
  width: calc(100% - 16px);

  &:hover {
    background: linear-gradient(135deg, #8b7355, #1a1a1a);
    color: white;
  }

  &.available {
    color: #a68660;
    font-weight: 500;
  }

  &.coming-soon {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      background: none;
      color: #e0e0e0;
    }
  }

  @media (max-width: 768px) {
    margin: 2px 0;
    width: 100%;
    padding: 10px 16px;
    text-align: left;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    display: block;
    position: absolute;
    right: 20px;
    z-index: 10;
  }
`;

const LaunchAppButton = styled.button`
  background: linear-gradient(135deg, #00b4d8, #0077b6);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 180, 216, 0.25);
    background: linear-gradient(135deg, #0096c7, #005577);
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 10px;
  }
`;

const DisclaimerContainer = styled.div`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #0c0c0c;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;

  /* Mobile fallback for background-attachment: fixed issues */
  @media (max-width: 768px) {
    background-attachment: scroll;
  }
  border-bottom: none;
  height: 35px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 10, 10, 0.8);
    z-index: 1;
    pointer-events: none;
  }
`;

const DisclaimerText = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  font-size: 0.85rem;
  color: #dc2626;
  font-weight: 600;
  white-space: nowrap;
  animation: scrollLeft 40s linear infinite;
  padding: 0 20px;
  position: relative;
  z-index: 2;
  
  @keyframes scrollLeft {
    0% {
      transform: translateX(100vw);
    }
    100% {
      transform: translateX(-100%);
    }
  }
`;

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAppsDropdown, setShowAppsDropdown] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
    setShowAppsDropdown(false);
    setShowDownloadDropdown(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <HeaderContainer className="website-page">
        <HeaderContent>
          <Logo>
            <Link to="/">
              <CCubeLogo />
            </Link>
          </Logo>

        <Nav isOpen={mobileMenuOpen}>
          <NavItem
            to="/"
            className={isActive('/') ? 'active' : ''}
            onClick={handleMobileMenuClose}
          >
            Home
          </NavItem>
          <NavItem
            to="/learn"
            className={isActive('/learn') ? 'active' : ''}
            onClick={handleMobileMenuClose}
          >
            Learn
          </NavItem>
          <NavItem
            to="/ai-tutor"
            className={isActive('/ai-tutor') ? 'active' : ''}
            onClick={handleMobileMenuClose}
          >
            Earn
          </NavItem>

          <AppsDropdown>
            <NavButton onClick={() => {
              setShowAppsDropdown(!showAppsDropdown);
              setShowDownloadDropdown(false);
            }}>
              Platform ▼
            </NavButton>
            {showAppsDropdown && (
              <AppsDropdownMenu>
                <DropdownItem 
                  as={Link}
                  to="/apps"
                  className="available"
                  onClick={handleMobileMenuClose}
                >
                  C-Cube Wallet
                </DropdownItem>
                <DropdownItem 
                  className="coming-soon"
                  onClick={(e) => e.preventDefault()}
                >
                  File Encryption Tool
                </DropdownItem>
                <DropdownItem 
                  className="coming-soon"
                  onClick={(e) => e.preventDefault()}
                >
                  Network Security Scanner
                </DropdownItem>
                <DropdownItem 
                  className="coming-soon"
                  onClick={(e) => e.preventDefault()}
                >
                  Blockchain Explorer
                </DropdownItem>
                <DropdownItem 
                  className="coming-soon"
                  onClick={(e) => e.preventDefault()}
                >
                  Digital Identity Manager
                </DropdownItem>
                <DropdownItem 
                  className="coming-soon"
                  onClick={(e) => e.preventDefault()}
                >
                  Secure Communication Hub
                </DropdownItem>
              </AppsDropdownMenu>
            )}
          </AppsDropdown>

          <AppsDropdown>
            <NavButton onClick={() => {
              setShowDownloadDropdown(!showDownloadDropdown);
              setShowAppsDropdown(false);
            }}>
              Downloads ▼
            </NavButton>
            {showDownloadDropdown && (
              <AppsDropdownMenu>
                <DropdownItem 
                  as={Link}
                  to="/downloads"
                  className="available"
                  onClick={handleMobileMenuClose}
                >
                  Wallet
                </DropdownItem>
              </AppsDropdownMenu>
            )}
          </AppsDropdown>

          <NavItem
            to="/playground"
            className={isActive('/playground') ? 'active' : ''}
            onClick={handleMobileMenuClose}
          >
            Playground
          </NavItem>

          <NavItem
            to="/faq"
            className={isActive('/faq') ? 'active' : ''}
            onClick={handleMobileMenuClose}
          >
            FAQ
          </NavItem>
          <NavItem
            to="/community"
            className={isActive('/community') ? 'active' : ''}
            onClick={handleMobileMenuClose}
          >
            Community
          </NavItem>
          <NavItem
            to="/about"
            className={isActive('/about') ? 'active' : ''}
            onClick={handleMobileMenuClose}
          >
            About Us
          </NavItem>

          <LaunchAppButton as={Link} to="/launch-token" onClick={handleMobileMenuClose}>
            Create Token
          </LaunchAppButton>
        </Nav>

        <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
        </MobileMenuButton>
      </HeaderContent>
    </HeaderContainer>
    
    <DisclaimerContainer>
      <DisclaimerText>
        ⚠️ EDUCATIONAL USE ONLY: Do not send real assets to wallets created on this platform. While we can interface with real blockchain networks, use this platform strictly for educational and learning purposes only.
      </DisclaimerText>
    </DisclaimerContainer>
    </>
  );
};

export default Header;