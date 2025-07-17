@echo off
echo Setting up Python virtual environment for StoryMagic image generation...

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Upgrade pip
python -m pip install --upgrade pip

REM Install requirements
pip install -r python_requirements.txt

echo Virtual environment setup complete!
echo To activate the virtual environment manually, run: venv\Scripts\activate.bat
echo The image generator will automatically use the venv when it exists.
pause