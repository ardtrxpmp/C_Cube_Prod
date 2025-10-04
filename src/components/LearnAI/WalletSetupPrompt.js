import React, { useState } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

// Styled components matching C-Cube wallet design
const SetupContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ConsoleFrame = styled.div`
  max-width: 600px;
  width: 100%;
  border: 2px solid #00cc33;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  background-color: rgba(0, 0, 0, 0.8);
  box-shadow: 0 0 30px rgba(0, 204, 51, 0.25);
  
  &::before {
    content: "C-CUBE WALLET SETUP v1.3.37";
    position: absolute;
    top: -12px;
    left: 20px;
    background-color: #0f172a;
    color: #00cc33;
    padding: 2px 10px;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    letter-spacing: 1px;
  }
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 204, 51, 0.03) 0px,
      rgba(0, 204, 51, 0.03) 1px,
      transparent 1px,
      transparent 2px
    );
  }
`;

const Title = styled.h2`
  color: #00cc33;
  margin-bottom: 1.5rem;
  text-align: center;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(0, 204, 51, 0.5);
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 204, 51, 0.3);
`;

const Tab = styled.button`
  flex: 1;
  background: none;
  border: none;
  padding: 1rem;
  color: ${({ active }) => active ? '#00cc33' : '#ffffff'};
  border-bottom: ${({ active }) => active ? '2px solid #00cc33' : 'none'};
  font-weight: ${({ active }) => active ? 'bold' : 'normal'};
  font-family: 'Courier New', monospace;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: #00cc33;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  color: #00cc33;
  margin-bottom: 0.5rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid ${({ error }) => error ? '#ff4444' : 'rgba(0, 204, 51, 0.3)'};
  background-color: rgba(0, 0, 0, 0.5);
  color: #00cc33;
  font-family: 'Courier New', monospace;
  box-sizing: border-box;

  &:focus {
    border-color: #00cc33;
    outline: none;
    box-shadow: 0 0 10px rgba(0, 204, 51, 0.3);
  }

  &::placeholder {
    color: rgba(0, 204, 51, 0.5);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid ${({ error }) => error ? '#ff4444' : 'rgba(0, 204, 51, 0.3)'};
  background-color: rgba(0, 0, 0, 0.5);
  color: #00cc33;
  min-height: 100px;
  font-family: 'Courier New', monospace;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    border-color: #00cc33;
    outline: none;
    box-shadow: 0 0 10px rgba(0, 204, 51, 0.3);
  }

  &::placeholder {
    color: rgba(0, 204, 51, 0.5);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  input[type="checkbox"] {
    margin-right: 0.5rem;
    accent-color: #00cc33;
  }
  
  label {
    margin-bottom: 0;
    cursor: pointer;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #00cc33, #009926);
  border: none;
  border-radius: 4px;
  color: black;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    background: linear-gradient(135deg, #00ff40, #00cc33);
    box-shadow: 0 0 20px rgba(0, 204, 51, 0.5);
  }

  &:disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  margin-top: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: #00cc33;
  margin-top: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  text-align: center;
`;

const InfoText = styled.p`
  color: rgba(0, 204, 51, 0.8);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: 1px solid rgba(0, 204, 51, 0.5);
  color: #00cc33;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 204, 51, 0.1);
    border-color: #00cc33;
  }
`;

const WalletInfo = styled.div`
  background: rgba(0, 204, 51, 0.1);
  border: 1px solid rgba(0, 204, 51, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const WalletAddress = styled.div`
  color: #00cc33;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const WalletLabel = styled.div`
  color: rgba(0, 204, 51, 0.8);
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
`;

const WalletDetailsContainer = styled.div`
  background: rgba(255, 204, 51, 0.1);
  border: 2px solid rgba(255, 204, 51, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
`;

const WarningText = styled.div`
  color: #ffcc33;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
  text-transform: uppercase;
`;

const SecurityWarning = styled.div`
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 4px;
  padding: 0.75rem;
  margin: 1rem 0;
  color: #ff4444;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const PrivateKeyContainer = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 204, 51, 0.3);
  border-radius: 4px;
  padding: 0.75rem;
  margin: 0.5rem 0;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: rgba(0, 204, 51, 0.9);
`;

const SeedPhraseContainer = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 204, 51, 0.3);
  border-radius: 4px;
  padding: 0.75rem;
  margin: 0.5rem 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: rgba(0, 204, 51, 0.9);
  line-height: 1.6;
`;

const ContinueButton = styled(Button)`
  background: linear-gradient(135deg, #ffcc33, #ff9900);
  color: black;
  
  &:hover {
    background: linear-gradient(135deg, #ffdd44, #ffaa00);
    box-shadow: 0 0 20px rgba(255, 204, 51, 0.5);
  }
`;

const WalletSetupPrompt = ({ onWalletSetup, onClose, existingWallet }) => {
  const [activeTab, setActiveTab] = useState(existingWallet ? 'view' : 'create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [newWalletData, setNewWalletData] = useState(null);
  
  // Create wallet states
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Import wallet states
  const [privateKey, setPrivateKey] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  const validatePassword = () => {
    if (usePassword && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (usePassword && password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleCreateWallet = async () => {
    setError('');
    setSuccess('');
    
    if (!validatePassword()) return;
    
    setLoading(true);
    
    try {
      // Create new wallet
      const wallet = ethers.Wallet.createRandom();
      
      const walletData = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
        isEncrypted: usePassword,
        password: usePassword ? password : null
      };
      
      // Store wallet data and show details instead of immediately logging in
      setNewWalletData(walletData);
      setShowWalletDetails(true);
      setSuccess('Wallet created successfully!');
      
    } catch (err) {
      setError('Failed to create wallet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmWalletDetails = () => {
    // User has seen their wallet details, now log them in
    onWalletSetup(newWalletData);
  };

  const handleImportWallet = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      let wallet;
      
      if (activeTab === 'privateKey') {
        if (!privateKey.trim()) {
          throw new Error('Please enter a private key');
        }
        wallet = new ethers.Wallet(privateKey.trim());
      } else if (activeTab === 'mnemonic') {
        if (!mnemonic.trim()) {
          throw new Error('Please enter a recovery phrase');
        }
        wallet = ethers.Wallet.fromMnemonic(mnemonic.trim());
      }
      
      const walletData = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase || null,
        isImported: true,
        isEncrypted: false
      };
      
      setSuccess('Wallet imported successfully! Welcome to C-Cube AI Tutor.');
      
      // Delay to show success message
      setTimeout(() => {
        onWalletSetup(walletData);
      }, 2000);
      
    } catch (err) {
      setError('Failed to import wallet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show wallet details after creation (before login)
  if (showWalletDetails && newWalletData) {
    return (
      <SetupContainer>
        <ConsoleFrame>
          <Title>🔐 WALLET CREATED SUCCESSFULLY</Title>
          
          <WarningText>⚠️ IMPORTANT - SAVE THIS INFORMATION ⚠️</WarningText>
          
          <SecurityWarning>
            <strong>CRITICAL SECURITY NOTICE:</strong><br/>
            • Write down your seed phrase and private key on paper<br/>
            • Store them in a safe, secure location<br/>
            • NEVER share them with anyone<br/>
            • You need this to recover your wallet if you lose access<br/>
            • C-Cube cannot recover your wallet without this information
          </SecurityWarning>

          <WalletDetailsContainer>
            <WalletLabel>YOUR WALLET ADDRESS:</WalletLabel>
            <PrivateKeyContainer>{newWalletData.address}</PrivateKeyContainer>

            <WalletLabel>YOUR RECOVERY PHRASE (12 WORDS - KEEP SECRET):</WalletLabel>
            <SeedPhraseContainer>{newWalletData.mnemonic}</SeedPhraseContainer>

            <WalletLabel>YOUR PRIVATE KEY (KEEP SECRET):</WalletLabel>
            <PrivateKeyContainer>{newWalletData.privateKey}</PrivateKeyContainer>
          </WalletDetailsContainer>

          <InfoText style={{ color: 'rgba(255, 204, 51, 0.9)', textAlign: 'center' }}>
            ✅ I have safely written down my seed phrase and private key
          </InfoText>

          <ContinueButton onClick={handleConfirmWalletDetails}>
            CONTINUE TO AI TUTOR
          </ContinueButton>
        </ConsoleFrame>
      </SetupContainer>
    );
  }

  return (
    <SetupContainer>
      <ConsoleFrame>
        <Title>🔐 WALLET SETUP REQUIRED</Title>
        
        {onClose && (
          <CloseButton onClick={onClose}>
            ✕ CLOSE
          </CloseButton>
        )}

        <InfoText>
          {existingWallet 
            ? "You have an existing C-Cube wallet. You can connect your current wallet, or create/import a different one for the AI Tutor."
            : "Welcome to C-Cube AI Tutor! To access the learning features, you need to set up a wallet first. Choose to create a new wallet or import an existing one."
          }
        </InfoText>

        <TabContainer>
          {existingWallet && (
            <Tab 
              active={activeTab === 'view'} 
              onClick={() => setActiveTab('view')}
            >
              Current Wallet
            </Tab>
          )}
          <Tab 
            active={activeTab === 'create'} 
            onClick={() => setActiveTab('create')}
          >
            Create New
          </Tab>
          <Tab 
            active={activeTab === 'privateKey'} 
            onClick={() => setActiveTab('privateKey')}
          >
            Import Private Key
          </Tab>
          <Tab 
            active={activeTab === 'mnemonic'} 
            onClick={() => setActiveTab('mnemonic')}
          >
            Import Recovery Phrase
          </Tab>
        </TabContainer>

        {activeTab === 'view' && existingWallet && (
          <>
            <WalletInfo>
              <WalletLabel>WALLET ADDRESS:</WalletLabel>
              <WalletAddress>{existingWallet.address}</WalletAddress>
              
              <WalletLabel>STATUS:</WalletLabel>
              <WalletAddress>
                {existingWallet.isImported ? '📥 IMPORTED WALLET' : '🆕 CREATED WALLET'} 
                {existingWallet.isEncrypted ? ' • 🔒 ENCRYPTED' : ' • 🔓 UNENCRYPTED'}
              </WalletAddress>

              {existingWallet.mnemonic && (
                <>
                  <WalletLabel>RECOVERY PHRASE (KEEP SECRET):</WalletLabel>
                  <WalletAddress style={{ fontSize: '0.8rem', color: 'rgba(0, 204, 51, 0.9)' }}>
                    {existingWallet.mnemonic}
                  </WalletAddress>
                </>
              )}
            </WalletInfo>

            <InfoText style={{ color: 'rgba(255, 204, 51, 0.8)' }}>
              ⚠️ This wallet is used for AI Tutor learning progress only. For real transactions, use the main C-Cube wallet.
            </InfoText>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Button 
                onClick={() => onWalletSetup(existingWallet)}
                style={{ 
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderColor: '#10b981'
                }}
              >
                🔗 CONNECT THIS WALLET
              </Button>
              
              {onClose && (
                <Button onClick={onClose}>
                  ✕ CANCEL
                </Button>
              )}
            </div>
          </>
        )}

        {activeTab === 'create' && (
          <>
            <CheckboxContainer>
              <input
                type="checkbox"
                id="usePassword"
                checked={usePassword}
                onChange={(e) => setUsePassword(e.target.checked)}
              />
              <Label htmlFor="usePassword">Encrypt wallet with password</Label>
            </CheckboxContainer>
            
            {usePassword && (
              <>
                <FormGroup>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 8 characters)"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                </FormGroup>
              </>
            )}
            
            <Button 
              onClick={handleCreateWallet} 
              disabled={loading}
            >
              {loading ? 'Creating Wallet...' : 'Create New Wallet'}
            </Button>
          </>
        )}

        {activeTab === 'privateKey' && (
          <>
            <FormGroup>
              <Label htmlFor="privateKey">Private Key</Label>
              <Input
                id="privateKey"
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your private key (0x...)"
              />
            </FormGroup>
            
            <Button 
              onClick={handleImportWallet} 
              disabled={loading || !privateKey.trim()}
            >
              {loading ? 'Importing Wallet...' : 'Import Wallet'}
            </Button>
          </>
        )}

        {activeTab === 'mnemonic' && (
          <>
            <FormGroup>
              <Label htmlFor="mnemonic">Recovery Phrase</Label>
              <TextArea
                id="mnemonic"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="Enter your 12 or 24 word recovery phrase separated by spaces"
              />
            </FormGroup>
            
            <Button 
              onClick={handleImportWallet} 
              disabled={loading || !mnemonic.trim()}
            >
              {loading ? 'Importing Wallet...' : 'Import Wallet'}
            </Button>
          </>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
      </ConsoleFrame>
    </SetupContainer>
  );
};

export default WalletSetupPrompt;