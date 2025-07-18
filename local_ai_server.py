#!/usr/bin/env python3
"""
Optimized image server for your custom SD15+IP-Adapter setup
Designed specifically for: C:\Users\Admin\Downloads\Story\fast_story_gen\app.py
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import subprocess
import os
import tempfile
import time
import base64
import shutil

app = Flask(__name__)
CORS(app)

# Configuration for your specific setup
VENV_PATH = r"C:\Users\Admin\Downloads\Story\fast_story_gen\venv"
APP_PY_PATH = r"C:\Users\Admin\Downloads\Story\fast_story_gen\app.py"
WORK_DIR = r"C:\Users\Admin\Downloads\Story\fast_story_gen"

# Ensure output directory exists
OUTPUT_DIR = "outputs/story_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def get_python_executable():
    """Get the correct Python executable path"""
    if os.path.exists(VENV_PATH):
        return os.path.join(VENV_PATH, "Scripts", "python.exe")
    return "python"

@app.route('/health')
def health():
    """Health check endpoint"""
    python_exe = get_python_executable()
    return jsonify({
        'status': 'ok', 
        'service': 'FAIryTale SD15+IP-Adapter Server',
        'python_path': python_exe,
        'working_directory': WORK_DIR,
        'venv_active': os.path.exists(VENV_PATH)
    })

@app.route('/generate', methods=['POST'])
def generate_image():
    """Generate image using your custom SD15+IP-Adapter setup"""
    try:
        description = request.form.get('description', '')
        genre = request.form.get('genre', 'fantasy')
        character_name = request.form.get('character_name', 'hero')
        character_image = request.form.get('character_image')
        
        if not description:
            return jsonify({'error': 'Description is required'}), 400
        
        # Create story prompt optimized for your app
        # Your app.py expects comma-separated story segments, so we'll create one segment
        # Also avoid Unicode characters to prevent Windows encoding issues
        story_prompt = description.encode('ascii', 'ignore').decode('ascii')
        
        # Clean up the prompt to avoid special characters that cause encoding issues
        import re
        story_prompt = re.sub(r'[^\x00-\x7F]+', ' ', story_prompt)
        
        # Further truncate if still too long to avoid 413 errors
        if len(story_prompt) > 150:
            story_prompt = story_prompt[:150].rsplit(' ', 1)[0] + "..."
        
        # Generate unique timestamp
        timestamp = int(time.time())
        
        # Prepare command
        python_exe = get_python_executable()
        cmd = [
            python_exe, APP_PY_PATH,
            '--story', story_prompt,
            '--character', character_name,
            '--output_dir', OUTPUT_DIR,
            '--seed', str(timestamp % 10000),
            '--steps', '25',  # Balanced quality/speed
            '--scale', '7.5'
        ]
        
        # Handle reference image for IP-Adapter
        temp_image_path = None
        if character_image:
            try:
                if character_image.startswith('data:image'):
                    # Decode base64 image
                    header, encoded = character_image.split(',', 1)
                    image_data = base64.b64decode(encoded)
                    temp_image_path = os.path.join(OUTPUT_DIR, f'reference_{timestamp}.png')
                    with open(temp_image_path, 'wb') as f:
                        f.write(image_data)
                    cmd.extend(['--reference', temp_image_path])
                    print(f"Using reference image: {temp_image_path}")
                else:
                    # Direct file path
                    if os.path.exists(character_image):
                        cmd.extend(['--reference', character_image])
            except Exception as e:
                print(f"Error processing reference image: {e}")
        
        print(f"Running command: {' '.join(cmd)}")
        print(f"Working directory: {WORK_DIR}")
        
        # Run the generation in your app's directory
        result = subprocess.run(
            cmd, 
            cwd=WORK_DIR,
            capture_output=True, 
            text=True, 
            timeout=180  # 3 minutes timeout
        )
        
        # Clean up temp files
        if temp_image_path and os.path.exists(temp_image_path):
            os.remove(temp_image_path)
        
        print(f"Return code: {result.returncode}")
        print(f"STDOUT: {result.stdout}")
        if result.stderr:
            print(f"STDERR: {result.stderr}")
        
        if result.returncode == 0:
            # Your app generates images as 00.png, 01.png, etc.
            full_output_path = os.path.join(WORK_DIR, OUTPUT_DIR)
            generated_files = []
            
            # Look for generated images (your app creates 00.png, 01.png, etc.)
            if os.path.exists(full_output_path):
                for filename in os.listdir(full_output_path):
                    if filename.endswith('.png') and filename[0].isdigit():
                        generated_files.append(filename)
            else:
                return jsonify({
                    'error': f'Output directory not found: {full_output_path}',
                    'working_dir': WORK_DIR,
                    'output_dir': OUTPUT_DIR
                }), 500
            
            if generated_files:
                # Use the first generated image
                generated_files.sort()
                source_file = generated_files[0]
                source_path = os.path.join(full_output_path, source_file)
                
                # Copy to our served directory with a web-friendly name
                web_filename = f"story_{timestamp}.png"
                web_path = os.path.join('generated_images', web_filename)
                os.makedirs('generated_images', exist_ok=True)
                shutil.copy2(source_path, web_path)
                
                # Get external URL
                external_host = os.getenv('EXTERNAL_HOST', request.host)
                image_url = f"http://{external_host}/images/{web_filename}"
                
                return jsonify({
                    'success': True,
                    'image_url': image_url,
                    'local_path': web_path,
                    'generated_files': len(generated_files)
                })
            else:
                return jsonify({
                    'error': 'No images found in output directory',
                    'output_dir': full_output_path,
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }), 500
        else:
            return jsonify({
                'error': 'Image generation failed',
                'return_code': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Image generation timed out (3 minutes)'}), 500
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/images/<filename>')
def serve_image(filename):
    """Serve generated images"""
    return send_from_directory('generated_images', filename)

@app.route('/test')
def test():
    """Test the setup"""
    python_exe = get_python_executable()
    
    # Test if we can access the app.py
    app_exists = os.path.exists(APP_PY_PATH)
    venv_exists = os.path.exists(VENV_PATH)
    
    return jsonify({
        'message': 'FAIryTale SD15+IP-Adapter Server Test',
        'python_executable': python_exe,
        'app_py_exists': app_exists,
        'app_py_path': APP_PY_PATH,
        'venv_exists': venv_exists,
        'venv_path': VENV_PATH,
        'working_directory': WORK_DIR,
        'output_directory': OUTPUT_DIR,
        'endpoints': {
            'health': '/health',
            'generate': '/generate (POST)',
            'images': '/images/<filename>',
            'test': '/test'
        }
    })

if __name__ == '__main__':
    print("="*60)
    print("FAIryTale SD15+IP-Adapter Image Server")
    print("="*60)
    print(f"App.py path: {APP_PY_PATH}")
    print(f"Virtual env: {VENV_PATH}")
    print(f"Working dir: {WORK_DIR}")
    print(f"Python exe: {get_python_executable()}")
    print("="*60)
    print("Starting server on http://0.0.0.0:5001")
    print("Test endpoint: http://localhost:5001/test")
    print()
    print("To expose to Replit:")
    print("1. Install ngrok: https://ngrok.com/download")
    print("2. Run: ngrok http 5001")
    print("3. Copy the HTTPS URL to Replit secrets as REMOTE_IMAGE_URL")
    print("="*60)
    
    app.run(host='0.0.0.0', port=5001, debug=True)