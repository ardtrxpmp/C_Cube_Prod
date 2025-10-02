import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import LearnAIInterface from '../components/LearnAI/LearnAIInterface';

// Orbital Animation Keyframes
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

// Orbital Animation Container (Always Visible)
const OrbitContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 600px;
  height: 600px;
  transform: translate(-50%, -50%);
  opacity: 1;
  visibility: visible;
  pointer-events: none;
  z-index: 5;
  
  @media (max-width: 768px) {
    width: 400px;
    height: 400px;
  }
`;

// Central Hub - like the main icon in the reference image
const CentralHub = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
  border: 2px solid rgba(147, 197, 253, 0.3);
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }
`;

// Earth's Upper Surface - Horizontal Orbital Paths
const EarthOrbitalPath = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${props => props.diameter}px;
  height: ${props => props.diameter}px;
  transform: translate(-50%, -50%) rotateX(75deg);
  border: 3px dashed rgba(74, 222, 128, 0.7);
  border-radius: 50%;
  pointer-events: none;
`;

// Orbital Ring (horizontal circular like Earth's surface)
const CircularOrbitRing = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${props => props.diameter}px;
  height: ${props => props.diameter}px;
  transform: translate(-50%, -50%) rotateX(75deg);
  border-radius: 50%;
  animation: ${orbit} ${props => props.duration}s linear infinite;
`;

// Orbital Icon (positioned on the perimeter of the circular path)
const OrbitIcon = styled.div`
  position: absolute;
  top: -20px;
  right: -20px;  
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: rotate(-${props => props.rotation || 0}deg);
  
  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
    font-size: 1.1rem;
  }
`;

// Main Container
const AITutorContainer = styled.div`
  height: 100vh;
  background: #000000;
  position: relative;
  overflow: hidden;
  color: #e0e0e0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;        { id: 'progress-tracking', title: 'Progress Tracking', icon: '📈' },
        { id: 'adaptive-learning', title: 'Adaptive Learning', icon: '🧠' },
        { id: 'skill-recommendations', title: 'Skill Recommendations', icon: '💡' }   background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23ffffff10" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
`;

const AIContent = styled.div`
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 1;
  display: flex;
  gap: 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: 100vh;
  }
`;

// Hamburger Menu Button
// Hamburger Button inside sidebar
const HamburgerButton = styled.button`
  position: absolute;
  top: 0px;
  left: ${props => props.isOpen ? '0px' : '0px'};
  width: 60px;
  height: 60px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: bold;
`;



// Sidebar Navigation
const Sidebar = styled.div`
  width: ${props => props.isOpen ? '300px' : '60px'};
  background: #000000;
  border-radius: 0;
  border: none;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: ${props => props.isOpen ? '24px 0px' : '0px'};
  height: ${props => props.isOpen ? 'calc(100vh - 80px)' : '60px'};
  min-height: ${props => props.isOpen ? '400px' : '60px'};
  position: sticky;
  top: 0;
  z-index: 10;
  transition: width 0.3s ease, height 0.3s ease, padding 0.3s ease;
  overflow: visible;
  
  @media (max-width: 768px) {
    width: 100%;
    position: static;
    margin-bottom: 20px;
    height: fit-content;
    min-height: auto;
    border-radius: 0;
    border: none;
  }
`;

const SidebarTitle = styled.h2`
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 24px;
  margin-top: 60px;
  font-weight: 600;
  display: ${props => props.isOpen ? 'block' : 'none'};
  align-items: center;
  gap: 8px;
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: opacity 0.2s ease;
`;

const SidebarMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
  background: transparent;
  border-radius: 0;
  border: none;
  overflow: visible;
  margin-top: ${props => props.isOpen ? '30px' : '30px'};
  transition: margin-top 0.3s ease;
