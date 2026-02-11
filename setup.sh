#!/bin/bash

echo "🌍 Climate Globe Setup"
echo "====================="
echo ""

echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🚀 To start the development server, run:"
    echo "   npm run dev"
    echo ""
    echo "Then open http://localhost:3000 in your browser"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the errors above."
    echo ""
fi
