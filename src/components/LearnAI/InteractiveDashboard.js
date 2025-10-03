import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const dashboardPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.02); opacity: 1; }
`;

const DashboardContainer = styled.div`
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #1a1a3e, #0d1117);
  position: relative;
  overflow: hidden;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 20px;
  padding: 80px 20px 20px 20px;
  height: 100%;
`;

const DashboardCard = styled.div`
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${dashboardPulse} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  }
`;

const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #10b981;
`;

const MetricLabel = styled.div`
  font-size: 1rem;
  opacity: 0.8;
  text-align: center;
`;

const ProgressRing = styled.div`
  width: 80px;
  height: 80px;
  border: 4px solid rgba(16, 185, 129, 0.2);
  border-top: 4px solid #10b981;
  border-radius: 50%;
  animation: spin 2s linear infinite;
  margin-bottom: 15px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const InteractiveDashboard = ({ userProgress, setUserProgress }) => {
  const [metrics, setMetrics] = useState({
    blocksLearned: userProgress?.totalProgress || 0,
    skillLevel: Math.floor((userProgress?.totalProgress || 0) / 10),
    streakDays: 7,
    certificationsEarned: Math.floor((userProgress?.totalProgress || 0) / 25),
    totalPoints: (userProgress?.totalProgress || 0) * 100,
    nextMilestone: 100 - ((userProgress?.totalProgress || 0) % 100)
  });

  const handleCardClick = (cardType) => {
    console.log(`Clicked on ${cardType} dashboard card`);
    // Add specific actions for each card
  };

  return (
    <DashboardContainer>
      <DashboardGrid>
        <DashboardCard delay="0s" onClick={() => handleCardClick('blocks')}>
          <MetricValue>{metrics.blocksLearned}</MetricValue>
          <MetricLabel>Blocks Learned</MetricLabel>
        </DashboardCard>

        <DashboardCard delay="0.5s" onClick={() => handleCardClick('level')}>
          <MetricValue>Level {metrics.skillLevel}</MetricValue>
          <MetricLabel>Skill Level</MetricLabel>
        </DashboardCard>

        <DashboardCard delay="1s" onClick={() => handleCardClick('streak')}>
          <MetricValue>{metrics.streakDays} 🔥</MetricValue>
          <MetricLabel>Day Streak</MetricLabel>
        </DashboardCard>

        <DashboardCard delay="1.5s" onClick={() => handleCardClick('certs')}>
          <MetricValue>{metrics.certificationsEarned} 🏆</MetricValue>
          <MetricLabel>Certifications</MetricLabel>
        </DashboardCard>

        <DashboardCard delay="2s" onClick={() => handleCardClick('points')}>
          <MetricValue>{metrics.totalPoints.toLocaleString()}</MetricValue>
          <MetricLabel>Total Points</MetricLabel>
        </DashboardCard>

        <DashboardCard delay="2.5s" onClick={() => handleCardClick('milestone')}>
          <ProgressRing />
          <MetricLabel>Next Milestone<br/>{metrics.nextMilestone} blocks away</MetricLabel>
        </DashboardCard>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default InteractiveDashboard;