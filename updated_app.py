import os
import torch
import argparse
from diffusers import StableDiffusionPipeline, DDIMScheduler
from ip_adapter.ip_adapter import IPAdapterPlus
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument("--style_lora", type=str, default="anime_style.safetensors", help="LoRA style filename (inside loras/)")
parser.add_argument("--reference", type=str, default=None, help="Path to reference image (optional)")
parser.add_argument("--output_dir", type=str, default="outputs/story_images", help="Output directory for images")
parser.add_argument("--seed", type=int, default=1234, help="Random seed for reproducibility")
parser.add_argument("--steps", type=int, default=30, help="Number of inference steps")
parser.add_argument("--scale", type=float, default=7.5, help="Guidance scale")
parser.add_argument("--story", type=str, default=None, help="Custom story description (split by commas)")
parser.add_argument("--character", type=str, default="")
args = parser.parse_args()

# ==== Story character ====
character = args.character

if args.story:
    # Use customized story content
    story_sentences = [f"{character}, {line.strip()}" for line in args.story.split(",")]
else:
    # default story content
    story_sentences = [
        f"{character}, riding through a misty forest",
        f"{character}, discovering a hidden glowing cave behind a waterfall",
        f"{character}, approaching a sleeping dragon guarding a magical gem",
        f"{character}, startled as the dragon awakens",
        f"{character} and the dragon flying into the night sky together"
    ]

negative_prompt = None  # "blurry, low quality, deformed, watermark"

# ==== output path ====
os.makedirs(args.output_dir, exist_ok=True)

# ==== initialize Stable Diffusion model ====
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16
)
pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)
pipe.to("cuda")

# ==== imploy LoRA style ====
if args.style_lora:
    lora_path = os.path.join("loras", args.style_lora)
    pipe.load_lora_weights(lora_path)
    pipe.fuse_lora()

# ==== determine wheter to use IP-Adapter Plus ====
use_ip_adapter = args.reference is not None
if use_ip_adapter:
    image_input = Image.open(args.reference).convert("RGB").resize((224, 224))
    ip_model = IPAdapterPlus(
        ip_ckpt_path="ip-adapter-plus_sd15.bin",
        device="cuda"
    )

# ==== generate the image in batches ====
for i, prompt in enumerate(story_sentences):
    print(f"[Generated] Sentence {i+1}: {prompt}")
    
    if use_ip_adapter:
        generated_image = ip_model.generate(
            prompt=prompt,
            image=image_input,
            pipe=pipe,
            negative_prompt=negative_prompt,
            num_inference_steps=args.steps,
            guidance_scale=args.scale,
            seed=args.seed
        )
    else:
        generated_image = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=args.steps,
            guidance_scale=args.scale
        ).images[0]

    image_path = os.path.join(args.output_dir, f"{i:02}.png")
    generated_image.save(image_path)
    print(f"{image_path} saved successfully!")

print("[Completed] All image has been generated successfully!")