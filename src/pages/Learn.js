import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageBackground, PageContent } from '../components/shared/PageBackground';
import { scrollToSection, updateUrlHash, getHashFromUrl, handleHashNavigation, createSectionId } from '../utils/scrollUtils';
import Footer from '../components/Footer_New';

const LearnContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
  
  @media (max-width: 480px) {
    padding: 0 12px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  margin-top: 60px;
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
    margin-top: 50px;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  letter-spacing: -0.5px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 12px;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
  font-weight: 400;
  line-height: 1.6;
  color: #e0e0e0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 500px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    max-width: 100%;
    padding: 0 10px;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const DropdownButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px 24px;
  color: #e0e0e0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 300px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(74, 222, 128, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(74, 222, 128, 0.2);
  }
  
  &::after {
    content: '▼';
    font-size: 0.8rem;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.3s ease;
    margin-left: 12px;
  }
  
  @media (max-width: 768px) {
    width: 280px;
    padding: 14px 20px;
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    width: 250px;
    padding: 12px 16px;
    font-size: 0.95rem;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px;
  margin-top: 8px;
  min-width: 300px;
  z-index: 1000;
  display: ${props => props.isOpen ? 'block' : 'none'};
  animation: ${props => props.isOpen ? 'fadeInDown 0.3s ease' : 'none'};
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.active ? 'rgba(74, 222, 128, 0.2)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  
  &:hover {
    background: rgba(74, 222, 128, 0.15);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 20px;
  color: #e0e0e0;
  font-size: 1rem;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  &:focus {
    outline: none;
    border-color: rgba(74, 222, 128, 0.5);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 20px rgba(74, 222, 128, 0.1);
  }
  
  &::placeholder {
    color: rgba(224, 224, 224, 0.5);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  }
`;

const ContentSection = styled.div`
  margin-top: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 25px;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 20px;
  }
`;

const MaterialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 20px;
  }
  
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const MaterialCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(74, 222, 128, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const MaterialHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const MaterialMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const CategoryTag = styled.span`
  background: linear-gradient(135deg, #4ade80, #06b6d4);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ReadTime = styled.span`
  color: rgba(224, 224, 224, 0.6);
  font-size: 0.8rem;
  font-weight: 500;
`;

const MaterialTitle = styled.h3`
  font-size: 1.25rem;
  color: #ffffff;
  margin-bottom: 12px;
  font-weight: 600;
  flex: 1;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
`;

const MaterialPreview = styled.p`
  color: rgba(224, 224, 224, 0.8);
  line-height: 1.6;
  margin-bottom: 16px;
  white-space: pre-line;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
`;

const ReadMoreButton = styled.button`
  background: linear-gradient(135deg, #4ade80, #06b6d4);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  line-height: 1;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(74, 222, 128, 0.3);
  }
`;

const PDFDownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 36px;
  box-sizing: border-box;
  line-height: 1;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
    color: white;
    text-decoration: none;
  }
  
  &:before {
    content: "📄";
    font-size: 0.85rem;
    line-height: 1;
    display: flex;
    align-items: center;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
`;

const VideoCard = styled(MaterialCard)`
  position: relative;
  overflow: hidden;
`;

const VideoThumbnail = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.thumbnail 
    ? `url('/videos/${props.thumbnail}') center/cover no-repeat` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  
  &::before {
    content: '▶';
    font-size: 3rem;
    color: white;
    opacity: 0.9;
    transition: all 0.3s ease;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  }
  
  &:hover::before {
    transform: scale(1.1);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    transition: all 0.3s ease;
  }
  
  &:hover::after {
    background: rgba(0, 0, 0, 0.2);
  }
`;

const VideoDuration = styled.span`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const DifficultyBadge = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  background: ${props => {
    switch(props.difficulty) {
      case 'Beginner': return 'rgba(74, 222, 128, 0.9)';
      case 'Intermediate': return 'rgba(251, 191, 36, 0.9)';
      case 'Advanced': return 'rgba(239, 68, 68, 0.9)';
      case 'Essential': return 'rgba(168, 85, 247, 0.9)';
      default: return 'rgba(74, 222, 128, 0.9)';
    }
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const VideoTopics = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

const TopicTag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: rgba(224, 224, 224, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
`;

const VideoModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const VideoModalContent = styled.div`
  background: rgba(26, 26, 46, 0.95);
  border-radius: 16px;
  padding: 20px;
  max-width: 90vw;
  max-height: 90vh;
  width: 800px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const VideoModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const VideoModalTitle = styled.h3`
  color: #ffffff;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const VideoPlayer = styled.video`
  width: 100%;
  height: auto;
  max-height: 60vh;
  border-radius: 8px;
  background: #000;
`;

const AITutorSection = styled.div`
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const AITutorTitle = styled.h3`
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 16px;
  font-weight: 600;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
`;

const AITutorDescription = styled.p`
  color: rgba(224, 224, 224, 0.8);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 32px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
`;

const AIFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
`;

const FeatureItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 8px;
`;

const FeatureTitle = styled.h4`
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
`;

const FeatureDescription = styled.p`
  color: rgba(224, 224, 224, 0.8);
  font-size: 0.9rem;
  line-height: 1.4;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const StartChatButton = styled.button`
  background: linear-gradient(135deg, #4ade80, #06b6d4);
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(74, 222, 128, 0.4);
  }
`;

const QuickTopicButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 24px;
  color: #e0e0e0;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(74, 222, 128, 0.5);
    transform: translateY(-2px);
  }
`;

const Learn = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('AI Tutor');
  const [expandedMaterials, setExpandedMaterials] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const sections = ['AI Tutor', 'Materials', 'Video'];

  // Handle URL hash changes and set active section
  useEffect(() => {
    const hash = getHashFromUrl();
    if (hash) {
      const sectionName = hash.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      if (sections.includes(sectionName)) {
        setActiveSection(sectionName);
        handleHashNavigation();
      }
    }
  }, [location]);

  // Function to handle section changes with URL updates
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setDropdownOpen(false);
    setSearchTerm('');
    
    const sectionId = createSectionId(section);
    updateUrlHash(sectionId);
    
    // Scroll to section
    setTimeout(() => {
      scrollToSection(sectionId);
    }, 100);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const sampleMaterials = [
    {
      id: 0,
      title: "C-Cube Cold Wallet: Complete User Education Guide",
      category: "C-Cube Guide",
      readTime: "45 min read",
      preview: "Your comprehensive journey to secure cryptocurrency management with C-Cube. Master cold storage, multi-chain support, security features, and advanced wallet management through this complete tutorial guide.",
      fullContent: "🔒 **Welcome to C-Cube - Your Secure Cold Wallet Companion**\n\nThis comprehensive guide covers everything you need to know about managing cryptocurrency safely with C-Cube Cold Wallet:\n\n**🚀 What You'll Learn:**\n• Setting up your first secure cold wallet\n• Understanding true cold storage technology\n• Managing multiple wallets across different networks\n• Multi-chain support (Ethereum, Polygon, BSC, Arbitrum, Optimism)\n• Advanced security features and best practices\n• Transaction management and token handling\n• Troubleshooting common issues\n\n**📋 Key Topics Covered:**\n\n**Getting Started**\n• First launch and security setup\n• Creating your first wallet with password protection\n• Understanding recovery phrases and backup strategies\n\n**Security Features**\n• Four layers of security protection\n• Cold storage design principles\n• Transaction signing and verification\n• Network security and validation\n\n**Advanced Features**\n• Multi-network wallet management\n• Custom gas fee settings\n• Smart contract interactions\n• DeFi protocol integration\n\n**Best Practices**\n• Recovery phrase protection strategies\n• Transaction security protocols\n• Regular security maintenance\n• Emergency procedures\n\n**💡 Why This Guide Matters:**\nC-Cube represents the future of secure cryptocurrency management. This guide ensures you can confidently navigate the world of digital assets while maintaining the highest security standards.\n\n**📄 [Download Complete PDF Guide](/C-Cube_Learning_Guide.pdf)**\n\n*Click the link above to access the full 50+ page comprehensive tutorial in PDF format.*",
      isPdfGuide: true,
      pdfUrl: "/C-Cube_Learning_Guide.pdf"
    },
    {
      id: 1,
      title: "Introduction to Blockchain Technology",
      category: "Fundamentals",
      readTime: "5 min read",
      preview: "Blockchain is a distributed ledger technology that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography. Each block contains a hash of the previous block...",
      fullContent: "Blockchain is a distributed ledger technology that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography. Each block contains a hash of the previous block, a timestamp, and transaction data. This creates an immutable chain of blocks that cannot be altered without changing all subsequent blocks. The technology provides transparency, security, and decentralization, making it ideal for cryptocurrency transactions, smart contracts, and various other applications in finance, supply chain, and digital identity verification.\n\nKey features of blockchain include:\n• Decentralization: No single point of control\n• Immutability: Records cannot be changed once confirmed\n• Transparency: All transactions are publicly visible\n• Security: Cryptographic protection of data\n• Consensus: Network agreement on transaction validity"
    },
    {
      id: 2,
      title: "Cold Wallet Security Best Practices",
      category: "Security",
      readTime: "8 min read",
      preview: "Cold wallets, also known as offline wallets, are considered the most secure way to store cryptocurrencies. They are not connected to the internet, making them immune to online attacks...",
      fullContent: "Cold wallets, also known as offline wallets, are considered the most secure way to store cryptocurrencies. They are not connected to the internet, making them immune to online attacks, hacking attempts, and malware.\n\nBest practices include:\n\n1. **Always verify receiving addresses** - Double-check addresses before sending transactions\n2. **Keep your recovery phrase secure and offline** - Store in multiple secure locations\n3. **Use multiple signatures for large amounts** - Add extra security layers\n4. **Regularly update firmware** - Keep your device up to date\n5. **Test small amounts first** - Verify everything works before large transactions\n6. **Keep your wallet in a secure physical location** - Protect from theft and damage\n7. **Have multiple backup copies** - Store recovery phrases in different secure locations\n\nRemember: You are your own bank when using cryptocurrencies. Security is your responsibility."
    },
    {
      id: 3,
      title: "Understanding Private Keys and Public Keys",
      category: "Cryptography",
      readTime: "6 min read",
      preview: "In cryptocurrency, private and public keys are fundamental concepts that ensure the security and functionality of digital transactions. A private key is a secret number that allows you to spend bitcoins...",
      fullContent: "In cryptocurrency, private and public keys are fundamental concepts that ensure the security and functionality of digital transactions.\n\n**Private Keys:**\n• A secret number that allows you to spend cryptocurrencies from your wallet\n• Must be kept absolutely secret - anyone with access can control your funds\n• Usually represented as a 256-bit number\n• Can be derived from a mnemonic seed phrase\n\n**Public Keys:**\n• Derived from the private key using cryptographic algorithms\n• Can be shared openly without security risk\n• Used to create wallet addresses where others can send cryptocurrency\n• Allows others to verify that transactions were signed by the corresponding private key\n\n**The Relationship:**\nThe mathematical relationship between private and public keys ensures that:\n• Only you can spend your funds (with your private key)\n• Others can verify transactions came from you (using your public key)\n• No one can derive your private key from your public key\n\n**Security Rules:**\n• Never share your private key with anyone\n• Always verify addresses before sending funds\n• Use hardware wallets for large amounts\n• Keep backups of your private keys/seed phrases"
    },
    {
      id: 4,
      title: "Multi-Signature Wallets Explained",
      category: "Advanced",
      readTime: "7 min read",
      preview: "Multi-signature (multisig) wallets require multiple signatures to authorize a transaction, providing enhanced security for cryptocurrency storage...",
      fullContent: "Multi-signature (multisig) wallets require multiple signatures to authorize a transaction, providing enhanced security for cryptocurrency storage and shared custody solutions.\n\n**How Multisig Works:**\n• Requires M-of-N signatures to spend funds\n• Example: 2-of-3 wallet needs 2 out of 3 keys to sign\n• Can be 1-of-2, 2-of-3, 3-of-5, or other combinations\n\n**Benefits:**\n• **Enhanced Security:** No single point of failure\n• **Shared Control:** Perfect for organizations or families\n• **Recovery Options:** Lost key doesn't mean lost funds\n• **Audit Trail:** Multiple parties must approve transactions\n\n**Use Cases:**\n• Corporate treasury management\n• Joint accounts between partners\n• Inheritance planning\n• High-value personal storage\n• Escrow services\n\n**Setup Considerations:**\n• Choose reliable co-signers\n• Secure all keys in different locations\n• Document the setup process\n• Test with small amounts first\n• Plan for emergency scenarios\n\n**C-Cube Integration:**\nC-Cube Cold Wallet supports multisig setups, allowing you to create secure shared custody solutions while maintaining the security benefits of cold storage."
    },
    {
      id: 5,
      title: "Transaction Fees and Optimization",
      category: "Transactions",
      readTime: "4 min read",
      preview: "Understanding how cryptocurrency transaction fees work and how to optimize them can save you money and ensure timely transaction processing...",
      fullContent: "Understanding how cryptocurrency transaction fees work and how to optimize them can save you money and ensure timely transaction processing.\n\n**How Fees Work:**\n• Fees compensate miners/validators for processing transactions\n• Higher fees = faster confirmation times\n• Fee rates change based on network congestion\n• Different networks have different fee structures\n\n**Fee Optimization Strategies:**\n\n**Bitcoin:**\n• Use SegWit addresses (lower fees)\n• Batch multiple payments\n• Time transactions during low congestion\n• Use fee estimation tools\n\n**Ethereum:**\n• Monitor gas prices\n• Use Layer 2 solutions when available\n• Optimize smart contract interactions\n• Consider transaction timing\n\n**General Tips:**\n• Check network congestion before sending\n• Use fee estimation features in your wallet\n• Consider the urgency of your transaction\n• Learn about your network's fee structure\n\n**C-Cube Features:**\n• Built-in fee estimation\n• Support for multiple fee priorities\n• Fee optimization suggestions\n• Historical fee data for timing decisions"
    }
  ];

  const sampleVideos = [
    {
      id: 1,
      title: "Cyber Threats: Bridging Security Gaps",
      duration: "00:13",
      description: "Bridging the gap that makes attacks possible",
      topics: ["Cyber Security", "Attack Prevention", "Security Education"],
      videoFile: "hacker_In_Trouble.mov",
      thumbnail: "hacker_In_Trouble_thumbnail.jpg"
    },
    {
      id: 2,
      title: "Understanding C-Cube Wallet",
      duration: "04:25",
      description: "Our comprehensive journey to secure cryptocurrency management with C-Cube",
      topics: ["C-Cube Wallet", "User Education Guide Video"],
      videoFile: "AI_Generated_C_Wallet_Tutorial.mp4",
      thumbnail: "AI_Generated_C_Wallet_Tutorial_Thumbnail.png"
    },
    {
      id: 3,
      title: "C-Cube Wallet Setup Tutorial",
      duration: "5:30",
      difficulty: "Beginner",
      description: "Learn how to set up your C-Cube cold wallet step by step.",
      topics: ["Installation", "Initial Setup", "Security Configuration"]
    },
    {
      id: 4,
      title: "Creating Your First Transaction",
      duration: "8:15",
      difficulty: "Beginner",
      description: "Complete guide to creating and signing your first transaction.",
      topics: ["Transaction Creation", "Digital Signatures", "Broadcasting"]
    },
    {
      id: 5,
      title: "Advanced Security Features",
      duration: "12:45",
      difficulty: "Intermediate",
      description: "Explore advanced security features and best practices.",
      topics: ["Multi-sig", "Hardware Integration", "Security Auditing"]
    },
    {
      id: 5,
      title: "Multi-Network Support",
      duration: "7:22",
      difficulty: "Intermediate",
      description: "How to manage multiple blockchain networks in C-Cube.",
      topics: ["Network Selection", "Custom Networks", "Cross-chain Features"]
    },
    {
      id: 6,
      title: "Backup and Recovery",
      duration: "6:18",
      difficulty: "Essential",
      description: "Critical knowledge for protecting your cryptocurrency assets.",
      topics: ["Seed Phrases", "Recovery Process", "Backup Strategies"]
    },
    {
      id: 7,
      title: "Integration with Hardware Wallets",
      duration: "10:33",
      difficulty: "Advanced",
      description: "Connect and use hardware wallets with C-Cube for maximum security.",
      topics: ["Hardware Setup", "Transaction Signing", "Security Benefits"]
    }
  ];

  // Filter materials and videos based on search term
  const filteredMaterials = sampleMaterials.filter(material =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVideos = sampleVideos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (video.difficulty && video.difficulty.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (video.topics && video.topics.some(topic => 
      topic.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const toggleMaterial = (id) => {
    setExpandedMaterials(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderAITutor = () => (
    <AITutorSection>
      <AITutorTitle>🤖 AI Learning Assistant</AITutorTitle>
      <AITutorDescription>
        Get personalized help with blockchain concepts, wallet security, and cryptocurrency fundamentals. 
        Our AI tutor is available 24/7 to answer your questions and guide your learning journey.
      </AITutorDescription>
      
      <AIFeatures>
        <FeatureItem>
          <FeatureIcon>📚</FeatureIcon>
          <FeatureTitle>Personalized Learning</FeatureTitle>
          <FeatureDescription>
            Tailored explanations based on your experience level
          </FeatureDescription>
        </FeatureItem>
        <FeatureItem>
          <FeatureIcon>🔒</FeatureIcon>
          <FeatureTitle>Security Guidance</FeatureTitle>
          <FeatureDescription>
            Best practices for keeping your crypto safe
          </FeatureDescription>
        </FeatureItem>
        <FeatureItem>
          <FeatureIcon>⚡</FeatureIcon>
          <FeatureTitle>Quick Answers</FeatureTitle>
          <FeatureDescription>
            Instant responses to common questions
          </FeatureDescription>
        </FeatureItem>
        <FeatureItem>
          <FeatureIcon>🎯</FeatureIcon>
          <FeatureTitle>Step-by-Step</FeatureTitle>
          <FeatureDescription>
            Guided tutorials for complex topics
          </FeatureDescription>
        </FeatureItem>
      </AIFeatures>
      
      <ButtonGroup>
        <StartChatButton>
          Start Learning Session
        </StartChatButton>
      </ButtonGroup>
      
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ color: '#e0e0e0', marginBottom: '16px', fontSize: '1.1rem' }}>
          Quick Topics:
        </h4>
        <ButtonGroup>
          <QuickTopicButton>How to create a wallet?</QuickTopicButton>
          <QuickTopicButton>What are private keys?</QuickTopicButton>
          <QuickTopicButton>Multi-signature explained</QuickTopicButton>
          <QuickTopicButton>Transaction fees guide</QuickTopicButton>
        </ButtonGroup>
      </div>
    </AITutorSection>
  );

  const renderMaterials = () => (
    <>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search materials by title, category, or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>
      <MaterialsGrid>
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map(material => (
            <MaterialCard key={material.id}>
              <MaterialHeader>
                <MaterialTitle>{material.title}</MaterialTitle>
                <MaterialMeta>
                  <CategoryTag>{material.category}</CategoryTag>
                  <ReadTime>{material.readTime}</ReadTime>
                </MaterialMeta>
              </MaterialHeader>
              <MaterialPreview>
                {expandedMaterials[material.id] ? material.fullContent : material.preview}
              </MaterialPreview>
              <ButtonContainer>
                <ReadMoreButton onClick={() => toggleMaterial(material.id)}>
                  {expandedMaterials[material.id] ? 'Read Less' : 'Read More'}
                </ReadMoreButton>
                {material.isPdfGuide && material.pdfUrl && (
                  <PDFDownloadButton 
                    href={material.pdfUrl} 
                    download="C-Cube_Learning_Guide.pdf"
                    rel="noopener noreferrer"
                  >
                    Download PDF Guide
                  </PDFDownloadButton>
                )}
              </ButtonContainer>
            </MaterialCard>
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            color: 'rgba(224, 224, 224, 0.6)', 
            gridColumn: '1 / -1',
            padding: '40px'
          }}>
            No materials found matching "{searchTerm}"
          </div>
        )}
      </MaterialsGrid>
    </>
  );

  const renderVideos = () => (
    <>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search videos by title, difficulty, or topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>
      <MaterialsGrid>
        {filteredVideos.length > 0 ? (
          filteredVideos.map(video => (
            <VideoCard key={video.id}>
              <VideoThumbnail 
                thumbnail={video.thumbnail}
                onClick={() => {
                  if (video.videoFile) {
                    setSelectedVideo(video);
                    setIsVideoModalOpen(true);
                  } else {
                    alert('Video coming soon!');
                  }
                }}
              >
                {video.difficulty && (
                  <DifficultyBadge difficulty={video.difficulty}>
                    {video.difficulty}
                  </DifficultyBadge>
                )}
                <VideoDuration>{video.duration}</VideoDuration>
              </VideoThumbnail>
              <MaterialTitle>{video.title}</MaterialTitle>
              <MaterialPreview>{video.description}</MaterialPreview>
              {video.topics && (
                <VideoTopics>
                  {video.topics.map((topic, index) => (
                    <TopicTag key={index}>{topic}</TopicTag>
                  ))}
                </VideoTopics>
              )}
              <ReadMoreButton 
                style={{ marginTop: '12px' }}
                onClick={() => {
                  if (video.videoFile) {
                    setSelectedVideo(video);
                    setIsVideoModalOpen(true);
                  } else {
                    alert('Video coming soon!');
                  }
                }}
              >
                Watch Video
              </ReadMoreButton>
            </VideoCard>
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            color: 'rgba(224, 224, 224, 0.6)', 
            gridColumn: '1 / -1',
            padding: '40px'
          }}>
            No videos found matching "{searchTerm}"
          </div>
        )}
      </MaterialsGrid>
    </>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'AI Tutor':
        return renderAITutor();
      case 'Materials':
        return renderMaterials();
      case 'Video':
        return renderVideos();
      default:
        return renderAITutor();
    }
  };

  return (
    <PageBackground>
      <PageContent>
        <LearnContainer>
          <Header>
            <Title>Learning Center</Title>
            <Subtitle>
              Master blockchain technology, cryptocurrency security, and wallet management with our comprehensive learning resources.
            </Subtitle>
          </Header>

          <DropdownContainer className="dropdown-container">
            <DropdownButton 
              isOpen={dropdownOpen}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {activeSection}
            </DropdownButton>
            
            <DropdownMenu isOpen={dropdownOpen}>
              {sections.map(section => (
                <DropdownItem
                  key={section}
                  active={activeSection === section}
                  onClick={() => handleSectionChange(section)}
                >
                  {section}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </DropdownContainer>

          <ContentSection id={createSectionId(activeSection)}>
            <SectionTitle>{activeSection}</SectionTitle>
            {renderContent()}
          </ContentSection>
        </LearnContainer>
      </PageContent>
      
      {/* Video Modal */}
      {isVideoModalOpen && selectedVideo && (
        <VideoModal onClick={() => setIsVideoModalOpen(false)}>
          <VideoModalContent onClick={(e) => e.stopPropagation()}>
            <VideoModalHeader>
              <VideoModalTitle>{selectedVideo.title}</VideoModalTitle>
              <CloseButton onClick={() => setIsVideoModalOpen(false)}>
                ×
              </CloseButton>
            </VideoModalHeader>
            <VideoPlayer
              controls
              autoPlay
              src={`/videos/${selectedVideo.videoFile}`}
            >
              Your browser does not support the video tag.
            </VideoPlayer>
          </VideoModalContent>
        </VideoModal>
      )}
      <Footer onNavigate={onNavigate} />
    </PageBackground>
  );
};

export default Learn;