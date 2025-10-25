import React from 'react';
import QAInterface from './QAInterface';

const EnhancedChatInterface = ({ userProgress, setUserProgress }) => {
  return (
    <QAInterface 
      userProgress={userProgress} 
      setUserProgress={setUserProgress} 
    />
  );
};

export default EnhancedChatInterface;
