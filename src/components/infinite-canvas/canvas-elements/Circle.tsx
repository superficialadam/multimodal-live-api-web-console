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

import { memo } from "react";
import * as THREE from "three";
import { CircleElement } from "./types";

interface CircleProps {
  element: CircleElement;
  onClick?: (id: string) => void;
}

function CircleComponent({ element, onClick }: CircleProps) {
  const {
    id,
    position,
    rotation,
    scale,
    color,
    opacity,
    radius,
    segments = 32,
    filled,
    lineWidth = 1,
    selected,
  } = element;

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
        // Filled circle
        <mesh onClick={handleClick}>
          <circleGeometry args={[radius, segments]} />
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
        // Outline circle
        <line onClick={handleClick}>
          <circleGeometry args={[radius, segments]} />
          <lineBasicMaterial
            color={color}
            transparent={opacity < 1}
            opacity={opacity}
            linewidth={lineWidth}
          />
        </line>
      )}
    </group>
  );
}

export const Circle = memo(CircleComponent);
