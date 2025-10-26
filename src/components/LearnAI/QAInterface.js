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
  background: rgba(20, 20, 25, 0.6);
  
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  margin-top: 20px;
  animation: ${fadeIn} 1s ease-out;
  height: fit-content;
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
  margin-bottom: 0;
  width: 45%;
  text-align: left;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
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
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  animation: ${fadeIn} 0.8s ease-out;
  
  &:hover {
    background: rgba(16, 185, 129, 0.05);
    border-bottom-color: rgba(16, 185, 129, 0.3);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const QuestionTitle = styled.h3`
  color: #10b981;
  font-size: 1.1rem;
  margin-bottom: 12px;
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
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const QuestionStats = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 0.75rem;
`;

const QuestionAuthor = styled.div`
  color: #3b82f6;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  display: inline-block;
  width: fit-content;
`;

const QuestionContent = styled.div`
  color: #e2e8f0;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 16px;
`;

const AnswerSection = styled.div`
  margin-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  background: rgba(20, 20, 25, 0.6);
  padding: 20px;
  border-radius: 8px;
`;

const AnswerCard = styled.div`
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(20, 20, 25, 0.8);
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
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 4px 8px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  display: inline-block;
  width: fit-content;
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
  line-height: 1.5;
  font-size: 0.85rem;
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
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
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

// Filter Menu Components
const FilterMenuContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0;
  align-items: center;
`;

const FilterMenu = styled.div`
  display: flex;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
`;

const FilterOption = styled.button`
  background: ${props => props.children === 'Ask Question' ? '#3b82f6' : 'none'};
  border: none;
  color: ${props => props.children === 'Ask Question' ? 'white' : '#64748b'};
  padding: 8px 16px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background: ${props => props.children === 'Ask Question' ? '#2563eb' : 'rgba(255, 255, 255, 0.05)'};
    color: ${props => props.children === 'Ask Question' ? 'white' : '#e2e8f0'};
  }
  
  &.active {
    background: ${props => props.children === 'Ask Question' ? '#3b82f6' : 'rgba(16, 185, 129, 0.1)'};
    color: ${props => props.children === 'Ask Question' ? 'white' : '#10b981'};
  }
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


const QAInterface = ({ userProgress, setUserProgress }) => {
  // State management
  const [selectedCategory, setSelectedCategory] = useState('All Questions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Newest');

  // Q&A Functions
  const filteredQuestions = questions.filter(question => {
    const categoryMatch = selectedCategory === 'All Questions' || question.category === selectedCategory;
    const searchMatch = searchQuery === '' || 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && searchMatch;
  }).sort((a, b) => {
    switch (activeFilter) {
      case 'Newest':
        return new Date(b.created_at || b.created) - new Date(a.created_at || a.created);
      case 'Active':
        return new Date(b.last_activity || b.updated_at || b.created_at) - new Date(a.last_activity || a.updated_at || a.created_at);
      case 'Unanswered':
        return (a.answer_count || 0) - (b.answer_count || 0);
      default:
        return 0;
    }
  });

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
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
        // Load from real API
        const response = await fetch('/api/qa/questions');
        const data = await response.json();
        
        console.log('API Response:', data);
        if (data.success) {
          console.log('Loading questions:', data.data.length, 'questions found');
          // Add debugging for vote data
          data.data.forEach((q, i) => {
            if (typeof q.votes === 'object') {
              console.warn(`Question ${i} has object votes:`, q.votes);
            }
          });
          setQuestions(data.data);
        } else {
          console.error('Failed to load questions:', data.error);
          // Keep empty array if API fails
          setQuestions([]);
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
        // Keep empty array if API fails
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Load answers for selected question
  const loadAnswers = async (questionId) => {
    setLoadingAnswers(true);
    try {
      const response = await fetch(`/api/qa/questions/${questionId}/answers`);
      const data = await response.json();
      
      if (data.success) {
        // Add debugging for answer vote data
        data.data.forEach((a, i) => {
          if (typeof a.votes === 'object') {
            console.warn(`Answer ${i} has object votes:`, a.votes);
          }
        });
        setAnswers(data.data);
      } else {
        console.error('Failed to load answers:', data.error);
        // No fallback - show empty state
        setAnswers([]);
      }
    } catch (error) {
      console.error('Failed to load answers:', error);
      // No fallback - show empty state
      setAnswers([]);
    } finally {
      setLoadingAnswers(false);
    }
  };

  // Handle question selection - toggle if same question clicked
  const handleQuestionSelect = (question) => {
    if (selectedQuestion && selectedQuestion.id === question.id) {
      // If clicking the same question, collapse it
      setSelectedQuestion(null);
      setAnswers([]);
    } else {
      // If clicking a different question, expand it
      setSelectedQuestion(question);
      loadAnswers(question.id);
    }
  };

  return (
    <QAContainer>
      {/* Left Sidebar - Categories & Search */}
      <LeftSidebar>
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
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
          
          <FilterMenuContainer>
            <FilterMenu>
              {['Newest', 'Active', 'Unanswered', 'Ask Question'].map((filter) => (
                <FilterOption
                  key={filter}
                  className={activeFilter === filter ? 'active' : ''}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </FilterOption>
              ))}
            </FilterMenu>
          </FilterMenuContainer>
        </QAHeader>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading questions...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No questions found. API Status: {questions.length} total questions loaded.
            <br />
            <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Reload Page
            </button>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <QuestionCard key={question.id} onClick={() => handleQuestionSelect(question)}>
              <QuestionAuthor>
                👤 {question.author_name || 'Anonymous'}
              </QuestionAuthor>
              
              <QuestionTitle>{question.title}</QuestionTitle>
              
              <QuestionContent>
                {question.content.length > 200 
                  ? `${question.content.substring(0, 200)}...`
                  : question.content
                }
              </QuestionContent>

              <QuestionMeta>
                {question.tags.map((tag, index) => (
                  <MetaTag key={index}>{tag}</MetaTag>
                ))}
                <QuestionStats>
                  <span>👁 {question.views?.toLocaleString() || 0} views</span>
                  <span>👍 {typeof question.votes === 'object' ? 0 : (question.votes || 0)} votes</span>
                  <span>💬 {question.answer_count || 0} answers</span>
                  <span>⏰ {formatTimeAgo(question.created_at || question.created)}</span>
                </QuestionStats>
              </QuestionMeta>

              {/* Real answers from database */}
              {selectedQuestion && question.id === selectedQuestion.id && (
                <AnswerSection>
                  <h4 style={{ color: '#10b981', marginBottom: '16px' }}>
                    Top Answers {loadingAnswers ? '(Loading...)' : `(${answers.length})`}:
                  </h4>
                  {loadingAnswers ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                      Loading answers...
                    </div>
                  ) : (
                    answers.map((answer) => (
                      <AnswerCard key={answer.id}>
                        <AnswerAuthor>
                          <AuthorName>👤 {answer.author_name || answer.author}</AuthorName>
                          <AuthorBadge>{answer.is_accepted ? '✅ Accepted' : 'Community Member'}</AuthorBadge>
                        </AnswerAuthor>
                        
                        <AnswerContent>
                          {(answer.content || '').split('\n').map((line, i) => (
                            <div key={i}>{String(line)}</div>
                          ))}
                        </AnswerContent>

                        <AnswerActions>
                          <VoteButtons>
                            <VoteButton>👍 {typeof answer.votes === 'object' ? 0 : (answer.votes || 0)}</VoteButton>
                            <VoteButton>💬 Reply</VoteButton>
                            <VoteButton>📚 Save</VoteButton>
                          </VoteButtons>
                          <AnswerTime>{formatTimeAgo(answer.created_at || answer.timestamp)}</AnswerTime>
                        </AnswerActions>
                      </AnswerCard>
                    ))
                  )}
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