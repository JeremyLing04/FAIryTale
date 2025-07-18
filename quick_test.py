#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quick test script for your SD15+IP-Adapter setup
Run this to verify the integration will work
"""

import os
import subprocess
import sys

# Your specific paths
VENV_PATH = "C:/Users/Admin/Downloads/Story/fast_story_gen/venv"
APP_PY_PATH = "C:/Users/Admin/Downloads/Story/fast_story_gen/app.py"
WORK_DIR = "C:/Users/Admin/Downloads/Story/fast_story_gen"

def test_basic_setup():
    """Test if basic setup is correct"""
    print("🔍 Testing Basic Setup...")
    
    # Test paths
    if not os.path.exists(VENV_PATH):
        print(f"❌ Virtual environment not found: {VENV_PATH}")
        return False
    print(f"✅ Virtual environment found: {VENV_PATH}")
    
    if not os.path.exists(APP_PY_PATH):
        print(f"❌ app.py not found: {APP_PY_PATH}")
        return False
    print(f"✅ app.py found: {APP_PY_PATH}")
    
    if not os.path.exists(WORK_DIR):
        print(f"❌ Working directory not found: {WORK_DIR}")
        return False
    print(f"✅ Working directory found: {WORK_DIR}")
    
    return True

def test_python_executable():
    """Test if Python executable works"""
    print("\n🐍 Testing Python Executable...")
    
    python_exe = os.path.join(VENV_PATH, "Scripts", "python.exe")
    if not os.path.exists(python_exe):
        print(f"❌ Python executable not found: {python_exe}")
        return False
    print(f"✅ Python executable found: {python_exe}")
    
    # Test running Python
    try:
        result = subprocess.run([python_exe, "--version"], 
                               capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✅ Python version: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ Python failed to run: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error running Python: {e}")
        return False

def test_app_py_arguments():
    """Test if your app.py accepts the required arguments"""
    print("\n📋 Testing app.py Arguments...")
    
    python_exe = os.path.join(VENV_PATH, "Scripts", "python.exe")
    
    try:
        # Test help command
        result = subprocess.run([python_exe, APP_PY_PATH, "--help"], 
                               cwd=WORK_DIR, capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            help_text = result.stdout
            required_args = ["--story", "--character", "--output_dir", "--seed"]
            
            missing_args = []
            for arg in required_args:
                if arg not in help_text:
                    missing_args.append(arg)
            
            if not missing_args:
                print("✅ All required arguments are supported")
                print("   Required: --story, --character, --output_dir, --seed")
                if "--reference" in help_text:
                    print("✅ IP-Adapter --reference argument is supported")
                return True
            else:
                print(f"❌ Missing arguments: {missing_args}")
                print("   Your app.py might need different argument names")
                return False
        else:
            print(f"❌ app.py help failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing app.py: {e}")
        return False

def test_flask_availability():
    """Test if Flask is available"""
    print("\n🌐 Testing Flask Availability...")
    
    python_exe = os.path.join(VENV_PATH, "Scripts", "python.exe")
    
    try:
        result = subprocess.run([python_exe, "-c", "import flask; print('Flask', flask.__version__)"], 
                               capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✅ {result.stdout.strip()}")
            return True
        else:
            print("❌ Flask not installed")
            print("   Run: pip install flask flask-cors")
            return False
    except Exception as e:
        print(f"❌ Error testing Flask: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 FAIryTale SD15+IP-Adapter Integration Test")
    print("=" * 50)
    
    tests = [
        ("Basic Setup", test_basic_setup),
        ("Python Executable", test_python_executable),
        ("app.py Arguments", test_app_py_arguments),
        ("Flask Availability", test_flask_availability)
    ]
    
    all_passed = True
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if not result:
                all_passed = False
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All tests passed! Your setup should work with FAIryTale")
        print("\nNext steps:")
        print("1. Run: python local_ai_server.py")
        print("2. Test: curl http://localhost:5001/test")
        print("3. Expose with ngrok: ngrok http 5001")
    else:
        print("⚠️  Some tests failed. Please fix the issues above.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)