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

import {
  parseCanvasCommands,
  executeCanvasCommand,
  processAIMessage,
  CanvasCommand,
  CanvasCommandType,
} from "./CanvasCommandAPI";

/**
 * This file contains test functions for the Canvas Command API.
 * These functions can be called from the browser console to test the API.
 */

// Make the test functions available globally
declare global {
  interface Window {
    testCanvasCommands: typeof testCanvasCommands;
    testInlineCommands: typeof testInlineCommands;
    testJsonCommands: typeof testJsonCommands;
    testMixedCommands: typeof testMixedCommands;
    testUpdateCommands: typeof testUpdateCommands;
    testDeleteCommands: typeof testDeleteCommands;
    testClearCommand: typeof testClearCommand;
    testSelectCommand: typeof testSelectCommand;
  }
}

/**
 * Test the parsing of canvas commands
 */
export function testCanvasCommands() {
  console.log("Testing Canvas Command API...");

  // Test inline commands
  testInlineCommands();

  // Test JSON commands
  testJsonCommands();

  // Test mixed commands
  testMixedCommands();

  // Test update commands
  testUpdateCommands();

  // Test delete commands
  testDeleteCommands();

  // Test clear command
  testClearCommand();

  // Test select command
  testSelectCommand();

  console.log("All tests completed!");
}

/**
 * Test inline commands
 */
export function testInlineCommands() {
  console.log("Testing inline commands...");

  const message = `
    Let me create some shapes for you:
    
    /canvas create circle {"radius": 2, "position": [0, 0, 0], "color": "#ff0000"}
    /canvas create rectangle {"width": 3, "height": 2, "position": [5, 0, 0], "color": "#00ff00"}
    /canvas create line {"points": [[0, 0, 0], [0, 3, 0], [3, 3, 0]], "color": "#0000ff", "lineWidth": 2}
  `;

  const commands = parseCanvasCommands(message);
  console.log("Parsed inline commands:", commands);

  // Execute the commands
  const results = processAIMessage(message);
  console.log("Execution results:", results);
}

/**
 * Test JSON commands
 */
export function testJsonCommands() {
  console.log("Testing JSON commands...");

  const message = `
    Here are some shapes I'll create for you:
    
    \`\`\`json
    [
      {
        "command": "create",
        "elementType": "circle",
        "params": {
          "radius": 2,
          "position": [0, 5, 0],
          "color": "#ff00ff"
        }
      },
      {
        "command": "create",
        "elementType": "text",
        "params": {
          "text": "Hello, Canvas!",
          "position": [3, 5, 0],
          "fontSize": 1
        }
      }
    ]
    \`\`\`
  `;

  const commands = parseCanvasCommands(message);
  console.log("Parsed JSON commands:", commands);

  // Execute the commands
  const results = processAIMessage(message);
  console.log("Execution results:", results);
}

/**
 * Test mixed commands
 */
export function testMixedCommands() {
  console.log("Testing mixed commands...");

  const message = `
    I'll create a few shapes using different command styles:
    
    /canvas create polygon {"points": [[0, 0, 0], [2, 0, 0], [2, 2, 0], [0, 2, 0]], "position": [0, -5, 0], "color": "#ffff00"}
    
    And here's an image:
    
    \`\`\`json
    {
      "command": "create",
      "elementType": "image",
      "params": {
        "url": "/logo.jpg",
        "position": [-8, -5, 0],
        "width": 6,
        "height": 2
      }
    }
    \`\`\`
  `;

  const commands = parseCanvasCommands(message);
  console.log("Parsed mixed commands:", commands);

  // Execute the commands
  const results = processAIMessage(message);
  console.log("Execution results:", results);
}

/**
 * Test update commands
 */
export function testUpdateCommands() {
  console.log("Testing update commands...");

  // First create an element
  const createMessage = `/canvas create circle {"radius": 2, "position": [0, 0, 0], "color": "#ff0000"}`;
  const createResults = processAIMessage(createMessage);
  console.log("Created element with ID:", createResults[0]);

  if (createResults[0]) {
    // Then update it
    const elementId = createResults[0];
    // Create a command object directly instead of parsing from a string
    const updateCommand: CanvasCommand = {
      command: "update" as CanvasCommandType,
      elementId: elementId,
      params: {
        position: [5, 5, 0],
        color: "#00ff00",
      },
    };
    const updateResults = [executeCanvasCommand(updateCommand)];
    console.log("Update results:", updateResults);
  }
}

/**
 * Test delete commands
 */
export function testDeleteCommands() {
  console.log("Testing delete commands...");

  // First create an element
  const createMessage = `/canvas create rectangle {"width": 3, "height": 2, "position": [0, 0, 0], "color": "#ff0000"}`;
  const createResults = processAIMessage(createMessage);
  console.log("Created element with ID:", createResults[0]);

  if (createResults[0]) {
    // Then delete it
    const elementId = createResults[0];
    // Create a command object directly instead of parsing from a string
    const deleteCommand: CanvasCommand = {
      command: "delete" as CanvasCommandType,
      elementId: elementId,
    };
    const deleteResults = [executeCanvasCommand(deleteCommand)];
    console.log("Delete results:", deleteResults);
  }
}

/**
 * Test clear command
 */
export function testClearCommand() {
  console.log("Testing clear command...");

  // First create some elements
  const createMessage = `
    /canvas create circle {"radius": 2, "position": [0, 0, 0], "color": "#ff0000"}
    /canvas create rectangle {"width": 3, "height": 2, "position": [5, 0, 0], "color": "#00ff00"}
  `;
  processAIMessage(createMessage);

  // Then clear the canvas
  const clearCommand: CanvasCommand = {
    command: "clear" as CanvasCommandType,
  };
  const clearResults = [executeCanvasCommand(clearCommand)];
  console.log("Clear results:", clearResults);
}

/**
 * Test select command
 */
export function testSelectCommand() {
  console.log("Testing select command...");

  // First create an element
  const createMessage = `/canvas create circle {"radius": 2, "position": [0, 0, 0], "color": "#ff0000"}`;
  const createResults = processAIMessage(createMessage);
  console.log("Created element with ID:", createResults[0]);

  if (createResults[0]) {
    // Then select it
    const elementId = createResults[0];
    // Create a command object directly instead of parsing from a string
    const selectCommand: CanvasCommand = {
      command: "select" as CanvasCommandType,
      elementId: elementId,
    };
    const selectResults = [executeCanvasCommand(selectCommand)];
    console.log("Select results:", selectResults);

    // Then deselect it
    const deselectCommand: CanvasCommand = {
      command: "deselect" as CanvasCommandType,
    };
    const deselectResults = [executeCanvasCommand(deselectCommand)];
    console.log("Deselect results:", deselectResults);
  }
}

// Make the test functions available globally
window.testCanvasCommands = testCanvasCommands;
window.testInlineCommands = testInlineCommands;
window.testJsonCommands = testJsonCommands;
window.testMixedCommands = testMixedCommands;
window.testUpdateCommands = testUpdateCommands;
window.testDeleteCommands = testDeleteCommands;
window.testClearCommand = testClearCommand;
window.testSelectCommand = testSelectCommand;
