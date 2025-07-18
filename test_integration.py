#!/usr/bin/env python3
"""
Test script to verify the FAIryTale integration will work with your setup
Run this to check for potential issues before deploying
"""

import os
import subprocess
import sys
import requests
import json

# Configuration - Update these to match your setup
VENV_PATH = r"C:\Users\Admin\Downloads\Story\fast_story_gen\venv"
APP_PY_PATH = r"C:\Users\Admin\Downloads\Story\fast_story_gen\app.py"
WORK_DIR = r"C:\Users\Admin\Downloads\Story\fast_story_gen"

def test_python_setup():
    """Test if Python and virtual environment are working"""
    print("🐍 Testing Python Setup...")
    
    # Check if venv exists
    if not os.path.exists(VENV_PATH):
        print(f"❌ Virtual environment not found at: {VENV_PATH}")
        return False
    print(f"✅ Virtual environment found: {VENV_PATH}")
    
    # Check if app.py exists
    if not os.path.exists(APP_PY_PATH):
        print(f"❌ app.py not found at: {APP_PY_PATH}")
        return False
    print(f"✅ app.py found: {APP_PY_PATH}")
    
    # Test Python executable
    python_exe = os.path.join(VENV_PATH, "Scripts", "python.exe")
    if not os.path.exists(python_exe):
        print(f"❌ Python executable not found: {python_exe}")
        return False
    print(f"✅ Python executable found: {python_exe}")
    
    return True

def test_dependencies():
    """Test if required dependencies are installed"""
    print("\n📦 Testing Dependencies...")
    
    python_exe = os.path.join(VENV_PATH, "Scripts", "python.exe")
    
    # Test if app.py can run with help
    try:
        result = subprocess.run([python_exe, APP_PY_PATH, "--help"], 
                               cwd=WORK_DIR, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ app.py can run and accepts arguments")
        else:
            print(f"❌ app.py failed with error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error testing app.py: {e}")
        return False
    
    # Test Flask import
    try:
        result = subprocess.run([python_exe, "-c", "import flask; print('Flask version:', flask.__version__)"], 
                               cwd=WORK_DIR, capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✅ Flask available: {result.stdout.strip()}")
        else:
            print("❌ Flask not installed. Run: pip install flask flask-cors")
            return False
    except Exception as e:
        print(f"❌ Error testing Flask: {e}")
        return False
    
    return True

def test_image_generation():
    """Test if image generation works"""
    print("\n🎨 Testing Image Generation...")
    
    python_exe = os.path.join(VENV_PATH, "Scripts", "python.exe")
    output_dir = os.path.join(WORK_DIR, "outputs", "test_images")
    os.makedirs(output_dir, exist_ok=True)
    
    # Test basic image generation
    cmd = [
        python_exe, APP_PY_PATH,
        "--story", "test hero in a magical forest",
        "--character", "test_hero",
        "--output_dir", output_dir,
        "--steps", "5",  # Very fast for testing
        "--seed", "1234"
    ]
    
    try:
        print("Running test generation...")
        result = subprocess.run(cmd, cwd=WORK_DIR, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            # Check if image was created
            generated_files = [f for f in os.listdir(output_dir) if f.endswith('.png')]
            if generated_files:
                print(f"✅ Image generation works! Generated: {generated_files}")
                return True
            else:
                print(f"❌ No images generated in {output_dir}")
                print(f"STDOUT: {result.stdout}")
                return False
        else:
            print(f"❌ Image generation failed")
            print(f"STDERR: {result.stderr}")
            print(f"STDOUT: {result.stdout}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Image generation timed out")
        return False
    except Exception as e:
        print(f"❌ Error testing image generation: {e}")
        return False

def test_ollama():
    """Test if Ollama is accessible"""
    print("\n🤖 Testing Ollama...")
    
    # Test local Ollama
    try:
        result = subprocess.run(["ollama", "list"], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ Ollama is working locally")
            if "mistral" in result.stdout:
                print("✅ Mistral model is available")
            else:
                print("⚠️  Mistral model not found. Run: ollama pull mistral")
            return True
        else:
            print("❌ Ollama not working. Install from https://ollama.ai")
            return False
    except FileNotFoundError:
        print("❌ Ollama not installed. Download from https://ollama.ai")
        return False
    except Exception as e:
        print(f"❌ Error testing Ollama: {e}")
        return False

def test_network_setup():
    """Test network configuration for exposing services"""
    print("\n🌐 Testing Network Setup...")
    
    # Check if ports are available
    import socket
    
    def check_port(port, service_name):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            result = sock.connect_ex(('localhost', port))
            if result == 0:
                print(f"⚠️  Port {port} ({service_name}) is already in use")
                return False
            else:
                print(f"✅ Port {port} ({service_name}) is available")
                return True
        finally:
            sock.close()
    
    port_5001_ok = check_port(5001, "Image Server")
    port_11434_ok = check_port(11434, "Ollama")
    
    return port_5001_ok and port_11434_ok

def main():
    """Run all tests"""
    print("🧪 FAIryTale Integration Test")
    print("=" * 50)
    
    tests = [
        ("Python Setup", test_python_setup),
        ("Dependencies", test_dependencies),
        ("Image Generation", test_image_generation),
        ("Ollama", test_ollama),
        ("Network Setup", test_network_setup)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results[test_name] = False
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("=" * 50)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
        if not passed:
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("🎉 All tests passed! Your setup should work with FAIryTale.")
        print("\nNext steps:")
        print("1. Copy local_ai_server.py to your fast_story_gen directory")
        print("2. Run: python local_ai_server.py")
        print("3. In another terminal: ngrok http 5001")
        print("4. Update Replit secrets with the ngrok URL")
    else:
        print("⚠️  Some tests failed. Please fix the issues above before proceeding.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)