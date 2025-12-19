#!/bin/bash

# Test Environment Setup Script for AI Exam Evaluator
# This script prepares the environment for TestSprite testing

echo "🚀 Setting up AI Exam Evaluator test environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please update .env with your Supabase credentials"
else
    echo "✅ .env file exists"
fi

# Install script dependencies
echo "📦 Installing script dependencies..."
cd scripts
npm install
cd ..

# Setup test admin user
echo "👤 Setting up test admin user..."
node scripts/setup-test-admin.js

# Kill any existing dev server on port 5173
echo "🔄 Checking for existing dev server..."
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5173 is in use. Killing existing process..."
    kill -9 $(lsof -Pi :5173 -sTCP:LISTEN -t) 2>/dev/null || true
    sleep 2
fi

# Start the development server in background
echo "🚀 Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Check if server is running
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Development server is running on http://localhost:5173"
    echo "🎉 Test environment setup complete!"
    echo ""
    echo "📋 Test Credentials:"
    echo "   Email: admin@testsprite.com"
    echo "   Password: TestSprite123!"
    echo ""
    echo "🧪 Ready for TestSprite testing!"
    echo "   Server PID: $DEV_SERVER_PID"
    echo "   To stop server: kill $DEV_SERVER_PID"
else
    echo "❌ Failed to start development server"
    kill $DEV_SERVER_PID 2>/dev/null || true
    exit 1
fi