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

const flowAnimation = keyframes`
  0% { 
    background-position: 0% 50%;
    box-shadow: 0 0 4px rgba(75, 85, 99, 0.3);
  }
  50% { 
    background-position: 100% 50%;
    box-shadow: 0 0 8px rgba(79, 70, 229, 0.5);
  }
  100% { 
    background-position: 200% 50%;
    box-shadow: 0 0 4px rgba(75, 85, 99, 0.3);
  }
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
        : props.locked
          ? 'linear-gradient(135deg, #6b7280, #9ca3af)'
          : 'linear-gradient(135deg, #374151, #4b5563)'
  };
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.locked ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  border: 3px solid ${props => 
    props.completed ? '#10b981' : 
    props.active ? '#4f46e5' : 
    props.locked ? '#9ca3af' : '#6b7280'
  };
  animation: ${props => props.active ? pulse : 'none'} 2s infinite;
  z-index: 10;
  opacity: ${props => props.locked ? 0.6 : 1};
  
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
  background: ${props => props.completed ? 
    'linear-gradient(90deg, #10b981, #059669)' : 
    'linear-gradient(90deg, #4b5563 0%, #6b7280 50%, #4f46e5 100%)'
  };
  background-size: 200% 100%;
  height: 4px;
  transform-origin: left center;
  transition: all 0.3s ease;
  z-index: 5;
  border-radius: 2px;
  box-shadow: ${props => props.completed ? 
    '0 0 8px rgba(16, 185, 129, 0.4)' : 
    '0 0 4px rgba(75, 85, 99, 0.3)'
  };
  animation: ${props => !props.completed ? flowAnimation : 'none'} 3s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: -8px;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    background: ${props => props.completed ? '#10b981' : '#6b7280'};
    border-radius: 50%;
    opacity: 0.8;
  }
  
  &::after {
    content: '';
    position: absolute;
    right: -10px;
    top: -6px;
    width: 0;
    height: 0;
    border-left: 16px solid ${props => props.completed ? '#059669' : '#6b7280'};
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    z-index: 2;
    filter: drop-shadow(0 0 3px rgba(0,0,0,0.3));
  }
  
  &:hover {
    background: ${props => props.completed ? 
      'linear-gradient(90deg, #059669, #047857)' : 
      'linear-gradient(90deg, #6b7280, #9ca3af)'
    };
    height: 5px;
    box-shadow: ${props => props.completed ? 
      '0 0 12px rgba(16, 185, 129, 0.6)' : 
      '0 0 8px rgba(75, 85, 99, 0.5)'
    };
    
    &::before {
      width: 10px;
      height: 10px;
      top: -9px;
    }
    
    &::after {
      border-left-color: ${props => props.completed ? '#047857' : '#9ca3af'};
      border-left-width: 18px;
      border-top-width: 9px;
      border-bottom-width: 9px;
      right: -11px;
      top: -7px;
    }
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

const LegendPanel = styled.div`
  position: fixed;
  top: 100px;
  left: 20px;
  width: 300px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 100;
`;

const LevelIndicator = styled.div`
  position: absolute;
  top: -12px;
  left: -12px;
  width: 24px;
  height: 24px;
  background: ${props => props.completed ? 
    'linear-gradient(135deg, #10b981, #059669)' : 
    props.accessible ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 
    'linear-gradient(135deg, #6b7280, #9ca3af)'
  };
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  color: white;
  border: 2px solid ${props => props.completed ? '#10b981' : props.accessible ? '#4f46e5' : '#9ca3af'};
  z-index: 15;
`;

const StartHereIndicator = styled.div`
  position: absolute;
  top: -45px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
  z-index: 20;
  animation: ${pulse} 2s infinite;
  border: 2px solid #f59e0b;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #f59e0b;
  }
`;

const LegendTitle = styled.h3`
  color: #f1f5f9;
  margin: 0 0 12px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #e5e7eb;
