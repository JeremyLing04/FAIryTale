#!/usr/bin/env python3
# Script to fix Unicode encoding issues in app.py
import re

# Read the current app.py content (this will be sent to your Windows machine)
fix_instructions = """
To fix the Unicode encoding error in your app.py, replace all Chinese characters in print statements with English:

Find lines like:
    print(f"[生成] 第{i+1}句: {prompt}")
    
Replace with:
    print(f"[Generated] Sentence {i+1}: {prompt}")

Or comment out the problematic print statements:
    # print(f"[生成] 第{i+1}句: {prompt}")

This will fix the 'charmap' codec error you're seeing.
"""

print(fix_instructions)