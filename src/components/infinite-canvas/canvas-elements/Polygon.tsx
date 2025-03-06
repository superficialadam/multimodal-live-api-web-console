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

import { memo, useMemo } from "react";
import * as THREE from "three";
import { PolygonElement } from "./types";

interface PolygonProps {
  element: PolygonElement;
  onClick?: (id: string) => void;
}

function PolygonComponent({ element, onClick }: PolygonProps) {
  const {
    id,
    position,
    rotation,
    scale,
    color,
    opacity,
    points,
    filled,
    lineWidth = 1,
    selected,
  } = element;

  // Create a shape from the points
  const shape = useMemo(() => {
    const shape = new THREE.Shape();

    if (points.length < 3) return shape;

    // Move to the first point
    shape.moveTo(points[0][0], points[0][1]);

    // Draw lines to the rest of the points
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i][0], points[i][1]);
    }

    // Close the shape
    shape.lineTo(points[0][0], points[0][1]);

    return shape;
  }, [points]);

  // Create a geometry for the outline
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    if (points.length < 2) return geometry;

    // Create a closed loop by adding the first point at the end
    const closedPoints = [...points, points[0]];

    // Convert array of points to flat array for BufferGeometry
    const vertices = new Float32Array(closedPoints.flat());

    // Set position attribute
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    return geometry;
  }, [points]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onClick) onClick(id);
  };

  return (
    <group
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={new THREE.Vector3(...scale)}
    >
      {filled ? (
        // Filled polygon
        <mesh onClick={handleClick}>
          <shapeGeometry args={[shape]} />
          <meshStandardMaterial
            color={color}
            transparent={opacity < 1}
            opacity={opacity}
            side={THREE.DoubleSide}
            emissive={selected ? "#ffffff" : undefined}
            emissiveIntensity={selected ? 0.2 : 0}
          />
        </mesh>
      ) : (
        // Outline polygon
        <line onClick={handleClick}>
          <bufferGeometry attach="geometry" {...lineGeometry} />
          <lineBasicMaterial
            color={selected ? "#ffffff" : color}
            transparent={opacity < 1}
            opacity={opacity}
            linewidth={lineWidth}
          />
        </line>
      )}
    </group>
  );
}

export const Polygon = memo(PolygonComponent);
