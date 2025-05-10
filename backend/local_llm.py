from typing import Any, Dict
import gc

from torch import no_grad
from torch import bfloat16
from torch import cuda
from torch.nn.attention import SDPBackend, sdpa_kernel
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig


class ChatCompletionLLM:
    def __init__(self, args: Dict[str, Any]):
        self.tokenizer = AutoTokenizer.from_pretrained(args["model_id"])
        self.tokenizer.pad_token = self.tokenizer.eos_token
        
        quantization = None
        if args["enable_quantization"]:
            quantization = self.set_model_quantization(args)

        self.model = AutoModelForCausalLM.from_pretrained(
            args["model_id"], torch_dtype=args["dtype"], quantization_config=quantization, device_map=args["device"]
        )
        self.sampling_params = {
            "max_new_tokens": 512, "use_cache": True, "temperature": 1.0, "top_p": 1.0, "top_k": 50   
        }
        self.device = args["device"]

    def process_completion(self, user_msg: str) -> str:
        messages = [
            {"role": "user", "content": user_msg}
        ]
        input_ids = self.tokenizer.apply_chat_template(
            messages, add_generation_prompt=True, return_tensors="pt"
        ).to(self.device)

        with no_grad(), sdpa_kernel(SDPBackend.FLASH_ATTENTION):
            output_ids = self.model.generate(
                input_ids, **self.sampling_params, pad_token_id=self.tokenizer.eos_token_id
            )

        response = output_ids[0][input_ids.shape[-1]:]
        
        return self.tokenizer.decode(response, skip_special_tokens=True)

    def set_sampling_param(self, sampling_param: Dict[str, Any]) -> None:
        self.sampling_params.update(sampling_param)

    def set_model_quantization(self, args: Dict[str, Any]) -> BitsAndBytesConfig:
        return BitsAndBytesConfig(
            load_in_4bit=args["load_in_4bit"],
            load_in_8bit=args["load_in_8bit"],
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
            bnb_4bit_compute_dtype=bfloat16
        )

    def flush(self) -> None:
        del self.model
        gc.collect()
        if self.device == "cuda":
            cuda.empty_cache()
            cuda.reset_peak_memory_stats()