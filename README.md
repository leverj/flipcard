# Flipcard

A web component built with Lit for displaying interactive flipcard images with grid support. This package provides a custom element `<flipcard-viewer>` that can display and interact with grid-based flipcard images, supporting automatic orientation correction and responsive sizing.

## Features

- Grid-based image display with configurable rows and columns
- Interactive flip card animation
- Automatic image orientation correction (EXIF)
- Responsive sizing based on container dimensions
- IPFS gateway support
- Built with Lit for optimal performance

## Installation

```bash
npm install flipcard
# or
yarn add flipcard
```

## Import Options

You can import the component in several ways:

```javascript
// Option 1: Default import (recommended)
import FlipCard from 'flipcard';

// Option 2: Named import
import { FlipcardViewer } from 'flipcard';

// Option 3: Side-effects only import (the component will be auto-registered)
import 'flipcard';
```

## Builds

The package includes two builds:

### Development Build
```javascript
import FlipCard from 'flipcard/dist/flipcard-viewer.js';
```
- Unminified for better readability
- Includes source maps for easier debugging
- Preserves comments and console statements
- Best for local development and debugging

### Production Build
```javascript
import FlipCard from 'flipcard/dist/flipcard-viewer.min.js';
```
- Minified and optimized for production
- No source maps to reduce file size
- Removes console statements and comments
- Best for production deployments

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
></flipcard-viewer>
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    // Import the component (any of the import options above will work)
    import 'flipcard';
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
  ></flipcard-viewer>
</body>
</html>
```

## Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `metadata-json` | String | JSON string containing image metadata and display properties | `""` |
| `gateway-url` | String | Base URL for the IPFS gateway | `"https://www.ipfs.io/ipfs/"` |

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

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Safari iOS (13.4+)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with [Lit](https://lit.dev/)
- EXIF data parsing with [exifr](https://github.com/MikeKovarik/exifr)
