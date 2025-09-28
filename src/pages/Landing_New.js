import React from 'react';
import styled from 'styled-components';
import Footer from '../components/Footer_New';
import CCubeLogo from '../components/CyFoCubeLogo';

const LandingContainer = styled.div`
  min-height: 100vh;
  background: transparent;
  color: #e0e0e0;
  overflow-x: hidden;
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 26, 46, 0.7);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23ffffff10" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
`;

const HeroContent = styled.div`
  max-width: none;
  width: 100%;
  margin: 0;
  padding-left: 40px;
  padding-right: 20px;
  text-align: left;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  min-height: 100vh;
  justify-content: flex-start;
  
  @media (max-width: 768px) {
    text-align: center;
    padding-left: 20px;
  }
`;

const TextContainer = styled.div`
  flex: none;
  max-width: 70%;
  padding: 0;
  margin: 0;
  
  @media (max-width: 768px) {
    max-width: 100%;
    text-align: center;
  }
`;

const HeroTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
  white-space: nowrap;
  overflow: visible;

  @media (max-width: 768px) {
    font-size: 1.0rem;
    white-space: normal;
    line-height: 1.3;
    text-align: center;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  margin-bottom: 40px;
  opacity: 0.8;
  max-width: 600px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 80px;
  max-width: 800px;
  
  @media (max-width: 768px) {
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
    gap: 8px;
    padding: 0 10px;
  }
`;

const StatCard = styled.div`
  text-align: center;
  padding: 3px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  @media (max-width: 768px) {
    padding: 8px 4px;
    min-width: 0;
    flex: 1;
  }
`;

const StatNumber = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0px;
  text-align: center;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    white-space: normal;
    line-height: 1.2;
  }
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FeaturesSection = styled.section`
  padding: 120px 20px;
  background: #0a0a0a;
`;

const SectionTitle = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 60px;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const FeaturesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
`;

const FeatureCard = styled.div`
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(102, 126, 234, 0.3);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.1);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 24px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #ffffff;
`;

const FeatureDescription = styled.p`
  opacity: 0.8;
  line-height: 1.6;
`;

const AppsSection = styled.section`
  padding: 120px 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
`;

const AppsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 60px;
`;

const AppCard = styled.div`
  padding: 30px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(102, 126, 234, 0.4);
    box-shadow: 0 16px 32px rgba(102, 126, 234, 0.15);
  }

  &.available {
    border-color: rgba(102, 126, 234, 0.3);
    background: rgba(102, 126, 234, 0.1);
  }

  &.coming-soon {
    opacity: 0.7;
  }
`;

const AppIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${props => props.available 
    ? 'linear-gradient(135deg, #667eea, #764ba2)' 
    : 'linear-gradient(135deg, #4a5568, #2d3748)'};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 20px;
`;

const AppTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #ffffff;
`;

const AppStatus = styled.span`
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  
  &.available {
    background: rgba(102, 126, 234, 0.2);
    color: #667eea;
  }
  
  &.coming-soon {
    background: rgba(255, 255, 255, 0.1);
    color: #a0a0a0;
  }
`;

const CTASection = styled.section`
  padding: 120px 20px;
  text-align: center;
  background: #0a0a0a;
`;

const CTAButton = styled.button`
  padding: 16px 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 30px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
  }
`;

const Landing = ({ onAppSelect, onNavigate }) => {
  const handleLaunchApp = () => {
    console.log('Launch app clicked, onAppSelect:', onAppSelect);
    if (onAppSelect) {
      onAppSelect('c-cube');
    }
  };

  const handleAppClick = (appName) => {
    console.log('App clicked:', appName, 'onNavigate:', onNavigate);
    if (appName === 'c-cube') {
      if (onNavigate) {
        onNavigate('downloads');
      }
    } else {
      if (onAppSelect) {
        onAppSelect('coming-soon');
      }
    }
  };

  return (
    <LandingContainer className="website-page">
      <HeroSection>
        <HeroContent>
          <TextContainer>
            <HeroTitle>Learn and Practice Blockchain Security</HeroTitle>
            <HeroSubtitle>
              Master blockchain technology through AI-powered hands-on learning, interactive video tutorials, and practical tools. 
              Build your expertise while practicing real-world crypto security techniques with intelligent guidance.
              <br /><br />
              Our platform prides itself in providing comprehensive tools for learning that make complex concepts accessible and engaging.
            </HeroSubtitle>
            
            <HeroStats>
              <StatCard>
                <StatNumber>100% Hands-On</StatNumber>
              </StatCard>
              <StatCard>
                <StatNumber>24/7 Learning</StatNumber>
              </StatCard>
              <StatCard>
                <StatNumber>∞ Knowledge</StatNumber>
              </StatCard>
            </HeroStats>
          </TextContainer>
        </HeroContent>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>Why Choose Our Learn Platform</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🔐</FeatureIcon>
            <FeatureTitle>Academy-Grade Security</FeatureTitle>
            <FeatureDescription>
              Advanced encryption and secure learning environments ensure your educational progress 
              remains completely protected from data breaches.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>⚡</FeatureIcon>
            <FeatureTitle>Quick Learning</FeatureTitle>
            <FeatureDescription>
              Optimized tutorials with instant feedback and 
              real-time progress tracking across all learning modules.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>🛡️</FeatureIcon>
            <FeatureTitle>Safe Learning Environment</FeatureTitle>
            <FeatureDescription>
              Practice with confidence in our risk-free educational environment. 
              Learn without the worry of losing real funds or making costly mistakes.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <AppsSection>
        <SectionTitle>One Platform, Infinite Capabilities</SectionTitle>
        <AppsGrid>
          <AppCard className="available" onClick={() => handleAppClick('c-cube')}>
            <AppIcon available>💎</AppIcon>
            <AppTitle>C-Cube Wallet</AppTitle>
            <AppStatus className="available">Available Now</AppStatus>
          </AppCard>
          
          <AppCard className="coming-soon" onClick={() => handleAppClick('encryption')}>
            <AppIcon>🔒</AppIcon>
            <AppTitle>File Encryption Tool</AppTitle>
            <AppStatus className="coming-soon">Coming Soon</AppStatus>
          </AppCard>
          
          <AppCard className="coming-soon" onClick={() => handleAppClick('scanner')}>
            <AppIcon>📡</AppIcon>
            <AppTitle>Network Scanner</AppTitle>
            <AppStatus className="coming-soon">Coming Soon</AppStatus>
          </AppCard>
          
          <AppCard className="coming-soon" onClick={() => handleAppClick('explorer')}>
            <AppIcon>🌐</AppIcon>
            <AppTitle>Blockchain Explorer</AppTitle>
            <AppStatus className="coming-soon">Coming Soon</AppStatus>
          </AppCard>
          
          <AppCard className="coming-soon" onClick={() => handleAppClick('identity')}>
            <AppIcon>🆔</AppIcon>
            <AppTitle>Identity Manager</AppTitle>
            <AppStatus className="coming-soon">Coming Soon</AppStatus>
          </AppCard>
          
          <AppCard className="coming-soon" onClick={() => handleAppClick('communications')}>
            <AppIcon>💬</AppIcon>
            <AppTitle>Secure Communications</AppTitle>
            <AppStatus className="coming-soon">Coming Soon</AppStatus>
          </AppCard>
        </AppsGrid>
      </AppsSection>

      <Footer onNavigate={onNavigate} />
    </LandingContainer>
  );
};

export default Landing;