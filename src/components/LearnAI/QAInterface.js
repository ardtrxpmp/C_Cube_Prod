import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Main Container
const QAContainer = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: #e2e8f0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

// Left Sidebar (12.5%)
const LeftSidebar = styled.div`
  width: 12.5%;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 35px 20px 15px 20px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(16, 185, 129, 0.3);
    border-radius: 2px;
  }
`;

// Main Content Area (75%)
const MainContent = styled.div`
  width: 75%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 25px 30px 15px 30px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(16, 185, 129, 0.3);
    border-radius: 3px;
  }
`;

// Right Sidebar (12.5%)
const RightSidebar = styled.div`
  width: 12.5%;
  background: rgba(255, 255, 255, 0.02);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding: 35px 20px 15px 20px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(16, 185, 129, 0.3);
    border-radius: 2px;
  }
`;

// Header Components
const QAHeader = styled.div`
  text-align: center;
  margin-bottom: 15px;
  animation: ${fadeIn} 1s ease-out;
`;

const QATitle = styled.h1`
  color: #10b981;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
`;

const QASubtitle = styled.p`
  color: #64748b;
  font-size: 1.1rem;
  margin: 0;
`;

// Sidebar Components
const SidebarSection = styled.div`
  margin-bottom: 25px;
`;

const SidebarTitle = styled.h3`
  color: #10b981;
  font-size: 1rem;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(16, 185, 129, 0.2);
`;

const CategoryItem = styled.div`
  padding: 8px 12px;
  margin-bottom: 6px;
  background: ${props => props.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: ${props => props.active ? '#10b981' : '#e2e8f0'};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
    transform: translateX(3px);
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: #64748b;
  }
  
  &:focus {
    border-color: rgba(16, 185, 129, 0.5);
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
  }
`;

// Question and Answer Components
const QuestionCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.8s ease-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: rgba(16, 185, 129, 0.3);
  }
`;

const QuestionTitle = styled.h3`
  color: #10b981;
  font-size: 1.3rem;
  margin-bottom: 16px;
  line-height: 1.4;
`;

const QuestionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const MetaTag = styled.span`
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const QuestionStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: #64748b;
  font-size: 0.85rem;
`;

const QuestionContent = styled.div`
  color: #e2e8f0;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const AnswerSection = styled.div`
  margin-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
`;

const AnswerCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(16, 185, 129, 0.2);
  }
`;

const AnswerAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const AuthorName = styled.span`
  color: #10b981;
  font-weight: 600;
  font-size: 0.9rem;
`;

const AuthorBadge = styled.span`
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const AnswerContent = styled.div`
  color: #e2e8f0;
  line-height: 1.6;
  font-size: 0.95rem;
`;

const AnswerActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const VoteButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const VoteButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #64748b;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    border-color: rgba(16, 185, 129, 0.5);
    color: #10b981;
  }
  
  &.active {
    background: rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.5);
    color: #10b981;
  }
`;

const AnswerTime = styled.span`
  color: #64748b;
  font-size: 0.8rem;
`;

// Sample data
const sampleCategories = [
  'All Questions',
  'DeFi Protocols', 
  'Layer 2 Scaling',
  'Security Audits',
  'GameFi Economics',
  'DAO Governance',
  'Smart Contracts',
  'Blockchain Basics',
  'NFTs & Web3',
  'Regulatory'
];

const sampleQuestions = [
  {
    id: 'q1',
    title: 'Which Layer 2 solution provides the best gas savings for a DeFi protocol processing $50M daily volume?',
    category: 'Layer 2 Scaling',
    tags: ['Polygon zkEVM', 'Optimism', 'Gas Optimization'],
    content: 'I\'m evaluating Layer 2 solutions for migrating our DeFi protocol. We currently process $50M in daily volume on Ethereum mainnet, paying $125k/day in gas costs...',
    author: 'DeFiArchitect',
    created: '2024-10-25T00:30:00Z',
    views: 4521,
    votes: 156,
    answers: 5
  },
  {
    id: 'q2',
    title: 'How to implement institutional-grade compliance hooks in Uniswap V4?',
    category: 'Smart Contracts',
    tags: ['Uniswap V4', 'Hooks', 'Compliance'],
    content: 'We need to implement KYC/AML compliance for institutional traders using Uniswap V4 hooks...',
    author: 'ComplianceEngineer',
    created: '2024-10-24T18:15:00Z',
    views: 2847,
    votes: 89,
    answers: 3
  }
];

