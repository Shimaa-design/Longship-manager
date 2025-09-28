"use strict";
// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Runs this code if the plugin is run in Figma
if (figma.editorType === 'figma') {
    // This shows the HTML page in "ui.html".
    figma.showUI(__html__, { width: 400, height: 600 });
    // Calls to "parent.postMessage" from within the HTML page will trigger this
    // callback. The callback will be passed the "pluginMessage" property of the
    // posted message.
    figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
        if (msg.type === 'read-variables') {
            try {
                // Get all local variables in the current file
                const localVariables = yield figma.variables.getLocalVariablesAsync();
                if (localVariables.length === 0) {
                    figma.ui.postMessage({
                        type: 'variables-result',
                        variables: [],
                        error: null
                    });
                    return;
                }
                // Get all variable collections to access mode information
                const collections = yield figma.variables.getLocalVariableCollectionsAsync();
                // Create a map of collection id to modes for easier lookup
                const collectionModes = {};
                collections.forEach(collection => {
                    collectionModes[collection.id] = collection.modes;
                });
                // Process each variable
                const variableInfos = [];
                for (const variable of localVariables) {
                    const modes = collectionModes[variable.variableCollectionId] || [];
                    const values = modes.map(mode => ({
                        mode: mode.name,
                        value: variable.valuesByMode[mode.id]
                    }));
                    variableInfos.push({
                        id: variable.id,
                        name: variable.name,
                        resolvedType: variable.resolvedType,
                        values: values
                    });
                }
                // Send the variables back to the UI
                figma.ui.postMessage({
                    type: 'variables-result',
                    variables: variableInfos,
                    error: null
                });
            }
            catch (error) {
                console.error('Error reading variables:', error);
                figma.ui.postMessage({
                    type: 'variables-result',
                    variables: [],
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        }
        // Original shape creation functionality
        if (msg.type === 'create-shapes') {
            const numberOfRectangles = msg.count || 5;
            const nodes = [];
            for (let i = 0; i < numberOfRectangles; i++) {
                const rect = figma.createRectangle();
                rect.x = i * 150;
                rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
                figma.currentPage.appendChild(rect);
                nodes.push(rect);
            }
            figma.currentPage.selection = nodes;
            figma.viewport.scrollAndZoomIntoView(nodes);
            // Close plugin after creating shapes
            figma.closePlugin();
        }
        if (msg.type === 'cancel') {
            figma.closePlugin();
        }
    });
}
// Runs this code if the plugin is run in FigJam
if (figma.editorType === 'figjam') {
    figma.showUI(__html__, { width: 400, height: 600 });
    figma.ui.onmessage = (msg) => {
        if (msg.type === 'create-shapes') {
            const numberOfShapes = msg.count || 5;
            const nodes = [];
            for (let i = 0; i < numberOfShapes; i++) {
                const shape = figma.createShapeWithText();
                shape.shapeType = 'ROUNDED_RECTANGLE';
                shape.x = i * (shape.width + 200);
                shape.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
                figma.currentPage.appendChild(shape);
                nodes.push(shape);
            }
            for (let i = 0; i < numberOfShapes - 1; i++) {
                const connector = figma.createConnector();
                connector.strokeWeight = 8;
                connector.connectorStart = {
                    endpointNodeId: nodes[i].id,
                    magnet: 'AUTO',
                };
                connector.connectorEnd = {
                    endpointNodeId: nodes[i + 1].id,
                    magnet: 'AUTO',
                };
            }
            figma.currentPage.selection = nodes;
            figma.viewport.scrollAndZoomIntoView(nodes);
            figma.closePlugin();
        }
        if (msg.type === 'cancel') {
            figma.closePlugin();
        }
    };
}
// Runs this code if the plugin is run in Slides
if (figma.editorType === 'slides') {
    figma.showUI(__html__, { width: 400, height: 600 });
    figma.ui.onmessage = (msg) => {
        if (msg.type === 'create-shapes') {
            const numberOfSlides = msg.count || 5;
            const nodes = [];
            for (let i = 0; i < numberOfSlides; i++) {
                const slide = figma.createSlide();
                nodes.push(slide);
            }
            figma.viewport.slidesView = 'grid';
            figma.currentPage.selection = nodes;
            figma.closePlugin();
        }
        if (msg.type === 'cancel') {
            figma.closePlugin();
        }
    };
}
