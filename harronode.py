import json
from pathlib import Path
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

class PromptEditor:

    @classmethod
    def INPUT_TYPES(cls):
        
        inputs = {
            "required": {
                "prompt": ("STRING", {"forceInput": True}), # forceInput makes it an input node
                "mode": (["Edit", "Bypass"],{}),
                "promptEditor": ("STRING", {"default": "", "multiline": True})
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }
        return inputs

    RETURN_TYPES = ("STRING",)
    FUNCTION = "EditPrompt"
    OUTPUT_NODE = True
    OUTPUT_IS_LIST = (True,)
    CATEGORY = "Harronode/PromptBuilder"

    def EditPrompt(self, prompt, mode, promptEditor, unique_id = None, extra_pnginfo=None):
        print("Enter EditPrompt")
        if unique_id and extra_pnginfo and "workflow" in extra_pnginfo:
            workflow = extra_pnginfo["workflow"]
            target_id = unique_id
            node = None
            # try to find the node in the workflow so we can get all the values of it
            for node in workflow["nodes"]:
                if str(node["id"]) == target_id:
                    break
            # if the node is found, set the value of the textbox (3rd input, 0-indexed) to the prompt
            if node:
                node["widgets_values"][2] = [prompt]
            if mode == "Edit":
                # edit the prompt and wait for user to click GO
                # set output
                output = promptEditor,
            else:
                # just set the output to the string we input
                output = prompt,
        return (output,)
   
def onprompt_populate_prompt(json_data):
    try:
        prompt = json_data['prompt']
        updated_widget_values = {}
        for k, v in prompt.items():
            if 'class_type' in v and (v['class_type'] == 'Harronode'):
                inputs = v['inputs']
                if isinstance(inputs['prompt'], str):
                    inputs['prompt'] = prompt_builder.build_prompt(inputs)
                    server.PromptServer.instance.send_sync("harronode-node-feedback", {"node_id": k, "widget_name": "prompt", "type": "STRING", "value": inputs['prompt']})
                    updated_widget_values[k] = inputs['prompt']
    except Exception as e:
        print(f"[WARN] ComfyUI-Harronode: Error on prompt\n{e}")
    
def harroonprompt(json_data):
    try:
        onprompt_populate_prompt(json_data)
    except Exception as e:
        print(f"[WARN] ComfyUI-Harronode: Error on prompt - autopopulation of prompt will not work.\n{e}")

    return json_data

class prompt_builder:
    def build_prompt(inputs):
        # Initialize the prompt builder string
        text = ""
        text = text + "('"
        text = text + inputs["text_on_image"]
        text_weight = inputs["text_weight"]
        text = text + f"':{text_weight:.2f}) text logo, "
        color_count = inputs["color_count"]
        # gather colors
        if color_count > 0:
            color1 = inputs["color_1"]
            color2 = inputs["color_2"]
            color3 = inputs["color_3"]
            for i in range(1, color_count + 1):
                variable_name = f"color{i}"
                color_value = locals()[variable_name]
                text = text + color_value + ", "
        style_count = inputs["style_count"]
        # gather styles
        if style_count > 0:
            style1 = inputs["style_1"]
            style2 = inputs["style_2"]
            for i in range(1, style_count + 1):
                variable_name = f"style{i}"
                style_value = locals()[variable_name]
                text = text + style_value + ", "
        accent_count = inputs["accent_count"]
        # gather accents
        if accent_count > 0:
            accent1 = inputs["accent_1"]
            accent2 = inputs["accent_2"]
            accent3 = inputs["accent_3"]
            for i in range(1, accent_count + 1):
                variable_name = f"accent{i}"
                accent_value = locals()[variable_name]
                text = text + accent_value + ", "
        content_count = inputs["content_count"]
        # gather contents
        if content_count > 0:
            content1 = inputs["content_1"]
            content2 = inputs["content_2"]
            content3 = inputs["content_3"]
            for i in range(1, content_count + 1):
                variable_name = f"content{i}"
                content_value = locals()[variable_name]
                text = text + content_value + ", "
        return text

server.PromptServer.instance.add_on_prompt_handler(harroonprompt)
