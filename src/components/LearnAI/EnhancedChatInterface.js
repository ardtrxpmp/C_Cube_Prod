import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const messageSlide = keyframes`
  0% { transform: translateX(-20px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const typingAnimation = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

const ChatContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2));
  padding: 20px;
  border-bottom: 1px solid rgba(16, 185, 129, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h2`
  color: #10b981;
  margin: 0;
  font-size: 1.5rem;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  color: #10b981;
  font-size: 0.9rem;
`;

const OnlineIndicator = styled.div`
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  margin-right: 8px;
  animation: ${typingAnimation} 1s infinite;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: ${messageSlide} 0.5s ease-out;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  max-width: 70%;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    : 'linear-gradient(135deg, #10b981, #059669)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const MessageBubble = styled.div`
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
    : 'rgba(16, 185, 129, 0.1)'};
  border: ${props => props.isUser 
    ? 'none'
    : '1px solid rgba(16, 185, 129, 0.3)'};
  color: white;
  padding: 15px 20px;
  border-radius: ${props => props.isUser 
    ? '20px 20px 5px 20px'
    : '20px 20px 20px 5px'};
  position: relative;
  backdrop-filter: blur(10px);
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 5px;
`;

const QuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
`;

const QuickActionButton = styled.button`
  padding: 8px 15px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 20px;
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(16, 185, 129, 0.4);
    transform: translateY(-2px);
  }
`;

const InputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: white;
  font-size: 1rem;
  resize: none;
  max-height: 120px;
  min-height: 50px;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SendButton = styled.button`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #10b981;
  font-style: italic;
  opacity: 0.8;
  margin-left: 52px;
`;

const TypingDot = styled.div`
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: ${typingAnimation} 1.4s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

const EnhancedChatInterface = ({ userProgress, setUserProgress }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI blockchain tutor. I'm here to help you understand crypto, DeFi, NFTs, and everything blockchain! What would you like to learn about today?",
      isUser: false,
      timestamp: new Date(),
      avatar: "🤖"
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    "What is blockchain?",
    "How do cryptocurrencies work?",
    "Explain smart contracts",
    "What is DeFi?",
    "How to create a wallet?",
    "Mining vs Staking",
    "NFT basics"
  ];

  const predefinedResponses = {
    "what is blockchain": "Blockchain is a distributed ledger technology that maintains a continuously growing list of records (blocks) that are linked and secured using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data. Think of it as a digital ledger that's duplicated across a network of computers!",
    "how do cryptocurrencies work": "Cryptocurrencies work by using blockchain technology to create a decentralized digital currency system. Transactions are verified by network participants (miners or validators) and recorded on the blockchain. This eliminates the need for a central authority like a bank!",
    "explain smart contracts": "Smart contracts are self-executing contracts with terms directly written into code. They automatically execute when predetermined conditions are met, without needing intermediaries. It's like a vending machine - you put in money, select a product, and it automatically gives you what you paid for!",
    "what is defi": "DeFi (Decentralized Finance) refers to financial services built on blockchain networks, primarily Ethereum. It recreates traditional financial systems (lending, borrowing, trading) in a decentralized manner using smart contracts, eliminating the need for banks or other financial intermediaries.",
    "how to create a wallet": "Creating a crypto wallet involves generating a pair of cryptographic keys - a public key (your address) and a private key (your password). You can use software wallets, hardware wallets, or even paper wallets. Remember: never share your private key or seed phrase with anyone!",
    "mining vs staking": "Mining uses computational power to solve complex puzzles and validate transactions (Proof of Work). Staking involves holding and 'staking' coins to validate transactions and earn rewards (Proof of Stake). Staking is more energy-efficient than mining!",
    "nft basics": "NFTs (Non-Fungible Tokens) are unique digital assets stored on a blockchain. Unlike cryptocurrencies, each NFT is one-of-a-kind and cannot be replicated. They can represent art, music, videos, or any digital content, providing proof of ownership and authenticity."
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
      avatar: "👤"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const lowerInput = inputValue.toLowerCase();
      let response = "That's a great question! While I'm continuously learning, I'd recommend exploring our interactive modules for deeper insights. Each topic has hands-on examples and visual explanations that make complex concepts easier to understand!";

      // Check for predefined responses
      for (const [key, value] of Object.entries(predefinedResponses)) {
        if (lowerInput.includes(key)) {
          response = value;
          break;
        }
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date(),
        avatar: "🤖"
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Update progress
      const newProgress = { ...userProgress };
      newProgress.totalProgress = (newProgress.totalProgress || 0) + 2;
      setUserProgress(newProgress);
    }, 1500 + Math.random() * 1000);
  };

  const handleQuickAction = (action) => {
    setInputValue(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>💬 AI Blockchain Tutor</ChatTitle>
        <StatusIndicator>
          <OnlineIndicator />
          Online & Ready to Help
        </StatusIndicator>
      </ChatHeader>

      <MessagesContainer>
        {messages.map((message) => (
          <Message key={message.id} isUser={message.isUser}>
            {!message.isUser && (
              <Avatar isUser={message.isUser}>{message.avatar}</Avatar>
            )}
            <div>
              <MessageBubble isUser={message.isUser}>
                {message.text}
                <MessageTime>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </MessageTime>
                {!message.isUser && message.id === 1 && (
                  <QuickActions>
                    {quickActions.map((action, index) => (
                      <QuickActionButton
                        key={index}
                        onClick={() => handleQuickAction(action)}
                      >
                        {action}
                      </QuickActionButton>
                    ))}
                  </QuickActions>
                )}
              </MessageBubble>
            </div>
            {message.isUser && (
              <Avatar isUser={message.isUser}>{message.avatar}</Avatar>
            )}
          </Message>
        ))}
        
        {isTyping && (
          <TypingIndicator>
            <Avatar>🤖</Avatar>
            <div>
              AI is typing
              <div style={{ display: 'inline-flex', marginLeft: '5px' }}>
                <TypingDot delay={0} />
                <TypingDot delay={0.2} />
                <TypingDot delay={0.4} />
              </div>
            </div>
          </TypingIndicator>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <InputWrapper>
          <MessageInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about blockchain, crypto, DeFi..."
            rows={1}
          />
          <SendButton 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
          >
            ➤
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </ChatContainer>
  );
};

export default EnhancedChatInterface;