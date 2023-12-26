import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

let origProps = {};
let initialized = false;
let previousPrompt = "";

const harroWidgetHandlers = {
    "Harronode": {
        'color_count': handleColorCount,
        'style_count': handleStyleCount,
        'accent_count': handleAccentCount,
        'content_count': handleContentCount
    },
    "PromptEditor": {
        'mode': handleMode
    },
};

// ------------------ HANDLERS

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

function handleMode (node, widget) {
    //const goButton = findWidgetByName(node, "Prompt looks good (GO)");
    const promptEditor = findWidgetByName(node, "promptEditor");
    if (widget.value == "Bypass"){
        //goButton.disabled = 1==1;
        promptEditor.inputEl.disabled = 1==1;
    }
    else {
        //goButton.disabled = 1==0;
        promptEditor.inputEl.disabled = 1==0;
    }
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
    console.log("colors", color_count)
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
}

// -- END BASE CODE NEEDED BY PROMPT BUILDER

function startupLogic (node, widget) //change name
{
    // Retrieve the handler for the current node title and widget name
    const handler = harroWidgetHandlers[node.comfyClass]?.[widget.name];
    if (handler) {
        handler(node, widget);
    }
    prompt = findWidgetByName(node, 'prompt');

}

function progressButtonPressed (){

}

app.registerExtension({
    name: "harronode.harronode",
    setup(){
        function harronode_populate_promptEditor(event)
        {
            const node = app.graph._nodes_by_id[event.detail.node_id];
            if (node) {
                if(node.comfyClass == "PromptEditor") {
                    let prompt = event.detail.value;
                    if (prompt != previousPrompt){
                        previousPrompt = prompt;
                        node.widgets[1].inputEl.value = event.detail.value;
                    }
                }
            } else {
                console.log(`Harronode Prompt Editor - failed to find ${event.detail.node_id}`)
            }
        }

        function harronode_node_feedback(event){
            const node = app.graph._nodes_by_id[event.detail.node_id];
            if (node) {
                if(node.comfyClass == "Harronode"){
                    let prompt = event.detail.value;
                    node.widgets[0].inputEl.value = prompt;
                }
            }
            else {
                console.log(`Harronode Prompt Builder - failed to find ${event.detail.node_id}`);
            }
        }

        api.addEventListener("harronode-populate-promptEditor", harronode_populate_promptEditor);
        api.addEventListener("harronode-node-feedback", harronode_node_feedback);
    },
    async nodeCreated(node) {
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
        }
        //do this if we're messing with the prompt builder
        if(node.comfyClass == "Harronode"){
            node.widgets[0].inputEl.placeholder = "Populated Prompt (Will be generated automatically)";
            node.widgets[1].inputEl.placeholder = "Input Text to Display on Image";
            const prompt = node.widgets.find((w) => w.name == 'prompt');
            prompt.inputEl.disabled = 1 == 1;
        }
        //do this if we're messing with the prompt editor
        if(node.comfyClass == "PromptEditor") {
            const mode = node.widgets.find((w) => w.name === "mode");
            node.widgets[1].inputEl.placeholder = "Populated Prompt (Will be generated automatically)";
            console.log("setting size");
            const newHeight = node.computeSize()[1];
            node.setSize([node.size[0], newHeight]);
        }
        setTimeout(() => { initialized = true; }, 500);
    }
});
