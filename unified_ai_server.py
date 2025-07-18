#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Unified AI server for FAIryTale - Handles both Ollama and SD15+IP-Adapter on same port
Designed for: C:/Users/Admin/Downloads/Story/fast_story_gen/
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import subprocess
import os
import tempfile
import time
import base64
import shutil
import json
import threading
import requests
from urllib.parse import urljoin

app = Flask(__name__)
CORS(app)

# Configuration for your specific setup
VENV_PATH = "C:/Users/Admin/Downloads/Story/fast_story_gen/venv"
APP_PY_PATH = "C:/Users/Admin/Downloads/Story/fast_story_gen/app.py"
WORK_DIR = "C:/Users/Admin/Downloads/Story/fast_story_gen"

# Ollama configuration
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "mistral"

# Output directories
OUTPUT_DIR = "outputs/story_images"
WEB_IMAGE_DIR = "generated_images"

# Ensure directories exist
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(WEB_IMAGE_DIR, exist_ok=True)

def get_python_executable():
    """Get the correct Python executable path"""
    if os.path.exists(VENV_PATH):
        return os.path.join(VENV_PATH, "Scripts", "python.exe")
    return "python"

def is_ollama_running():
    """Check if Ollama is running locally"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=2)
        return response.status_code == 200
    except:
        return False

def ensure_ollama_model():
    """Ensure Mistral model is available"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            model_names = [model.get('name', '') for model in models]
            if any(OLLAMA_MODEL in name for name in model_names):
                return True
            else:
                print(f"Model {OLLAMA_MODEL} not found. Available models: {model_names}")
                return False
    except Exception as e:
        print(f"Error checking Ollama models: {e}")
        return False

# ============================================================================
# HEALTH AND STATUS ENDPOINTS
# ============================================================================

@app.route('/health')
def health():
    """Health check endpoint"""
    python_exe = get_python_executable()
    ollama_status = is_ollama_running()
    model_status = ensure_ollama_model() if ollama_status else False
    
    return jsonify({
        'status': 'ok',
        'service': 'FAIryTale Unified AI Server',
        'services': {
            'ollama': {
                'running': ollama_status,
                'model_ready': model_status,
                'url': OLLAMA_BASE_URL
            },
            'image_generator': {
                'python_path': python_exe,
                'app_py_exists': os.path.exists(APP_PY_PATH),
                'venv_active': os.path.exists(VENV_PATH)
            }
        },
        'config': {
            'working_directory': WORK_DIR,
            'output_directory': OUTPUT_DIR,
            'venv_path': VENV_PATH
        }
    })

@app.route('/test')
def test():
    """Comprehensive test endpoint"""
    python_exe = get_python_executable()
    
    return jsonify({
        'message': 'FAIryTale Unified AI Server Test',
        'endpoints': {
            'health': '/health',
            'story_generation': '/api/generate (POST)',
            'image_generation': '/generate (POST)', 
            'images': '/images/<filename>',
            'ollama_proxy': '/api/*'
        },
        'services': {
            'ollama_running': is_ollama_running(),
            'model_available': ensure_ollama_model() if is_ollama_running() else False,
            'python_executable': python_exe,
            'app_py_exists': os.path.exists(APP_PY_PATH),
            'venv_exists': os.path.exists(VENV_PATH)
        },
        'directories': {
            'working': WORK_DIR,
            'output': OUTPUT_DIR,
            'web_images': WEB_IMAGE_DIR
        }
    })

# ============================================================================
# OLLAMA STORY GENERATION
# ============================================================================

@app.route('/api/generate', methods=['POST'])
def generate_story():
    """Generate story using Ollama"""
    try:
        if not is_ollama_running():
            return jsonify({
                'error': 'Ollama is not running',
                'message': 'Please start Ollama with: set OLLAMA_HOST=0.0.0.0:11434 && ollama serve'
            }), 503
        
        if not ensure_ollama_model():
            return jsonify({
                'error': f'Model {OLLAMA_MODEL} not available',
                'message': f'Please install with: ollama pull {OLLAMA_MODEL}'
            }), 503
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        model = data.get('model', OLLAMA_MODEL)
        prompt = data.get('prompt', '')
        stream = data.get('stream', False)
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Forward request to Ollama
        ollama_data = {
            'model': model,
            'prompt': prompt,
            'stream': stream
        }
        
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=ollama_data,
            timeout=60
        )
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({
                'error': 'Ollama request failed',
                'status_code': response.status_code,
                'message': response.text
            }), response.status_code
            
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Ollama request timed out'}), 504
    except Exception as e:
        return jsonify({'error': f'Story generation failed: {str(e)}'}), 500

