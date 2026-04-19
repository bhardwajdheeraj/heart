#!/bin/bash
set -e

echo "========================================="
echo "Installing Python dependencies..."
echo "========================================="
pip install --upgrade pip
pip install -r requirements.txt

echo "========================================="
echo "Build complete!"
echo "========================================="
