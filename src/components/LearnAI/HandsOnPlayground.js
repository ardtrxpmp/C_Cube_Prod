import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideUp = keyframes`
  0% { transform: translateY(100px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const codeGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
`;

const PlaygroundContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0c1622, #1a1a3e);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  padding-top: 60px;
`;

const PlaygroundHeader = styled.div`
  background: rgba(16, 185, 129, 0.1);
  padding: 20px;
  border-bottom: 1px solid rgba(16, 185, 129, 0.3);
  animation: ${slideUp} 0.8s ease-out;
`;

const PlaygroundTitle = styled.h2`
  color: #10b981;
  margin: 0;
  font-size: 1.5rem;
`;

const PlaygroundContent = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
  animation: ${slideUp} 1s ease-out 0.2s both;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CodeEditor = styled.div`
  background: #1e1e1e;
  border-radius: 15px;
  overflow: hidden;
  border: 2px solid rgba(16, 185, 129, 0.3);
  animation: ${codeGlow} 3s ease-in-out infinite;
`;

const CodeHeader = styled.div`
  background: #2d2d2d;
  padding: 12px 16px;
  color: #10b981;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CodeArea = styled.textarea`
  width: 100%;
  height: 400px;
  background: #1e1e1e;
  border: none;
  color: #f8f8f2;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  padding: 20px;
  resize: none;
  outline: none;
  line-height: 1.5;

  &::placeholder {
    color: #666;
  }
`;

const RunButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
`;

const OutputPanel = styled.div`
  background: #0d1117;
  border-radius: 15px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  overflow: hidden;
`;

const OutputHeader = styled.div`
  background: #161b22;
  padding: 12px 16px;
  color: #3b82f6;
  font-weight: bold;
`;

const OutputArea = styled.div`
  padding: 20px;
  color: #e6e6e6;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
`;

const TutorialSidebar = styled.div`
  position: absolute;
  right: 20px;
  top: 100px;
  width: 300px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  animation: ${slideUp} 1.2s ease-out 0.4s both;

  @media (max-width: 1200px) {
    display: none;
  }
`;

const TutorialStep = styled.div`
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(16, 185, 129, 0.2);
  }
`;

const ExampleButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const ExampleButton = styled.button`
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.4);
  }
`;

const HandsOnPlayground = ({ userProgress, setUserProgress }) => {
  const [code, setCode] = useState('// Welcome to the Blockchain Playground!\n// Try creating a simple block structure\n\nclass Block {\n  constructor(data, previousHash) {\n    this.timestamp = new Date().toISOString();\n    this.data = data;\n    this.previousHash = previousHash;\n    this.hash = this.calculateHash();\n  }\n\n  calculateHash() {\n    // Simple hash simulation\n    return Math.random().toString(36).substring(2, 15);\n  }\n}\n\n// Create your first block!\nconst genesisBlock = new Block("Genesis Block", "0");\nconsole.log("Genesis Block:", genesisBlock);');
  
  const [output, setOutput] = useState('Click "Run Code" to execute your blockchain code!\n\n💡 Try the examples on the left to get started.');

  const [currentTutorial, setCurrentTutorial] = useState(0);

  const codeExamples = {
    'Simple Block': `class Block {
  constructor(data, previousHash) {
    this.timestamp = new Date().toISOString();
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return Math.random().toString(36).substring(2, 15);
  }
}

const block = new Block("Hello Blockchain!", "0");
console.log("Block created:", block);`,

    'Blockchain': `class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block("Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }
}

const blockchain = new Blockchain();
blockchain.addBlock(new Block("Transaction 1"));
blockchain.addBlock(new Block("Transaction 2"));
console.log("Blockchain:", blockchain.chain);`,

    'Hash Validation': `function validateChain(blockchain) {
  for (let i = 1; i < blockchain.chain.length; i++) {
    const currentBlock = blockchain.chain[i];
    const previousBlock = blockchain.chain[i - 1];

    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }
  }
  return true;
}

const isValid = validateChain(blockchain);
console.log("Is blockchain valid?", isValid);`
  };

  const tutorialSteps = [
    "1. Create a Block class with timestamp, data, and hash",
    "2. Implement a simple hash calculation method",
    "3. Link blocks together using previous hash",
    "4. Build a Blockchain class to manage the chain",
    "5. Add validation to ensure chain integrity",
    "6. Experiment with modifying blocks and see what happens!"
  ];

  const runCode = () => {
    try {
      // Create a safe execution environment
      let consoleOutput = '';
      const mockConsole = {
        log: (...args) => {
          consoleOutput += args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ') + '\n';
        }
      };

      // Execute code in a controlled environment
      const func = new Function('console', 'Block', 'Blockchain', code);
      
      // Define Block and Blockchain classes for the execution context
      class Block {
        constructor(data, previousHash = '') {
          this.timestamp = new Date().toISOString();
          this.data = data;
          this.previousHash = previousHash;
          this.hash = this.calculateHash();
        }

        calculateHash() {
          return Math.random().toString(36).substring(2, 15);
        }
      }

      class Blockchain {
        constructor() {
          this.chain = [this.createGenesisBlock()];
        }

        createGenesisBlock() {
          return new Block("Genesis Block", "0");
        }

        getLatestBlock() {
          return this.chain[this.chain.length - 1];
        }

        addBlock(newBlock) {
          newBlock.previousHash = this.getLatestBlock().hash;
          newBlock.hash = newBlock.calculateHash();
          this.chain.push(newBlock);
        }
      }

      func(mockConsole, Block, Blockchain);
      
      setOutput(consoleOutput || 'Code executed successfully! 🎉');
      
      // Update progress
      const newProgress = { ...userProgress };
      newProgress.totalProgress = (newProgress.totalProgress || 0) + 3;
      setUserProgress(newProgress);
      
    } catch (error) {
      setOutput(`Error: ${error.message}\n\n💡 Check your syntax and try again!`);
    }
  };

  const loadExample = (exampleName) => {
    setCode(codeExamples[exampleName]);
    setOutput('Example loaded! Click "Run Code" to execute.');
  };

  return (
    <PlaygroundContainer>
      <PlaygroundHeader>
        <PlaygroundTitle>🔧 Hands-On Blockchain Playground</PlaygroundTitle>
      </PlaygroundHeader>

      <ExampleButtons>
        {Object.keys(codeExamples).map(example => (
          <ExampleButton key={example} onClick={() => loadExample(example)}>
            Try: {example}
          </ExampleButton>
        ))}
      </ExampleButtons>

      <PlaygroundContent>
        <CodeEditor>
          <CodeHeader>
            <span>📝 Code Editor</span>
            <RunButton onClick={runCode}>▶ Run Code</RunButton>
          </CodeHeader>
          <CodeArea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your blockchain code here..."
          />
        </CodeEditor>

        <OutputPanel>
          <OutputHeader>📤 Output Console</OutputHeader>
          <OutputArea>{output}</OutputArea>
        </OutputPanel>
      </PlaygroundContent>

      <TutorialSidebar>
        <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '15px' }}>
          🎯 Tutorial Steps
        </div>
        {tutorialSteps.map((step, index) => (
          <TutorialStep
            key={index}
            onClick={() => setCurrentTutorial(index)}
            style={{
              background: currentTutorial === index 
                ? 'rgba(16, 185, 129, 0.3)' 
                : 'rgba(255, 255, 255, 0.05)'
            }}
          >
            {step}
          </TutorialStep>
        ))}
      </TutorialSidebar>
    </PlaygroundContainer>
  );
};

export default HandsOnPlayground;