#!/bin/bash

# Production Start Script for abbaslogic.com
# This script sets up and starts the production server

echo "🚀 Starting AI Resume Analyzer - Production Mode"
echo "================================================"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with your MongoDB URI"
    exit 1
fi

# Load production environment variables
export $(cat .env.production | grep -v '^#' | xargs)

echo "✅ Environment variables loaded"
echo "📦 Installing dependencies..."

# Install dependencies
npm install

echo "🔨 Building TypeScript..."

# Build the project
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed! dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully"
echo "🌐 Starting server on port $PORT..."

# Start the server
npm start
