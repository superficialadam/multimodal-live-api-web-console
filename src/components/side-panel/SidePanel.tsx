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

import cn from "classnames";
import { useEffect, useRef, useState } from "react";
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import Select from "react-select";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { useLoggerStore } from "../../lib/store-logger";
import Logger, { LoggerFilterType } from "../logger/Logger";
import ControlTray from "../control-tray/ControlTray";
import {
  processAIMessage,
  parseCanvasCommands,
} from "../infinite-canvas/CanvasCommandAPI";
import "./side-panel.scss";

const filterOptions = [
  { value: "conversations", label: "Conversations" },
  { value: "tools", label: "Tool Use" },
  { value: "none", label: "All" },
];

export type SidePanelProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  onVideoStreamChange?: (stream: MediaStream | null) => void;
};

export default function SidePanel({
  videoRef,
  onVideoStreamChange,
}: SidePanelProps) {
  const { connected, client, connect } = useLiveAPIContext();
  const [open, setOpen] = useState(true);
  const loggerRef = useRef<HTMLDivElement>(null);
  const loggerLastHeightRef = useRef<number>(-1);
  const { log, logs } = useLoggerStore();
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [processingCanvasCommand, setProcessingCanvasCommand] = useState(false);

  const [textInput, setTextInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Update parent component when video stream changes
  useEffect(() => {
    if (onVideoStreamChange) {
      onVideoStreamChange(videoStream);
    }
  }, [videoStream, onVideoStreamChange]);

  //scroll the log to the bottom when new logs come in
  useEffect(() => {
    if (loggerRef.current) {
      const el = loggerRef.current;
      const scrollHeight = el.scrollHeight;
      if (scrollHeight !== loggerLastHeightRef.current) {
        el.scrollTop = scrollHeight;
        loggerLastHeightRef.current = scrollHeight;
      }
    }
  }, [logs]);

  // Connect to the API when the component mounts
  useEffect(() => {
    // Only connect if not already connected
    if (!connected) {
      connect().catch((error) => {
        console.error("Failed to connect to API:", error);
        log({
          date: new Date(),
          type: "error",
          message: `Failed to connect to API: ${error.message}`,
        });
      });
    }
  }, [connect, connected, log]);

  // listen for log events and store them
  useEffect(() => {
    client.on("log", log);
    return () => {
      client.off("log", log);
    };
  }, [client, log]);

  // Listen for AI content and process for canvas commands
  useEffect(() => {
    const handleContent = (content: any) => {
      // Check if it's a model turn with text content
      if (content.modelTurn && content.modelTurn.parts) {
        const parts = content.modelTurn.parts;

        // Process each text part for canvas commands
        parts.forEach((part: any) => {
          if (part.text) {
            setProcessingCanvasCommand(true);
            try {
              const results = processAIMessage(part.text);

              // Log the results if any commands were processed
              if (results.length > 0) {
                log({
                  date: new Date(),
                  type: "canvas.commands",
                  message: `Processed ${results.length} canvas commands`,
                });
              }
            } catch (error) {
              console.error("Error processing canvas commands:", error);
              log({
                date: new Date(),
                type: "canvas.error",
                message: `Error processing canvas commands: ${error}`,
              });
            } finally {
              setProcessingCanvasCommand(false);
            }
          }
        });
      }
    };

    client.on("content", handleContent);
    return () => {
      client.off("content", handleContent);
    };
  }, [client, log]);

  const handleSubmit = () => {
    client.send([{ text: textInput }]);

    setTextInput("");
    if (inputRef.current) {
      inputRef.current.innerText = "";
    }
  };

  return (
    <div className={`side-panel ${open ? "open" : ""}`}>
      <header className="top">
        <h2>Console</h2>
        {open ? (
          <button className="opener" onClick={() => setOpen(false)}>
            <RiSidebarFoldLine color="#b4b8bb" />
          </button>
        ) : (
          <button className="opener" onClick={() => setOpen(true)}>
            <RiSidebarUnfoldLine color="#b4b8bb" />
          </button>
        )}
      </header>

      {/* Video display area */}
      <div className="video-container">
        <video
          className={cn("stream", {
            hidden: !videoRef.current || !videoStream,
          })}
          ref={videoRef}
          autoPlay
          playsInline
        />
      </div>

      {/* Media controls */}
      <div className="media-controls-container">
        <ControlTray
          videoRef={videoRef}
          supportsVideo={true}
          onVideoStreamChange={setVideoStream}
        />
      </div>

      <section className="indicators">
        <Select
          className="react-select"
          classNamePrefix="react-select"
          styles={{
            control: (baseStyles) => ({
              ...baseStyles,
              background: "var(--Neutral-15)",
              color: "var(--Neutral-90)",
              minHeight: "33px",
              maxHeight: "33px",
              border: 0,
            }),
            option: (styles, { isFocused, isSelected }) => ({
              ...styles,
              backgroundColor: isFocused
                ? "var(--Neutral-30)"
                : isSelected
                ? "var(--Neutral-20)"
                : undefined,
            }),
          }}
          defaultValue={selectedOption}
          options={filterOptions}
          onChange={(e) => {
            setSelectedOption(e);
          }}
        />
        <div
          className={cn("streaming-indicator", {
            connected: connected && !processingCanvasCommand,
            "processing-canvas": processingCanvasCommand,
          })}
        >
          {processingCanvasCommand
            ? `🎨${open ? " Processing Canvas" : ""}`
            : connected
            ? `🔵${open ? " Streaming" : ""}`
            : `⏸️${open ? " Paused" : ""}`}
        </div>
      </section>

      <div className="side-panel-container" ref={loggerRef}>
        <Logger
          filter={(selectedOption?.value as LoggerFilterType) || "none"}
        />
      </div>

      <div className={cn("input-container", { disabled: !connected })}>
        <div className="input-content">
          <textarea
            className="input-area"
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }
            }}
            onChange={(e) => setTextInput(e.target.value)}
            value={textInput}
          ></textarea>
          <span
            className={cn("input-content-placeholder", {
              hidden: textInput.length,
            })}
          >
            Type&nbsp;something...
          </span>

          <button
            className="send-button material-symbols-outlined filled"
            onClick={handleSubmit}
          >
            send
          </button>
        </div>

        {/* Test button for simulating AI response with canvas commands */}
        <div className="test-buttons">
          <button
            style={{ backgroundColor: "#5a3d7a", fontWeight: "bold" }}
            onClick={() => {
              // Simulate AI response with canvas commands
              const aiResponse = {
                modelTurn: {
                  parts: [
                    {
                      text: `I'll create some shapes for you on the canvas:

/canvas create circle {"radius": 3, "position": [0, 0, 0], "color": "#ff0000"}
/canvas create rectangle {"width": 4, "height": 3, "position": [6, 0, 0], "color": "#00ff00"}
/canvas create text {"text": "AI-Generated Content", "position": [0, -5, 0], "fontSize": 1.5, "fontColor": "#ffffff"}

You can see these shapes on the canvas now!`,
                    },
                  ],
                },
              };

              // Process the simulated response
              setProcessingCanvasCommand(true);
              try {
                const parts = aiResponse.modelTurn.parts;
                parts.forEach((part: any) => {
                  if (part.text) {
                    // Parse the commands first to see what's being extracted
                    const commands = parseCanvasCommands(part.text);
                    console.log("Test button parsed commands:", commands);

                    // Then process them
                    const results = processAIMessage(part.text);
                    console.log("Test button execution results:", results);

                    if (results.length > 0) {
                      log({
                        date: new Date(),
                        type: "canvas.commands",
                        message: `Processed ${results.length} canvas commands from test`,
                      });
                    }
                  }
                });
              } catch (error) {
                console.error("Error processing test canvas commands:", error);
              } finally {
                setProcessingCanvasCommand(false);
              }
            }}
          >
            Test AI Canvas Commands
          </button>
        </div>
      </div>
    </div>
  );
}
