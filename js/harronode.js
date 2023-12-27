import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import "../../scripts/widgets.js";
import { ComfyWidgets } from "../../scripts/widgets.js";

let origProps = {};
let initialized = false;
let previousPrompt = "";
let tokenDict = {
    "text": {
        "location": 0,
        "currentValue":""
    },
    "color_1":{
        "location": 0,
        "currentValue":""
    },
    "color_2":{
        "location": 0,
        "currentValue":""
    },
    "color_3":{
        "location": 0,
        "currentValue":""
    },
    "style_1":{
        "location": 0,
        "currentValue":""
    },
    "style_2":{
        "location": 0,
        "currentValue":""
    },
    "accent_1":{
        "location": 0,
        "currentValue":""
    },
    "accent_2":{
        "location": 0,
        "currentValue":""
    },
    "accent_3":{
        "location": 0,
        "currentValue":""
    },
    "content_1":{
        "location": 0,
        "currentValue":""
    },
    "content_2":{
        "location": 0,
        "currentValue":""
    },
    "content_3":{
        "location": 0,
        "currentValue":""
    },
    "tokens": []
}

const harroWidgetHandlers = {
    "Harronode": {
        'color_count': handleColorCount,
        'style_count': handleStyleCount,
        'accent_count': handleAccentCount,
        'content_count': handleContentCount,
        'color_1': handlePromptChange,
        'color_2': handlePromptChange,
        'color_3': handlePromptChange,
        'style_1': handlePromptChange,
        'style_2': handlePromptChange,
        'accent_1': handlePromptChange,
        'accent_2': handlePromptChange,
        'accent_3': handlePromptChange,
        'content_1': handlePromptChange,
        'content_2': handlePromptChange,
        'content_3': handlePromptChange,
        'text_weight': handlePromptChange,
    },
};

// ------------------ HANDLERS
function handlePromptChange(node, widget) {
    rebuildPrompt(node);
}

function handleColorCount(node, widget) {
    updateColorWidgets(node, widget.value);
}

function handleStyleCount(node, widget) {
    updateStyleWidgets(node, widget.value);
}

function handleAccentCount(node, widget) {
    updateAccentWidgets(node, widget.value);
}

function handleContentCount(node, widget) {
    updateContentWidgets(node, widget.value);
}

//----------------------END HANDLERS

//-------function credit to efficiency nodes for comfyUI---------//

const findWidgetByName = (node, name) => {
    return node.widgets ? node.widgets.find((w) => w.name === name) : null;
};

const doesInputWithNameExist = (node, name) => {
    return node.inputs ? node.inputs.some((input) => input.name === name) : false;
};

const HIDDEN_TAG = "harrohide";

// function to hide a widget from view
function harrToggleWidget(node, widget, show = false, suffix = "") {
    if (!widget || doesInputWithNameExist(node, widget.name)) return;

    // Store the original properties of the widget if not already stored
    if (!origProps[widget.name]) {
        origProps[widget.name] = { origType: widget.type, origComputeSize: widget.computeSize };
    }

    const origSize = node.size;

    // Set the widget type and computeSize based on the show flag
    widget.type = show ? origProps[widget.name].origType : HIDDEN_TAG + suffix;
    widget.computeSize = show ? origProps[widget.name].origComputeSize : () => [0, -4];

    // Recursively handle linked widgets if they exist
    widget.linkedWidgets?.forEach(w => harrToggleWidget(node, w, ":" + widget.name, show));

    // Calculate the new height for the node based on its computeSize method
    const newHeight = node.computeSize()[1];
    node.setSize([node.size[0], newHeight]);
}
//--------------------------END CREDIT---------------------------//

// -- BASE CODE NEEDED BY PROMPT BUILDER
function updateColorWidgets(node, color_count){
    for (let i = 1; i <= 3; i++) {
        //find widget
        const color_picker = findWidgetByName(node, `color_${i}`)
        if(i <= color_count){
            //set visible and required
            harrToggleWidget(node, color_picker, true)
        }
        else {
            //hide and set not required
            harrToggleWidget(node, color_picker, false)
        }
    }
    rebuildPrompt(node);
}

function updateStyleWidgets(node, color_count){
    for (let i = 1; i <= 3; i++) {
        //find widget
        const style_picker = findWidgetByName(node, `style_${i}`)
        if(i <= color_count){
            //set visible and required
            harrToggleWidget(node, style_picker, true)
        }
        else {
            //hide and set not required
            harrToggleWidget(node, style_picker, false)
        }
    }
    rebuildPrompt(node);
}
function updateAccentWidgets(node, color_count){
    for (let i = 1; i <= 3; i++) {
        //find widget
        const accent_picker = findWidgetByName(node, `accent_${i}`)
        if(i <= color_count){
            //set visible and required
            harrToggleWidget(node, accent_picker, true)
        }
        else {
            //hide and set not required
            harrToggleWidget(node, accent_picker, false)
        }
    }
    rebuildPrompt(node);
}
function updateContentWidgets(node, color_count){
    for (let i = 1; i <= 3; i++) {
        //find widget
        const content_picker = findWidgetByName(node, `content_${i}`)
        if(i <= color_count){
            //set visible and required
            harrToggleWidget(node, content_picker, true)
        }
        else {
            //hide and set not required
            harrToggleWidget(node, content_picker, false)
        }
    }
    rebuildPrompt(node);
}

