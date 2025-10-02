import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const storyFade = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const StoryContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460);
  position: relative;
  overflow-y: auto;
  padding: 20px;
`;

const StoryHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  animation: ${storyFade} 1s ease-out;
`;

const ChapterTitle = styled.h2`
  color: #10b981;
  font-size: 2rem;
  margin-bottom: 10px;
`;

const StoryProgress = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  width: ${props => props.progress || 0}%;
  transition: width 0.5s ease;
`;

const StoryContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
  animation: ${storyFade} 1s ease-out 0.3s both;
`;

const StoryText = styled.p`
  color: white;
  line-height: 1.8;
  font-size: 1.1rem;
  margin-bottom: 20px;
`;

const CharacterDialogue = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border-left: 4px solid #10b981;
  padding: 15px 20px;
  margin: 20px 0;
  border-radius: 0 10px 10px 0;
`;

const Speaker = styled.div`
  color: #10b981;
  font-weight: bold;
  margin-bottom: 8px;
`;

const ChoiceContainer = styled.div`
  margin-top: 30px;
  animation: ${storyFade} 1s ease-out 0.6s both;
`;

const ChoiceButton = styled.button`
  display: block;
  width: 100%;
  padding: 15px 20px;
  margin: 10px 0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2));
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.3));
    transform: translateX(5px);
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const NavButton = styled.button`
  padding: 12px 24px;
  background: rgba(16, 185, 129, 0.8);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: rgba(16, 185, 129, 1);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StoryModeLearning = ({ userProgress, setUserProgress }) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);

  const storyChapters = [
    {
      title: "The Genesis Block Mystery",
      content: "In the year 2008, a mysterious figure known only as Satoshi Nakamoto released a whitepaper that would change the world forever. You are a digital detective investigating the origins of blockchain technology.",
      dialogue: {
        speaker: "Digital Assistant",
        text: "Welcome, Detective! Your mission is to understand how the first blockchain was created. But first, what do you think makes a digital ledger secure?"
      },
      choices: [
        "Cryptographic hashing ensures data integrity",
        "Multiple copies prevent single points of failure",
        "Both cryptography and decentralization work together",
        "I need to learn more about these concepts"
      ],
      correctChoice: 2
    },
    {
      title: "The Mining Expedition",
      content: "Deep in the digital mines, you discover how new blocks are created. The process of mining isn't about pickaxes and hard hats—it's about solving complex mathematical puzzles.",
      dialogue: {
        speaker: "Miner Guide",
        text: "Each block contains transactions, but how do we ensure everyone agrees on the same version of the blockchain?"
      },
      choices: [
        "The longest chain rule - most work wins",
        "Everyone votes on the correct version",
        "A central authority decides",
        "Random selection process"
      ],
      correctChoice: 0
    },
    {
      title: "The Smart Contract Laboratory",
      content: "You've entered a futuristic laboratory where code comes to life. Smart contracts are self-executing programs that run exactly as programmed, without the need for intermediaries.",
      dialogue: {
        speaker: "Lab Scientist",
        text: "These contracts automatically execute when conditions are met. What makes them revolutionary?"
      },
      choices: [
        "They eliminate the need for lawyers",
        "They're stored on the blockchain and can't be changed",
        "They execute automatically without human intervention",
        "All of the above"
      ],
      correctChoice: 3
    }
  ];

  const currentStory = storyChapters[currentChapter];
  const progress = ((currentChapter + 1) / storyChapters.length) * 100;

  const handleChoiceSelect = (choiceIndex) => {
    setSelectedChoice(choiceIndex);
    
    // Update user progress
    if (choiceIndex === currentStory.correctChoice) {
      const newProgress = { ...userProgress };
      newProgress.totalProgress = (newProgress.totalProgress || 0) + 5;
      setUserProgress(newProgress);
    }
  };

  const handleNext = () => {
    if (currentChapter < storyChapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setSelectedChoice(null);
    }
  };

  const handlePrevious = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      setSelectedChoice(null);
    }
  };

  return (
    <StoryContainer>
      <StoryHeader>
        <ChapterTitle>Chapter {currentChapter + 1}: {currentStory.title}</ChapterTitle>
        <StoryProgress>
          <ProgressBar progress={progress} />
        </StoryProgress>
      </StoryHeader>

      <StoryContent>
        <StoryText>{currentStory.content}</StoryText>
        
        <CharacterDialogue>
          <Speaker>{currentStory.dialogue.speaker}:</Speaker>
          <div>{currentStory.dialogue.text}</div>
        </CharacterDialogue>

        <ChoiceContainer>
          {currentStory.choices.map((choice, index) => (
            <ChoiceButton
              key={index}
              onClick={() => handleChoiceSelect(index)}
              style={{
                background: selectedChoice === index 
                  ? (index === currentStory.correctChoice 
                     ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(34, 197, 94, 0.5))'
                     : 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3))')
                  : undefined
              }}
            >
              {choice}
              {selectedChoice === index && index === currentStory.correctChoice && " ✅"}
              {selectedChoice === index && index !== currentStory.correctChoice && " ❌"}
            </ChoiceButton>
          ))}
        </ChoiceContainer>
      </StoryContent>

      <NavigationButtons>
        <NavButton onClick={handlePrevious} disabled={currentChapter === 0}>
          ← Previous
        </NavButton>
        <NavButton 
          onClick={handleNext} 
          disabled={currentChapter === storyChapters.length - 1 || selectedChoice === null}
        >
          Next →
        </NavButton>
      </NavigationButtons>
    </StoryContainer>
  );
};

export default StoryModeLearning;