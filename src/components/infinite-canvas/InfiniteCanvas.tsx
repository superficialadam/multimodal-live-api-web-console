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
import "./infinite-canvas.scss";

/**
 * Placeholder component for the infinite canvas.
 * This will be replaced with a WebGL implementation in Phase 2.
 */
function InfiniteCanvasComponent() {
  return (
    <div className="infinite-canvas">
      <div className="placeholder-content">
        <h2>Infinite Canvas</h2>
        <p>This area will be replaced with a WebGL canvas in Phase 2.</p>
        <p>The canvas will support:</p>
        <ul>
          <li>Pan and zoom navigation</li>
          <li>Text elements</li>
          <li>Vector graphics (circles, lines, boxes, polygons)</li>
          <li>Images</li>
        </ul>
      </div>
    </div>
  );
}

export const InfiniteCanvas = memo(InfiniteCanvasComponent);
