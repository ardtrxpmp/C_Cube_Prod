import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(79, 70, 229, 0.5); }
  50% { box-shadow: 0 0 20px rgba(79, 70, 229, 0.8); }
  100% { box-shadow: 0 0 5px rgba(79, 70, 229, 0.5); }
`;

const TreeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  padding: 80px 20px 20px;
  overflow: auto;
`;

const KnowledgeTree = styled.div`
  width: 100%;
  min-height: 800px;
  position: relative;
  background: radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.1), transparent);
`;

const ConceptNode = styled.div`
  position: absolute;
  width: ${props => props.size || '120px'};
  height: ${props => props.size || '120px'};
  background: ${props => 
    props.completed 
      ? 'linear-gradient(135deg, #10b981, #059669)' 
      : props.active 
        ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
        : 'linear-gradient(135deg, #374151, #4b5563)'
  };
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.completed ? '#10b981' : props.active ? '#4f46e5' : '#6b7280'};
  animation: ${props => props.active ? pulse : 'none'} 2s infinite;
  
  &:hover {
    transform: scale(1.1);
    animation: ${glow} 1s infinite;
  }

  ${props => props.completed && `
    &::after {
      content: '✓';
      position: absolute;
      top: -10px;
      right: -10px;
      background: #10b981;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
    }
  `}
`;

const NodeIcon = styled.div`
  font-size: ${props => props.size === '80px' ? '20px' : '24px'};
  margin-bottom: 4px;
`;

const NodeTitle = styled.div`
  font-size: ${props => props.size === '80px' ? '10px' : '12px'};
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  color: white;
`;

const ConnectionLine = styled.div`
  position: absolute;
  background: ${props => props.completed ? '#10b981' : '#4b5563'};
  height: 2px;
  transform-origin: left center;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    right: -4px;
    top: -2px;
    width: 0;
    height: 0;
    border-left: 8px solid ${props => props.completed ? '#10b981' : '#4b5563'};
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
  }
`;

