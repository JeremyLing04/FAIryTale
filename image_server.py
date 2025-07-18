#!/usr/bin/env python3
"""
Simple HTTP server for Stable Diffusion image generation
Run this on your local PC to provide image generation services to the deployed Replit app
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import subprocess
import os
import tempfile
import time
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests from Replit

# Ensure generated_images directory exists
os.makedirs('generated_images', exist_ok=True)

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'FAIryTale Image Generator'})

@app.route('/generate', methods=['POST'])
def generate_image():
    """Generate an image using Stable Diffusion"""
    try:
        description = request.form.get('description')
        genre = request.form.get('genre', 'cartoon')
        character_image = request.form.get('character_image')
        
        if not description:
            return jsonify({'error': 'Description is required'}), 400
        
        # Generate unique filename
        timestamp = int(time.time())
        output_file = f"story_{timestamp}.png"
        output_path = os.path.join('generated_images', output_file)
        
        # Build command for your custom app.py script
        cmd = [
            'python', 'app.py',
            '--story', description,
            '--output_dir', 'generated_images',
            '--seed', str(timestamp % 10000),  # Use timestamp for unique seeds
            '--steps', '20',  # Faster generation for web use
            '--scale', '7.5'
        ]
        
        # Add character info if available
        character_info = request.form.get('character_name', '')
        if character_info:
            cmd.extend(['--character', character_info])
        
        # Handle character reference image if provided
        temp_image_path = None
        if character_image:
            if character_image.startswith('data:image'):
                # Handle base64 image
                try:
                    header, encoded = character_image.split(',', 1)
                    image_data = base64.b64decode(encoded)
                    temp_image_path = os.path.join('generated_images', f'temp_{timestamp}.png')
                    with open(temp_image_path, 'wb') as f:
                        f.write(image_data)
                    cmd.extend(['--reference', temp_image_path])
                except Exception as e:
                    print(f"Error processing character image: {e}")
            else:
                # Handle URL or file path
                cmd.extend(['--reference', character_image])
        
        print(f"Running command: {' '.join(cmd)}")
        
        # Run the image generation
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        # Clean up temporary files
        if temp_image_path and os.path.exists(temp_image_path):
            os.remove(temp_image_path)
        
        if result.returncode == 0:
            # Your app.py generates multiple images (00.png, 01.png, etc.)
            # Find the first generated image
            generated_files = [f for f in os.listdir('generated_images') if f.startswith('00.png')]
            
            if generated_files:
                # Rename the first image to our expected filename
                source_path = os.path.join('generated_images', generated_files[0])
                if os.path.exists(source_path):
                    os.rename(source_path, output_path)
                
                # Get the external URL for the image
                external_host = os.getenv('EXTERNAL_HOST', request.host)
                image_url = f"http://{external_host}/images/{output_file}"
                
                return jsonify({
                    'success': True,
                    'image_url': image_url,
                    'local_path': output_path
                })
            else:
                return jsonify({'error': 'No images were generated'}), 500
        else:
            error_msg = result.stderr or "Image generation failed"
            print(f"Generation failed: {error_msg}")
            return jsonify({'error': error_msg}), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Image generation timed out'}), 500
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/images/<filename>')
def serve_image(filename):
    """Serve generated images"""
    return send_from_directory('generated_images', filename)

@app.route('/test')
def test():
    """Test endpoint"""
    return jsonify({
        'message': 'FAIryTale Image Server is running!',
        'endpoints': {
            'health': '/health',
            'generate': '/generate (POST)',
            'images': '/images/<filename>',
            'test': '/test'
        }
    })

if __name__ == '__main__':
    print("Starting FAIryTale Image Generation Server...")
    print("Make sure you have:")
    print("1. Python dependencies installed: pip install flask flask-cors")
    print("2. Your app.py script in the same directory")
    print("3. Stable Diffusion setup working locally")
    print()
    print("Server will be available at:")
    print("- Local: http://localhost:5001")
    print("- Network: http://0.0.0.0:5001")
    print()
    print("Use ngrok to expose to internet:")
    print("ngrok http 5001")
    print()
    
    app.run(host='0.0.0.0', port=5001, debug=True)