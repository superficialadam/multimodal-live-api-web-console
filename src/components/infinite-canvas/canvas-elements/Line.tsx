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
import { LineElement } from "./types";

interface LineProps {
  element: LineElement;
  onClick?: (id: string) => void;
}

function LineComponent({ element, onClick }: LineProps) {
  const {
    id,
    position,
    rotation,
    scale,
    color,
    opacity,
    points,
    lineWidth,
    selected,
  } = element;

  // Create a geometry from the points
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    // Convert array of points to flat array for BufferGeometry
    const vertices = new Float32Array(points.flat());

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
      <line onClick={handleClick}>
        <bufferGeometry attach="geometry" {...lineGeometry} />
        <lineBasicMaterial
          color={selected ? "#ffffff" : color}
          transparent={opacity < 1}
          opacity={opacity}
          linewidth={lineWidth}
        />
      </line>
    </group>
  );
}

export const Line = memo(LineComponent);
