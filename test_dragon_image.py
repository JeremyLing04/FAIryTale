#!/usr/bin/env python3
"""Test script to verify character reference image functionality"""

import requests
import base64
import os

# Test with the dragon image you provided
def test_character_reference():
    # This would be the dragon image you uploaded
    dragon_image_path = "attached_assets/ai-generated-dragon-cartoon-on-transparent-background-free-png_1752861856736.webp"
    
    # Test data
    test_data = {
        'description': 'A friendly dragon flying through a magical forest with sparkling trees',
        'genre': 'fantasy',
        'character_name': 'Friendly Dragon'
    }
    
    # Test the remote image generation service
    url = 'https://8aea4376e3b0.ngrok-free.app/generate'
    
    # If the image file exists locally, send it
    if os.path.exists(dragon_image_path):
        with open(dragon_image_path, 'rb') as f:
            files = {'character_image': f}
            response = requests.post(url, data=test_data, files=files)
    else:
        # Just send the text data
        response = requests.post(url, data=test_data)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == '__main__':
    test_character_reference()