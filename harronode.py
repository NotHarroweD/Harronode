import json
from pathlib import Path
from server import PromptServer
import server

class Harronode:
    
    @classmethod
    def INPUT_TYPES(cls):
        words_path = Path(__file__).parent / "words.json"
        with open(words_path, "r") as file:
            data = json.load(file)
        colors = data.get("colors", [])
        styles = data.get("styles", [])
        accents = data.get("accents", [])
        content = data.get("content", [])
        
        # setup inputs for the node
        inputs =  {
            "required": {
                "prompt": ("STRING", {"default": "", "multiline": True}),
                "text_on_image": ("STRING", {"default": "", "multiline": True}),
                "mode": ("BOOLEAN", {"default": True, "label_on": "Editable", "label_off": "Fixed"}),
                "text_weight": ("FLOAT", {"default": 1.0, "min":0.5, "max":1.5, "step": 0.01}),
                "color_count": ("INT", {"default": 1, "min": 0, "max": 3, "step": 1}),
                "style_count": ("INT", {"default": 1, "min": 1, "max": 2, "step": 1}),
                "accent_count": ("INT", {"default": 1, "min": 0, "max": 3, "step": 1}),
                "content_count": ("INT", {"default": 1, "min": 0, "max": 3, "step": 1})
            }
        }

        for i in range (1, 4):
            inputs["required"][f"color_{i}"] = (colors, {"default": colors[0] if colors else None})

        for i in range (1, 3):
            inputs["required"][f"style_{i}"] = (styles, {"default": styles[0] if styles else None})

        for i in range (1, 4):
            inputs["required"][f"accent_{i}"] = (accents, {"default": accents[0] if accents else None})

        for i in range (1, 4):
            inputs["required"][f"content_{i}"] = (content, {"default": content[0] if content else None})

        return inputs

    RETURN_TYPES = ("STRING",)
    FUNCTION = "doTheThing"
    CATEGORY = "Harronode/PromptBuilder"

    def doTheThing(self, *args, **kwargs):
        output = kwargs['prompt']
        return(output,) # comma outputs a tuple with a single record instead of a bunch of records all containing the prompt
