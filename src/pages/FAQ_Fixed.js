import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Footer from '../components/Footer_New';
import { handleHashNavigation, updateUrlHash, getHashFromUrl } from '../utils/scrollUtils';

const FAQContainer = styled.div`
  min-height: 100vh;
  background: rgba(26, 26, 46, 0.7);
  position: relative;
  overflow-x: hidden;
  padding: 80px 20px 40px;
  color: #e0e0e0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23ffffff10" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
    pointer-events: none;
    z-index: 0;
  }
`;

const FAQCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 30px;
  text-align: center;
  background: linear-gradient(135deg, #4ade80, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  font-weight: 400;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 40px;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 12px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  font-size: 1rem;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.05);
  color: #e0e0e0;
  transition: all 0.3s ease;

  &:focus {
    border-color: #4ade80;
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
  }

  &::placeholder {
    color: #888;
  }
`;

const CategoryFilter = styled.div`
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 2px solid ${props => props.active ? '#4ade80' : 'rgba(255, 255, 255, 0.2)'};
  background: ${props => props.active ? '#4ade80' : 'transparent'};
  color: ${props => props.active ? '#0a0a0a' : '#e0e0e0'};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    border-color: #4ade80;
    background: ${props => props.active ? '#4ade80' : 'rgba(74, 222, 128, 0.1)'};
  }
`;

const FAQItem = styled.div`
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(74, 222, 128, 0.3);
    box-shadow: 0 4px 20px rgba(74, 222, 128, 0.1);
  }
`;

const FAQQuestion = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #e0e0e0;
  font-size: 1.1rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #4ade80;
  }

  .icon {
    transition: transform 0.3s ease;
    color: #4ade80;
    font-size: 1.2rem;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const Answer = styled.div`
  padding: ${props => props.isOpen ? '0 20px 20px 20px' : '0'};
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
  border-top: ${props => props.isOpen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
  
  p {
    color: #b0b0b0;
    line-height: 1.6;
    margin-bottom: 15px;
  }

  ul {
    margin: 15px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
    color: #b0b0b0;
  }

  strong {
    color: #e0e0e0;
    font-weight: 600;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
`;

const FAQ = ({ onNavigate }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState({});

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'technical', label: 'Technical' },
    { id: 'wallet', label: 'Wallet' },
    { id: 'defi', label: 'DeFi' }
  ];

  // Handle URL hash changes for category navigation
  useEffect(() => {
    const hash = getHashFromUrl();
    if (hash) {
      const category = categories.find(cat => cat.id === hash);
      if (category) {
        setSelectedCategory(hash);
      }
    }
    handleHashNavigation();
  }, [location]);

  // Function to handle category changes with URL updates
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId !== 'all') {
      updateUrlHash(categoryId);
    } else {
      updateUrlHash('');
    }
  };

  const faqData = [
    {
      category: 'general',
      question: 'What is C-cube and what does it offer?',
      answer: `C-cube is an educational platform focused on blockchain technology and cryptocurrency education. Our mission is to provide safe, accessible learning environments for people at all experience levels. We offer educational wallet applications for learning about cryptocurrency storage, interactive tutorials on blockchain fundamentals, safe testing environments that don't require real cryptocurrency, comprehensive educational content about DeFi, security, and best practices, and tools designed specifically for learning purposes.`
    },
    {
      question: 'Is C-cube suitable for beginners?',
      answer: `Absolutely! C-cube is designed with beginners in mind. Our educational approach ensures that complex concepts are broken down into digestible, easy-to-understand lessons. You can start with basic blockchain concepts and gradually work your way up to more advanced topics like DeFi and smart contracts.`
    },
    {
      category: 'general',
      question: 'Is CyFoCube suitable for beginners?',
      answer: `Absolutely! CyFoCube is designed with beginners in mind. Our educational approach ensures that complex concepts are broken down into digestible, easy-to-understand lessons. You can start with basic blockchain concepts and gradually work your way up to more advanced topics like DeFi and smart contracts.`
    },
    {
      category: 'security',
      question: 'How secure are the educational tools?',
      answer: `Our educational tools are designed with security in mind, but they are specifically for learning purposes only. They operate in simulated environments that don't involve real cryptocurrency or real blockchain transactions. This approach allows you to learn and practice without any financial risk.`
    },
    {
      category: 'wallet',
      question: 'What is a cold wallet and why is it important?',
      answer: `A cold wallet is a cryptocurrency storage method that keeps your private keys completely offline, making it virtually immune to online hacking attempts. Cold wallets are considered the most secure way to store cryptocurrency long-term. Our educational cold wallet helps you understand how these systems work before you need to use them with real assets.`
    },
    {
      category: 'technical',
      question: 'What blockchain networks are covered in the educational content?',
      answer: `Our educational content covers major blockchain networks including Ethereum, Bitcoin, Polygon, Binance Smart Chain, and others. We explain the differences between these networks, their unique features, transaction costs, and use cases to help you understand the broader blockchain ecosystem.`
    },
    {
      category: 'defi',
      question: 'What is DeFi and how can I learn about it safely?',
      answer: `DeFi (Decentralized Finance) refers to financial services built on blockchain technology that operate without traditional intermediaries like banks. Our educational platform provides safe, simulated environments where you can learn about DeFi concepts like liquidity pools, yield farming, and decentralized exchanges without risking real money.`
    }
  ];

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <FAQContainer className="website-page">
        <FAQCard>
          <Title>Frequently Asked Questions</Title>
          <Subtitle>Find answers to common questions about blockchain education and C-cube</Subtitle>

          <SearchBar
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <CategoryFilter>
            {categories.map(category => (
              <FilterButton
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.label}
              </FilterButton>
            ))}
          </CategoryFilter>

          {filteredFAQs.length === 0 ? (
            <NoResults>
              No questions found matching your search criteria. Try different keywords or categories.
            </NoResults>
          ) : (
            filteredFAQs.map((item, index) => (
              <FAQItem key={index}>
                <FAQQuestion
                  isOpen={openItems[index]}
                  onClick={() => toggleItem(index)}
                >
                  <span>{item.question}</span>
                  <span className="icon">▼</span>
                </FAQQuestion>
                <Answer isOpen={openItems[index]}>
                  <p>{item.answer}</p>
                </Answer>
              </FAQItem>
            ))
          )}
        </FAQCard>
      </FAQContainer>
      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default FAQ;