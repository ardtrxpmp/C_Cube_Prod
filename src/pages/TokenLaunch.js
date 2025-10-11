import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import CCubeLogo from '../components/CyFoCubeLogo';
import WalletSetupPrompt from '../components/LearnAI/WalletSetupPrompt';

// Utility function to format supply numbers
const formatSupply = (supply) => {
  if (!supply) return '0';
  const num = parseInt(supply);
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1).replace('.0', '')}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
  return num.toString();
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(0, 204, 51, 0.3), 
                0 0 40px rgba(0, 204, 51, 0.2), 
                0 0 60px rgba(0, 204, 51, 0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(0, 255, 65, 0.4), 
                0 0 60px rgba(0, 255, 65, 0.3), 
                0 0 90px rgba(0, 255, 65, 0.2);
  }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// Simple header with just logo
const SimpleHeader = styled.header`
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

const SimpleHeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const SimpleLogo = styled.div`
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

  svg {
    z-index: 10;
    transform: scale(0.7);
  }
`;

// Network Toggle Components
const NetworkToggleButton = styled.button`
  background: linear-gradient(135deg, #2c2c2c, #1a1a1a);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  height: 32px;
  position: absolute;
  right: ${props => props.rightOffset || 280}px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    background: linear-gradient(135deg, #3c3c3c, #2a2a2a);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const NetworkToggleIcon = styled.span`
  font-size: 0.8rem;
  transition: transform 0.2s ease;
  ${props => props.isMainnet && 'animation: pulse 2s infinite;'}
`;

// Wallet Modal Components
const WalletModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
`;

const WalletModal = styled.div`
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  border: 1px solid rgba(0, 204, 51, 0.3);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
`;

const WalletModalTitle = styled.h2`
  color: #00cc33;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const WalletOption = styled.button`
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &:hover {
    background: linear-gradient(135deg, #3a3a3a, #2f2f2f);
    border-color: rgba(0, 204, 51, 0.5);
    transform: translateY(-1px);
  }
`;

const WalletIcon = styled.span`
  font-size: 1.5rem;
`;

const CloseModalButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #999;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: #fff;
  }
`;

const CCubeWalletButton = styled.button`
  background: ${props => props.connected 
    ? 'linear-gradient(135deg, #10b981, #059669)' 
    : 'linear-gradient(135deg, #ff6b35, #f7931e)'};
  border: none;
  color: white;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.connected 
    ? '0 2px 8px rgba(16, 185, 129, 0.3)' 
    : '0 2px 8px rgba(255, 107, 53, 0.3)'};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  height: 32px;
  position: absolute;
  right: 40px;
  z-index: 10;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.connected 
      ? '0 4px 12px rgba(16, 185, 129, 0.4)' 
      : '0 4px 12px rgba(255, 107, 53, 0.4)'};
    background: ${props => props.connected 
      ? 'linear-gradient(135deg, #34d399, #10b981)' 
      : 'linear-gradient(135deg, #ff7849, #ffa726)'};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: ${props => props.connected 
      ? '0 2px 6px rgba(16, 185, 129, 0.3)' 
      : '0 2px 6px rgba(255, 107, 53, 0.3)'};
  }
`;

// Confirmation dialog styles
const ConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(10px);
`;

const ConfirmationDialog = styled.div`
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 2px solid #dc2626;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 50px rgba(220, 38, 38, 0.3);
`;

const ConfirmationTitle = styled.h3`
  color: #dc2626;
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
`;

const ConfirmationText = styled.p`
  color: #fff;
  margin: 0 0 20px 0;
  text-align: center;
  line-height: 1.5;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ConfirmButton = styled.button`
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    transform: translateY(-1px);
  }
`;

const CancelButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
`;

// Page wrapper
const PageWrapper = styled.div`
  height: 100vh;
  background: #000000;
  color: #e0e0e0;
  padding-top: 70px;
  overflow: hidden; /* Prevent page scrolling */
`;

// Main container
const LaunchContainer = styled.div`
  background: #000000;
  display: grid;
  grid-template-columns: 1fr 2px 1fr;
  gap: 0;
  height: calc(100vh - 70px); /* Full height minus header */
  color: #e0e0e0;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    grid-template-rows: 1fr 1fr;
  }
`;

// Header section
const LaunchHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const LaunchTitle = styled.h1`
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const LaunchSubtitle = styled.p`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.3rem;
  color: white;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.7;
  font-weight: 400;
`;

// Header section inside form
const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  flex-shrink: 0; /* Prevent header from shrinking */
`;

const FormTitle = styled.h1`
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const FormSubtitle = styled.p`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.2rem;
  line-height: 1.7;
  font-weight: 400;
  color: white;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

// Left column - Form container
const FormContainer = styled.div`
  background: transparent;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 1s ease-out 0.2s both;
  
  @media (max-width: 1024px) {
    height: 50vh;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const FormContentContainer = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const ScrollableFormSections = styled.div`
  height: 630px; /* Set to 630px for expanded content space */
  overflow-y: auto;
  padding-right: 8px;
  border: 1px solid rgba(0, 204, 51, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 204, 51, 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(0, 204, 51, 0.5);
    }
  }
`;

// Form sections
const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.4rem;
  color: #4f46e5;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #00cc33;
`;

const Input = styled.input`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 1rem;
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  background: rgba(20, 20, 20, 0.8);
  color: #00cc33;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #00ff41;
    box-shadow: 0 0 0 2px rgba(0, 204, 51, 0.2);
    background: rgba(20, 20, 20, 0.9);
  }
  
  &::placeholder {
    color: rgba(78, 154, 6, 0.7);
  }
`;

const TextArea = styled.textarea`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 1rem;
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  background: rgba(20, 20, 20, 0.8);
  color: #00cc33;
  font-size: 1rem;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #00ff41;
    box-shadow: 0 0 0 2px rgba(0, 204, 51, 0.2);
    background: rgba(20, 20, 20, 0.9);
  }
  
  &::placeholder {
    color: rgba(78, 154, 6, 0.7);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  background: rgba(20, 20, 20, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  flex-direction: column;
  gap: 0.5rem;
  color: #00cc33;
  
  &:hover {
    border-color: #00ff41;
    background: rgba(0, 204, 51, 0.1);
  }
`;

const ImagePreview = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.src ? `url(${props.src})` : 'rgba(255, 255, 255, 0.1)'};
  background-size: cover;
  background-position: center;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

// Button container
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const LaunchButton = styled.button`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
  padding: 1rem 3rem;
  background: ${props => props.loading 
    ? 'linear-gradient(135deg, rgba(0, 204, 51, 0.6), rgba(46, 204, 64, 0.6))' 
    : 'linear-gradient(135deg, #00cc33, #2ecc40, #00ff41)'};
  border: 2px solid rgba(0, 255, 65, 0.4);
  border-radius: 50px;
  color: #0a0a0a;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 1px;
  min-width: 250px;
  box-shadow: 0 4px 15px rgba(0, 204, 51, 0.3);
  
  /* Shimmer effect overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.05);
    background: linear-gradient(135deg, #2ecc40, #00ff41, #00cc33);
    border-color: #00ff41;
    animation: ${glow} 2s ease-in-out infinite;
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px) scale(1.02);
  }
  
  &:disabled {
    opacity: 0.8;
    cursor: not-allowed;
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 2.5rem;
    font-size: 1.1rem;
    min-width: 200px;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 1s linear infinite;
  margin-right: 0.5rem;
`;

const ResultContainer = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: ${props => props.success 
    ? 'rgba(0, 204, 51, 0.1)' 
    : 'rgba(255, 7, 58, 0.1)'};
  border: 1px solid ${props => props.success 
    ? 'rgba(0, 255, 65, 0.3)' 
    : 'rgba(255, 7, 58, 0.3)'};
  border-radius: 4px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ResultTitle = styled.h3`
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: ${props => props.success ? '#00cc33' : '#ff073a'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
`;

const ResultLink = styled.a`
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TokenDetails = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(20, 20, 20, 0.6);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 65, 0.2);
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 255, 65, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const DetailLabel = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  color: #4e9a06;
`;

const DetailValue = styled.span`
  font-family: 'Share Tech Mono', 'Courier New', monospace;
  color: #00cc33;
  word-break: break-all;
`;

// Right column - Token listing components
const Divider = styled.div`
  width: 2px;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(0, 204, 51, 0.3) 10%, 
    rgba(0, 204, 51, 0.8) 50%, 
    rgba(0, 204, 51, 0.3) 90%, 
    transparent 100%);
  margin: 0 2rem;
  animation: ${fadeIn} 1s ease-out 0.3s both;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const TokenListContainer = styled.div`
  background: transparent;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 1s ease-out 0.4s both;
  
  @media (max-width: 1024px) {
    height: 50vh;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const ListTitle = styled.h2`
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  border-bottom: 2px solid;
  border-image: linear-gradient(90deg, transparent, #ffffff, transparent) 1;
  padding-bottom: 1rem;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  flex-shrink: 0; /* Keep title fixed */
`;

const TokenTable = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const TokenRowsSubContainer = styled.div`
  height: 690px; /* Fine-tuned height for perfect balance */
  overflow-y: auto;
  padding: 1.5rem;
  border: 1px solid rgba(0, 204, 51, 0.2);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  margin-top: 0.5rem;
  margin-right: 20px;
  margin-left: 20px;
  
  /* Hide scrollbars */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const TokenRowsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 60px 1.3fr 100px 1.7fr 80px;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 204, 51, 0.1);
  border-radius: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  color: #ccc;
  font-size: 0.9rem;
  flex-shrink: 0; /* Keep header fixed */
`;

const TokenRow = styled.div`
  display: grid;
  grid-template-columns: 60px 1.3fr 100px 1.7fr 80px;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 204, 51, 0.1), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, rgba(0, 204, 51, 0.08), rgba(0, 255, 65, 0.05));
    border-color: rgba(0, 255, 65, 0.3);
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 25px rgba(0, 204, 51, 0.2);
    
    &::before {
      left: 100%;
    }
  }
