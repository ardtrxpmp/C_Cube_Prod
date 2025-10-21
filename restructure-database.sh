#!/bin/bash

# Script to restructure the C_DataBase repository
# This script moves story-mode folder from questions/ to root level

echo "🔄 Database Restructuring Script"
echo "This script will move story-mode folder from questions/ to root level"
echo ""

# Check if we're in the right directory
if [ ! -d "../C_DataBase" ]; then
    echo "❌ C_DataBase repository not found in parent directory"
    echo "Please clone the C_DataBase repository first:"
    echo "git clone https://github.com/cyfocube/C_DataBase.git ../C_DataBase"
    exit 1
fi

cd ../C_DataBase

echo "📁 Current structure:"
ls -la

echo ""
echo "🔍 Checking if questions/story-mode exists..."
if [ ! -d "questions/story-mode" ]; then
    echo "❌ questions/story-mode folder not found"
    exit 1
fi

echo "✅ Found questions/story-mode folder"
echo ""

# Move the story-mode folder to root level
echo "📦 Moving story-mode folder to root level..."
mv questions/story-mode ./story-mode

echo "✅ Moved story-mode folder successfully"
echo ""

echo "📁 New structure:"
ls -la

echo ""
echo "📂 Contents of story-mode folder:"
ls -la story-mode/

echo ""
echo "🔧 Adding changes to git..."
git add .

echo "💾 Committing changes..."
git commit -m "Restructure: Move story-mode folder from questions/ to root level

- Moved questions/story-mode/ to story-mode/
- This enables direct access via /story-mode/questions.json
- Matches the same structure as gaming-hub folder
- Updates database path structure for better organization"

echo "🚀 Pushing changes to GitHub..."
git push origin main

echo ""
echo "✅ Database restructuring complete!"
echo "Story Mode is now accessible at: https://raw.githubusercontent.com/cyfocube/C_DataBase/main/story-mode/"
echo ""
echo "🧪 Testing new path..."
sleep 3
curl -s -o /dev/null -w "Story Mode path status: %{http_code}\n" "https://raw.githubusercontent.com/cyfocube/C_DataBase/main/story-mode/questions.json"