"""
@author: HarroweD and quadmoon (https://github.com/traugdor)
@title: Harrlogos Prompt Builder Node
@nickname: Harronode
@description: This extension to ComfyUI will build a prompt for the Harrlogos LoRA for SDXL.
"""


from .harronode import Harronode,PromptEditor
from .harroserver import HarroServer

NODE_CLASS_MAPPINGS = {
    "Harronode": Harronode,
    "PromptEditor": PromptEditor
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "Harronode": "Harronode - Prompt Builder",
    "PromptEditor": "Harronode - Prompt Editor"
}

WEB_DIRECTORY = "js"

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']
