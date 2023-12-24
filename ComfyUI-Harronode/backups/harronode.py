import json
from pathlib import Path
import torch

class Harronode:
    """
    A node to load colors from words.json and display them in a dropdown list.
    """

    @classmethod
    def INPUT_TYPES(cls):
        # Load colors from words.json
        words_path = Path(__file__).parent / "words.json"
        with open(words_path, "r") as file:
            data = json.load(file)
        colors = data.get("colors", [])
        styles = data.get("styles", [])
        accents = data.get("accents", [])
        content = data.get("content", [])
        
        return {
            "required": {
                "prompt_text": ("STRING", {"default": "", "multiline": False}),
                "color_count": ("INT", {"default": 0, "min": 0, "max": 3, "step": 1}),
                "color": (colors, {"default": colors[0] if colors else None}),
                "style_count": ("INT", {"default": 1, "min": 1, "max": 2, "step": 1}),                
                "style": (styles, {"default": styles[0] if styles else None}),
                "accent_count": ("INT", {"default": 0, "min": 0, "max": 3, "step": 1}),                
                "accent": (accents, {"default": accents[0] if accents else None}),
                "content_count": ("INT", {"default": 0, "min": 0, "max": 3, "step": 1}),                
                "content": (content, {"default": content[0] if content else None}),
                "prompt": ("STRING", {"default": "", "multiline": True})
            }
        }

    RETURN_TYPES = ("STRING",)
    FUNCTION = "select_color"
    CATEGORY = "Harronode/PromptBuilder"

    def select_color(self, color):
        # do thing
        return (color,)
