import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import VisualKnowledgeTree from './VisualKnowledgeTree';
import BlockchainExplorer3D from './BlockchainExplorer3D';
import GamifiedLearningHub from './GamifiedLearningHub';
import ARVRInterface from './ARVRInterface';
import InteractiveDashboard from './InteractiveDashboard';
import StoryModeLearning from './StoryModeLearning';
import HandsOnPlayground from './HandsOnPlayground';
import EnhancedChatInterface from './EnhancedChatInterface';

const LearnAIContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
  color: white;
  overflow: hidden;
  position: relative;
`;

const HeaderContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InterfaceTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
`;

const InterfaceSelector = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const SelectorTitle = styled.h3`
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  opacity: 0.9;
`;

const ButtonGrid = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 3px;
  overflow-x: auto;
  max-width: 700px;
  padding-bottom: 4px;
  
  &::-webkit-scrollbar {
    height: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const DecorativeLine = styled.div`
  position: absolute;
  top: 90px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(79, 70, 229, 0.6) 20%, 
    rgba(124, 58, 237, 0.8) 50%, 
    rgba(79, 70, 229, 0.6) 80%, 
    transparent 100%
  );
  border-radius: 1px;
  z-index: 999;
`;

const ContentWrapper = styled.div`
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 1;
`;

const SelectorButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.active ? 'rgba(79, 70, 229, 0.5)' : 'rgba(255, 255, 255, 0.3)'};
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.65rem;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.3s ease;
  text-align: center;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: fit-content;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }
`;

const LearnAIInterface = () => {
  const [activeInterface, setActiveInterface] = useState('knowledge-tree');
  const [userProgress, setUserProgress] = useState({
    completedNodes: [],
    currentLevel: 1,
    achievements: [],
    totalTime: 0
  });

  const interfaces = [
    { id: 'knowledge-tree', name: 'Knowledge Tree', component: VisualKnowledgeTree },
    { id: '3d-explorer', name: '3D Explorer', component: BlockchainExplorer3D },
    { id: 'gamified-hub', name: 'Gaming Hub', component: GamifiedLearningHub },
    { id: 'ar-vr', name: 'AR/VR Style', component: ARVRInterface },
    { id: 'dashboard', name: 'Dashboard', component: InteractiveDashboard },
    { id: 'story-mode', name: 'Story Mode', component: StoryModeLearning },
    { id: 'playground', name: 'Playground', component: HandsOnPlayground },
    { id: 'enhanced-chat', name: 'Enhanced Chat', component: EnhancedChatInterface }
  ];

  const getCurrentInterface = () => {
    const selectedInterface = interfaces.find(i => i.id === activeInterface);
    return selectedInterface ? selectedInterface.component : VisualKnowledgeTree;
  };

  const CurrentComponent = getCurrentInterface();

  return (
    <LearnAIContainer>
      <HeaderContainer>
        <InterfaceTitle>
          🧠 Learn AI - Blockchain Fundamentals
        </InterfaceTitle>
        
        <InterfaceSelector>
          <SelectorTitle>Choose Learning Interface:</SelectorTitle>
          <ButtonGrid>
            {interfaces.map(interfaceItem => (
              <SelectorButton
                key={interfaceItem.id}
                active={activeInterface === interfaceItem.id}
                onClick={() => setActiveInterface(interfaceItem.id)}
              >
                {interfaceItem.name}
              </SelectorButton>
            ))}
          </ButtonGrid>
        </InterfaceSelector>
      </HeaderContainer>

      <DecorativeLine />

      <ContentWrapper>
        <CurrentComponent 
          userProgress={userProgress}
          setUserProgress={setUserProgress}
        />
      </ContentWrapper>
    </LearnAIContainer>
  );
};

export default LearnAIInterface;