`;

const LegendIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
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
    // LEVEL 1: Foundation (Start Here)
    { 
      id: 'what-is-money', 
      title: 'What is Money?', 
      icon: '�', 
      x: '10%', 
      y: '20%', 
      size: '100px',
      description: 'Start your journey by understanding the basics of money and value.',
      prerequisites: [],
      content: {
        explanation: 'Money is a medium of exchange, store of value, and unit of account...',
        examples: ['Barter system', 'Gold standard', 'Fiat currency'],
        quiz: []
      }
    },
    
    // LEVEL 2: Digital Evolution
    { 
      id: 'digital-money', 
      title: 'Digital Money', 
      icon: '💳', 
      x: '30%', 
      y: '20%', 
      size: '100px',
      description: 'Learn how money evolved into digital form and its limitations.',
      prerequisites: ['what-is-money'],
      content: {
        explanation: 'Digital money requires trusted intermediaries like banks...',
        examples: ['Credit cards', 'PayPal', 'Bank transfers'],
        quiz: []
      }
    },
    
    // LEVEL 3: The Problem
    { 
      id: 'double-spending', 
      title: 'Double Spending Problem', 
      icon: '🔄', 
      x: '50%', 
      y: '20%', 
      size: '100px',
      description: 'Understand the key problem that blockchain solves.',
      prerequisites: ['digital-money'],
      content: {
        explanation: 'Without trusted parties, digital money can be copied and spent twice...',
        examples: ['Copy-paste problem', 'Need for verification'],
        quiz: []
      }
    },
    
    // LEVEL 4: The Solution Foundation
    { 
      id: 'cryptography', 
      title: 'Cryptography', 
      icon: '🔐', 
      x: '70%', 
      y: '20%', 
      size: '100px',
      description: 'Learn the mathematical tools that make blockchain secure.',
      prerequisites: ['double-spending'],
      content: {
        explanation: 'Cryptographic hash functions create unique digital fingerprints...',
        examples: ['SHA-256', 'Digital signatures', 'Hash functions'],
        quiz: []
      }
    },
    
    // LEVEL 5: Core Innovation
    { 
      id: 'blockchain-basics', 
      title: 'Blockchain Basics', 
      icon: '🔗', 
      x: '90%', 
      y: '20%', 
      size: '120px',
      description: 'Discover how blockchain creates trust without intermediaries.',
      prerequisites: ['cryptography'],
      content: {
        explanation: 'A blockchain is a chain of blocks, each containing transactions and linking to the previous block...',
        examples: ['Block structure', 'Chain of trust', 'Immutable ledger'],
        quiz: []
      }
    },
    
    // LEVEL 6: Network Architecture  
    { 
      id: 'decentralization', 
      title: 'Decentralization', 
      icon: '🌐', 
      x: '90%', 
      y: '40%', 
      size: '100px',
      description: 'Learn how peer-to-peer networks eliminate single points of failure.',
      prerequisites: ['blockchain-basics'],
      content: {
        explanation: 'Instead of one central authority, thousands of computers maintain the ledger...',
        examples: ['P2P networks', 'Distributed systems', 'Network resilience'],
        quiz: []
      }
    },
    
    // LEVEL 7: Agreement Protocol
    { 
      id: 'consensus', 
      title: 'Consensus Mechanisms', 
      icon: '🤝', 
      x: '70%', 
      y: '40%', 
      size: '100px',
      description: 'Understand how thousands of computers agree on transaction validity.',
      prerequisites: ['decentralization'],
      content: {
        explanation: 'Consensus mechanisms ensure all nodes agree on the state of the blockchain...',
        examples: ['Proof of Work', 'Proof of Stake', 'Network agreement'],
        quiz: []
      }
    },
    
    // LEVEL 8: First Implementation
    { 
      id: 'bitcoin', 
      title: 'Bitcoin', 
      icon: '₿', 
      x: '50%', 
      y: '40%', 
      size: '120px',
      description: 'Explore the first successful implementation of blockchain technology.',
      prerequisites: ['consensus'],
      content: {
        explanation: 'Bitcoin combines all these concepts into the world\'s first cryptocurrency...',
        examples: ['Digital gold', 'Peer-to-peer cash', 'Store of value'],
        quiz: []
      }
    },
    
    // LEVEL 9: Security Process
    { 
      id: 'mining', 
      title: 'Mining & Validation', 
      icon: '⛏️', 
      x: '30%', 
      y: '40%', 
      size: '100px',
      description: 'Learn how new blocks are created and the network stays secure.',
      prerequisites: ['bitcoin'],
      content: {
        explanation: 'Miners compete to solve puzzles and validate transactions...',
        examples: ['Hash puzzles', 'Block rewards', 'Network security'],
        quiz: []
      }
    },
    
    // LEVEL 10: Storage Solutions
    { 
      id: 'wallets', 
      title: 'Digital Wallets', 
      icon: '👛', 
      x: '10%', 
      y: '40%', 
      size: '100px',
      description: 'Understand how to securely store and manage your cryptocurrency.',
      prerequisites: ['mining'],
      content: {
        explanation: 'Wallets don\'t actually store coins, they store the keys that prove ownership...',
        examples: ['Hot wallets', 'Cold wallets', 'Hardware wallets'],
        quiz: []
      }
    },
    
    // LEVEL 11: Evolution
    { 
      id: 'ethereum', 
      title: 'Ethereum & Smart Contracts', 
      icon: '♦️', 
      x: '10%', 
      y: '60%', 
      size: '120px',
      description: 'Discover programmable money and decentralized applications.',
      prerequisites: ['wallets'],
      content: {
        explanation: 'Ethereum extends blockchain to run programs called smart contracts...',
        examples: ['Smart contracts', 'DApps', 'Programmable money'],
        quiz: []
      }
    },
    
    // LEVEL 12: Modern Applications
    { 
      id: 'defi', 
      title: 'DeFi', 
      icon: '🏦', 
      x: '30%', 
      y: '60%', 
      size: '100px',
      description: 'Explore decentralized finance and its revolutionary applications.',
      prerequisites: ['ethereum'],
      content: {
        explanation: 'DeFi recreates traditional financial services without banks...',
        examples: ['Lending', 'Trading', 'Yield farming'],
        quiz: []
      }
    },
    
    // LEVEL 13: Digital Ownership
    { 
      id: 'nfts', 
      title: 'NFTs', 
      icon: '🎨', 
      x: '50%', 
      y: '60%', 
      size: '100px',
      description: 'Learn about non-fungible tokens and digital ownership.',
      prerequisites: ['ethereum'],
      content: {
        explanation: 'NFTs represent unique digital assets and prove ownership...',
        examples: ['Digital art', 'Gaming items', 'Collectibles'],
        quiz: []
      }
    },
    
    // LEVEL 14: Future Potential
    { 
      id: 'web3', 
      title: 'Web3 Future', 
      icon: '🌟', 
      x: '70%', 
      y: '60%', 
      size: '120px',
      description: 'Envision the decentralized internet and its possibilities.',
      prerequisites: ['defi', 'nfts'],
      content: {
        explanation: 'Web3 represents the next evolution of the internet, owned by users...',
        examples: ['Decentralized social media', 'User-owned data', 'Censorship resistance'],
        quiz: []
      }
    }
  ];

  const connections = [
    // Linear learning flow - each concept builds on the previous
    { from: 'what-is-money', to: 'digital-money' },
    { from: 'digital-money', to: 'double-spending' },
    { from: 'double-spending', to: 'cryptography' },
    { from: 'cryptography', to: 'blockchain-basics' },
    { from: 'blockchain-basics', to: 'decentralization' },
    { from: 'decentralization', to: 'consensus' },
    { from: 'consensus', to: 'bitcoin' },
    { from: 'bitcoin', to: 'mining' },
    { from: 'mining', to: 'wallets' },
    { from: 'wallets', to: 'ethereum' },
    { from: 'ethereum', to: 'defi' },
    { from: 'ethereum', to: 'nfts' },
    { from: 'defi', to: 'web3' },
    { from: 'nfts', to: 'web3' }
  ];

  const calculateConnection = (fromNode, toNode) => {
    if (!fromNode || !toNode) return {};
    
    // Get container dimensions (assume container is ~800px height minimum)
    const containerWidth = 1000; // Approximate container width
    const containerHeight = 800; // Approximate container height
    
    // Calculate center points of nodes
    const fromSize = parseFloat(fromNode.size?.replace('px', '')) || 120;
    const toSize = parseFloat(toNode.size?.replace('px', '')) || 120;
    
    const fromX = parseFloat(fromNode.x) * containerWidth / 100 + fromSize / 2;
    const fromY = parseFloat(fromNode.y) * containerHeight / 100 + fromSize / 2;
    const toX = parseFloat(toNode.x) * containerWidth / 100 + toSize / 2;
    const toY = parseFloat(toNode.y) * containerHeight / 100 + toSize / 2;
    
    // Calculate connection vector
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    
    // Adjust starting position to edge of from-node
    const startX = fromX + (fromSize / 2 * Math.cos(angle * Math.PI / 180));
    const startY = fromY + (fromSize / 2 * Math.sin(angle * Math.PI / 180));
    
    // Adjust length to end at edge of to-node
    const adjustedLength = length - (fromSize / 2) - (toSize / 2);
    
    return {
      left: `${(startX / containerWidth) * 100}%`,
      top: `${(startY / containerHeight) * 100}%`,
      width: `${adjustedLength}px`,
      transform: `rotate(${angle}deg)`,
      transformOrigin: 'left center'
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
      
      <LegendPanel>
        <LegendTitle>
          🗺️ Learning Flow Guide
        </LegendTitle>
        <LegendItem>
          <LegendIcon style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}>✓</LegendIcon>
          Completed concepts
        </LegendItem>
        <LegendItem>
          <LegendIcon style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white' }}>📚</LegendIcon>
          Available to learn
        </LegendItem>
        <LegendItem>
          <LegendIcon style={{ background: 'linear-gradient(135deg, #6b7280, #9ca3af)', color: 'white' }}>🔒</LegendIcon>
          Locked (complete prerequisites)
        </LegendItem>
        <LegendItem>
          <LegendIcon style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontSize: '10px' }}>🚀</LegendIcon>
          Start here - your learning journey begins
        </LegendItem>
        <div style={{ marginTop: '12px', fontSize: '11px', color: '#9ca3af', lineHeight: '1.4' }}>
          <strong>🎯 Learning Flow:</strong><br/>
          Follow the numbered levels (1→2→3...) and animated arrows. Each concept builds logically on the previous one, from basic money concepts to advanced Web3 applications.
        </div>
      </LegendPanel>
      
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
        {knowledgeNodes.map((node, index) => {
          const isCompleted = userProgress.completedNodes.includes(node.id);
          const isAccessible = isNodeAccessible(node);
          const isActive = activeNode?.id === node.id;
          const level = index + 1;
          
          return (
            <div key={node.id} style={{ position: 'relative' }}>
              {level === 1 && (
                <StartHereIndicator 
                  style={{ 
                    left: `calc(${node.x} + ${parseInt(node.size) / 2}px)`,
                    top: `calc(${node.y} + ${parseInt(node.size) / 2 - 45}px)`
                  }}
                >
                  🚀 START HERE
                </StartHereIndicator>
              )}
              <LevelIndicator 
                completed={isCompleted}
                accessible={isAccessible}
                style={{ 
                  left: `calc(${node.x} + ${parseInt(node.size) / 2 - 12}px)`,
                  top: `calc(${node.y} + ${parseInt(node.size) / 2 - 12}px)`
                }}
              >
                {level}
              </LevelIndicator>
              <ConceptNode
                style={{ left: node.x, top: node.y }}
                size={node.size}
                active={isActive}
                completed={isCompleted}
                locked={!isAccessible}
                onClick={() => handleNodeClick(node)}
                title={!isAccessible ? `Level ${level}: Complete ${node.prerequisites.join(', ')} first` : `Level ${level}: ${node.description}`}
              >
                <NodeIcon size={node.size}>
                  {!isAccessible ? '🔒' : node.icon}
                </NodeIcon>
                <NodeTitle size={node.size}>{node.title}</NodeTitle>
              </ConceptNode>
            </div>
          );
        })}
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