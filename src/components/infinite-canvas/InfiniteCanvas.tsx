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

import { memo, useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Text } from "@react-three/drei";
import * as THREE from "three";
import "./infinite-canvas.scss";
import { useCanvasStore, createTestElements } from "./CanvasState";
import {
  Circle,
  Rectangle,
  Line,
  Polygon,
  Text as CanvasText,
  Image as CanvasImage,
} from "./canvas-elements";

// Grid component for the infinite canvas
function CanvasGrid({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <Grid
      cellSize={1}
      cellThickness={0.5}
      cellColor="#6f6f6f"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#9d4b4b"
      fadeDistance={50}
      fadeStrength={1.5}
      infiniteGrid
    />
  );
}

// Info text that displays current camera position
function InfoText() {
  const { camera } = useThree();
  const [position, setPosition] = useState<string>("x: 0, y: 0, z: 0");

  useFrame(() => {
    setPosition(
      `x: ${camera.position.x.toFixed(2)}, y: ${camera.position.y.toFixed(
        2
      )}, z: ${camera.position.z.toFixed(2)}`
    );
  });

  return (
    <Text
      position={[0, 0, 0]}
      color="white"
      anchorX="center"
      anchorY="middle"
      fontSize={0.5}
    >
      {position}
    </Text>
  );
}

// Create a global interface for camera reset
interface WindowWithReset extends Window {
  resetCanvasCamera?: () => void;
}

// Component to render canvas elements
function CanvasElements({
  onElementClick,
}: {
  onElementClick?: (id: string) => void;
}) {
  const elements = useCanvasStore((state) => state.elements);

  return (
    <>
      {elements.map((element) => {
        switch (element.type) {
          case "circle":
            return (
              <Circle
                key={element.id}
                element={element}
                onClick={onElementClick}
              />
            );
          case "rectangle":
            return (
              <Rectangle
                key={element.id}
                element={element}
                onClick={onElementClick}
              />
            );
          case "line":
            return (
              <Line
                key={element.id}
                element={element}
                onClick={onElementClick}
              />
            );
          case "polygon":
            return (
              <Polygon
                key={element.id}
                element={element}
                onClick={onElementClick}
              />
            );
          case "text":
            return (
              <CanvasText
                key={element.id}
                element={element}
                onClick={onElementClick}
              />
            );
          case "image":
            return (
              <CanvasImage
                key={element.id}
                element={element}
                onClick={onElementClick}
              />
            );
          default:
            console.warn(`Unknown element type: ${element.type}`);
            return null;
        }
      })}
    </>
  );
}

// Scene component with access to camera controls
function Scene({ showGrid }: { showGrid: boolean }) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const selectElement = useCanvasStore((state) => state.selectElement);

  // Set up camera for 2D view in the xy plane
  useEffect(() => {
    // Position camera in front of the xy plane
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    // Standard up vector for xy plane
    camera.up.set(0, 1, 0);
  }, [camera]);

  // Create resetCamera function with useCallback to avoid recreation on each render
  const resetCamera = useCallback(() => {
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [camera, controlsRef]);

  // Expose the reset function to parent via global window object
  useEffect(() => {
    (window as WindowWithReset).resetCanvasCamera = resetCamera;
    return () => {
      delete (window as WindowWithReset).resetCanvasCamera;
    };
  }, [resetCamera]);

  const handleElementClick = useCallback(
    (id: string) => {
      selectElement(id);
    },
    [selectElement]
  );

  return (
    <>
      <color attach="background" args={["#1c1f21"]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 25, 0]} />

      {/* Grid for reference */}
      <CanvasGrid visible={showGrid} />

      {/* Canvas elements */}
      <CanvasElements onElementClick={handleElementClick} />

      {/* Info text */}
      <InfoText />

      {/* Camera controls for pan and zoom only (no rotation) */}
      <OrbitControls
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.25}
        enableRotate={false} // Disable rotation
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN, // Left click for panning
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        minDistance={5}
        maxDistance={100}
      />
    </>
  );
}

// Main component for the infinite canvas
function InfiniteCanvasComponent() {
  const [showGrid, setShowGrid] = useState(true);
  const clearCanvas = useCanvasStore((state) => state.clearCanvas);
  const elements = useCanvasStore((state) => state.elements);

  const resetView = () => {
    const win = window as WindowWithReset;
    if (win.resetCanvasCamera) {
      win.resetCanvasCamera();
    }
  };

  // Load test elements when the component mounts
  useEffect(() => {
    if (elements.length === 0) {
      createTestElements();
    }
  }, [elements.length]);

  return (
    <div className="infinite-canvas">
      <Canvas
        camera={{ position: [0, 20, 0], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Scene showGrid={showGrid} />
      </Canvas>

      {/* Controls overlay */}
      <div className="canvas-controls">
        <button onClick={() => setShowGrid(!showGrid)}>
          {showGrid ? "Hide Grid" : "Show Grid"}
        </button>
        <button onClick={resetView}>Reset View</button>
        <button onClick={createTestElements}>Load Test Elements</button>
        <button onClick={clearCanvas}>Clear Canvas</button>
      </div>

      {/* Element count */}
      <div className="element-count">Elements: {elements.length}</div>

      {/* Info panel */}
      <div className="info-panel">
        <p>Left-click + drag: Pan</p>
        <p>Scroll: Zoom</p>
        <p>Click on element: Select</p>
      </div>
    </div>
  );
}

export const InfiniteCanvas = memo(InfiniteCanvasComponent);