const AIGuide = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background: rgba(0, 0, 0, 0.95);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: translateY(${props => props.show ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 1000;
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
`;

const GuideText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: #e5e7eb;
`;

const ProgressBar = styled.div`
  position: fixed;
  top: 70px;
  left: 20px;
  right: 20px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #10b981);
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
`;

const VisualKnowledgeTree = ({ userProgress, setUserProgress }) => {
  const [activeNode, setActiveNode] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const knowledgeNodes = [
    // Core Foundation (Center)
    { 
      id: 'blockchain-basics', 
      title: 'Blockchain Basics', 
      icon: '🔗', 
      x: '50%', 
      y: '40%', 
      size: '140px',
      description: 'Learn what blockchain is and how it works fundamentally.',
      prerequisites: [],
      content: {
        explanation: 'A blockchain is a distributed ledger that maintains a continuously growing list of records...',
        examples: ['Bitcoin blockchain', 'Ethereum blockchain'],
        quiz: [
          { question: 'What makes blockchain secure?', options: ['Cryptography', 'Centralization', 'Speed'], correct: 0 }
        ]
      }
    },
    
    // First Ring - Direct Dependencies
    { 
      id: 'cryptography', 
      title: 'Cryptography', 
      icon: '🔐', 
      x: '25%', 
      y: '25%', 
      size: '100px',
      description: 'Understand the cryptographic foundations of blockchain security.',
      prerequisites: ['blockchain-basics'],
      content: {
        explanation: 'Cryptographic hash functions ensure data integrity...',
        examples: ['SHA-256', 'Digital signatures'],
        quiz: [
          { question: 'What is a hash function?', options: ['Encryption', 'One-way function', 'Key generator'], correct: 1 }
        ]
      }
    },
    
    { 
      id: 'decentralization', 
      title: 'Decentralization', 
      icon: '🌐', 
      x: '75%', 
      y: '25%', 
      size: '100px',
      description: 'Learn about distributed systems and peer-to-peer networks.',
      prerequisites: ['blockchain-basics'],
      content: {
        explanation: 'Decentralization removes single points of failure...',
        examples: ['P2P networks', 'Distributed consensus'],
        quiz: []
      }
    },
    
    { 
      id: 'consensus', 
      title: 'Consensus Mechanisms', 
      icon: '🤝', 
      x: '50%', 
      y: '15%', 
      size: '100px',
      description: 'Discover how networks agree on the state of the blockchain.',
      prerequisites: ['blockchain-basics', 'decentralization'],
      content: {
        explanation: 'Consensus mechanisms ensure all nodes agree...',
        examples: ['Proof of Work', 'Proof of Stake'],
        quiz: []
      }
    },
    
    // Second Ring - Advanced Concepts
    { 
      id: 'bitcoin', 
      title: 'Bitcoin', 
      icon: '₿', 
      x: '15%', 
      y: '60%', 
      size: '80px',
      description: 'Explore the first and most famous cryptocurrency.',
      prerequisites: ['cryptography', 'consensus'],
      content: {
        explanation: 'Bitcoin is the first successful cryptocurrency...',
        examples: ['Mining', 'UTXO model'],
        quiz: []
      }
    },
    
    { 
      id: 'ethereum', 
      title: 'Ethereum', 
      icon: '♦️', 
      x: '85%', 
      y: '60%', 
      size: '80px',
      description: 'Learn about smart contracts and programmable money.',
      prerequisites: ['consensus', 'decentralization'],
      content: {
        explanation: 'Ethereum introduced smart contracts...',
        examples: ['EVM', 'Smart contracts'],
        quiz: []
      }
    },
    
    { 
      id: 'mining', 
      title: 'Mining & Validation', 
      icon: '⛏️', 
      x: '30%', 
      y: '70%', 
      size: '80px',
      description: 'Understand how new blocks are created and validated.',
      prerequisites: ['bitcoin', 'consensus'],
      content: {
        explanation: 'Mining secures the network through computation...',
        examples: ['Hash puzzles', 'Block rewards'],
        quiz: []
      }
    },
    
    { 
      id: 'wallets', 
      title: 'Digital Wallets', 
      icon: '👛', 
      x: '70%', 
      y: '70%', 
      size: '80px',
      description: 'Learn how to securely store and manage cryptocurrencies.',
      prerequisites: ['cryptography', 'bitcoin'],
      content: {
        explanation: 'Wallets manage your private keys...',
        examples: ['Hot wallets', 'Cold wallets'],
        quiz: []
      }
    }
  ];

  const connections = [
    // From blockchain-basics to first ring
    { from: 'blockchain-basics', to: 'cryptography' },
    { from: 'blockchain-basics', to: 'decentralization' },
    { from: 'blockchain-basics', to: 'consensus' },
    
    // From first ring to second ring
    { from: 'cryptography', to: 'bitcoin' },
    { from: 'cryptography', to: 'wallets' },
    { from: 'decentralization', to: 'ethereum' },
    { from: 'consensus', to: 'mining' },
    { from: 'consensus', to: 'ethereum' },
    { from: 'bitcoin', to: 'mining' },
  ];

  const calculateConnection = (fromNode, toNode) => {
    const fromX = parseFloat(fromNode.x) + (parseFloat(fromNode.size) || 120) / 240;
    const fromY = parseFloat(fromNode.y) + (parseFloat(fromNode.size) || 120) / 240;
    const toX = parseFloat(toNode.x) + (parseFloat(toNode.size) || 120) / 240;
    const toY = parseFloat(toNode.y) + (parseFloat(toNode.size) || 120) / 240;
    
    const deltaX = (toX - fromX) * window.innerWidth / 100;
    const deltaY = (toY - fromY) * window.innerHeight / 100;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    
    return {
      left: `${fromX}%`,
      top: `${fromY}%`,
      width: `${length}px`,
      transform: `rotate(${angle}deg)`
    };
  };

  const handleNodeClick = (node) => {
    const canAccess = node.prerequisites.every(prereq => 
      userProgress.completedNodes.includes(prereq)
    ) || node.prerequisites.length === 0;

    if (canAccess) {
      setActiveNode(node);
      setShowGuide(true);
      
      // Mark as completed after viewing
      if (!userProgress.completedNodes.includes(node.id)) {
        setUserProgress(prev => ({
          ...prev,
          completedNodes: [...prev.completedNodes, node.id]
        }));
      }
    }
  };

  const isNodeAccessible = (node) => {
    return node.prerequisites.every(prereq => 
      userProgress.completedNodes.includes(prereq)
    ) || node.prerequisites.length === 0;
  };

  const progressPercentage = (userProgress.completedNodes.length / knowledgeNodes.length) * 100;

  return (
    <TreeContainer>
      <ProgressBar>
        <ProgressFill progress={progressPercentage} />
      </ProgressBar>
      
      <KnowledgeTree>
        {/* Render connections */}
        {connections.map((connection, index) => {
          const fromNode = knowledgeNodes.find(n => n.id === connection.from);
          const toNode = knowledgeNodes.find(n => n.id === connection.to);
          const connectionStyle = calculateConnection(fromNode, toNode);
          const isCompleted = userProgress.completedNodes.includes(connection.to);
          
          return (
            <ConnectionLine
              key={index}
              style={connectionStyle}
              completed={isCompleted}
            />
          );
        })}
        
        {/* Render nodes */}
        {knowledgeNodes.map(node => (
          <ConceptNode
            key={node.id}
            style={{ left: node.x, top: node.y }}
            size={node.size}
            active={activeNode?.id === node.id}
            completed={userProgress.completedNodes.includes(node.id)}
            accessible={isNodeAccessible(node)}
            onClick={() => handleNodeClick(node)}
          >
            <NodeIcon size={node.size}>{node.icon}</NodeIcon>
            <NodeTitle size={node.size}>{node.title}</NodeTitle>
          </ConceptNode>
        ))}
      </KnowledgeTree>

      <AIGuide show={showGuide}>
        <AvatarContainer>
          <Avatar>🤖</Avatar>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '16px' }}>
              Learn AI Guide
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              Foundation Knowledge
            </div>
          </div>
        </AvatarContainer>
        
        {activeNode && (
          <GuideText>
            <strong>{activeNode.title}</strong><br/>
            {activeNode.description}<br/><br/>
            {activeNode.content.explanation}
            
            {activeNode.content.examples.length > 0 && (
              <>
                <br/><br/><strong>Examples:</strong><br/>
                {activeNode.content.examples.map((example, i) => (
                  <span key={i}>• {example}<br/></span>
                ))}
              </>
            )}
          </GuideText>
        )}
        
        <button
          onClick={() => setShowGuide(false)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </AIGuide>
    </TreeContainer>
  );
};

export default VisualKnowledgeTree;