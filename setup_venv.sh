#!/bin/bash

echo "Setting up Python virtual environment for StoryMagic image generation..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r python_requirements.txt

echo "Virtual environment setup complete!"
echo "To activate the virtual environment manually, run: source venv/bin/activate"
echo "The image generator will automatically use the venv when it exists."