import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import ARVRInterface from '../components/LearnAI/ARVRInterface';
import HandsOnPlayground from '../components/LearnAI/HandsOnPlayground';

// Animations from AI Tutor
const orbit = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// Container for the Playground page
const PlaygroundContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  position: relative;
  overflow-x: hidden;
`;

// Header section for the playground
const PlaygroundHeader = styled.div`
  padding: 4rem 2rem 2rem;
  text-align: center;
  position: relative;
  z-index: 10;
`;

const PlaygroundTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const PlaygroundSubtitle = styled.p`
  font-size: 1.3rem;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

// Mode selector for switching between AR/VR and Hands-on
const ModeSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
`;

const ModeButton = styled.button`
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' 
    : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.active ? '#4f46e5' : 'rgba(255, 255, 255, 0.3)'};
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover:before {
    left: 100%;
  }
`;

// Orbital animation container for visual effects
const OrbitContainer = styled.div`
  position: absolute;
  top: 20%;
  right: 10%;
  width: 300px;
  height: 300px;
  opacity: 0.3;
  pointer-events: none;
  z-index: 1;
  
  @media (max-width: 768px) {
    width: 200px;
    height: 200px;
    top: 15%;
    right: 5%;
  }
`;

const CircularOrbitRing = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${props => props.diameter}px;
  height: ${props => props.diameter}px;
  transform: translate(-50%, -50%) rotateX(75deg);
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 50%;
  animation: ${orbit} ${props => props.duration}s linear infinite;
`;

const OrbitIcon = styled.div`
  position: absolute;
  top: -15px;
  right: -15px;  
  width: 30px;
  height: 30px;
  background: rgba(79, 70, 229, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

// Content container for the selected mode
const PlaygroundContent = styled.div`
  position: relative;
  z-index: 5;
  min-height: calc(100vh - 300px);
`;

const Playground = ({ onNavigate }) => {
  const [activeMode, setActiveMode] = useState('arvr');

  const renderContent = () => {
    switch (activeMode) {
      case 'arvr':
        return <ARVRInterface />;
      case 'handson':
        return <HandsOnPlayground />;
      default:
        return <ARVRInterface />;
    }
  };

  return (
    <PlaygroundContainer>
      {/* Orbital animation for visual effect */}
      <OrbitContainer>
        <CircularOrbitRing diameter={250} duration={20}>
          <OrbitIcon delay={0}>🎮</OrbitIcon>
        </CircularOrbitRing>
        <CircularOrbitRing diameter={180} duration={15}>
          <OrbitIcon delay={1}>🥽</OrbitIcon>
        </CircularOrbitRing>
        <CircularOrbitRing diameter={120} duration={12}>
          <OrbitIcon delay={2}>🚀</OrbitIcon>
        </CircularOrbitRing>
      </OrbitContainer>

      <PlaygroundHeader>
        <PlaygroundTitle>Interactive Playground</PlaygroundTitle>
        <PlaygroundSubtitle>
          Immerse yourself in blockchain learning through AR/VR experiences and hands-on interactive tutorials. 
          Choose your preferred learning style and dive into the future of education.
        </PlaygroundSubtitle>

        <ModeSelector>
          <ModeButton
            active={activeMode === 'arvr'}
            onClick={() => setActiveMode('arvr')}
          >
            🥽 AR/VR Experience
          </ModeButton>
          <ModeButton
            active={activeMode === 'handson'}
            onClick={() => setActiveMode('handson')}
          >
            🛠️ Hands-On Learning
          </ModeButton>
        </ModeSelector>
      </PlaygroundHeader>

      <PlaygroundContent>
        {renderContent()}
      </PlaygroundContent>
    </PlaygroundContainer>
  );
};

export default Playground;