# Check if Python is installed
$pythonVersion = python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Python is not installed. Please install Python 3.7 or higher." -ForegroundColor Red
    exit 1
}

Write-Host "Installing Python dependencies..." -ForegroundColor Green
pip install -r requirements.txt

Write-Host "Starting Flask server..." -ForegroundColor Green
python app.py