# ============================================================================
# OLLAMA PROXY (for other Ollama endpoints)
# ============================================================================

@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def ollama_proxy(path):
    """Proxy other Ollama API calls"""
    try:
        if not is_ollama_running():
            return jsonify({'error': 'Ollama is not running'}), 503
        
        url = f"{OLLAMA_BASE_URL}/api/{path}"
        
        # Forward the request
        if request.method == 'GET':
            response = requests.get(url, params=request.args, timeout=30)
        elif request.method == 'POST':
            response = requests.post(url, json=request.get_json(), timeout=30)
        elif request.method == 'PUT':
            response = requests.put(url, json=request.get_json(), timeout=30)
        elif request.method == 'DELETE':
            response = requests.delete(url, timeout=30)
        
        return jsonify(response.json()), response.status_code
        
    except Exception as e:
        return jsonify({'error': f'Proxy request failed: {str(e)}'}), 500

# ============================================================================
# SD15+IP-ADAPTER IMAGE GENERATION
# ============================================================================

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
        story_prompt = description
        
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
            '--steps', '25',
            '--scale', '7.5'
        ]
        
        # Handle reference image for IP-Adapter
        temp_image_path = None
        if character_image:
            try:
                if character_image.startswith('data:image'):
                    header, encoded = character_image.split(',', 1)
                    image_data = base64.b64decode(encoded)
                    temp_image_path = os.path.join(OUTPUT_DIR, f'reference_{timestamp}.png')
                    with open(temp_image_path, 'wb') as f:
                        f.write(image_data)
                    cmd.extend(['--reference', temp_image_path])
                    print(f"Using reference image: {temp_image_path}")
                else:
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
            timeout=180
        )
        
        # Clean up temp files
        if temp_image_path and os.path.exists(temp_image_path):
            os.remove(temp_image_path)
        
        print(f"Return code: {result.returncode}")
        print(f"STDOUT: {result.stdout}")
        if result.stderr:
            print(f"STDERR: {result.stderr}")
        
        if result.returncode == 0:
            # Look for generated images
            full_output_path = os.path.join(WORK_DIR, OUTPUT_DIR)
            generated_files = []
            
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
                generated_files.sort()
                source_file = generated_files[0]
                source_path = os.path.join(full_output_path, source_file)
                
                # Copy to web-served directory
                web_filename = f"story_{timestamp}.png"
                web_path = os.path.join(WEB_IMAGE_DIR, web_filename)
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
    return send_from_directory(WEB_IMAGE_DIR, filename)

# ============================================================================
# MAIN SERVER
# ============================================================================

if __name__ == '__main__':
    print("=" * 70)
    print("FAIryTale Unified AI Server (Ollama + SD15+IP-Adapter)")
    print("=" * 70)
    print(f"App.py path: {APP_PY_PATH}")
    print(f"Virtual env: {VENV_PATH}")
    print(f"Working dir: {WORK_DIR}")
    print(f"Python exe: {get_python_executable()}")
    print(f"Ollama URL: {OLLAMA_BASE_URL}")
    print("=" * 70)
    print("Services on http://0.0.0.0:5001:")
    print("  • Story Generation: POST /api/generate")
    print("  • Image Generation: POST /generate")
    print("  • Health Check: GET /health")
    print("  • Test: GET /test")
    print("  • Images: GET /images/<filename>")
    print("=" * 70)
    print("Setup Instructions:")
    print("1. Start Ollama: set OLLAMA_HOST=0.0.0.0:11434 && ollama serve")
    print("2. Install model: ollama pull mistral")
    print("3. Start this server: python unified_ai_server.py")
    print("4. Expose with ngrok: ngrok http 5001")
    print("5. Set Replit secrets:")
    print("   OLLAMA_HOST=https://your-ngrok-url.ngrok.io")
    print("   REMOTE_IMAGE_URL=https://your-ngrok-url.ngrok.io")
    print("=" * 70)
    
    app.run(host='0.0.0.0', port=5001, debug=True)