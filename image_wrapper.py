#!/usr/bin/env python3
"""
Simple wrapper for the existing app.py to generate single story images
Compatible with the existing IP-Adapter setup
"""

import argparse
import os
import sys
import subprocess
import tempfile
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Generate story images using existing app.py")
    parser.add_argument("--genre", default="cartoon", help="Genre/style of the image")
    parser.add_argument("--description", required=True, help="Description of the scene to generate")
    parser.add_argument("--reference", help="Path to reference image for IP-Adapter")
    parser.add_argument("--output", default="output.png", help="Output image path")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose logging")
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(args.output) or "."
    os.makedirs(output_dir, exist_ok=True)
    
    # Map genre to character style
    genre_styles = {
        "cartoon": "anime style character",
        "fantasy": "magical fantasy character", 
        "adventure": "heroic adventure character",
        "mystery": "mysterious character",
        "sci-fi": "futuristic sci-fi character",
        "friendship": "friendly character"
    }
    
    character_desc = genre_styles.get(args.genre, "anime style character")
    story_text = f"{character_desc}, {args.description}"
    
    # Build command for the existing app.py
    cmd = [
        "python", "app.py",
        "--story", story_text,
        "--output_dir", output_dir,
        "--seed", str(hash(args.description) % 10000)  # Deterministic seed based on description
    ]
    
    # Add reference image if provided
    if args.reference and os.path.exists(args.reference):
        cmd.extend(["--reference", args.reference])
    
    if args.verbose:
        print(f"Running command: {' '.join(cmd)}")
    
    try:
        # Run the image generation
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        if args.verbose:
            if result.stdout:
                print("STDOUT:", result.stdout)
            if result.stderr:
                print("STDERR:", result.stderr)
        
        if result.returncode == 0:
            # Find the generated image and copy it to the expected output path
            generated_files = list(Path(output_dir).glob("*.png"))
            if generated_files:
                # Get the most recent file
                latest_file = max(generated_files, key=lambda p: p.stat().st_mtime)
                
                # Copy to expected output path if different
                if str(latest_file) != args.output:
                    import shutil
                    shutil.copy2(latest_file, args.output)
                
                print(f"Generated image saved to: {args.output}")
                return True
            else:
                print("Error: No image files were generated")
                return False
        else:
            print(f"Error: Image generation failed with return code {result.returncode}")
            if result.stderr:
                print(f"Error output: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("Error: Image generation timed out after 120 seconds")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)