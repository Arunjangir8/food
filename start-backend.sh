#!/bin/bash

echo "Starting Food Delivery Backend..."
cd Backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please update the .env file with your database and API keys"
fi

# Start the server
echo "Starting server on port 5000..."
npm run dev