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
    figma.showUI(__html__, { width: 900, height: 600 });
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
                        collections: [],
                        error: null
                    });
                    return;
                }
                // Get all variable collections to access mode information
                const collections = yield figma.variables.getLocalVariableCollectionsAsync();
                // Create a map of collection id to modes for easier lookup
                const collectionModes = {};
                collections.forEach((collection) => {
                    collectionModes[collection.id] = collection.modes;
                });
                // Process each variable
                const variableInfos = [];
                for (const variableRef of localVariables) {
                    try {
                        // Get the full variable object using the ID
                        const variable = yield figma.variables.getVariableByIdAsync(variableRef.id);
                        const modes = collectionModes[variable.variableCollectionId] || [];
                        const values = modes.map(mode => {
                            // Access the value for this mode
                            const value = variable.valuesByMode[mode.id];
                            return {
                                mode: mode.name,
                                value: value
                            };
                        });
                        variableInfos.push({
                            id: variable.id,
                            name: variable.name,
                            resolvedType: variable.resolvedType,
                            values: values,
                            collectionId: variable.variableCollectionId
                        });
                    }
                    catch (error) {
                        console.error(`Error processing variable ${variableRef.id}:`, error);
                    }
                }
                // Send the variables and collections back to the UI
                figma.ui.postMessage({
                    type: 'variables-result',
                    variables: variableInfos,
                    collections: collections.map((collection) => ({
                        id: collection.id,
                        name: collection.name,
                        modes: collection.modes
                    })),
                    error: null
                });
            }
            catch (error) {
                console.error('Error reading variables:', error);
                figma.ui.postMessage({
                    type: 'variables-result',
                    variables: [],
                    collections: [],
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        }
        if (msg.type === 'resize-window') {
            // Resize the plugin window
            figma.ui.resize(msg.width, msg.height);
        }
        if (msg.type === 'cancel') {
            figma.closePlugin();
        }
    });
}
// Runs this code if the plugin is run in FigJam
if (figma.editorType === 'figjam') {
    figma.showUI(__html__, { width: 900, height: 600 });
    figma.ui.onmessage = (msg) => {
        if (msg.type === 'resize-window') {
            // Resize the plugin window
            figma.ui.resize(msg.width, msg.height);
        }
        if (msg.type === 'cancel') {
            figma.closePlugin();
        }
    };
}
// Runs this code if the plugin is run in Slides
if (figma.editorType === 'slides') {
    figma.showUI(__html__, { width: 900, height: 600 });
    figma.ui.onmessage = (msg) => {
        if (msg.type === 'resize-window') {
            // Resize the plugin window
            figma.ui.resize(msg.width, msg.height);
        }
        if (msg.type === 'cancel') {
            figma.closePlugin();
        }
    };
}
