
## Properties

- `metadata-json`: A JSON string containing metadata for the image, including the IPFS hash and display properties.
- `gateway-url`: The base URL for the IPFS gateway (default: `https://www.ipfs.io/ipfs/`).

## Methods

- `parseMetadata()`: Parses the metadata JSON to extract image URL and grid dimensions.
- `loadImageAndCorrectOrientation()`: Loads an image, corrects its orientation based on EXIF data, and updates the `imgSrc` property.

## Events

- `click`: Clicking on the flip card will trigger the `displayFlipcard` method to show the next image in the sequence.

## Styling

The component uses CSS variables to customize the appearance of the flip card:

- `--rotate-by`: Rotation angle for the flip card.
- `--container-width`: Width of the container.
- `--container-height`: Height of the container.
- `--img-height`: Height of the image.
- `--img-width`: Width of the image.
- `--front-img-top`: Top position of the front image.
- `--front-img-left`: Left position of the front image.
- `--back-img-top`: Top position of the back image.
- `--back-img-left`: Left position of the back image.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [LitElement](https://lit.dev/)
- EXIF data parsing with [exifr](https://github.com/MikeKovarik/exifr)
