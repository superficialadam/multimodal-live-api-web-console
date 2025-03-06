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

import { memo, useEffect, useState, useMemo } from "react";
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
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      url,
      (loadedTexture) => {
        setTexture(loadedTexture);

        // Get the image dimensions from the texture
        const image = loadedTexture.image;
        if (image) {
          setNaturalWidth(image.width);
          setNaturalHeight(image.height);
        }

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

  // Calculate dimensions that maintain aspect ratio
  const dimensions = useMemo(() => {
    // Default to provided dimensions if natural dimensions aren't available
    if (!naturalWidth || !naturalHeight) {
      return { width, height };
    }

    const aspectRatio = naturalWidth / naturalHeight;

    // If both width and height are specified, prioritize width and adjust height
    if (width && height) {
      return { width, height: width / aspectRatio };
    }

    // If only width is specified, calculate height based on aspect ratio
    if (width) {
      return { width, height: width / aspectRatio };
    }

    // If only height is specified, calculate width based on aspect ratio
    if (height) {
      return { width: height * aspectRatio, height };
    }

    // If neither is specified, use a default size while maintaining aspect ratio
    const defaultSize = 5;
    return {
      width: defaultSize,
      height: defaultSize / aspectRatio,
    };
  }, [width, height, naturalWidth, naturalHeight]);

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
        <planeGeometry args={[dimensions.width, dimensions.height]} />
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
            <boxGeometry args={[dimensions.width, dimensions.height, 0.01]} />
          </edgesGeometry>
          <lineBasicMaterial color="#ffffff" />
        </lineSegments>
      )}
    </group>
  );
}

export const Image = memo(ImageComponent);
