import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import "../../scripts/widgets.js";

let origProps = {};
let initialized = false;
let oldTTI = "";

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
        'desired_image_text': handlePromptChange,
    },
};

function handlePromptChange(node, widget) {
    rebuildPrompt(node, widget);
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

const findWidgetByName = (node, name) => node.widgets ? node.widgets.find((w) => w.name === name) : null;

const doesInputWithNameExist = (node, name) => node.inputs ? node.inputs.some((input) => input.name === name) : false;

const HIDDEN_TAG = "harrohide";

function harrToggleWidget(node, widget, show = false, suffix = "") {
    if (!widget || doesInputWithNameExist(node, widget.name)) return;

    if (!origProps[widget.name]) {
        origProps[widget.name] = { origType: widget.type, origComputeSize: widget.computeSize };
    }

    widget.type = show ? origProps[widget.name].origType : HIDDEN_TAG + suffix;
    widget.computeSize = show ? origProps[widget.name].origComputeSize : () => [0, -4];

    widget.linkedWidgets?.forEach(w => harrToggleWidget(node, w, ":" + widget.name, show));

    const newHeight = node.computeSize()[1];
    node.setSize([node.size[0], newHeight]);
}

function updateColorWidgets(node, count) {
    updateWidgetsByCount(node, "color", count);
}

function updateStyleWidgets(node, count) {
    updateWidgetsByCount(node, "style", count);
}

function updateAccentWidgets(node, count) {
    updateWidgetsByCount(node, "accent", count);
}

function updateContentWidgets(node, count) {
    updateWidgetsByCount(node, "content", count);
}

function updateWidgetsByCount(node, type, count) {
    for (let i = 1; i <= 3; i++) {
        const widget = findWidgetByName(node, `${type}_${i}`);
        harrToggleWidget(node, widget, i <= count);
    }
    rebuildPrompt(node);
}

function buildPrompt(node, widgets = null) {
    let prompt = '';
    const widgetArray = widgets || node.widgets;

    prompt += `("${findWidgetByName(node, "desired_image_text").value}":${parseFloat(findWidgetByName(node, "text_weight").value).toFixed(2)}) text logo, `;

    //TY ChatGPT <3  ;)
    ['color', 'style', 'accent', 'content'].forEach((type) => {
        const count = findWidgetByName(node, `${type}_count`).value;
        for (let i = 1; i <= count; i++) {
            const value = findWidgetByName(node, `${type}_${i}`).value;
            prompt += `${value}, `;
        }
    });

    return prompt;
}

function rebuildPrompt(node, widget) {
    var promptOutput = "";
    if (widget){
        console.log(widget.name);
        if (widget.name == "desired_image_text"){
            if(widget.value != oldTTI) {
                console.log("Old TTI =", oldTTI);
                console.log("widget.value =", widget.value);
                oldTTI = widget.value;
                promptOutput = buildPrompt(node);
                node.widgets[17].inputEl.value = promptOutput;
            }
        }
        else {
            promptOutput = buildPrompt(node);
            node.widgets[17].inputEl.value = promptOutput;
        }
    }
}

function startupLogic(node, widget) {
    const handler = harroWidgetHandlers[node.comfyClass]?.[widget.name];
    if (handler) {
        handler(node, widget);
    }
}

function harronode_node_feedback(event) {
    const node = app.graph._nodes_by_id[event.detail.node_id];
    if (node && node.comfyClass === "Harronode") {
        rebuildPrompt(node);
    } else {
        console.log(`Harronode Prompt Builder - failed to find ${event.detail.node_id}`);
    }
}

app.registerExtension({
    name: "harronode.harronode",
    nodeCreated(node) {
        if (node.comfyClass === "Harronode") {
            for (const w of node.widgets || []) {
                let widgetValue = w.value;
                let originalDescriptor = Object.getOwnPropertyDescriptor(w, 'value');
                startupLogic(node, w);
                Object.defineProperty(w, 'value', {
                    get() {
                        let valueToReturn = originalDescriptor && originalDescriptor.get
                            ? originalDescriptor.get.call(w)
                            : widgetValue;
                        return valueToReturn;
                    },
                    set(newVal) {
                        if (originalDescriptor && originalDescriptor.set) {
                            originalDescriptor.set.call(w, newVal);
                        } else {
                            widgetValue = newVal;
                        }
                        startupLogic(node, w);
                    }
                });
            }
            node.widgets[17].inputEl.placeholder = "Generated Prompt - Changing a parameter may overwrite what is in this box.";
            api.addEventListener("harronode-node-feedback", harronode_node_feedback);
        }
        setTimeout(() => { initialized = true; }, 500);
    }
});
