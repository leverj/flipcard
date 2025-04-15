# Flipcard

A web component built with Lit for displaying interactive flipcard images with grid support. This package provides a custom element `<flipcard-viewer>` that can display and interact with grid-based flipcard images, supporting automatic orientation correction and responsive sizing.

## Features

- Grid-based image display with configurable rows and columns
- Interactive flip card animation
- Automatic image orientation correction (EXIF)
- Responsive sizing based on container dimensions
- IPFS gateway support
- Built with Lit for optimal performance
- Configurable logging system for debugging
- Thumbnail mode support

## Installation

```bash
npm install @dek-art/flipcard
# or
yarn add @dek-art/flipcard
```

## Import Options

The component can be imported in several ways depending on your use case:

### Option 1: Custom Element Usage (Recommended for most cases)
```javascript
// This will register the custom element automatically
import '@dek-art/flipcard';

// Use in HTML or templates
// <flipcard-viewer metadata-json="..." gateway-url="..."></flipcard-viewer>
```

### Option 2: Class Import (For advanced use cases)
```javascript
// Import the class directly
import { FlipcardViewer } from '@dek-art/flipcard';

// The class can be used for:
// - Extending the component
// - Type checking
// - Programmatic element creation
const element = new FlipcardViewer();
```

### Option 3: Default Import
```javascript
// Alternative way to import the class
import FlipCard from '@dek-art/flipcard';
```

Note: When using the component in frameworks like Vue, React, or Angular, you should use Option 1 (custom element usage) and ensure the component is properly registered in your framework's component system.

## Usage

The component will be automatically registered as a custom element `<flipcard-viewer>`. You can use it directly in your HTML:

```html
<flipcard-viewer
  metadata-json='{
    "image": "ipfs://QmExample...",
    "properties": {
      "display": {
        "rows": 2,
        "columns": 2
      }
    }
  }'
  gateway-url="https://www.ipfs.io/ipfs/"
  is-thumbnail="true"
></flipcard-viewer>
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@dek-art/flipcard';
  </script>
</head>
<body>
  <flipcard-viewer
    metadata-json='{
      "image": "ipfs://QmExample...",
      "properties": {
        "display": {
          "rows": 2,
          "columns": 2
        }
      }
    }'
    gateway-url="https://www.ipfs.io/ipfs/"
    is-thumbnail="true"
  ></flipcard-viewer>
</body>
</html>
```

## Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `metadata-json` | String | JSON string containing image metadata and display properties | `""` |
| `gateway-url` | String | Base URL for the IPFS gateway | `"https://www.ipfs.io/ipfs/"` |
| `is-thumbnail` | Boolean | Whether to display in thumbnail mode (disables flip animation) | `true` |

### Metadata JSON Format

```json
{
  "image": "ipfs://QmHash...",
  "properties": {
    "display": {
      "rows": 2,
      "columns": 2
    }
  }
}
```

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Run tests
yarn test

# Build for production
yarn build
```

## Debugging and Logging

The component includes a configurable logging system that can be used to debug issues and monitor component behavior. You can configure logging in your application:

```javascript
import { logger, LOG_LEVELS } from '@dek-art/flipcard';

// Set log level (DEBUG, INFO, WARN, ERROR)
logger.setLogLevel('DEBUG');

// Enable/disable logging
logger.enableLogging();
logger.disableLogging();
```

Available log levels:
- `DEBUG`: Detailed debugging information
- `INFO`: General information about component operation
- `WARN`: Warning messages for potential issues
- `ERROR`: Error messages for critical issues

Example log output:
```
[Flipcard] Initializing FlipcardViewer
[Flipcard] Metadata parsed successfully { mediaUrl: "...", rows: 2, columns: 2 }
[Flipcard] Frame size calculated { frameWidth: 10, frameHeight: 10 }
[Flipcard] FlipcardViewer initialized successfully
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Safari iOS (13.4+)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with [Lit](https://lit.dev/)
- EXIF data parsing with [exifr](https://github.com/MikeKovarik/exifr)
