#!/bin/bash

# One-Click Setup Script for Kage

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Kage Setup...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js (version 18+) from https://nodejs.org/"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}Warning: Node.js version is $NODE_VERSION. Version 18+ is recommended.${NC}"
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    exit 1
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies via npm..."
    npm install
else
    echo -e "${GREEN}Dependencies already installed.${NC}"
fi

# Parse flags
INSTALL_ONLY=false
X11_MODE=false

for arg in "$@"
do
    case $arg in
        --install-only)
        INSTALL_ONLY=true
        shift
        ;;
        --x11)
        X11_MODE=true
        shift
        ;;
    esac
done

if [ "$INSTALL_ONLY" = true ]; then
    echo -e "${GREEN}Setup complete. Run 'npm start' to launch Kage.${NC}"
    exit 0
fi

echo -e "${GREEN}Launching Kage...${NC}"
if [ "$X11_MODE" = true ]; then
    echo "Using X11 fallback mode..."
    npm run start:x11
else
    npm start
fi
