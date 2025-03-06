/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCanvasStore } from "./CanvasState";
import {
  CanvasElementType,
  CircleElement,
  RectangleElement,
  LineElement,
  PolygonElement,
  TextElement,
  ImageElement,
} from "./canvas-elements/types";

// Define the command types
export type CanvasCommandType =
  | "create"
  | "update"
  | "delete"
  | "clear"
  | "select"
  | "deselect";

// Define the element types that can be created
export type CanvasElementCreateType =
  | "circle"
  | "rectangle"
  | "line"
  | "polygon"
  | "text"
  | "image";

// Define the command structure
export interface CanvasCommand {
  command: CanvasCommandType;
  elementType?: CanvasElementCreateType;
  elementId?: string;
  params?: any;
}

// Command pattern for extracting commands from AI messages
const COMMAND_PATTERN = /\/canvas\s+(\w+)(?:\s+(\w+))?(?:\s+(.+))?/i;
// Updated JSON pattern to match arrays as well as objects
const JSON_PATTERN = /```(?:json)?\s*([\[\{][\s\S]*?[\]\}])\s*```/i;

/**
 * Parse a message to extract canvas commands
 * @param message The message to parse
 * @returns An array of canvas commands
 */
export function parseCanvasCommands(message: string): CanvasCommand[] {
  const commands: CanvasCommand[] = [];

  // Look for explicit commands with the /canvas prefix
  const lines = message.split("\n");
  for (const line of lines) {
    const match = line.match(COMMAND_PATTERN);
    if (match) {
      const [_, command, elementType, paramsStr] = match;

      let params: any = {};

      // Try to parse params as JSON if they exist
      if (paramsStr) {
        try {
          params = JSON.parse(paramsStr);
        } catch (e) {
          // If not valid JSON, use as a simple string parameter
          params = { text: paramsStr };
        }
      }

      commands.push({
        command: command.toLowerCase() as CanvasCommandType,
        elementType: elementType?.toLowerCase() as CanvasElementCreateType,
        params,
      });
    }
  }

  // Look for JSON blocks that might contain commands
  const jsonMatches = message.match(JSON_PATTERN);
  if (jsonMatches && jsonMatches[1]) {
    try {
      const jsonData = JSON.parse(jsonMatches[1]);

      // If it's an array, assume it's an array of commands
      if (Array.isArray(jsonData)) {
        commands.push(...jsonData);
      }
      // If it has a command property, assume it's a single command
      else if (jsonData.command) {
        commands.push(jsonData);
      }
    } catch (e) {
      console.error("Failed to parse JSON command:", e);
    }
  }

  return commands;
}

/**
 * Execute a canvas command
 * @param command The command to execute
 * @returns The ID of the created or updated element, or undefined
 */
export function executeCanvasCommand(
  command: CanvasCommand
): string | undefined {
  const store = useCanvasStore.getState();

  switch (command.command) {
    case "create":
      if (!command.elementType) {
        console.error("Element type is required for create command");
        return undefined;
      }
      return createCanvasElement(command.elementType, command.params);

    case "update":
      if (!command.elementId) {
        console.error("Element ID is required for update command");
        return undefined;
      }
      updateCanvasElement(command.elementId, command.params);
      return command.elementId;

    case "delete":
      if (!command.elementId) {
        console.error("Element ID is required for delete command");
        return undefined;
      }
      store.removeElement(command.elementId);
      return command.elementId;

    case "clear":
      store.clearCanvas();
      return undefined;

    case "select":
      if (!command.elementId) {
        console.error("Element ID is required for select command");
        return undefined;
      }
      store.selectElement(command.elementId);
      return command.elementId;

    case "deselect":
      store.clearSelection();
      return undefined;

    default:
      console.error(`Unknown command: ${command.command}`);
      return undefined;
  }
}

/**
 * Create a new canvas element
 * @param elementType The type of element to create
 * @param params The parameters for the element
 * @returns The ID of the created element
 */
function createCanvasElement(
  elementType: CanvasElementCreateType,
  params: any = {}
): string {
  const store = useCanvasStore.getState();

  // Default position, rotation, scale, color, and opacity
  const position = params.position || [0, 0, 0];
  const rotation = params.rotation || [0, 0, 0];
  const scale = params.scale || [1, 1, 1];
  const color = params.color || "#ffffff";
  const opacity = params.opacity !== undefined ? params.opacity : 1;

  let element: Partial<CanvasElementType>;

  switch (elementType) {
    case "circle":
      element = {
        type: "circle",
        position,
        rotation,
        scale,
        color,
        opacity,
        radius: params.radius || 1,
        filled: params.filled !== undefined ? params.filled : true,
        lineWidth: params.lineWidth || 1,
      } as CircleElement;
      break;

    case "rectangle":
      element = {
        type: "rectangle",
        position,
        rotation,
        scale,
        color,
        opacity,
        width: params.width || 2,
        height: params.height || 1,
        filled: params.filled !== undefined ? params.filled : true,
        lineWidth: params.lineWidth || 1,
      } as RectangleElement;
      break;

    case "line":
      element = {
        type: "line",
        position,
        rotation,
        scale,
        color,
        opacity,
        points: params.points || [
          [0, 0, 0],
          [1, 1, 0],
        ],
        lineWidth: params.lineWidth || 1,
      } as LineElement;
      break;

    case "polygon":
      element = {
        type: "polygon",
        position,
        rotation,
        scale,
        color,
        opacity,
        points: params.points || [
          [0, 0, 0],
          [1, 0, 0],
          [1, 1, 0],
          [0, 1, 0],
        ],
        filled: params.filled !== undefined ? params.filled : true,
        lineWidth: params.lineWidth || 1,
      } as PolygonElement;
      break;

    case "text":
      element = {
        type: "text",
        position,
        rotation,
        scale,
        color,
        opacity,
        text: params.text || "Text",
        fontSize: params.fontSize || 1,
        fontColor: params.fontColor || color,
      } as TextElement;
      break;

    case "image":
      element = {
        type: "image",
        position,
        rotation,
        scale,
        color,
        opacity,
        url: params.url || "/logo.jpg",
        width: params.width || 3,
        height: params.height || 2,
      } as ImageElement;
      break;

    default:
      console.error(`Unknown element type: ${elementType}`);
      return "";
  }

  return store.addElement(element as any);
}

/**
 * Update an existing canvas element
 * @param elementId The ID of the element to update
 * @param params The parameters to update
 */
function updateCanvasElement(elementId: string, params: any = {}): void {
  const store = useCanvasStore.getState();

  // Find the element to update
  const elements = store.elements;
  const element = elements.find((e) => e.id === elementId);

  if (!element) {
    console.error(`Element with ID ${elementId} not found`);
    return;
  }

  // Create a copy of the params without the type property
  // as we don't want to change the element type
  const { type, ...updateParams } = params;

  // Update the element
  store.updateElement(elementId, updateParams);
}

/**
 * Process an AI message to extract and execute canvas commands
 * @param message The AI message to process
 * @returns An array of results from executing the commands
 */
export function processAIMessage(message: string): (string | undefined)[] {
  const commands = parseCanvasCommands(message);
  return commands.map(executeCanvasCommand);
}
