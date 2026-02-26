#!/bin/bash

# BuKe MVP Setup Script

set -e

echo "🚀 Setting up BuKe MVP..."
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ Prerequisites OK"
echo ""

# Backend setup
echo "🔧 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Created virtual environment"
fi

source venv/bin/activate
pip install -r requirements.txt
echo "✅ Installed backend dependencies"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created .env file - PLEASE UPDATE WITH YOUR DATABASE URL"
else
    echo "✅ .env file exists"
fi

cd ..

# Frontend setup
echo "🔧 Setting up frontend..."
cd frontend

npm install
echo "✅ Installed frontend dependencies"

if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo "✅ Created .env.local file"
else
    echo "✅ .env.local file exists"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your Supabase DATABASE_URL"
echo "2. Run database migrations:"
echo "   psql \$DATABASE_URL -f backend/app/database/schema.sql"
echo ""
echo "3. Start backend:"
echo "   cd backend && python app/main.py"
echo ""
echo "4. Start frontend (in new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "🌐 Access the app at http://localhost:3000"
echo "📚 API docs at http://localhost:8000/docs"
