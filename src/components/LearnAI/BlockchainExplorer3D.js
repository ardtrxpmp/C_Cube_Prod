import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const float3D = keyframes`
  0%, 100% { transform: translateY(0px) rotateX(0deg); }
  50% { transform: translateY(-10px) rotateX(5deg); }
`;

const rotate3D = keyframes`
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
`;

const ExplorerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1), rgba(79, 70, 229, 0.05));
  overflow: hidden;
  perspective: 1000px;
`;

const BlockchainSpace = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: ${rotate3D} 60s linear infinite;
  animation-play-state: ${props => props.paused ? 'paused' : 'running'};
`;

const Block3D = styled.div`
  position: absolute;
  width: 80px;
  height: 80px;
  background: ${props => props.genesis ? 
    'linear-gradient(135deg, #f59e0b, #d97706)' : 
    props.latest ? 
    'linear-gradient(135deg, #10b981, #059669)' : 
    'linear-gradient(135deg, #4f46e5, #7c3aed)'
  };
  border: 2px solid ${props => props.genesis ? '#f59e0b' : props.latest ? '#10b981' : '#4f46e5'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  animation: ${float3D} 4s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  
  &:hover {
    transform: scale(1.2) translateZ(20px);
    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.4);
  }

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    border-radius: 8px;
    z-index: -1;
  }
`;

const BlockNumber = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 4px;
  border-radius: 4px;
`;

const BlockIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
`;

const Transaction = styled.div`
  position: absolute;
  width: 4px;
  height: 20px;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 2px;
  animation: ${props => `moveTransaction${props.direction}`} 3s linear infinite;
  animation-delay: ${props => props.delay}s;
  opacity: 0.8;

  @keyframes moveTransactionRight {
    0% { transform: translateX(-50px) translateZ(0); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateX(150px) translateZ(0); opacity: 0; }
  }

  @keyframes moveTransactionLeft {
    0% { transform: translateX(150px) translateZ(0); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateX(-50px) translateZ(0); opacity: 0; }
  }
`;

const AINavigator = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 350px;
  background: rgba(0, 0, 0, 0.95);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
`;

const NavigatorHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const NavigatorAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
`;

const NavigatorText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: #e5e7eb;
  margin-bottom: 12px;
`;

const ControlPanel = styled.div`
  position: fixed;
  top: 100px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ControlButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  font-size: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
  }
`;

const BlockInfo = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.95);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 300px;
  z-index: 1001;
  display: ${props => props.show ? 'block' : 'none'};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 18px;
`;