`;

const SidebarItem = styled.button`
  background: ${props => props.active ? 
    '#2a2a2a !important' : 
    'transparent'};
  border: none;
  border-radius: 0px;
  padding: ${props => props.isOpen ? '6px 16px' : '8px'};
  margin: 0;
  color: ${props => props.active ? '#ffffff' : 'rgba(224, 224, 224, 0.6)'};
  text-align: ${props => props.isOpen ? 'left' : 'center'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: ${props => props.isOpen ? '0.9rem' : '1.2rem'};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: ${props => props.isOpen ? 'flex-start' : 'center'};
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.active ? 
    '0 4px 20px rgba(51, 51, 51, 0.3)' : 
    '0 2px 8px rgba(0, 0, 0, 0.1)'};
  border: none;
  
  .icon {
    font-size: 1.2rem;
    margin-right: ${props => props.isOpen ? '8px' : '0'};
    flex-shrink: 0;
  }
  
  .text {
    display: ${props => props.isOpen ? 'inline' : 'none'};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
    font-weight: 500;
  }
  
  .arrow {
    display: ${props => props.isOpen ? 'inline' : 'none'};
    margin-left: auto;
    font-size: 0.8rem;
    opacity: 0.6;
    transition: all 0.3s ease;
    
    &::before {
      content: '▼';
    }
    
    &[data-open="true"]::before {
      content: '▲';
    }
  }
  
  &:hover {
    background: ${props => props.active ? 
      '#444444' : 
      'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-2px);
    box-shadow: ${props => props.active ? 
      '0 6px 25px rgba(68, 68, 68, 0.4)' : 
      '0 4px 15px rgba(0, 0, 0, 0.15)'};
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #4ade80;
    display: ${props => props.active ? 'block' : 'none'};
  }
`;

// Submenu Components
const SubMenu = styled.div`
  width: 100%;
  background: #1a1a1a;
  border: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  max-height: ${props => props.show ? '400px' : '0'};
  overflow: hidden;
  opacity: ${props => props.show ? '1' : '0'};
  transform: scaleY(${props => props.show ? '1' : '0'});
  transform-origin: top;
  transition: all 0.3s ease;
  pointer-events: ${props => props.show ? 'auto' : 'none'};
`;

const SubMenuItem = styled.button`
  width: 100%;
  background: ${props => props.active ? '#2a2a2a' : 'transparent'};
  border: none;
  color: ${props => props.active ? '#ffffff' : 'rgba(224, 224, 224, 0.8)'};
  padding: 12px 16px 12px 32px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 400;
  
  &:hover {
    background: ${props => props.active ? '#2a2a2a' : 'rgba(255, 255, 255, 0.1)'};
    color: #ffffff;
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const MenuItemWrapper = styled.div`
  position: relative;
`;

// Main Content Area
const MainContent = styled.div`
  flex: 1;
  background: ${props => props.isLearnAI ? 'transparent' : '#ffffff'};
  border-radius: 0;
  border: none;
  padding: ${props => props.isLearnAI ? '0' : '32px'};
  height: 100vh;
  overflow-y: auto;
  color: #333333;
  
  @media (max-width: 768px) {
    padding: ${props => props.isLearnAI ? '0' : '20px'};
    height: 100vh;
  }
`;

const ContentHeader = styled.div`
  margin-bottom: 32px;
`;

const ContentTitle = styled.h1`
  font-size: 2.5rem;
  color: #333333;
  margin-bottom: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ContentDescription = styled.p`
  font-size: 1.2rem;
  color: #666666;
  line-height: 1.6;
  max-width: 800px;
`;

// Hero Section Styles
const HeroSection = styled.section`
  padding: 60px 0;
  text-align: center;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  border-radius: 20px;
  margin-bottom: 60px;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #333333;
  margin-bottom: 24px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.3rem;
  color: #666666;
  margin-bottom: 40px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #3b82f6;
    color: white;
    transform: translateY(-2px);
  }
`;

// Stats Section
const StatsSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  margin-bottom: 80px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  color: #666666;
  margin-bottom: 16px;
`;

const StatIcon = styled.div`
  font-size: 2rem;
`;

// Features Section
const FeaturesSection = styled.section`
  margin-bottom: 80px;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333333;
  margin-bottom: 16px;
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666666;
  max-width: 600px;
  margin: 0 auto;
`;

const FeaturesList = styled.div`
  display: grid;
  gap: 32px;
`;

const FeatureItem = styled.div`
  display: flex;
  gap: 24px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
`;

const FeatureContent = styled.div`
  flex: 1;
`;

// Workflow Section
const WorkflowSection = styled.section`
  margin-bottom: 80px;
`;

const WorkflowSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
`;

const WorkflowStep = styled.div`
  text-align: center;
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const StepIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 16px;
`;

const StepTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
`;

const StepDescription = styled.p`
  color: #666666;
  line-height: 1.5;
`;

// Coming Soon Section
const ComingSoonSection = styled.section`
  text-align: center;
  padding: 60px 32px;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  border-radius: 20px;
  color: white;
`;

const ComingSoonBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
`;

const ComingSoonTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ComingSoonDescription = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  color: #ffffff;
  margin-bottom: 12px;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  color: rgba(224, 224, 224, 0.8);
  line-height: 1.5;
  font-size: 1rem;
`;

const AITutor = ({ onNavigate }) => {
  const [activeProject, setActiveProject] = useState('chatbot');
  const [activeSubcategory, setActiveSubcategory] = useState('natural-language');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [clickedProject, setClickedProject] = useState(null);

  // Permanent orbital animation

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('[data-sidebar]');
      if (sidebar && !sidebar.contains(event.target)) {
        setClickedProject(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const projects = [
    {
      id: 'chatbot',
      title: 'Blockchain Chatbot',
      description: 'Advanced conversational AI specialized in blockchain education',
      icon: '🤖',
      status: 'coming-soon',
      submenu: [
        { id: 'learn-ai', title: 'Learn AI', icon: '🌱', description: 'Fundamentals and basics' },
        { id: 'build-ai', title: 'Build AI', icon: '🔧', description: 'Technical development' },
        { id: 'earn-ai', title: 'Earn AI', icon: '💰', description: 'Investment & Trading' }
      ]
    },
    {
      id: 'learning-path',
      title: 'Personalized Learning Path Generator',
      description: 'AI that creates custom learning journeys based on your goals',
      icon: '🎯',
      status: 'coming-soon',
      submenu: [
        { id: 'skill-assessment', title: 'Skill Assessment', icon: '�', description: 'Test current knowledge level' },
        { id: 'custom-roadmap', title: 'Custom Roadmap', icon: '🗺️', description: 'Generate personalized learning path' },
        { id: 'adaptive-content', title: 'Adaptive Content', icon: '📚', description: 'Content that adjusts to your pace' },
        { id: 'progress-tracker', title: 'Progress Tracker', icon: '🏆', description: 'Monitor learning milestones' }
      ]
    }
  ];

  // Get all submenu items for orbital animation
  const getAllSubmenuItems = () => {
    const allItems = [];
    projects.forEach(project => {
      project.submenu.forEach(item => {
        allItems.push({
          ...item,
          parentTitle: project.title
        });
      });
    });
    return allItems;
  };



  const renderMainContent = () => (
    <>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroTitle>
            Building the infrastructure layer for intelligent blockchain education
          </HeroTitle>
          <HeroSubtitle>
            Advanced AI-powered learning platform designed to accelerate your blockchain knowledge 
            with personalized tutoring, smart assessments, and adaptive curriculum generation.
          </HeroSubtitle>
          <HeroButtons>
            <PrimaryButton>Launch AI Tutor</PrimaryButton>
            <SecondaryButton>Learn More</SecondaryButton>
          </HeroButtons>
        </HeroContent>
      </HeroSection>

      {/* Stats Section */}
      <StatsSection>
        <StatCard>
          <StatNumber>10K+</StatNumber>
          <StatLabel>Active learners</StatLabel>
          <StatIcon>👥</StatIcon>
        </StatCard>
        <StatCard>
          <StatNumber>50+</StatNumber>
          <StatLabel>Learning modules</StatLabel>
          <StatIcon>📚</StatIcon>
        </StatCard>
        <StatCard>
          <StatNumber>95%</StatNumber>
          <StatLabel>Success rate</StatLabel>
          <StatIcon>🎯</StatIcon>
        </StatCard>
      </StatsSection>

      {/* AI-Powered Features */}
      <FeaturesSection>
        <SectionHeader>
          <SectionTitle>AI-Powered Learning Experience</SectionTitle>
          <SectionSubtitle>
            Revolutionize your blockchain education with cutting-edge AI technology
          </SectionSubtitle>
        </SectionHeader>

        <FeaturesList>
          <FeatureItem>
            <FeatureIcon>🤖</FeatureIcon>
            <FeatureContent>
              <FeatureTitle>Smart Learning Assistant</FeatureTitle>
              <FeatureDescription>
                AI chatbot that understands context and provides personalized guidance 
                tailored to your learning pace and style.
              </FeatureDescription>
            </FeatureContent>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureContent>
              <FeatureTitle>Adaptive Assessment</FeatureTitle>
              <FeatureDescription>
                Dynamic quizzes and evaluations that adapt to your knowledge level 
                and identify areas for improvement.
              </FeatureDescription>
            </FeatureContent>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>🎓</FeatureIcon>
            <FeatureContent>
              <FeatureTitle>Personalized Learning Paths</FeatureTitle>
              <FeatureDescription>
                Custom curricula generated based on your goals, experience, and 
                preferred learning methodology.
              </FeatureDescription>
            </FeatureContent>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>📈</FeatureIcon>
            <FeatureContent>
              <FeatureTitle>Progress Tracking</FeatureTitle>
              <FeatureDescription>
                Real-time analytics and insights into your learning journey 
                with detailed progress reports.
              </FeatureDescription>
            </FeatureContent>
          </FeatureItem>
        </FeaturesList>
      </FeaturesSection>

      {/* Workflow Section */}
      <WorkflowSection>
        <SectionHeader>
          <SectionTitle>AI Learning Workflow</SectionTitle>
          <SectionSubtitle>The complete journey of AI-enhanced blockchain education</SectionSubtitle>
        </SectionHeader>

        <WorkflowSteps>
          <WorkflowStep>
            <StepIcon>📝</StepIcon>
            <StepTitle>Assessment</StepTitle>
            <StepDescription>Initial knowledge evaluation</StepDescription>
          </WorkflowStep>

          <WorkflowStep>
            <StepIcon>🎯</StepIcon>
            <StepTitle>Path Generation</StepTitle>
            <StepDescription>Custom learning plan creation</StepDescription>
          </WorkflowStep>

          <WorkflowStep>
            <StepIcon>🤖</StepIcon>
            <StepTitle>AI Tutoring</StepTitle>
            <StepDescription>Interactive learning sessions</StepDescription>
          </WorkflowStep>

          <WorkflowStep>
            <StepIcon>📊</StepIcon>
            <StepTitle>Progress Tracking</StepTitle>
            <StepDescription>Continuous performance monitoring</StepDescription>
          </WorkflowStep>

          <WorkflowStep>
            <StepIcon>🏆</StepIcon>
            <StepTitle>Certification</StepTitle>
            <StepDescription>Achievement recognition</StepDescription>
          </WorkflowStep>
        </WorkflowSteps>
      </WorkflowSection>

      {/* Coming Soon Section */}
      <ComingSoonSection>
        <ComingSoonBadge>
          🚀 Coming Soon - Revolutionary AI Education Platform
        </ComingSoonBadge>
        <ComingSoonTitle>
          The Future of Blockchain Learning is Here
        </ComingSoonTitle>
        <ComingSoonDescription>
          Get ready for an unprecedented learning experience that adapts to you, 
          grows with you, and accelerates your blockchain expertise.
        </ComingSoonDescription>
      </ComingSoonSection>
    </>
  );

  const renderChatbot = () => renderMainContent();

  const renderLearningPath = () => (
    <>
      <ContentHeader>
        <ContentTitle>
          🎯 Personalized Learning Path Generator
        </ContentTitle>
        <ContentDescription>
          AI-powered system that creates custom learning journeys based on your goals, experience level, 
          and learning preferences. Get a tailored curriculum that adapts to your progress.
        </ContentDescription>
      </ContentHeader>

      <ComingSoonBadge>
        🚀 Coming Soon - In Development
      </ComingSoonBadge>

      <FeatureGrid>
        <FeatureCard>
          <FeatureIcon>📊</FeatureIcon>
          <FeatureTitle>Knowledge Assessment</FeatureTitle>
          <FeatureDescription>
            Take a comprehensive quiz to determine your current knowledge level 
            and identify areas for improvement in blockchain technology.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🛤️</FeatureIcon>
          <FeatureTitle>Dynamic Curriculum Generation</FeatureTitle>
          <FeatureDescription>
            Generate personalized learning paths that adapt to your goals, 
            whether you're a beginner or looking to specialize in specific areas.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>📈</FeatureIcon>
          <FeatureTitle>Progress Tracking</FeatureTitle>
          <FeatureDescription>
            Monitor your learning progress with detailed analytics and adaptive 
            difficulty that adjusts based on your performance.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🏆</FeatureIcon>
          <FeatureTitle>Certification Pathways</FeatureTitle>
          <FeatureDescription>
            Follow structured pathways that lead to recognized certifications 
            in blockchain technology and cryptocurrency management.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🎓</FeatureIcon>
          <FeatureTitle>Skill-Based Learning</FeatureTitle>
          <FeatureDescription>
            Focus on specific skills like smart contract development, DeFi protocols, 
            or wallet security based on your career goals.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>📅</FeatureIcon>
          <FeatureTitle>Flexible Scheduling</FeatureTitle>
          <FeatureDescription>
            Create learning schedules that fit your lifestyle with reminders 
            and progress milestones to keep you motivated.
          </FeatureDescription>
        </FeatureCard>
      </FeatureGrid>
    </>
  );

  const renderContent = () => {
    switch(activeSubcategory) {
      // Chatbot subcategories
      case 'natural-language':
        return (
          <>
            <ContentHeader>
              <ContentTitle>💬 Natural Language Processing</ContentTitle>
              <ContentDescription>
                Advanced NLP engine that understands context and intent in blockchain conversations. 
                Process complex queries about cryptocurrencies, DeFi protocols, and wallet operations 
                with human-like comprehension.
              </ContentDescription>
            </ContentHeader>
            <ComingSoonBadge>🚀 Coming Soon</ComingSoonBadge>
          </>
        );
      case 'blockchain-queries':
        return (
          <>
            <ContentHeader>
              <ContentTitle>🔍 Blockchain Query Engine</ContentTitle>
              <ContentDescription>
                Intelligent query system that can search and analyze blockchain data in real-time. 
                Get instant answers about transactions, smart contracts, token metrics, and network statistics.
              </ContentDescription>
            </ContentHeader>
            <ComingSoonBadge>🚀 Coming Soon</ComingSoonBadge>
          </>
        );
      case 'smart-responses':
        return (
          <>
            <ContentHeader>
              <ContentTitle>🧠 Smart Response System</ContentTitle>
              <ContentDescription>
                AI-powered response generation that provides contextual and personalized answers. 
                Adapts communication style based on user expertise level and learning preferences.
              </ContentDescription>
            </ContentHeader>
            <ComingSoonBadge>🚀 Coming Soon</ComingSoonBadge>
          </>
        );
      case 'multilingual-support':
        return (
          <>
            <ContentHeader>
              <ContentTitle>🌐 Multilingual Support</ContentTitle>
              <ContentDescription>
                Global accessibility with support for multiple languages and regional blockchain terminology. 
                Seamless translation and localization for international users.
              </ContentDescription>
            </ContentHeader>
            <ComingSoonBadge>🚀 Coming Soon</ComingSoonBadge>
          </>
        );
      
      // Learning Path subcategories
      case 'knowledge-assessment':
        return (
          <>
            <ContentHeader>
              <ContentTitle>📊 Knowledge Assessment</ContentTitle>
              <ContentDescription>
                Comprehensive evaluation system that analyzes your current blockchain knowledge level. 
                Interactive quizzes and practical assessments to identify strengths and learning gaps.
              </ContentDescription>
            </ContentHeader>
            <ComingSoonBadge>🚀 Coming Soon</ComingSoonBadge>
          </>
        );
      case 'dynamic-curriculum':
        return (
          <>
            <ContentHeader>
              <ContentTitle>🎓 Dynamic Curriculum Generation</ContentTitle>
              <ContentDescription>
                AI-generated learning paths that adapt in real-time based on your progress and interests. 
                Personalized curriculum that evolves with market trends and new blockchain technologies.
              </ContentDescription>
            </ContentHeader>
            <ComingSoonBadge>🚀 Coming Soon</ComingSoonBadge>
          </>
        );
      case 'progress-tracking':
        return (
          <>
            <ContentHeader>
              <ContentTitle>📈 Progress Tracking</ContentTitle>
              <ContentDescription>
                Advanced analytics dashboard showing your learning journey with detailed metrics. 
                Track completion rates, skill development, and knowledge retention over time.
              </ContentDescription>
            </ContentHeader>
            <ComingSoonBadge>🚀 Coming Soon</ComingSoonBadge>
          </>
        );
      case 'adaptive-learning':
        return (
          <>
            <ContentHeader>
              <ContentTitle>🧠 Adaptive Learning</ContentTitle>
              <ContentDescription>
                Machine learning algorithms that adjust difficulty and pacing based on your learning style. 
                Personalized content delivery that optimizes retention and understanding.
              </ContentDescription>
            </ContentHeader>
            <ComingSoonBadge>🚀 Coming Soon</ComingSoonBadge>
          </>
        );
      case 'skill-recommendations':
        return (
          <>
            <ContentHeader>
              <ContentTitle>💡 Skill Recommendations</ContentTitle>
              <ContentDescription>
                AI-powered suggestions for next skills to develop based on market demand and career goals. 
                Personalized recommendations for courses, certifications, and practical projects.
              </ContentDescription>
            </ContentHeader>
            <ComingSoonBadge>🚀 Coming Soon</ComingSoonBadge>
          </>
        );
      
      // Learn AI subcategory - render the comprehensive learning interface
      case 'learn-ai':
        return <LearnAIInterface />;
      
      default:
        return renderMainContent();
    }
  };

  return (
    <>
      <AITutorContainer>
        <AIContent>
          <Sidebar isOpen={isSidebarOpen} data-sidebar>
            <HamburgerButton 
              isOpen={isSidebarOpen}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? '✕' : '☰'}
            </HamburgerButton>
            <SidebarMenu isOpen={isSidebarOpen}>
              {/* Only render menu items when sidebar is open */}
              {isSidebarOpen && projects.map(project => (
                <MenuItemWrapper 
                  key={project.id}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  <SidebarItem
                    active={activeProject === project.id}
                    isOpen={isSidebarOpen}
                    onClick={() => {
                      setActiveProject(project.id);
                      // If submenu is currently open (by hover or click), close it
                      if (hoveredProject === project.id || clickedProject === project.id) {
                        setClickedProject(null);
                        setHoveredProject(null);
                      } else {
                        // If submenu is closed, open it via click
                        setClickedProject(project.id);
                      }
                    }}
                  >
                    <span className="icon">{project.icon}</span>
                    <span className="text">{project.title}</span>
                    {isSidebarOpen && <span className="arrow" data-open={hoveredProject === project.id || clickedProject === project.id}></span>}
                  </SidebarItem>
                  
                  <SubMenu show={hoveredProject === project.id || clickedProject === project.id}>
                    {project.submenu.map(subItem => (
                      <SubMenuItem 
                        key={subItem.id}
                        active={activeSubcategory === subItem.id}
                        onClick={() => {
                          setActiveProject(project.id);
                          setActiveSubcategory(subItem.id);
                          setHoveredProject(null);
                          setClickedProject(null);
                          // Keep sidebar open when Learn AI is selected
                          if (subItem.id === 'learn-ai') {
                            setIsSidebarOpen(true);
                          }
                        }}
                      >
                        <span>{subItem.icon}</span>
                        <span>{subItem.title}</span>
                      </SubMenuItem>
                    ))}
                  </SubMenu>
                </MenuItemWrapper>
              ))}
            </SidebarMenu>
          </Sidebar>

          <MainContent sidebarOpen={isSidebarOpen} isLearnAI={activeSubcategory === 'learn-ai'}>
            {renderContent()}
          </MainContent>
        </AIContent>
      </AITutorContainer>
    </>
  );
};

export default AITutor;