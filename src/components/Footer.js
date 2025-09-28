import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: #2c3e50;
  color: white;
  padding: 50px 20px 30px 20px;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
`;

const FooterSection = styled.div`
  h3 {
    color: #667eea;
    margin-bottom: 20px;
    font-size: 1.2rem;
  }

  p {
    line-height: 1.6;
    margin-bottom: 15px;
    opacity: 0.9;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 10px;
  }

  a {
    color: #bdc3c7;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #667eea;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 50%;
  color: #667eea;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
  }
`;

const FooterBottom = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #34495e;
  text-align: center;
  color: #bdc3c7;
  font-size: 0.9rem;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
`;

const Footer = ({ onNavigate }) => {
  const handleNavClick = (page) => {
    if (onNavigate) onNavigate(page);
  };

  return (
    <FooterContainer className="website-page">
      <FooterContent>
        <FooterSection>
          <SectionTitle>C-cube</SectionTitle>
          <SectionText>
            Your trusted partner for cybersecurity and cryptocurrency management. 
            Building the future of digital asset security.
          </SectionText>
        </FooterSection>

        <FooterSection>
          <h3>Educational Tools</h3>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('apps'); }}>C-Cube Cold Wallet</a></li>
            <li><a href="#">DeFi Simulator (Coming Soon)</a></li>
            <li><a href="#">Blockchain Academy (Coming Soon)</a></li>
            <li><a href="#">Portfolio Tracker (Coming Soon)</a></li>
            <li><a href="#">Security Analyzer (Coming Soon)</a></li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h3>Learn & Support</h3>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('learn'); }}>Getting Started Guide</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('learn'); }}>Educational Content</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('faq'); }}>Frequently Asked Questions</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('community'); }}>Community Forum</a></li>
            <li><a href="mailto:admin@citadelcube.com">Contact Support</a></li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h3>Resources</h3>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('learn'); }}>Documentation</a></li>
            <li><a href="#">API Reference</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('learn'); }}>Security Best Practices</a></li>
            <li><a href="#">Glossary</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('learn'); }}>Video Tutorials</a></li>
          </ul>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <p>
          © 2024 C-cube. All rights reserved. Educational platform for blockchain learning.
        </p>
        <p>
          <a href="#" style={{color: '#bdc3c7', marginRight: '20px'}}>Privacy Policy</a>
          <a href="#" style={{color: '#bdc3c7', marginRight: '20px'}}>Terms of Service</a>
          <a href="#" style={{color: '#bdc3c7'}}>Educational Disclaimer</a>
        </p>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;