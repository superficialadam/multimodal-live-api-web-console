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

import { memo, useEffect, useState } from "react";
import * as THREE from "three";
import { ImageElement } from "./types";

interface ImageProps {
  element: ImageElement;
  onClick?: (id: string) => void;
}

function ImageComponent({ element, onClick }: ImageProps) {
  const {
    id,
    position,
    rotation,
    scale,
    opacity,
    url,
    width,
    height,
    selected,
  } = element;

  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      url,
      (loadedTexture) => {
        setTexture(loadedTexture);
        setError(false);
      },
      undefined,
      () => {
        console.error(`Failed to load image: ${url}`);
        setError(true);
      }
    );

    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [url]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onClick) onClick(id);
  };

  if (error) {
    // Render a placeholder if image failed to load
    return (
      <group
        position={new THREE.Vector3(...position)}
        rotation={new THREE.Euler(...rotation)}
        scale={new THREE.Vector3(...scale)}
      >
        <mesh onClick={handleClick}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            color="#ff0000"
            opacity={opacity}
            transparent={opacity < 1}
          />
        </mesh>
      </group>
    );
  }

  if (!texture) {
    // Render a loading placeholder
    return (
      <group
        position={new THREE.Vector3(...position)}
        rotation={new THREE.Euler(...rotation)}
        scale={new THREE.Vector3(...scale)}
      >
        <mesh onClick={handleClick}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            color="#cccccc"
            opacity={opacity}
            transparent={opacity < 1}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={new THREE.Vector3(...scale)}
    >
      <mesh onClick={handleClick}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture}
          transparent={opacity < 1}
          opacity={opacity}
          color={selected ? "#ffffff" : "#ffffff"}
        />
      </mesh>
      {selected && (
        <lineSegments>
          <edgesGeometry>
            <boxGeometry args={[width, height, 0.01]} />
          </edgesGeometry>
          <lineBasicMaterial color="#ffffff" />
        </lineSegments>
      )}
    </group>
  );
}

export const Image = memo(ImageComponent);
