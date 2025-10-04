import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
  100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
`;

const MigrateContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f0f23, #1a1a2e);
  position: relative;
  overflow: auto;
  padding: 40px 20px 20px;
`;

const DashboardHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  animation: ${fadeIn} 1s ease-out;
`;

const DashboardTitle = styled.h1`
  color: #10b981;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
`;

const DashboardSubtitle = styled.p`
  color: #64748b;
  font-size: 1.1rem;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.8s ease-out;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: rgba(16, 185, 129, 0.3);
  }
`;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #10b981;
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
`;

const StatLabel = styled.div`
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatDescription = styled.div`
  color: #64748b;
  font-size: 0.9rem;
`;

const SectionContainer = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: white;
  font-size: 1.8rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionIcon = styled.span`
  font-size: 1.5rem;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const CategoryCard = styled.div`
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.05));
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(79, 70, 229, 0.5);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.2);
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CategoryName = styled.h3`
  color: white;
  font-size: 1.2rem;
  margin: 0;
`;

const CategoryPoints = styled.div`
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const ItemName = styled.span`
  color: #e2e8f0;
  font-size: 0.9rem;
`;

const ItemPoints = styled.span`
  color: #10b981;
  font-weight: 600;
  font-size: 0.9rem;
`;

const ChapterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const ChapterCard = styled.div`
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 95, 70, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(16, 185, 129, 0.5);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.2);
  }
`;

const ChapterHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 12px;
`;

const ChapterName = styled.h4`
  color: white;
  font-size: 1rem;
  margin: 0;
  flex: 1;
`;

const ChapterStatus = styled.div`
  background: ${props => props.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)'};
  color: ${props => props.completed ? '#10b981' : '#9ca3af'};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ChapterPoints = styled.div`
  color: #10b981;
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
  margin-top: 8px;
`;

const MigrateButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding: 20px;
`;

const MigrateButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  color: white;
  padding: 16px 48px;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  animation: ${glowPulse} 3s infinite;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    background: linear-gradient(135deg, #34d399, #10b981);
  }
  
  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: rgba(156, 163, 175, 0.3);
    color: #9ca3af;
    cursor: not-allowed;
    animation: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

const MigratePointDashboard = ({ userProgress, walletData }) => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [gamePoints, setGamePoints] = useState(0);
  const [storyPoints, setStoryPoints] = useState(0);
  const [achievementPoints, setAchievementPoints] = useState(0);

  // Mock data for gaming categories and their points
  const gamingCategories = [
    {
      name: "Blockchain Basics",
      points: 450,
      items: [
        { name: "What is Blockchain?", points: 100 },
        { name: "Cryptographic Hashing", points: 150 },
        { name: "Consensus Mechanisms", points: 200 }
      ]
    },
    {
      name: "Smart Contracts",
      points: 380,
      items: [
        { name: "Contract Fundamentals", points: 120 },
        { name: "Solidity Basics", points: 130 },
        { name: "Contract Deployment", points: 130 }
      ]
    },
    {
      name: "DeFi Protocols",
      points: 520,
      items: [
        { name: "Lending & Borrowing", points: 180 },
        { name: "DEX Mechanisms", points: 170 },
        { name: "Yield Farming", points: 170 }
      ]
    },
    {
      name: "NFTs & Web3",
      points: 290,
      items: [
        { name: "NFT Standards", points: 100 },
        { name: "Metadata & IPFS", points: 90 },
        { name: "Web3 Integration", points: 100 }
      ]
    }
  ];

  // Mock data for story mode chapters
  const storyChapters = [
    { name: "Chapter 1: Genesis Block", points: 200, completed: true },
    { name: "Chapter 2: The Mining Quest", points: 250, completed: true },
    { name: "Chapter 3: Smart Contract Wars", points: 300, completed: false },
    { name: "Chapter 4: DeFi Revolution", points: 350, completed: false },
    { name: "Chapter 5: NFT Kingdom", points: 280, completed: false },
    { name: "Chapter 6: Layer 2 Solutions", points: 320, completed: false },
    { name: "Chapter 7: Cross-Chain Bridges", points: 400, completed: false },
    { name: "Chapter 8: The Future of Web3", points: 450, completed: false }
  ];

  useEffect(() => {
    // Calculate total points from gaming categories
    const totalGamePoints = gamingCategories.reduce((sum, category) => sum + category.points, 0);
    
    // Calculate total points from completed story chapters
    const totalStoryPoints = storyChapters
      .filter(chapter => chapter.completed)
      .reduce((sum, chapter) => sum + chapter.points, 0);
    
    // Mock achievement points
    const totalAchievementPoints = 750;
    
    setGamePoints(totalGamePoints);
    setStoryPoints(totalStoryPoints);
    setAchievementPoints(totalAchievementPoints);
    setTotalPoints(totalGamePoints + totalStoryPoints + totalAchievementPoints);
  }, []);

  const handleMigrate = () => {
    if (!walletData) {
      alert("Please connect your C-Cube wallet first to migrate points!");
      return;
    }
    
    // Mock migration process
    alert(`Migrating ${totalPoints} points to your C-Cube wallet: ${walletData.address?.slice(0, 6)}...${walletData.address?.slice(-4)}\n\nMigration will be processed on the blockchain shortly!`);
  };

  return (
    <MigrateContainer>
      <DashboardHeader>
        <DashboardTitle>🔄 Migrate Points Dashboard</DashboardTitle>
        <DashboardSubtitle>
          View all your earned points and migrate them to your C-Cube wallet
        </DashboardSubtitle>
      </DashboardHeader>

      {/* Total Stats Overview */}
      <StatsGrid>
        <StatCard>
          <StatValue>{totalPoints.toLocaleString()}</StatValue>
          <StatLabel>Total Points</StatLabel>
          <StatDescription>Ready for migration</StatDescription>
        </StatCard>
        <StatCard>
          <StatValue>{gamePoints.toLocaleString()}</StatValue>
          <StatLabel>Gaming Hub Points</StatLabel>
          <StatDescription>From all game categories</StatDescription>
        </StatCard>
        <StatCard>
          <StatValue>{storyPoints.toLocaleString()}</StatValue>
          <StatLabel>Story Mode Points</StatLabel>
          <StatDescription>From completed chapters</StatDescription>
        </StatCard>
        <StatCard>
          <StatValue>{achievementPoints.toLocaleString()}</StatValue>
          <StatLabel>Achievement Points</StatLabel>
          <StatDescription>From special accomplishments</StatDescription>
        </StatCard>
      </StatsGrid>

      {/* Gaming Hub Categories */}
      <SectionContainer>
        <SectionTitle>
          <SectionIcon>🎮</SectionIcon>
          Gaming Hub Categories
        </SectionTitle>
        <CategoryGrid>
          {gamingCategories.map((category, index) => (
            <CategoryCard key={index}>
              <CategoryHeader>
                <CategoryName>{category.name}</CategoryName>
                <CategoryPoints>{category.points} pts</CategoryPoints>
              </CategoryHeader>
              <ItemsList>
                {category.items.map((item, itemIndex) => (
                  <ItemRow key={itemIndex}>
                    <ItemName>{item.name}</ItemName>
                    <ItemPoints>+{item.points}</ItemPoints>
                  </ItemRow>
                ))}
              </ItemsList>
            </CategoryCard>
          ))}
        </CategoryGrid>
      </SectionContainer>

      {/* Story Mode Chapters */}
      <SectionContainer>
        <SectionTitle>
          <SectionIcon>📚</SectionIcon>
          Story Mode Chapters
        </SectionTitle>
        <ChapterGrid>
          {storyChapters.map((chapter, index) => (
            <ChapterCard key={index}>
              <ChapterHeader>
                <ChapterName>{chapter.name}</ChapterName>
                <ChapterStatus completed={chapter.completed}>
                  {chapter.completed ? 'Completed' : 'Locked'}
                </ChapterStatus>
              </ChapterHeader>
              <ChapterPoints>
                {chapter.completed ? `+${chapter.points} pts` : `${chapter.points} pts available`}
              </ChapterPoints>
            </ChapterCard>
          ))}
        </ChapterGrid>
      </SectionContainer>

      {/* Migrate Button */}
      <MigrateButtonContainer>
        <MigrateButton 
          onClick={handleMigrate}
          disabled={!walletData || totalPoints === 0}
        >
          {!walletData ? '🔒 Connect Wallet to Migrate' : 
           totalPoints === 0 ? '🎯 No Points to Migrate' :
           `🚀 Migrate ${totalPoints.toLocaleString()} Points`}
        </MigrateButton>
      </MigrateButtonContainer>
    </MigrateContainer>
  );
};

export default MigratePointDashboard;