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

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { CanvasState, CanvasElementType } from "./canvas-elements/types";

// Define the store interface with looser typing to avoid TypeScript errors
interface CanvasStore {
  // State
  elements: any[];
  selectedElementId: string | null;

  // Actions
  addElement: (element: any) => string;
  updateElement: (id: string, updates: any) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  clearSelection: () => void;
  clearCanvas: () => void;
}

// Create the store
export const useCanvasStore = create<CanvasStore>((set) => ({
  // Initial state
  elements: [],
  selectedElementId: null,

  // Actions
  addElement: (element) => {
    const id = uuidv4();
    const newElement = { ...element, id };

    set((state) => ({
      elements: [...state.elements, newElement],
    }));

    return id;
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((element) =>
        element.id === id ? { ...element, ...updates } : element
      ),
    }));
  },

  removeElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((element) => element.id !== id),
      selectedElementId:
        state.selectedElementId === id ? null : state.selectedElementId,
    }));
  },

  selectElement: (id) => {
    set((state) => ({
      elements: state.elements.map((element) => ({
        ...element,
        selected: element.id === id,
      })),
      selectedElementId: id,
    }));
  },

  clearSelection: () => {
    set((state) => ({
      elements: state.elements.map((element) => ({
        ...element,
        selected: false,
      })),
      selectedElementId: null,
    }));
  },

  clearCanvas: () => {
    set({
      elements: [],
      selectedElementId: null,
    });
  },
}));

// Helper function to create test elements
export const createTestElements = () => {
  const store = useCanvasStore.getState();

  // Clear any existing elements
  store.clearCanvas();

  // Add a circle
  store.addElement({
    type: "circle",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#ff0000",
    opacity: 1,
    radius: 2,
    filled: true,
  });

  // Add a rectangle
  store.addElement({
    type: "rectangle",
    position: [5, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#00ff00",
    opacity: 1,
    width: 3,
    height: 2,
    filled: true,
  });

  // Add a line
  store.addElement({
    type: "line",
    position: [-5, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#0000ff",
    opacity: 1,
    points: [
      [0, 0, 0],
      [0, 3, 0],
      [3, 3, 0],
    ],
    lineWidth: 2,
  });

  // Add a polygon
  store.addElement({
    type: "polygon",
    position: [0, 5, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#ffff00",
    opacity: 1,
    points: [
      [0, 0, 0],
      [2, 0, 0],
      [2, 2, 0],
      [0, 2, 0],
    ],
    filled: true,
  });

  // Add text
  store.addElement({
    type: "text",
    position: [0, -5, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#ffffff",
    opacity: 1,
    text: "Hello, Canvas!",
    fontSize: 1,
    fontColor: "#ffffff",
  });

  // Add image
  store.addElement({
    type: "image",
    position: [-8, -5, 0], // Positioned to the left of the text
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#ffffff",
    opacity: 1,
    url: "/logo.jpg", // Local image from public folder
    width: 6, // Width is 3-4 times the height to maintain aspect ratio
    height: 2, // Adjusted height to maintain proper aspect ratio
  });
};
