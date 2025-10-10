#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 BSC Testnet Token Creator Setup');
console.log('=' .repeat(40));

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created!');
    console.log('⚠️  Please edit .env file with your actual values before deploying.');
} else {
    console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Dependencies installed successfully!');
} catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
}

console.log('\n🎯 Setup Complete!');
console.log('\nNext steps:');
console.log('1. Edit .env file with your wallet details');
console.log('2. Get testnet BNB: https://testnet.binance.org/faucet-smart');
console.log('3. Run: npm run deploy');
console.log('\n💡 Important: Never share your private key or commit .env file!');