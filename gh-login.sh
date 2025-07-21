#!/bin/bash
echo "Starting GitHub CLI authentication..."
echo ""
echo "When prompted:"
echo "1. Choose 'GitHub.com'"
echo "2. Choose 'HTTPS' for preferred protocol"
echo "3. Choose 'Login with a web browser'"
echo "4. Copy the one-time code shown"
echo "5. Press Enter to open github.com in your browser"
echo "6. Paste the code and authorize"
echo ""
echo "Press Enter to continue..."
read -r
gh auth login