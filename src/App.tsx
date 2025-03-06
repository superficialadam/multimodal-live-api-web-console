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

import { useRef, useState, useEffect } from "react";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import { InfiniteCanvas } from "./components/infinite-canvas/InfiniteCanvas";
import { LiveConfig } from "./multimodal-live-types";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

// Canvas command API system instructions
const canvasSystemInstructions = `
You have access to an infinite canvas that you can draw on. You can create, update, and manipulate elements on the canvas using the following commands:

1. Inline Commands:
   /canvas [command] [elementType] [parameters]
   
   Example: /canvas create circle {"radius": 2, "position": [0, 0, 0], "color": "#ff0000"}

2. JSON Block Commands:
   \`\`\`json
   {
     "command": "create",
     "elementType": "rectangle",
     "params": {
       "width": 3,
       "height": 2,
       "position": [0, 0, 0],
       "color": "#00ff00"
     }
   }
   \`\`\`

Supported commands: create, update, delete, clear, select, deselect
Supported element types: circle, rectangle, line, polygon, text, image

Use these commands to visualize information, create diagrams, or illustrate concepts for the user.
`;

function App() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  const videoRef = useRef<HTMLVideoElement>(null);
  // We still need setVideoStream for the SidePanel, but we can silence the ESLint warning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setVideoStream] = useState<MediaStream | null>(null);
  const [config, setConfig] = useState<LiveConfig>({
    model: "models/gemini-2.0-flash-exp",
    systemInstruction: {
      parts: [{ text: canvasSystemInstructions }],
    },
  });

  // Connect to the API when the component mounts
  useEffect(() => {
    // We'll use the LiveAPIContext to connect in the SidePanel component
    // This is just to ensure the config is properly set
    console.log("Canvas command API system instructions loaded");
  }, []);

  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY} config={config}>
        <div className="streaming-console">
          {/* Pass videoRef and onVideoStreamChange to SidePanel */}
          <SidePanel videoRef={videoRef} onVideoStreamChange={setVideoStream} />
          <main>
            <div className="main-app-area">
              {/* Replace Altair and video with InfiniteCanvas */}
              <InfiniteCanvas />
            </div>
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
