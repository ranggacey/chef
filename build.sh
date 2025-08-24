#!/bin/bash
echo "Installing dependencies..."
npm install
echo "Building project..."
node ./node_modules/vite/bin/vite.js build 