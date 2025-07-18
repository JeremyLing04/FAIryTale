#!/usr/bin/env python3
"""
FAIryTale Local AI Server
Provides AI services (Ollama + Stable Diffusion) for remote FAIryTale deployment
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import subprocess
import json
import os
import base64
import io
import tempfile
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Allow all origins - restrict in production

# Configuration
API_KEY = os.environ.get('AI_SERVER_API_KEY', '')  # Optional API key
OLLAMA_MODEL = 'mistral'
TEMP_DIR = tempfile.mkdtemp()

def check_auth():
    """Check API key if configured"""
    if API_KEY:
        auth_header = request.headers.get('Authorization')
        if not auth_header or auth_header != f"Bearer {API_KEY}":
            return False
    return True

@app.before_request
def before_request():
    """Authenticate requests if API key is configured"""
    if request.endpoint not in ['health', 'static'] and not check_auth():
        return jsonify({"error": "Unauthorized"}), 401

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    # Check Ollama
    ollama_status = False
    try:
        subprocess.run(['ollama', '--version'], capture_output=True, timeout=5)
        ollama_status = True
    except:
        pass
    
    # Check Python dependencies
    python_status = False
    try:
        import torch
        from diffusers import StableDiffusionPipeline
        python_status = True
    except ImportError:
        pass
    
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "ollama": ollama_status,
        "python_ai": python_status,
        "temp_dir": TEMP_DIR
    })

@app.route('/generate-story', methods=['POST'])
def generate_story():
    """Generate story using Ollama Mistral"""
    try:
        data = request.json
        logger.info(f"Generating story for character: {data.get('characterName')}")
        
        # Build prompt
        character_name = data.get('characterName', 'Hero')
        character_type = data.get('characterType', 'adventurer')
        personality = data.get('personality', 'brave')
        genre = data.get('genre', 'fantasy')
        chapter_number = data.get('chapterNumber', 1)
        previous_choice = data.get('previousChoice', '')
        previous_content = data.get('previousContent', '')
        
        # Character stats
        stats = data.get('characterStats', {})
        stats_text = ""
        if stats:
            stats_text = f"Character stats: Courage {stats.get('courage', 50)}/100, Kindness {stats.get('kindness', 50)}/100, Wisdom {stats.get('wisdom', 50)}/100, Creativity {stats.get('creativity', 50)}/100, Strength {stats.get('strength', 50)}/100, Friendship {stats.get('friendship', 50)}/100."
        
        # Determine if choices should be included
        should_include_choices = chapter_number % 3 == 0 or chapter_number == 1
        
        prompt = f"""You are a children's story writer creating engaging, age-appropriate stories for kids aged 6-12.
Create chapter {chapter_number} of a {genre} story featuring {character_name}, a {character_type} with the personality: {personality}.
{stats_text}
{f'Previous choice made: {previous_choice}' if previous_choice else ''}
{f'Previous chapter content: {previous_content}' if previous_content else ''}

Keep the language simple and positive. Each chapter should be around 150-200 words.
{f'Include exactly 2 choice options for the reader to continue the story. Each choice should include stat changes based on the action (+5 to +10 for positive traits). Consider how each choice would affect the character\'s courage, kindness, wisdom, creativity, strength, and friendship.' if should_include_choices else 'This chapter should continue the story naturally without choices.'}

