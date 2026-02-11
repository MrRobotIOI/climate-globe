#!/bin/bash

echo "🌍 Climate Globe Full-Stack Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    echo "Please install Python 3.9 or higher"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher"
    exit 1
fi

echo -e "${GREEN}✅ Python and Node.js found${NC}"
echo ""

# Backend Setup
echo "📦 Setting up Python Backend..."
echo "--------------------------------"
cd backend || exit

echo "Creating Python virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "Installing Python dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend setup complete!${NC}"
else
    echo -e "${RED}❌ Backend setup failed${NC}"
    exit 1
fi

cd ..
echo ""

# Frontend Setup
echo "📦 Setting up Next.js Frontend..."
echo "--------------------------------"

echo "Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend setup complete!${NC}"
else
    echo -e "${RED}❌ Frontend setup failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=================="
echo ""
echo -e "${YELLOW}To run the application:${NC}"
echo ""
echo "1️⃣  Start the backend (Terminal 1):"
echo "   cd backend"
echo "   source venv/bin/activate  # Windows: venv\\Scripts\\activate"
echo "   python main.py"
echo ""
echo "2️⃣  Start the frontend (Terminal 2):"
echo "   npm run dev"
echo ""
echo "3️⃣  Open your browser:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000/docs"
echo ""
