from argparse import ArgumentParser, Namespace


def parse_args() -> Namespace:
    parser = ArgumentParser(description="Run LLM Backend")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host address to bind to")
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on")
    parser.add_argument("--model_id", type=str, help="Huggingface model id", required=True)
    parser.add_argument("--dtype", type=str, default="auto", help="Data type to load model")
    parser.add_argument("--device", type=str, default="cpu", help="Data type to load model")
    parser.add_argument("--enable_quantization", action="store_true", help="Enable BitsAndBytes Quantization.")

    # Creating mutually exclusive group for 4bit and 8bit since they cannot be true at the same time.
    mutex_group = parser.add_mutually_exclusive_group()
    mutex_group.add_argument("--load_in_4bit", action="store_true", help="Load model in 4-bit precision")
    mutex_group.add_argument("--load_in_8bit", action="store_true", help="Load model in 8-bit precision")

    return vars(parser.parse_args())