// API endpoint to fetch launched tokens from GitHub database
// Use global fetch (Node 18+) or require node-fetch as fallback
const fetch = globalThis.fetch || require('node-fetch');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'cyfocube';
    const REPO_NAME = 'C_DataBase';
    const TOKENS_FOLDER = 'tokens';

    if (!GITHUB_TOKEN) {
      console.error('GitHub token not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // First, get the list of files in the tokens folder
    const folderResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${TOKENS_FOLDER}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'C-Cube-Token-Launch'
        }
      }
    );

    if (!folderResponse.ok) {
      if (folderResponse.status === 404) {
        // Tokens folder doesn't exist yet, return empty array
        return res.status(200).json([]);
      }
      throw new Error(`GitHub API error: ${folderResponse.status} ${folderResponse.statusText}`);
    }

    const folderContents = await folderResponse.json();
    
    // Filter for JSON files only
    const jsonFiles = folderContents.filter(file => 
      file.type === 'file' && file.name.endsWith('.json')
    );

    console.log(`Found ${jsonFiles.length} JSON files in tokens folder:`, jsonFiles.map(f => f.name));

    if (jsonFiles.length === 0) {
      console.log('No JSON files found, returning empty array');
      return res.status(200).json([]);
    }

    // Fetch each token file
    const tokens = [];
    for (const file of jsonFiles) {
      try {
        const fileResponse = await fetch(file.download_url);
        if (fileResponse.ok) {
          const tokenData = await fileResponse.json();
          
                    // Add image URL if it exists
          const contractAddress = tokenData.contractAddress || tokenData.address;
          if (contractAddress) {
            // Convert to lowercase and remove 0x prefix to match image file naming
            const imageFileName = contractAddress.toLowerCase().replace('0x', '');
            tokenData.image = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/images/${imageFileName}.png`;
            console.log(`Added image URL for ${tokenData.tokenSymbol || tokenData.symbol}: ${tokenData.image}`);
          }
          
          tokens.push(tokenData);
        }
      } catch (error) {
        console.error(`Error fetching token file ${file.name}:`, error);
        // Continue with other files
      }
    }

    // Sort tokens by creation date (newest first)
    const sortedTokens = tokens.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.deployedAt || a.timestamp || 0);
      const dateB = new Date(b.createdAt || b.deployedAt || b.timestamp || 0);
      return dateB - dateA;
    });

    // Add rank and format for display
    const rankedTokens = sortedTokens.map((token, index) => {
      // Convert social media fields to socials array
      const socials = [];
      if (token.twitter && token.twitter.trim()) socials.push('T'); // Twitter
      if (token.website && token.website.trim()) socials.push('W'); // Website
      if (token.telegram && token.telegram.trim()) socials.push('G'); // Telegram

      return {
        rank: index + 1,
        symbol: token.tokenSymbol || token.symbol,
        contractAddress: token.contractAddress || token.address,
        tokenName: token.tokenName || token.name,
        initialSupply: token.initialSupply || token.totalSupply,
        network: token.network || 'BSC',
        image: token.image,
        bgColor: token.bgColor || '#' + Math.floor(Math.random()*16777215).toString(16),
        description: token.description || `${token.tokenName || token.name} (${token.tokenSymbol || token.symbol}) - BSC Token`,
        socials: socials,
        socialLinks: {
          twitter: token.twitter,
          website: token.website,
          telegram: token.telegram
        },
        daysCreated: token.createdAt || token.deployedAt ? 
          Math.floor((Date.now() - new Date(token.createdAt || token.deployedAt).getTime()) / (1000 * 60 * 60 * 24)) :
          0
      };
    });

    console.log(`Returning ${rankedTokens.length} tokens`);
    res.status(200).json(rankedTokens);

  } catch (error) {
    console.error('Error fetching launched tokens:', error);
    res.status(500).json({ 
      error: 'Failed to fetch launched tokens',
      details: error.message 
    });
  }
}

module.exports = handler;