Format your response as JSON with this structure:
{{
  "content": "story content here"{f''',
  "choices": {{
    "optionA": {{
      "text": "brief choice text",
      "description": "what happens if they choose this",
      "statChanges": {{
        "courage": 5,
        "kindness": 0,
        "wisdom": 0,
        "creativity": 0,
        "strength": 0,
        "friendship": 0
      }}
    }},
    "optionB": {{
      "text": "brief choice text", 
      "description": "what happens if they choose this",
      "statChanges": {{
        "courage": 0,
        "kindness": 5,
        "wisdom": 0,
        "creativity": 0,
        "strength": 0,
        "friendship": 0
      }}
    }}
  }}''' if should_include_choices else ''}
}}"""

        # Call Ollama
        logger.info("Calling Ollama...")
        result = subprocess.run(
            ['ollama', 'run', OLLAMA_MODEL, prompt],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            # Parse JSON response
            output = result.stdout.strip()
            logger.info(f"Ollama output: {output[:200]}...")
            
            # Find JSON in the output
            json_start = output.find('{')
            json_end = output.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = output[json_start:json_end]
                story_data = json.loads(json_str)
                logger.info("Story generation successful")
                return jsonify(story_data)
            else:
                logger.warning("No valid JSON found in Ollama output")
        else:
            logger.error(f"Ollama error: {result.stderr}")
            
    except subprocess.TimeoutExpired:
        logger.error("Ollama timeout")
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
    except Exception as e:
        logger.error(f"Story generation error: {e}")
    
    # Fallback response
    logger.info("Using fallback story generation")
    return jsonify({
        "content": f"Chapter {data.get('chapterNumber', 1)}: {data.get('characterName', 'Hero')} the {data.get('characterType', 'adventurer')} continues their {data.get('genre', 'fantasy')} adventure. With their {data.get('personality', 'brave')} personality, they face new challenges and discover amazing things along the way.",
        "choices": {
            "optionA": {
                "text": "Explore ahead",
                "description": "Continue the journey with courage",
                "statChanges": {"courage": 5, "wisdom": 2}
            },
            "optionB": {
                "text": "Help others",
                "description": "Stop to assist someone in need", 
                "statChanges": {"kindness": 5, "friendship": 3}
            }
        } if should_include_choices else None
    })

@app.route('/generate-image', methods=['POST'])
def generate_image():
    """Generate image using Stable Diffusion"""
    try:
        data = request.json
        logger.info(f"Generating image: {data.get('description', '')[:50]}...")
        
        description = data.get('description', '')
        genre = data.get('genre', 'fantasy')
        timestamp = data.get('timestamp', int(datetime.now().timestamp()))
        character_image = data.get('characterImage', '')
        
        # Create temporary output path
        output_path = os.path.join(TEMP_DIR, f'story_{timestamp}.png')
        
        # Create output directory for your SD v1.5 + IP-Adapter script
        output_dir = os.path.join(TEMP_DIR, f'story_images_{timestamp}')
        os.makedirs(output_dir, exist_ok=True)
        
        # Build character description
        character_desc = f"a {genre} style character in an animated art style, cinematic lighting"
        
        # Build command for your app.py script
        cmd = [
            'python', 'app.py',
            '--character', character_desc,
            '--story', description,
            '--output_dir', output_dir,
            '--seed', str(timestamp % 9999),
            '--steps', '25',
            '--scale', '7.5'
        ]
        
        # Handle character reference image for IP-Adapter
        char_img_path = None
        if character_image and character_image.startswith('data:'):
            char_img_path = os.path.join(TEMP_DIR, f'reference_{timestamp}.png')
            # Decode base64 image
            img_data = base64.b64decode(character_image.split(',')[1])
            with open(char_img_path, 'wb') as f:
                f.write(img_data)
            cmd.extend(['--reference', char_img_path])
        
        # Add style LoRA based on genre
        style_map = {
            'fantasy': 'anime_style.safetensors',
            'adventure': 'anime_style.safetensors',
            'mystery': 'anime_style.safetensors',
            'scifi': 'anime_style.safetensors'
        }
        
        if genre.lower() in style_map:
            cmd.extend(['--style_lora', style_map[genre.lower()]])
        
        logger.info(f"Running image generation: {' '.join(cmd)}")
        
        # Run image generation
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        # Your app.py generates images sequentially (00.png, 01.png, etc.)
        generated_image_path = os.path.join(output_dir, '00.png')
        
        if result.returncode == 0 and os.path.exists(generated_image_path):
            # Read generated image
            with open(generated_image_path, 'rb') as f:
                img_data = f.read()
            
            # Convert to base64
            img_b64 = base64.b64encode(img_data).decode()
            
            # Cleanup temporary files
            if char_img_path and os.path.exists(char_img_path):
                os.remove(char_img_path)
            
            # Clean up generated story images directory
            try:
                import shutil
                shutil.rmtree(output_dir)
            except:
                pass
            
            logger.info("Image generation successful")
            return jsonify({"image": f"data:image/png;base64,{img_b64}"})
        else:
            logger.error(f"Image generation failed: {result.stderr}")
    
    except subprocess.TimeoutExpired:
        logger.error("Image generation timeout")
    except Exception as e:
        logger.error(f"Image generation error: {e}")
    
    # Return empty image on failure
    return jsonify({"image": ""})

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify server is working"""
    return jsonify({
        "message": "FAIryTale Local AI Server is running!",
        "endpoints": [
            "/health - Health check",
            "/generate-story - Story generation",
            "/generate-image - Image generation"
        ]
    })

if __name__ == '__main__':
    logger.info("Starting FAIryTale Local AI Server...")
    logger.info(f"Temporary directory: {TEMP_DIR}")
    logger.info(f"API Key required: {'Yes' if API_KEY else 'No'}")
    
    # Start server
    app.run(
        host='0.0.0.0',
        port=8888,
        debug=False,  # Set to True for development
        threaded=True
    )