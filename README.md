# LLM Playground App

Large Language Models (LLMs) have become a powerful tool for a wide range of applications, but running them locally often requires navigating a 
fragmented ecosystem of separate frontends, backends, and complex installations. Most existing solutions either require significant manual 
setup or are bundled into overly complicated systems that are difficult for everyday users to get started with.

**This project aims to fix that.**

The goal is to make LLMs accessible to everyone by providing a simple, unified solution that brings together both the frontend and backend in a 
seamless package. With minimal configuration, you can interact with powerful LLMs locally—no need to stitch together separate tools or wrestle 
with intricate dependencies.

We've chosen to build on the Hugging Face ecosystem as it hosts one of the largest collections of open-source models and provides a robust, 
community-driven foundation for LLM development. By fixing our stack to Hugging Face, we ensure maximum compatibility and simplicity, letting 
users focus on using LLMs, not setting them up.

Whether you're a developer, researcher, or curious tinkerer, this project is designed to get you up and running with LLMs in minutes—not hours.

## Features

- Completions & Chat interface with user, and assistant messages
- Parameter controls for temperature, max output token length, top-p, and top-k
- Responsive layout with sidebar navigation
- Built with React and Tailwind CSS

## Tech Stack

**Frontend**: React, TailwindCSS

**Backend**: FastAPI

**LLM Stack**: Pytorch, Huggingface

## Project Structure

```
backend/ # Contains FastAPI server to serve LLM using HuggingFace
frontend/ # Contains React based UI to interact with backend server
```

## Installation

1. Go inside the backend folder to install and setup the FastAPI server.

2. Go inside the frontend folder to install and setup the React UI

## License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

## 🤝 Contributing

We believe in the power of community and open source, and we’d love your help to make this project even better!

Whether it's fixing bugs, adding new features, improving documentation, or suggesting ideas—**every contribution matters**. Our goal is to keep 
this project simple, approachable, and useful for everyone looking to run LLMs locally without hassle, and your input can help us get there 
faster.

If you’re interested in contributing:

* Feel free to open a discussion or suggestion
* Submit a pull request anytime—happy to collaborate!

We're excited to build this with you. Let’s make local LLMs accessible to all 🚀

## Authors

- [@chiravdave](https://github.com/chiravdave/chiravdave)