/**
 * Types for canvas elements
 */

// Base element type that all shapes extend
export interface CanvasElement {
  id: string;
  type: string;
  position: [number, number, number]; // x, y, z coordinates
  rotation: [number, number, number]; // x, y, z rotation in radians
  scale: [number, number, number]; // x, y, z scale
  color: string;
  opacity: number;
  selected?: boolean;
}

// Circle element
export interface CircleElement extends CanvasElement {
  type: "circle";
  radius: number;
  segments?: number; // Optional: number of segments (detail level)
  filled: boolean;
  lineWidth?: number; // For non-filled circles
}

// Rectangle element
export interface RectangleElement extends CanvasElement {
  type: "rectangle";
  width: number;
  height: number;
  filled: boolean;
  lineWidth?: number; // For non-filled rectangles
}

// Line element
export interface LineElement extends CanvasElement {
  type: "line";
  points: [number, number, number][]; // Array of 3D points
  lineWidth: number;
}

// Polygon element
export interface PolygonElement extends CanvasElement {
  type: "polygon";
  points: [number, number, number][]; // Array of 3D points
  filled: boolean;
  lineWidth?: number; // For non-filled polygons
}

// Text element
export interface TextElement extends CanvasElement {
  type: "text";
  text: string;
  fontSize: number;
  fontColor: string;
}

// Image element
export interface ImageElement extends CanvasElement {
  type: "image";
  url: string;
  width: number;
  height: number;
}

// Union type of all possible canvas elements
export type CanvasElementType =
  | CircleElement
  | RectangleElement
  | LineElement
  | PolygonElement
  | TextElement
  | ImageElement;

// Canvas state
export interface CanvasState {
  elements: CanvasElementType[];
  selectedElementId: string | null;
}
