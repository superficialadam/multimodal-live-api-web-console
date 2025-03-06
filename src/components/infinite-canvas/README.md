# Infinite Canvas AI Integration

This document describes how to use the Canvas Command API to interact with the Infinite Canvas component.

## Overview

The Canvas Command API allows the AI to create, update, and manipulate elements on the infinite canvas. The API supports various element types and operations through a simple command syntax.

## Command Syntax

The AI can use two methods to send commands to the canvas:

### 1. Inline Commands

Inline commands use a simple syntax with the `/canvas` prefix:

```
/canvas [command] [elementType] [parameters]
```

For example:

```
/canvas create circle {"radius": 2, "position": [0, 0, 0], "color": "#ff0000"}
/canvas update element-id-123 {"position": [5, 5, 0]}
/canvas delete element-id-123
```

### 2. JSON Block Commands

For more complex operations, the AI can use JSON blocks:

```json
{
  "command": "create",
  "elementType": "rectangle",
  "params": {
    "width": 3,
    "height": 2,
    "position": [0, 0, 0],
    "color": "#00ff00"
  }
}
```

Multiple commands can be sent in a single JSON array:

```json
[
  {
    "command": "create",
    "elementType": "circle",
    "params": {
      "radius": 2,
      "position": [0, 0, 0],
      "color": "#ff0000"
    }
  },
  {
    "command": "create",
    "elementType": "text",
    "params": {
      "text": "Hello, Canvas!",
      "position": [3, 0, 0],
      "fontSize": 1
    }
  }
]
```

## Supported Commands

| Command    | Description                         | Parameters              |
| ---------- | ----------------------------------- | ----------------------- |
| `create`   | Creates a new element               | `elementType`, `params` |
| `update`   | Updates an existing element         | `elementId`, `params`   |
| `delete`   | Removes an element                  | `elementId`             |
| `clear`    | Clears all elements from the canvas | None                    |
| `select`   | Selects an element                  | `elementId`             |
| `deselect` | Deselects all elements              | None                    |

## Element Types

| Type        | Description              | Required Parameters | Optional Parameters                                                          |
| ----------- | ------------------------ | ------------------- | ---------------------------------------------------------------------------- |
| `circle`    | A circular shape         | `radius`            | `position`, `rotation`, `scale`, `color`, `opacity`, `filled`, `lineWidth`   |
| `rectangle` | A rectangular shape      | `width`, `height`   | `position`, `rotation`, `scale`, `color`, `opacity`, `filled`, `lineWidth`   |
| `line`      | A line connecting points | `points`            | `position`, `rotation`, `scale`, `color`, `opacity`, `lineWidth`             |
| `polygon`   | A multi-sided shape      | `points`            | `position`, `rotation`, `scale`, `color`, `opacity`, `filled`, `lineWidth`   |
| `text`      | Text element             | `text`              | `position`, `rotation`, `scale`, `color`, `opacity`, `fontSize`, `fontColor` |
| `image`     | Image element            | `url`               | `position`, `rotation`, `scale`, `color`, `opacity`, `width`, `height`       |

## Common Parameters

| Parameter  | Type                       | Description            | Default     |
| ---------- | -------------------------- | ---------------------- | ----------- |
| `position` | `[number, number, number]` | 3D position (x, y, z)  | `[0, 0, 0]` |
| `rotation` | `[number, number, number]` | 3D rotation in radians | `[0, 0, 0]` |
| `scale`    | `[number, number, number]` | 3D scale               | `[1, 1, 1]` |
| `color`    | `string`                   | CSS color string       | `"#ffffff"` |
| `opacity`  | `number`                   | Opacity (0-1)          | `1`         |

## Examples

### Creating a Circle

```
/canvas create circle {"radius": 2, "position": [0, 0, 0], "color": "#ff0000"}
```

### Creating a Rectangle

```
/canvas create rectangle {"width": 3, "height": 2, "position": [5, 0, 0], "color": "#00ff00"}
```

### Creating a Line

```
/canvas create line {"points": [[0, 0, 0], [0, 3, 0], [3, 3, 0]], "color": "#0000ff", "lineWidth": 2}
```

### Creating Text

```
/canvas create text {"text": "Hello, Canvas!", "position": [0, -5, 0], "fontSize": 1, "fontColor": "#ffffff"}
```

### Creating an Image

```
/canvas create image {"url": "/logo.jpg", "position": [-8, -5, 0], "width": 6, "height": 2}
```

### Updating an Element

```
/canvas update element-id-123 {"position": [10, 10, 0], "color": "#ff00ff"}
```

### Deleting an Element

```
/canvas delete element-id-123
```

### Clearing the Canvas

```
/canvas clear
```

## Best Practices

1. Use the appropriate element type for the content you want to display
2. Position elements carefully to avoid overlap
3. Use color and opacity to create visual hierarchy
4. Group related elements together spatially
5. Use text elements for labels and explanations
6. Consider the user's view when placing elements (center of canvas is [0,0,0])
7. Use the `select` command to highlight important elements
