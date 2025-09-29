import React from 'react';
import styled, { keyframes } from 'styled-components';

const earthSwing = keyframes`
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(30deg); }
  100% { transform: rotateY(0deg); }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.3s ease;
  margin-left: 5px;
  text-decoration: none !important;
  border: none !important;
  outline: none !important;

  &:hover {
    opacity: 0.8;
  }
  
  &:hover,
  &:focus,
  &:active,
  &:visited {
    text-decoration: none !important;
    border: none !important;
    outline: none !important;
  }
  
  * {
    text-decoration: none !important;
    border: none !important;
    outline: none !important;
  }
`;

const AnimatedLogo = styled.img`
  animation: ${earthSwing} 6s ease-in-out infinite;
  transform-style: preserve-3d;
  width: ${props => {
    if (props.size === 'hero') return '200px';
    if (props.size === 'large') return '160px';
    return '120px';
  }};
  height: ${props => {
    if (props.size === 'hero') return '120px';
    if (props.size === 'large') return '96px';
    return '72px';
  }};
  margin-right: 0;
  vertical-align: middle;
`;

const LogoText = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #e0e0e0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-decoration: none !important;
  margin-left: -35px;
  transform: translateY(-4px);
  display: inline-block;
  border: none !important;
  outline: none !important;
  
  &:hover,
  &:focus,
  &:active,
  &:visited {
    text-decoration: none !important;
    border: none !important;
    outline: none !important;
    color: #e0e0e0;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const CCubeLogo = ({ size = 'normal', onClick, showText = true }) => {
  return (
    <LogoContainer onClick={onClick}>
      <AnimatedLogo 
        src="/logo8.png" 
        alt="C-cube Logo" 
        size={size}
      />
      {showText && <LogoText size={size}>Cube</LogoText>}
    </LogoContainer>
  );
};

export default CCubeLogo;