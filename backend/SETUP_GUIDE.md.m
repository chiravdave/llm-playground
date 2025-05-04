# Setup Guide for Backend

This guide will help you set up the FastAPI backend server.

## Prerequisites

Make sure you have the following installed:
- transformers
- accelerate
- bitsandbytes

## Step 1: Install Packages

Create a virtual environment and install all the required packages.

## Step 2: Start the Development Server

```bash
python3 app.py --model_id Qwen/Qwen2.5-0.5B-Instruct --dtype bfloat16
```

The application should now be running at http://127.0.0.1:8000.

## Customization
Check **parser.py** file to see all possible tunable arguments to run your model.

## API Documentation

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc