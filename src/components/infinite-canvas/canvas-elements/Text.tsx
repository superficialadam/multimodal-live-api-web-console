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
import { Text as DreiText } from "@react-three/drei";
import { TextElement } from "./types";

interface TextProps {
  element: TextElement;
  onClick?: (id: string) => void;
}

function TextComponent({ element, onClick }: TextProps) {
  const {
    id,
    position,
    rotation,
    scale,
    opacity,
    text,
    fontSize,
    fontColor,
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
      <DreiText
        color={selected ? "#ffffff" : fontColor}
        fontSize={fontSize}
        anchorX="center"
        anchorY="middle"
        onClick={handleClick}
        outlineWidth={selected ? 0.01 : 0}
        outlineColor="#000000"
        fillOpacity={opacity}
      >
        {text}
      </DreiText>
    </group>
  );
}

export const Text = memo(TextComponent);
