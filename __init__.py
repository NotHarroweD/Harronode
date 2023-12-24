"""
@author: HarroweD and quadmoon (https://github.com/traugdor)
@title: Harrlogos Prompt Builder Node
@nickname: Harronode
@description: This extension to ComfyUI will build a prompt for the Harrlogos LoRA for SDXL.
"""


from .harronode import Harronode

NODE_CLASS_MAPPINGS = {
    "Harronode": Harronode

}

NODE_DISPLAY_NAME_MAPPINGS = {
    "Harronode": "Harronode - Prompt Builder"
}

WEB_DIRECTORY = "js"

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']