`;

const RankCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Share Tech Mono', monospace;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  text-shadow: 0 0 10px white;
  
  ${props => props.rank === 1 && `
    background: linear-gradient(135deg, #FFD700, #FFA500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
  
  ${props => props.rank === 2 && `
    background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
  
  ${props => props.rank === 3 && `
    background: linear-gradient(135deg, #CD7F32, #B8860B);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
`;

const InfoCell = styled.div`
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  min-height: 60px;
`;

const TokenImage = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 8px;
  background: ${props => props.src ? `url(${props.src})` : `linear-gradient(135deg, ${props.bgColor || '#00cc33'}, ${props.bgColor2 || '#2ecc40'})`};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${props => props.borderColor || 'rgba(255, 255, 255, 0.3)'};
  font-size: 1rem;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin: 1px 0;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    
    &::after {
      opacity: 1;
    }
  }
`;

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.01rem;
  flex: 1;
`;

const TokenSymbol = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segue UI', sans-serif;
  font-weight: 700;
  color: ${props => props.color || 'white'};
  font-size: 1rem;
  text-shadow: 0 0 10px ${props => props.color ? `${props.color}66` : 'rgba(255, 255, 255, 0.3)'};
`;

const ContractAddress = styled.div`
  font-family: 'Share Tech Mono', monospace;
  color: ${props => props.color || '#4e9a06'};
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 2px;
  border-radius: 3px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #00cc33;
    background: rgba(0, 204, 51, 0.1);
  }
  
  &:active {
    color: #00ff41;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0;
`;

const SocialIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: ${props => props.color || '#4e9a06'};
  font-weight: normal;
  transition: all 0.3s ease;
  cursor: pointer;
  background: none;
  
  &:hover {
    transform: scale(1.2);
    text-shadow: 0 0 8px ${props => props.color || '#4e9a06'};
  }
`;

const SupplyCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.85rem;
  font-weight: bold;
  color: #00cc33;
  text-shadow: 0 0 5px rgba(0, 204, 51, 0.3);
  white-space: nowrap;
`;

const DescriptionCell = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: white;
  font-size: 0.65rem;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
`;

const DaysCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #ffff00;
  font-size: 0.9rem;
  text-shadow: 0 0 10px #ffff00;
`;

const TokenLaunch = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    initialSupply: '',
    description: '',
    walletAddress: '',
    tokenImage: null,
    twitter: '',
    website: '',
    telegram: ''
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Wallet connection state
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [showWalletSetup, setShowWalletSetup] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  
  // External wallet integration
  const [externalWalletConnected, setExternalWalletConnected] = useState(false);
  const [externalWalletData, setExternalWalletData] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [gasPrice, setGasPrice] = useState(null);
  const [launchedTokens, setLaunchedTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  
  // Network selection state
  const [isMainnet, setIsMainnet] = useState(false); // false = testnet, true = mainnet
  
  // Dynamic positioning for toggle button
  const walletButtonRef = useRef(null);
  const [walletButtonWidth, setWalletButtonWidth] = useState(280); // default fallback

  // Sample token data with colorful images
  const sampleTokens = [
    {
      rank: 1,
      symbol: 'DOGE',
      contractAddress: '0x1234...abcd',
      daysCreated: 45,
      socials: ['T', 'W', 'D', 'TG'],
      image: 'https://assets.coingecko.com/coins/images/5/standard/dogecoin.png',
      bgColor: '#F7931A',
      description: 'The original meme coin that started as a joke. Beloved by communities worldwide for its fun and charitable spirit.'
    },
    {
      rank: 2,
      symbol: 'PEPE',
      contractAddress: '0x5678...efgh',
      daysCreated: 23,
      socials: ['T', 'W', 'TG'],
      image: 'https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg',
      bgColor: '#0F8A5F',
      description: 'Internet culture meets crypto with this frog-themed token. A tribute to the iconic meme character loved globally.'
    },
    {
      rank: 3,
      symbol: 'SHIB',
      contractAddress: '0x9abc...ijkl',
      daysCreated: 67,
      socials: ['T', 'W', 'D', 'G'],
      image: 'https://assets.coingecko.com/coins/images/11939/standard/shiba.png',
      bgColor: '#E91E63',
      description: 'The Dogecoin killer with an ambitious ecosystem. Features ShibaSwap DEX and plans for metaverse integration.'
    },
    {
      rank: 4,
      symbol: 'FLOKI',
      contractAddress: '0xdef0...mnop',
      daysCreated: 12,
      socials: ['T', 'W'],
      image: 'https://assets.coingecko.com/coins/images/16746/standard/PNG_image.png',
      bgColor: '#673AB7',
      description: 'Named after Elon Musk\'s dog, this token focuses on utility. Building NFT gaming metaverse and education platforms.'
    },
    {
      rank: 5,
      symbol: 'BONK',
      contractAddress: '0x3456...qrst',
      daysCreated: 89,
      socials: ['T', 'W', 'D'],
      image: 'https://assets.coingecko.com/coins/images/28600/standard/bonk.jpg',
      bgColor: '#FF9800',
      description: 'Solana\'s first dog coin designed for the people. Community-driven with fair distribution and meme culture focus.'
    },
    {
      rank: 6,
      symbol: 'MEME',
      contractAddress: '0x7890...uvwx',
      daysCreated: 156,
      socials: ['T', 'W', 'D'],
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=100&h=100&fit=crop&crop=face',
      bgColor: '#00BCD4',
      description: 'The ultimate meme token celebrating internet culture. Features viral content rewards and community-driven governance.'
    },
    {
      rank: 7,
      symbol: 'WOJAK',
      contractAddress: '0xabcd...yz12',
      daysCreated: 34,
      socials: ['T', 'G'],
      image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=100&h=100&fit=crop&crop=face',
      bgColor: '#4CAF50',
      description: 'Based on the classic internet meme character. Represents the everyman trader with relatable market emotions.'
    },
    {
      rank: 8,
      symbol: 'MOON',
      contractAddress: '0x3456...7890',
      daysCreated: 78,
      socials: ['T', 'W', 'D'],
      image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=100&h=100&fit=crop',
      bgColor: '#2196F3',
      description: 'Aiming for astronomical gains with space-themed tokenomics. Features lunar phases reward cycles and star mapping.'
    },
    {
      rank: 9,
      symbol: 'ROCKET',
      contractAddress: '0x4567...89ab',
      daysCreated: 91,
      socials: ['T', 'W', 'D'],
      image: 'https://images.unsplash.com/photo-1446776631856-73b72a0ec4ae?w=100&h=100&fit=crop',
      bgColor: '#FF5722',
      description: 'High-speed DeFi token built for rapid transactions. Focuses on cross-chain bridge technology and yield farming.'
    },
    {
      rank: 10,
      symbol: 'DIAMOND',
      contractAddress: '0x5678...9abc',
      daysCreated: 125,
      socials: ['T', 'W', 'G'],
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop',
      bgColor: '#9C27B0',
      description: 'Premium luxury token with diamond-backed reserves. Offers exclusive NFT collections and VIP member benefits.'
    },
    {
      rank: 11,
      symbol: 'FIRE',
      contractAddress: '0x6789...abcd',
      daysCreated: 56,
      socials: ['T', 'D'],
      image: 'https://images.unsplash.com/photo-1534388761991-2e2fa0b4ac95?w=100&h=100&fit=crop',
      bgColor: '#FF9800',
      description: 'Deflationary token with auto-burn mechanics. Every transaction reduces total supply creating scarcity and value.'
    },
    {
      rank: 12,
      symbol: 'CYBER',
      contractAddress: '0x789a...bcde',
      daysCreated: 198,
      socials: ['T', 'W', 'D', 'G'],
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop',
      bgColor: '#00BCD4',
      description: 'Futuristic AI-powered token for the metaverse economy. Integrates machine learning algorithms for smart trading.'
    },
    {
      rank: 13,
      symbol: 'LASER',
      contractAddress: '0x89ab...cdef',
      daysCreated: 33,
      socials: ['T', 'W'],
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop',
      bgColor: '#3F51B5',
      description: 'Precision-focused trading token with laser-sharp analytics. Provides real-time market insights and predictions.'
    },
    {
      rank: 14,
      symbol: 'GALAXY',
      contractAddress: '0x9abc...def0',
      daysCreated: 167,
      socials: ['T', 'W', 'D'],
      image: 'https://images.unsplash.com/photo-1446776741797-e4608715de55?w=100&h=100&fit=crop',
      bgColor: '#8BC34A',
      description: 'Interstellar token ecosystem spanning multiple blockchains. Connects distant crypto communities across the universe.'
    },
    {
      rank: 15,
      symbol: 'ALPHA',
      contractAddress: '0xabcd...ef01',
      daysCreated: 89,
      socials: ['T', 'G'],
      image: 'https://images.unsplash.com/photo-1464822759844-d150baac0889?w=100&h=100&fit=crop',
      bgColor: '#795548',
      description: 'Leading pack token for early adopters and risk-takers. Rewards alpha mindset with exclusive investment opportunities.'
    }
  ];

  const getSocialIcon = (type, token, index) => {
    const socialData = {
      'T': { color: '#1DA1F2', symbol: '𝕏', url: token?.socialLinks?.twitter }, // Twitter/X
      'W': { color: '#00cc33', symbol: '🌐', url: token?.socialLinks?.website }, // Website
      'D': { color: '#5865F2', symbol: '🎮', url: null }, // Discord (not in database)
      'G': { color: '#29B6F6', symbol: '▶', url: token?.socialLinks?.telegram }, // Telegram (using G for telegram)
      'TG': { color: '#29B6F6', symbol: '▶', url: token?.socialLinks?.telegram } // Telegram alternative
    };
    
    const social = socialData[type] || { color: '#4e9a06', symbol: '?', url: null };
    
    return (
      <SocialIcon 
        key={index || type} 
        color={social.color} 
        title={getSocialName(type)}
        onClick={() => social.url && window.open(social.url, '_blank')}
        style={{ cursor: social.url ? 'pointer' : 'default' }}
      >
        {social.symbol}
      </SocialIcon>
    );
  };

  const getSocialName = (type) => {
    const names = {
      'T': 'Twitter',
      'W': 'Website', 
      'D': 'Discord',
      'G': 'GitHub',
      'TG': 'Telegram'
    };
    return names[type] || 'Social';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove the data:image/...;base64, prefix to get just the base64 string
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        tokenImage: file
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const { tokenName, tokenSymbol, initialSupply, walletAddress } = formData;
    
    // Check if wallet is connected
    if (!walletConnected && !externalWalletConnected) {
      return 'Please connect a wallet to deploy your token';
    }
    
    if (!tokenName || !tokenSymbol || !initialSupply || !walletAddress) {
      return 'Please fill in all required fields';
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return 'Please enter a valid wallet address';
    }
    
    if (isNaN(initialSupply) || parseInt(initialSupply) <= 0) {
      return 'Please enter a valid initial supply';
    }
    
    return null;
  };

  const handleLaunch = async () => {
    const validationError = validateForm();
    if (validationError) {
      setResult({
        success: false,
        message: validationError
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Determine which wallet to use
      let deploymentWallet = null;
      if (walletConnected && walletData) {
        deploymentWallet = {
          type: 'ccube',
          data: walletData
        };
      } else if (externalWalletConnected && externalWalletData) {
        deploymentWallet = {
          type: 'external',
          data: externalWalletData
        };
      } else {
        setResult({
          success: false,
          message: 'Please connect a wallet before launching your token'
        });
        setLoading(false);
        return;
      }

      console.log('Sending deployment request:', {
        tokenName: formData.tokenName,
        tokenSymbol: formData.tokenSymbol,
        initialSupply: formData.initialSupply,
        walletAddress: formData.walletAddress,
        isMainnet,
        wallet: deploymentWallet
      });

      // Prepare form data for API - convert image to base64 if present
      let apiFormData = { ...formData };
      
      if (formData.tokenImage && formData.tokenImage instanceof File) {
        try {
          const base64Image = await convertFileToBase64(formData.tokenImage);
          apiFormData.tokenImage = base64Image;
        } catch (imageError) {
          console.error('Error converting image to base64:', imageError);
          // Continue without image if conversion fails
          apiFormData.tokenImage = null;
        }
      }

      // Call the deployment API
      const response = await fetch('/api/deploy-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...apiFormData,
          isMainnet: isMainnet,
          wallet: deploymentWallet
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        
        let errorMessage = 'Failed to launch token';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server error (${response.status}): ${errorText}`;
        }
        
        setResult({
          success: false,
          message: errorMessage
        });
        return;
      }

      const data = await response.json();
      console.log('Success response:', data);

      setResult({
        success: true,
        message: 'Token launched successfully!',
        contractAddress: data.contractAddress,
        transactionHash: data.transactionHash,
        explorerUrl: data.explorerUrl,
        deploymentInfo: data.deploymentInfo
      });
    } catch (error) {
      console.error('Network error:', error);
      setResult({
        success: false,
        message: 'Network error: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Wallet connection handlers
  const handleWalletClick = () => {
    if (walletConnected) {
      // C-Cube wallet connected - show confirmation dialog
      handleCCubeWalletDisconnect();
    } else if (externalWalletConnected) {
      // External wallet connected - disconnect immediately
      handleExternalWalletDisconnect();
    } else {
      // Not connected - show wallet selection modal
      setShowWalletModal(true);
    }
  };

  const handleWalletDisconnect = () => {
    // This function is used by the confirmation dialog for C-Cube wallet
    setWalletConnected(false);
    setWalletData(null);
    setExternalWalletConnected(false);
    setExternalWalletData(null);
    setShowRemoveConfirmation(false);
    
    // Clear wallet address from form
    setFormData(prev => ({
      ...prev,
      walletAddress: ''
    }));
    
    // Remove wallet data from localStorage
    localStorage.removeItem('ccube_token_wallet');
    localStorage.removeItem('ccube_token_wallet_connected');
    
    console.log('All wallets disconnected.');
  };

  const handleExternalWalletDisconnect = () => {
    // Direct disconnect for external wallets (MetaMask/Trust Wallet)
    setExternalWalletConnected(false);
    setExternalWalletData(null);
    
    // Clear wallet address from form
    setFormData(prev => ({
      ...prev,
      walletAddress: ''
    }));
    
    console.log('External wallet disconnected.');
  };

  const handleCCubeWalletDisconnect = () => {
    // Show confirmation dialog for C-Cube wallet
    setShowRemoveConfirmation(true);
  };

  const handleCancelRemove = () => {
    setShowRemoveConfirmation(false);
  };

  const handleWalletSetup = (newWalletData) => {
    setWalletData(newWalletData);
    setWalletConnected(true);
    setShowWalletSetup(false);
    
    // Auto-populate wallet address in form
    setFormData(prev => ({
      ...prev,
      walletAddress: newWalletData.address
    }));
    
    // Save to localStorage for persistence
    localStorage.setItem('ccube_token_wallet', JSON.stringify(newWalletData));
    localStorage.setItem('ccube_token_wallet_connected', 'true');
  };

  const handleCloseWalletSetup = () => {
    setShowWalletSetup(false);
  };

  // External Wallet Functions
  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // First disconnect any existing connections to force fresh connection
        try {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (permissionError) {
          // If permission request fails, try direct account request
          console.log('Permission request failed, trying direct connection:', permissionError);
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request accounts - this should always show the MetaMask popup
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please make sure MetaMask is unlocked.');
        }
        
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        
        const walletData = {
          address,
          balance: ethers.formatEther(balance),
          provider: 'MetaMask'
        };
        
        setExternalWalletData(walletData);
        setExternalWalletConnected(true);
        setShowWalletModal(false);
        
        // Auto-populate wallet address in form
        setFormData(prev => ({
          ...prev,
          walletAddress: address
        }));
      } else {
        alert('MetaMask is not installed. Please install MetaMask to continue.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      
      // More specific error messages
      if (error.code === 4001) {
        alert('MetaMask connection was rejected by user.');
      } else if (error.code === -32002) {
        alert('MetaMask connection request is already pending. Please check MetaMask.');
      } else {
        alert('Failed to connect to MetaMask: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const connectTrustWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isTrust) {
        // First request permissions to force fresh connection
        try {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (permissionError) {
          // If permission request fails, try direct account request
          console.log('Permission request failed, trying direct connection:', permissionError);
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request accounts - this should always show the Trust Wallet popup
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please make sure Trust Wallet is unlocked.');
        }
        
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        
        const walletData = {
          address,
          balance: ethers.formatEther(balance),
          provider: 'Trust Wallet'
        };
        
        setExternalWalletData(walletData);
        setExternalWalletConnected(true);
        setShowWalletModal(false);
        
        // Auto-populate wallet address in form
        setFormData(prev => ({
          ...prev,
          walletAddress: address
        }));
      } else {
        alert('Trust Wallet is not available. Please use Trust Wallet browser or install the extension.');
      }
    } catch (error) {
      console.error('Error connecting to Trust Wallet:', error);
      
      // More specific error messages
      if (error.code === 4001) {
        alert('Trust Wallet connection was rejected by user.');
      } else if (error.code === -32002) {
        alert('Trust Wallet connection request is already pending. Please check Trust Wallet.');
      } else {
        alert('Failed to connect to Trust Wallet: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const disconnectExternalWallet = () => {
    setExternalWalletConnected(false);
    setExternalWalletData(null);
  };

  // Database Integration Functions
  const fetchLaunchedTokens = async () => {
    try {
      setLoadingTokens(true);
      const response = await fetch('/api/tokens/launched');
      if (response.ok) {
        const tokens = await response.json();
        console.log('Fetched tokens from API:', tokens.length, tokens);
        setLaunchedTokens(tokens);
      } else {
        console.error('Failed to fetch launched tokens');
        // Fallback to sample data if API fails
        setLaunchedTokens(sampleTokens);
      }
    } catch (error) {
      console.error('Error fetching launched tokens:', error);
      // Fallback to sample data if API fails
      setLaunchedTokens(sampleTokens);
    } finally {
      setLoadingTokens(false);
    }
  };

  const fetchGasPrice = async () => {
    try {
      const chainId = isMainnet ? 56 : 97; // BSC Mainnet : BSC Testnet
      const rpcUrl = isMainnet 
        ? 'https://bsc-dataseed.binance.org/'
        : 'https://data-seed-prebsc-1-s1.binance.org:8545/';
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const feeData = await provider.getFeeData();
      setGasPrice(ethers.formatUnits(feeData.gasPrice, 'gwei'));
    } catch (error) {
      console.error('Error fetching gas price:', error);
    }
  };

  // Copy functionality
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
      console.log('Copied to clipboard:', text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // useEffect to load wallet data from localStorage on component mount
  useEffect(() => {
    const savedWalletData = localStorage.getItem('ccube_token_wallet');
    const savedWalletConnected = localStorage.getItem('ccube_token_wallet_connected');
    
    if (savedWalletData && savedWalletConnected === 'true') {
      try {
        const parsedWalletData = JSON.parse(savedWalletData);
        setWalletData(parsedWalletData);
        setWalletConnected(true);
        
        // Auto-populate wallet address in form
        setFormData(prev => ({
          ...prev,
          walletAddress: parsedWalletData.address
        }));
      } catch (error) {
        console.error('Error parsing saved wallet data:', error);
        // Clear invalid data
        localStorage.removeItem('ccube_token_wallet');
        localStorage.removeItem('ccube_token_wallet_connected');
      }
    }
  }, []);

  // useEffect to measure wallet button width and adjust toggle button position
  useEffect(() => {
    const measureWalletButton = () => {
      if (walletButtonRef.current) {
        const rect = walletButtonRef.current.getBoundingClientRect();
        setWalletButtonWidth(rect.width + 70); // Add 70px gap (20px + 50px extra)
      }
    };

    // Measure immediately
    measureWalletButton();

    // Measure again after a short delay to ensure content is rendered
    const timeoutId = setTimeout(measureWalletButton, 100);

    // Add resize listener to handle window resizing
    window.addEventListener('resize', measureWalletButton);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', measureWalletButton);
    };
  }, [walletConnected, externalWalletConnected, walletData, externalWalletData]); // Re-measure when wallet state changes

  // useEffect hooks for data fetching
  useEffect(() => {
    fetchLaunchedTokens();
    fetchGasPrice();
    
    // Refresh gas price every 30 seconds
    const gasInterval = setInterval(fetchGasPrice, 30000);
    
    // Refresh tokens every 2 minutes
    const tokensInterval = setInterval(fetchLaunchedTokens, 120000);
    
    return () => {
      clearInterval(gasInterval);
      clearInterval(tokensInterval);
    };
  }, [isMainnet]);

  // Show wallet setup prompt when requested
  if (showWalletSetup) {
    return (
      <WalletSetupPrompt 
        onWalletSetup={handleWalletSetup}
        onClose={handleCloseWalletSetup}
        existingWallet={walletConnected ? walletData : null}
      />
    );
  }

  return (
    <PageWrapper className="website-page">
      <SimpleHeader>
        <SimpleHeaderContent>
          <SimpleLogo>
            <Link to="/">
              <CCubeLogo />
            </Link>
          </SimpleLogo>
          
          <NetworkToggleButton 
            isMainnet={isMainnet} 
            onClick={() => setIsMainnet(!isMainnet)}
            title={`Switch to ${isMainnet ? 'Testnet' : 'Mainnet'}`}
            rightOffset={walletButtonWidth}
          >
            <NetworkToggleIcon isMainnet={isMainnet}>
              {isMainnet ? '🔴' : '🟡'}
            </NetworkToggleIcon>
            {isMainnet ? 'Mainnet' : 'Testnet'}
          </NetworkToggleButton>
          
          <CCubeWalletButton 
            ref={walletButtonRef}
            connected={walletConnected || externalWalletConnected} 
            onClick={handleWalletClick}
          >
            {walletConnected ? (
              <span style={{ fontWeight: 'bold' }}>
                🗑️ Disconnect C-Cube{' '}
                {walletData && walletData.address && (
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                    ({walletData.address.slice(0, 4)}...{walletData.address.slice(-3)})
                  </span>
                )}
              </span>
            ) : externalWalletConnected ? (
              <span style={{ fontWeight: 'bold' }}>
                �️ Disconnect {externalWalletData?.provider}{' '}
                {externalWalletData && externalWalletData.address && (
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                    ({externalWalletData.address.slice(0, 4)}...{externalWalletData.address.slice(-3)})
                  </span>
                )}
              </span>
            ) : <span style={{ fontWeight: 'bold' }}>💳 Connect Wallet</span>}
          </CCubeWalletButton>
        </SimpleHeaderContent>
      </SimpleHeader>
      
      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <WalletModalOverlay onClick={() => setShowWalletModal(false)}>
          <WalletModal onClick={(e) => e.stopPropagation()}>
            <CloseModalButton onClick={() => setShowWalletModal(false)}>×</CloseModalButton>
            <WalletModalTitle>Connect Wallet</WalletModalTitle>
            
            <WalletOption onClick={() => {
              setShowWalletModal(false);
              setShowWalletSetup(true);
            }}>
              <WalletIcon>🔷</WalletIcon>
              <div>
                <div style={{ fontWeight: 'bold' }}>C-Cube Wallet</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Create or import C-Cube wallet</div>
              </div>
            </WalletOption>
            
            <WalletOption onClick={connectMetaMask}>
              <WalletIcon>🦊</WalletIcon>
              <div>
                <div style={{ fontWeight: 'bold' }}>MetaMask</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Connect using MetaMask extension</div>
              </div>
            </WalletOption>
            
            <WalletOption onClick={connectTrustWallet}>
              <WalletIcon>🛡️</WalletIcon>
              <div>
                <div style={{ fontWeight: 'bold' }}>Trust Wallet</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Connect using Trust Wallet</div>
              </div>
            </WalletOption>
          </WalletModal>
        </WalletModalOverlay>
      )}
      
      <LaunchContainer>
      <FormContainer>
        <FormHeader>
          <FormTitle>Launch Your Token</FormTitle>
          <FormSubtitle>
            Create and deploy your BSC token in minutes. Fill in your token details below and launch to the blockchain.
          </FormSubtitle>
        </FormHeader>

        <FormContentContainer>
          <ScrollableFormSections>
            <FormSection>
          <SectionTitle>🎨 Token Branding</SectionTitle>
          
          <FormGroup>
            <Label>Token Logo</Label>
            <FileInputLabel htmlFor="tokenImage">
              <ImagePreview src={imagePreview}>
                {!imagePreview && '📷'}
              </ImagePreview>
              <span>Click to upload token logo</span>
              <small style={{ opacity: 0.7 }}>PNG, JPG, GIF up to 5MB</small>
            </FileInputLabel>
            <FileInput
              id="tokenImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>📋 Token Information</SectionTitle>
          
          <FormRow columns="1fr 1fr">
            <FormGroup>
              <Label>Token Name *</Label>
              <Input
                type="text"
                name="tokenName"
                value={formData.tokenName}
                onChange={handleInputChange}
                placeholder="e.g., My Awesome Token"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Token Symbol *</Label>
              <Input
                type="text"
                name="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={handleInputChange}
                placeholder="e.g., MAT"
                required
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Initial Supply *</Label>
              <Input
                type="number"
                name="initialSupply"
                value={formData.initialSupply}
                onChange={handleInputChange}
                placeholder="e.g., 1000000"
                required
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Token Description</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your token's purpose, utility, and unique features..."
                rows="4"
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        <FormSection>
          <SectionTitle>🌐 Social Media Links</SectionTitle>
          
          <FormRow columns="1fr 1fr">
            <FormGroup>
              <Label>Twitter</Label>
              <Input
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/yourhandle"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Website</Label>
              <Input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Telegram</Label>
              <Input
                type="url"
                name="telegram"
                value={formData.telegram}
                onChange={handleInputChange}
                placeholder="https://t.me/yourchannel"
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        <FormSection>
          <SectionTitle>💰 Wallet Configuration</SectionTitle>
          
          <FormRow>
            <FormGroup>
              <Label>Connected Wallet *</Label>
              {walletConnected ? (
                <div style={{
                  padding: '12px 16px',
                  border: '2px solid #00cc33',
                  borderRadius: '8px',
                  background: 'rgba(0, 204, 51, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'Share Tech Mono, monospace',
                  color: '#00ff41'
                }}>
                  <span>
                    ✅ C-Cube Wallet Connected
                    <br />
                    <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                      {walletData?.address}
                    </span>
                  </span>
                  <button
                    onClick={handleCCubeWalletDisconnect}
                    style={{
                      background: 'rgba(255, 69, 58, 0.2)',
                      border: '1px solid #ff453a',
                      borderRadius: '4px',
                      color: '#ff453a',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : externalWalletConnected ? (
                <div style={{
                  padding: '12px 16px',
                  border: '2px solid #00cc33',
                  borderRadius: '8px',
                  background: 'rgba(0, 204, 51, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'Share Tech Mono, monospace',
                  color: '#00ff41'
                }}>
                  <span>
                    ✅ {externalWalletData?.provider} Connected
                    <br />
                    <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                      {externalWalletData?.address}
                    </span>
                  </span>
                  <button
                    onClick={handleExternalWalletDisconnect}
                    style={{
                      background: 'rgba(255, 69, 58, 0.2)',
                      border: '1px solid #ff453a',
                      borderRadius: '4px',
                      color: '#ff453a',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #00cc33, #2ecc40)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    padding: '16px 24px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 204, 51, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 204, 51, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 204, 51, 0.3)';
                  }}
                >
                  💳 Connect Wallet
                </button>
              )}
            </FormGroup>
          </FormRow>
        </FormSection>

        <ButtonContainer>
          <LaunchButton
            onClick={handleLaunch}
            disabled={loading}
            loading={loading}
          >
            {loading && <LoadingSpinner />}
            {loading ? 'Launching Token...' : '🚀 Launch Token'}
          </LaunchButton>
        </ButtonContainer>

        {result && (
          <ResultContainer success={result.success}>
            <ResultTitle success={result.success}>
              {result.success ? '🎉 Success!' : '❌ Error'}
            </ResultTitle>
            <p>{result.message}</p>
            
            {result.success && result.deploymentInfo && (
              <TokenDetails>
                <DetailRow>
                  <DetailLabel>Token Name:</DetailLabel>
                  <DetailValue>{result.deploymentInfo.tokenName}</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Token Symbol:</DetailLabel>
                  <DetailValue>{result.deploymentInfo.tokenSymbol}</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Total Supply:</DetailLabel>
                  <DetailValue>{result.deploymentInfo.initialSupply.toLocaleString()} {result.deploymentInfo.tokenSymbol}</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Decimals:</DetailLabel>
                  <DetailValue>{result.deploymentInfo.decimals}</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Contract Address:</DetailLabel>
                  <DetailValue>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {result.contractAddress}
                      <CopyButton onClick={() => copyToClipboard(result.contractAddress)} title="Copy address">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                      </CopyButton>
                    </div>
                  </DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Owner Address:</DetailLabel>
                  <DetailValue>{result.deploymentInfo.ownerAddress}</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Network:</DetailLabel>
                  <DetailValue>{result.deploymentInfo.network} (Chain ID: {result.deploymentInfo.chainId})</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Transaction:</DetailLabel>
                  <DetailValue>
                    <ResultLink href={result.explorerUrl} target="_blank">
                      View on BSCScan ↗
                    </ResultLink>
                  </DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Deployed At:</DetailLabel>
                  <DetailValue>{new Date(result.deploymentInfo.deployedAt).toLocaleString()}</DetailValue>
                </DetailRow>
              </TokenDetails>
            )}
          </ResultContainer>
        )}
          </ScrollableFormSections>
        </FormContentContainer>
      </FormContainer>

      {/* Divider */}
      <Divider />

      {/* Right Column - Token List */}
      <TokenListContainer>
        <ListTitle>🏆 Launched Tokens</ListTitle>
        
        <TokenTable>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1.3fr 100px 1.7fr 80px',
            gap: '0.75rem',
            padding: '0.5rem 2.25rem',
            marginRight: '20px',
            marginLeft: '20px',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 400,
            color: '#ccc',
            fontSize: '0.9rem'
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Rank</div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>Token Info</div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Supply</div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginLeft: '4px'}}>Description</div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Days</div>
          </div>
          
          <TokenRowsSubContainer>
            <TokenRowsContent>
            {loadingTokens ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                Loading launched tokens...
              </div>
            ) : launchedTokens.length > 0 ? (
              launchedTokens.map((token) => (
            <TokenRow key={token.rank}>
              <RankCell rank={token.rank}>#{token.rank}</RankCell>
              
              <InfoCell>
                <TokenImage 
                  src={token.image}
                  bgColor={token.bgColor}
                  borderColor={token.bgColor}
                  onError={(e) => {
                    console.log('Image failed to load:', token.image);
                    e.target.style.backgroundImage = 'none';
                  }}
                >
                  {!token.image && token.symbol && token.symbol[0]}
                </TokenImage>
                <TokenInfo>
                  <TokenSymbol color="white">{token.symbol}</TokenSymbol>
                  <ContractAddress color="#00ff41">
                    {token.contractAddress ? 
                      `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}` : 
                      'N/A'
                    }
                    <CopyButton onClick={() => copyToClipboard(token.contractAddress)} title="Copy full address">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                    </CopyButton>
                  </ContractAddress>
                  <SocialIcons>
                    {token.socials && token.socials.map((social, index) => 
                      getSocialIcon(social, token, index)
                    )}
                  </SocialIcons>
                </TokenInfo>
              </InfoCell>
              
              <SupplyCell>{formatSupply(token.initialSupply)}</SupplyCell>
              
              <DescriptionCell>{token.description}</DescriptionCell>
              
              <DaysCell>{token.daysCreated}d</DaysCell>
            </TokenRow>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
                No tokens launched yet
              </div>
            )}
            </TokenRowsContent>
          </TokenRowsSubContainer>
        </TokenTable>
      </TokenListContainer>
    </LaunchContainer>

      {/* Wallet Removal Confirmation Dialog */}
      {showRemoveConfirmation && (
        <ConfirmationOverlay>
          <ConfirmationDialog>
            <ConfirmationTitle>⚠️ Remove Wallet</ConfirmationTitle>
            <ConfirmationText>
              Are you sure you want to remove your C-Cube wallet from Token Launch? 
              <br /><br />
              <strong>This will permanently delete:</strong>
              <br />• Your wallet connection
              <br />• Stored wallet data
              <br /><br />
              Make sure you have your seed phrase/private key saved if you want to import this wallet again later.
            </ConfirmationText>
            <ConfirmationButtons>
              <ConfirmButton onClick={handleWalletDisconnect}>
                🗑️ Yes, Remove Wallet
              </ConfirmButton>
              <CancelButton onClick={handleCancelRemove}>
                ✕ Cancel
              </CancelButton>
            </ConfirmationButtons>
          </ConfirmationDialog>
        </ConfirmationOverlay>
      )}
    </PageWrapper>
  );
};

export default TokenLaunch;