function buildPrompt(node, widgets = null, event = null){
    var prompt = "";
    var _widgets;
    if(widgets != null)
    {
        _widgets = widgets;
        
    }
    //get widget values from node
    else {
        if(node.comfyClass == "Harronode"){
            _widgets = node.widgets;
        }
    }
    prompt += '("' + findWidgetByName(node, "text_on_image").value+ '":' + parseFloat(findWidgetByName(node, "text_weight").value).toFixed(2) + ") text logo, ";
    //foreach color
    var colors = findWidgetByName(node, "color_count").value;
    for(var i = 1; i <= colors; i++){
        var color = findWidgetByName(node, `color_${i}`).value;
        prompt += color + ", ";
    }
    //foreach style
    var styles = findWidgetByName(node, "style_count").value;
    for(var i = 1; i <= styles; i++){
        var style = findWidgetByName(node, `style_${i}`).value;
        prompt += style + ", ";
    }
    //foreach accent
    var accents = findWidgetByName(node, "accent_count").value;
    for(var i = 1; i <= accents; i++){
        var accent = findWidgetByName(node, `accent_${i}`).value;
        prompt += accent + ", ";
    }
    //foreach content
    var contents = findWidgetByName(node, "content_count").value;
    for(var i = 1; i <= contents; i++){
        var content = findWidgetByName(node, `content_${i}`).value;
        prompt += content + ", ";
    }
    return prompt;
}

function rebuildPrompt(node){
    // build prompt
    var promptOutput = "";
    promptOutput = buildPrompt(node);
    node.widgets[0].inputEl.value = promptOutput;
}

// -- END BASE CODE NEEDED BY PROMPT BUILDER

function startupLogic (node, widget) //change name
{
    // Retrieve the handler for the current node title and widget name
    const handler = harroWidgetHandlers[node.comfyClass]?.[widget.name];
    if (handler) {
        handler(node, widget);
    }
}

app.registerExtension({
    name: "harronode.harronode",
    setup()
    {
        function harronode_node_feedback(event){
            const node = app.graph._nodes_by_id[event.detail.node_id];
            let promptOutput = "";
            let editedPrompt = node.widgets[0].inputEl.value;
            if (node) {
                if(node.comfyClass == "Harronode"){
                    let widgets = event.detail.value;
                    console.log(widgets);
                    rebuildPrompt(node);
                }
            }
            else {
                console.log(`Harronode Prompt Builder - failed to find ${event.detail.node_id}`);
            }
        }

        api.addEventListener("harronode-node-feedback", harronode_node_feedback);
    },
    async nodeCreated(node) 
    {
        for (const w of node.widgets || []) {
            let widgetValue = w.value;

            // Store the original descriptor if it exists
            let originalDescriptor = Object.getOwnPropertyDescriptor(w, 'value');
            startupLogic(node, w);
            Object.defineProperty(w, 'value', {
                get() {
                    // If there's an original getter, use it. Otherwise, return widgetValue.
                    let valueToReturn = originalDescriptor && originalDescriptor.get
                        ? originalDescriptor.get.call(w)
                        : widgetValue;

                    return valueToReturn;
                },
                set(newVal) {
                    // If there's an original setter, use it. Otherwise, set widgetValue.
                    if (originalDescriptor && originalDescriptor.set) {
                        originalDescriptor.set.call(w, newVal);
                    } else {
                        widgetValue = newVal;
                    }
                    
                    startupLogic(node, w);
                }
            });
            if(node.comfyClass == "Harronode"){
                const editablePrompt = node.widgets.find((w) => w.name == 'prompt');
                const mode_widget = node.widgets.find((w) => w.name == 'mode');
                Object.defineProperty(mode_widget, "value", {
                    set: (value) => {
                            node._mode_value = value == true || value == "Editable";
                            editablePrompt.inputEl.disabled = value == false || value == "Editable";
                        },
                    get: () => {
                            if(node._mode_value != undefined)
                                return node._mode_value;
                            else
                                return true;
                        }
                });
            }
        }
        //do this if we're messing with the prompt builder
        if(node.comfyClass == "Harronode"){
            node.widgets[0].inputEl.placeholder = "Generated Prompt - Changing a parameter may overwrite what is in this box.";
            node.widgets[1].inputEl.placeholder = "Input Text to Display on Image";
            //janky af but I don't care at this point
            if(!initialized) {
                console.log(node.widgets);
                const thebutton = node.addWidget("button", "CLICK to Rebuild Prompt (Erases edits)", "", () => {
                    rebuildPrompt(node);
                });
                initialized = true;
                console.log(node.widgets);
            }
        }
        setTimeout(() => { initialized = true; }, 500);
    }
});