const sampleAnswers = [
  {
    id: 'ans1',
    questionId: 'q1',
    author: 'zkProtocolExpert',
    badge: 'zkEVM Core Dev',
    content: 'For $50M daily volume, I\'d recommend **Polygon zkEVM** or **Arbitrum One**. Based on our migration analysis:\\n\\n**Polygon zkEVM:**\\n- Gas costs: ~95% savings vs mainnet\\n- Finality: 30-45 minutes (proof generation)\\n- Security: Ethereum-equivalent through validity proofs\\n- Tooling: Full EVM compatibility\\n\\n**Arbitrum One:**\\n- Gas costs: ~90% savings vs mainnet\\n- Finality: 7 days (challenge period)\\n- Security: Fraud proofs with 7-day delay\\n- Liquidity: Largest TVL among L2s\\n\\nFor your volume, zkEVM offers better long-term security guarantees.',
    votes: 89,
    timestamp: '2024-10-25T02:15:00Z'
  },
  {
    id: 'ans2', 
    questionId: 'q1',
    author: 'L2SecurityAuditor',
    badge: 'Smart Contract Auditor',
    content: 'Consider **Optimism** for your use case. Their recent Bedrock upgrade significantly improved gas efficiency:\\n\\n- **Data availability costs**: 10x reduction\\n- **Execution costs**: Native EVM opcodes\\n- **Sequencer decentralization**: Roadmap for multiple sequencers\\n- **Superchain vision**: Shared security across OP Stack chains\\n\\nFor DeFi specifically, Optimism\'s retro funding model attracts high-quality protocols.',
    votes: 67,
    timestamp: '2024-10-25T03:30:00Z'
  }
];

const QAInterface = ({ userProgress, setUserProgress }) => {
  // State management
  const [selectedCategory, setSelectedCategory] = useState('All Questions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questions, setQuestions] = useState(sampleQuestions);
  const [loading, setLoading] = useState(false);

  // Q&A Functions
  const filteredQuestions = questions.filter(question => {
    const categoryMatch = selectedCategory === 'All Questions' || question.category === selectedCategory;
    const searchMatch = searchQuery === '' || 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        // In production: load from qa-system/questions/
        await new Promise(resolve => setTimeout(resolve, 500));
        setQuestions(sampleQuestions);
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  return (
    <QAContainer>
      {/* Left Sidebar - Categories & Search */}
      <LeftSidebar>
        <SidebarSection>
          <SidebarTitle>Search</SidebarTitle>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
        </SidebarSection>

        <SidebarSection>
          <SidebarTitle>Categories</SidebarTitle>
          {sampleCategories.map((category, index) => (
            <CategoryItem
              key={index}
              active={selectedCategory === category}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </CategoryItem>
          ))}
        </SidebarSection>
      </LeftSidebar>

      {/* Main Content Area */}
      <MainContent>
        <QAHeader>
          <QATitle>Blockchain Q&A Hub</QATitle>
          <QASubtitle>
            Expert answers to complex blockchain questions • {filteredQuestions.length} questions available
          </QASubtitle>
        </QAHeader>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading questions...
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <QuestionCard key={question.id} onClick={() => handleQuestionSelect(question)}>
              <QuestionMeta>
                {question.tags.map((tag, index) => (
                  <MetaTag key={index}>{tag}</MetaTag>
                ))}
                <QuestionStats>
                  <span>👁 {question.views.toLocaleString()} views</span>
                  <span>👍 {question.votes} votes</span>
                  <span>💬 {question.answers} answers</span>
                  <span>⏰ {formatTimeAgo(question.created)}</span>
                </QuestionStats>
              </QuestionMeta>

              <QuestionTitle>{question.title}</QuestionTitle>
              
              <QuestionContent>
                {question.content.length > 200 
                  ? `${question.content.substring(0, 200)}...`
                  : question.content
                }
              </QuestionContent>

              {/* Sample answers for demonstration */}
              {question.id === 'q1' && (
                <AnswerSection>
                  <h4 style={{ color: '#10b981', marginBottom: '16px' }}>Top Answers:</h4>
                  {sampleAnswers.filter(ans => ans.questionId === 'q1').map((answer) => (
                    <AnswerCard key={answer.id}>
                      <AnswerAuthor>
                        <AuthorName>{answer.author}</AuthorName>
                        <AuthorBadge>{answer.badge}</AuthorBadge>
                      </AnswerAuthor>
                      
                      <AnswerContent>
                        {answer.content.split('\\n').map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </AnswerContent>

                      <AnswerActions>
                        <VoteButtons>
                          <VoteButton>👍 {answer.votes}</VoteButton>
                          <VoteButton>💬 Reply</VoteButton>
                          <VoteButton>📚 Save</VoteButton>
                        </VoteButtons>
                        <AnswerTime>{formatTimeAgo(answer.timestamp)}</AnswerTime>
                      </AnswerActions>
                    </AnswerCard>
                  ))}
                </AnswerSection>
              )}
            </QuestionCard>
          ))
        )}
      </MainContent>

      {/* Right Sidebar - Question Details */}
      <RightSidebar>
        <SidebarSection>
          <SidebarTitle>Quick Stats</SidebarTitle>
          <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
            <div>📊 Total Questions: {questions.length}</div>
            <div>🏷 Categories: {sampleCategories.length - 1}</div>
            <div>👥 Active Users: 1,247</div>
            <div>🔥 Trending: Layer 2</div>
          </div>
        </SidebarSection>

        <SidebarSection>
          <SidebarTitle>Recent Activity</SidebarTitle>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            <div style={{ marginBottom: '8px' }}>
              🟢 New answer on "Gas Optimization"
            </div>
            <div style={{ marginBottom: '8px' }}>
              🟡 Question updated "DeFi Security"
            </div>
            <div style={{ marginBottom: '8px' }}>
              🔵 Expert joined "zkEVM Discussion"
            </div>
          </div>
        </SidebarSection>
      </RightSidebar>
    </QAContainer>
  );
};

export default QAInterface;