const BlockchainExplorer3D = ({ userProgress, setUserProgress }) => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [animationPaused, setAnimationPaused] = useState(false);
  const [currentView, setCurrentView] = useState('blockchain');
  const [narratorText, setNarratorText] = useState("Welcome to the 3D Blockchain Explorer! You can walk through actual blockchain structures.");
  
  const blockchainData = [
    { 
      id: 0, 
      hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
      previousHash: '0',
      transactions: 1,
      timestamp: '2009-01-03 18:15:05',
      difficulty: 1,
      nonce: 2083236893,
      genesis: true,
      x: 100,
      y: 200,
      z: 0
    },
    { 
      id: 1, 
      hash: '00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048',
      previousHash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
      transactions: 1,
      timestamp: '2009-01-09 02:54:25',
      difficulty: 1,
      nonce: 2573394689,
      x: 250,
      y: 200,
      z: 0
    },
    { 
      id: 2, 
      hash: '000000006a625f06636b8bb6ac7b960a8d03705d1ace08b1a19da3fdcc99ddbd',
      previousHash: '00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048',
      transactions: 1,
      timestamp: '2009-01-09 02:55:44',
      difficulty: 1,
      nonce: 2850094635,
      x: 400,
      y: 200,
      z: 0
    },
    { 
      id: 3, 
      hash: '000000008b896e272758da5297bcd98fdc6d97c9b765ecec401e286dc1fdbe10',
      previousHash: '000000006a625f06636b8bb6ac7b960a8d03705d1ace08b1a19da3fdcc99ddbd',
      transactions: 2,
      timestamp: '2009-01-09 03:02:53',
      difficulty: 1,
      nonce: 2842207863,
      x: 550,
      y: 200,
      z: 0
    },
    { 
      id: 'latest',
      hash: '0000000000000000000234b93e11a1b2e3c5d6789a1b2c3d4e5f6789123456789',
      previousHash: '000000008b896e272758da5297bcd98fdc6d97c9b765ecec401e286dc1fdbe10',
      transactions: 2847,
      timestamp: new Date().toISOString(),
      difficulty: 25000000000000,
      nonce: 1234567890,
      latest: true,
      x: 700,
      y: 200,
      z: 0
    }
  ];

  const handleBlockClick = (block) => {
    setSelectedBlock(block);
    setAnimationPaused(true);
    
    if (block.genesis) {
      setNarratorText("This is the Genesis Block - the very first block in Bitcoin's blockchain, created by Satoshi Nakamoto on January 3, 2009.");
    } else if (block.latest) {
      setNarratorText("This represents the latest block in the blockchain. New blocks are continuously being mined and added to extend the chain.");
    } else {
      setNarratorText(`This is Block #${block.id}. Each block contains a cryptographic hash of the previous block, creating an immutable chain.`);
    }

    // Mark exploration progress
    if (!userProgress.completedNodes.includes(`block-${block.id}`)) {
      setUserProgress(prev => ({
        ...prev,
        completedNodes: [...prev.completedNodes, `block-${block.id}`]
      }));
    }
  };

  const closeBlockInfo = () => {
    setSelectedBlock(null);
    setAnimationPaused(false);
  };

  const changeView = (view) => {
    setCurrentView(view);
    
    switch(view) {
      case 'mining':
        setNarratorText("Mining View: Watch as miners compete to solve cryptographic puzzles and create new blocks. The process requires significant computational power.");
        break;
      case 'transactions':
        setNarratorText("Transaction Flow: See how transactions move through the network, waiting in the mempool before being included in blocks.");
        break;
      case 'consensus':
        setNarratorText("Consensus Mechanism: Observe how the network reaches agreement on the valid chain through Proof of Work.");
        break;
      default:
        setNarratorText("Blockchain Structure: Explore the interconnected blocks that form the immutable ledger.");
    }
  };

  // Generate random transactions for animation
  const generateTransactions = () => {
    const transactions = [];
    for (let i = 0; i < 20; i++) {
      transactions.push({
        id: i,
        delay: Math.random() * 3,
        direction: Math.random() > 0.5 ? 'Right' : 'Left',
        x: Math.random() * 600 + 50,
        y: Math.random() * 400 + 100
      });
    }
    return transactions;
  };

  const [transactions] = useState(generateTransactions());

  return (
    <ExplorerContainer>
      <BlockchainSpace paused={animationPaused}>
        {/* Render blockchain blocks */}
        {blockchainData.map((block, index) => (
          <Block3D
            key={block.id}
            genesis={block.genesis}
            latest={block.latest}
            delay={index * 0.5}
            style={{
              left: `${block.x}px`,
              top: `${block.y}px`,
              transform: `translateZ(${block.z}px)`
            }}
            onClick={() => handleBlockClick(block)}
          >
            <BlockNumber>#{block.id}</BlockNumber>
            <BlockIcon>
              {block.genesis ? '🚀' : block.latest ? '⚡' : '📦'}
            </BlockIcon>
          </Block3D>
        ))}

        {/* Animated transactions */}
        {currentView === 'transactions' && transactions.map(tx => (
          <Transaction
            key={tx.id}
            delay={tx.delay}
            direction={tx.direction}
            style={{
              left: `${tx.x}px`,
              top: `${tx.y}px`
            }}
          />
        ))}
      </BlockchainSpace>

      <ControlPanel>
        <div style={{ marginBottom: '8px', fontSize: '12px', opacity: 0.8 }}>
          Explorer Views:
        </div>
        <ControlButton 
          active={currentView === 'blockchain'}
          onClick={() => changeView('blockchain')}
        >
          🔗 Blockchain
        </ControlButton>
        <ControlButton 
          active={currentView === 'mining'}
          onClick={() => changeView('mining')}
        >
          ⛏️ Mining
        </ControlButton>
        <ControlButton 
          active={currentView === 'transactions'}
          onClick={() => changeView('transactions')}
        >
          💸 Transactions
        </ControlButton>
        <ControlButton 
          active={currentView === 'consensus'}
          onClick={() => changeView('consensus')}
        >
          🤝 Consensus
        </ControlButton>
        <ControlButton onClick={() => setAnimationPaused(!animationPaused)}>
          {animationPaused ? '▶️ Resume' : '⏸️ Pause'}
        </ControlButton>
      </ControlPanel>

      <AINavigator>
        <NavigatorHeader>
          <NavigatorAvatar>🤖</NavigatorAvatar>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '16px' }}>
              3D Explorer AI
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              Your Blockchain Guide
            </div>
          </div>
        </NavigatorHeader>
        
        <NavigatorText>
          {narratorText}
        </NavigatorText>
        
        <div style={{ fontSize: '12px', opacity: 0.6 }}>
          💡 Click on blocks to explore their contents
        </div>
      </AINavigator>

      <BlockInfo show={selectedBlock !== null}>
        <CloseButton onClick={closeBlockInfo}>×</CloseButton>
        
        {selectedBlock && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>
              {selectedBlock.genesis ? '🚀 Genesis Block' : 
               selectedBlock.latest ? '⚡ Latest Block' : 
               `📦 Block #${selectedBlock.id}`}
            </h3>
            
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div><strong>Hash:</strong> <code style={{ fontSize: '11px', opacity: 0.8 }}>{selectedBlock.hash}</code></div>
              <div><strong>Previous Hash:</strong> <code style={{ fontSize: '11px', opacity: 0.8 }}>{selectedBlock.previousHash}</code></div>
              <div><strong>Transactions:</strong> {selectedBlock.transactions.toLocaleString()}</div>
              <div><strong>Timestamp:</strong> {selectedBlock.timestamp}</div>
              <div><strong>Difficulty:</strong> {selectedBlock.difficulty.toLocaleString()}</div>
              <div><strong>Nonce:</strong> {selectedBlock.nonce.toLocaleString()}</div>
            </div>

            {selectedBlock.genesis && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', fontSize: '13px' }}>
                <strong>Special Note:</strong> This block contains the famous message: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"
              </div>
            )}
          </div>
        )}
      </BlockInfo>
    </ExplorerContainer>
  );
};

export default BlockchainExplorer3D;