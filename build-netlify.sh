#!/bin/bash

# Run the Vite build
npm run build

# Copy the redirects file to the dist folder
cp _redirects dist/

echo "Build completed for Netlify deployment!"