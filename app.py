#!/usr/bin/env python3
"""
Stable Diffusion Image Generator with IP-Adapter
Command line interface for generating story images
"""

import argparse
import os
import sys
from pathlib import Path
from PIL import Image
import torch
from diffusers import StableDiffusionPipeline, StableDiffusionImg2ImgPipeline
from diffusers.utils import load_image
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_pipeline(use_input_image=False):
    """Set up the Stable Diffusion pipeline"""
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {device}")
        
        model_id = "runwayml/stable-diffusion-v1-5"
        
        if use_input_image:
            pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                safety_checker=None,
                requires_safety_checker=False
            )
        else:
            pipe = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                safety_checker=None,
                requires_safety_checker=False
            )
        
        pipe = pipe.to(device)
        
        # Enable memory efficient attention if available
        if hasattr(pipe, 'enable_attention_slicing'):
            pipe.enable_attention_slicing()
        
        return pipe
    except Exception as e:
        logger.error(f"Error setting up pipeline: {e}")
        return None

def generate_image(prompt, genre="cartoon", input_image_path=None, output_path="output.png"):
    """Generate an image based on the prompt and genre"""
    
    # Build the full prompt based on genre
    genre_styles = {
        "cartoon": "cartoon style, colorful, child-friendly, bright colors, simple shapes, animated style",
        "fantasy": "fantasy art, magical, mystical, vibrant colors, fantasy illustration",
        "adventure": "adventure scene, dynamic, action-packed, heroic, illustrated style",
        "mystery": "mysterious atmosphere, dark corners, investigation scene, illustrated style",
        "sci-fi": "science fiction, futuristic, space theme, technological, sci-fi illustration",
        "friendship": "warm colors, happy scene, friendship theme, heartwarming illustration"
    }
    
    style_prompt = genre_styles.get(genre, genre_styles["cartoon"])
    full_prompt = f"{prompt}, {style_prompt}, high quality, detailed illustration, suitable for children"
    
    # Add negative prompt for better quality
    negative_prompt = "blurry, low quality, distorted, scary, violent, inappropriate, adult content, dark theme"
    
    try:
        if input_image_path and os.path.exists(input_image_path):
            # Use img2img pipeline with input image
            logger.info(f"Using input image: {input_image_path}")
            pipe = setup_pipeline(use_input_image=True)
            if pipe is None:
                return False
            
            # Load and process input image
            init_image = load_image(input_image_path)
            init_image = init_image.convert("RGB")
            init_image = init_image.resize((512, 512))
            
            # Generate image
            result = pipe(
                prompt=full_prompt,
                image=init_image,
                strength=0.75,  # How much to change the input image
                guidance_scale=7.5,
                num_inference_steps=20,
                negative_prompt=negative_prompt
            )
        else:
            # Use text2img pipeline
            logger.info("Generating image from text prompt")
            pipe = setup_pipeline(use_input_image=False)
            if pipe is None:
                return False
            
            # Generate image
            result = pipe(
                prompt=full_prompt,
                height=512,
                width=512,
                guidance_scale=7.5,
                num_inference_steps=20,
                negative_prompt=negative_prompt
            )
        
        # Save the generated image
        image = result.images[0]
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        image.save(output_path)
        logger.info(f"Image saved to: {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error generating image: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Generate story images using Stable Diffusion")
    parser.add_argument("--genre", default="cartoon", help="Genre/style of the image (cartoon, fantasy, adventure, etc.)")
    parser.add_argument("--description", required=True, help="Description of the scene to generate")
    parser.add_argument("--input-image", help="Path to input image for IP-Adapter/img2img")
    parser.add_argument("--output", default="output.png", help="Output image path")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose logging")
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    logger.info(f"Starting image generation...")
    logger.info(f"Genre: {args.genre}")
    logger.info(f"Description: {args.description}")
    logger.info(f"Output: {args.output}")
    
    if args.input_image:
        logger.info(f"Input image: {args.input_image}")
    
    # Generate the image
    success = generate_image(
        prompt=args.description,
        genre=args.genre,
        input_image_path=args.input_image,
        output_path=args.output
    )
    
    if success:
        logger.info("Image generation completed successfully!")
        print(f"Generated image saved to: {args.output}")
        sys.exit(0)
    else:
        logger.error("Image generation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()