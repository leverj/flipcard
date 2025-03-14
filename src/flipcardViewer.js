import { LitElement, html, css } from "lit";
import exifr from "exifr";

/**
 * FlipcardViewer is a custom web component that displays an interactive flip card
 * with images sourced from metadata. It handles image loading, EXIF data parsing,
 * and orientation correction for iOS and Safari browsers.
 */
export class FlipcardViewer extends LitElement {
  static properties = {
    metadataJson: { type: String, attribute: "metadata-json" }, // JSON string containing metadata for the image
    gatewayUrl: { type: String, attribute: "gateway-url" }, // Base URL for IPFS gateway
    imgSrc: { type: String, state: true }, // Source URL for the image
    mediaUrl: { type: String, state: true }, // Media URL derived from metadata
    rows: { type: Number, state: true }, // Number of rows in the image grid
    columns: { type: Number, state: true }, // Number of columns in the image grid
    rotateBy: { type: String, state: true }, // Rotation angle for the flip card
    index: { type: Number, state: true }, // Current index of the displayed image
    aspectRatio: { type: Number, state: true }, // Aspect ratio of the image
    frameWidth: { type: Number, state: true }, // Width of the image frame
    frameHeight: { type: Number, state: true }, // Height of the image frame
    imgWidth: { type: String, state: true }, // Width of the image
    imgHeight: { type: String, state: true }, // Height of the image
    containerWidth: { type: String, state: true }, // Width of the container
    containerHeight: { type: String, state: true }, // Height of the container
    frontImgTop: { type: String, state: true }, // Top position of the front image
    frontImgLeft: { type: String, state: true }, // Left position of the front image
    backImgTop: { type: String, state: true }, // Top position of the back image
    backImgLeft: { type: String, state: true }, // Left position of the back image
  };

  /**
   * Lifecycle method called when the component is added to the DOM.
   * It initializes metadata parsing and image loading.
   */
  async connectedCallback() {
    super.connectedCallback();
    await this.parseMetadata();
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (iOS || isSafari) await this.loadImageAndCorrectOrientation();
    else this.imgSrc = this.mediaUrl;
  }

  /**
   * Lifecycle method called when the component is removed from the DOM.
   * It removes the resize event listener.
   */
  disconnectedCallback() {
    window.removeEventListener("resize", this.calculateFrameSize.bind(this));
  }

  /**
   * Rounds a number to two decimal places.
   * @param {number} num - The number to round.
   * @returns {number} The rounded number.
   */
  roundToDecimals = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  /**
   * Constructor initializes default properties.
   */
  constructor() {
    super();
    this.metadataJson = "";
    this.gatewayUrl = "https://www.ipfs.io/ipfs/";
    this.imgSrc = "";
    this.mediaUrl = "";
    this.rows = 1;
    this.columns = 1;
    this.rotateBy = "0deg";
    this.index = 0;
    this.aspectRatio = '';
    this.frameWidth = 20;
    this.frameHeight = 20;
    this.imgWidth = "20rem";
    this.imgHeight = "20rem";
    this.containerWidth = "20rem";
    this.containerHeight = "20rem";
    this.frontImgTop = "0rem";
    this.frontImgLeft = "0rem";
    this.backImgTop = "0rem";
    this.backImgLeft = "0rem";
  }

  /**
   * Parses the metadata JSON to extract image URL and grid dimensions.
   * Updates the mediaUrl, rows, and columns properties.
   * Logs an error if parsing fails.
   */
  parseMetadata = async () => {
    try {
      const metadata = JSON.parse(this.metadataJson);
      this.mediaUrl = metadata.image.replace("ipfs://", this.gatewayUrl);
      this.rows = metadata.properties.display.rows || 1;
      this.columns = metadata.properties.display.columns || 1;
    } catch (error) {
      console.error("Error parsing metadata:", error);
    }
  }

  /**
   * Calculates the screen size and updates frame dimensions based on the
   * smaller of the element's or parent's dimensions.
   */
  calculateScreenSize = () => {
    const docFontSize = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("font-size")
        .trim()
        .replace("px", "")
    );

    const computedStyle = getComputedStyle(this);
    const width = parseInt(computedStyle.getPropertyValue('width')) || this.offsetWidth;
    const height = parseInt(computedStyle.getPropertyValue('height')) || this.offsetHeight;

    const parentElement = this.parentElement;
    const parentWidth = parentElement ? parentElement.offsetWidth : width;
    const parentHeight = parentElement ? parentElement.offsetHeight : height;

    this.frameWidth = (Math.min(width, parentWidth) / docFontSize) * 0.9;
    this.frameHeight = (Math.min(height, parentHeight) / docFontSize) * 0.9;
  }

  /**
   * Computes the aspect ratio of the image and updates the frame size.
   */
  computeAspectRatio = () => {
    const fusedImage = new Image();
    fusedImage.src = this.imgSrc;
    fusedImage.onload = () => {
      const fusedImageWidth = fusedImage.width;
      const fusedImageHeight = fusedImage.height;
      const iw = fusedImageWidth / this.columns;
      const ih = fusedImageHeight / this.rows;
      const currAspectRatio = iw / ih;
      this.aspectRatio = isNaN(currAspectRatio) ? 1 : currAspectRatio;
      this.calculateFrameSize();
    }
  }

  /**
   * Calculates the frame size based on the aspect ratio and updates
   * image and container dimensions.
   */
  calculateFrameSize = () => {
    this.calculateScreenSize();
    if (this.aspectRatio > 1) this.frameHeight = this.roundToDecimals(this.frameWidth / this.aspectRatio);
    else this.frameWidth = this.roundToDecimals(this.aspectRatio * this.frameHeight);
    this.imgWidth = `${this.frameWidth * this.columns}rem`;
    this.imgHeight = `${this.frameHeight * this.rows}rem`;
    this.containerWidth = `${this.frameWidth}rem`;
    this.containerHeight = `${this.frameHeight}rem`;
  }

  /**
   * Parses EXIF data from a given image blob.
   * @param {Blob} blob - The image blob to parse.
   * @returns {Promise<Object>} A promise that resolves to the parsed EXIF data.
   */
  parseExifData = async (blob) => {
    return await exifr.parse(blob, true);
  }

  /**
   * Loads an image, corrects its orientation based on EXIF data, and updates
   * the imgSrc property with the corrected image.
   * Logs an error if loading or parsing fails.
   */
  loadImageAndCorrectOrientation = async () => {
    try {
      const response = await fetch(this.mediaUrl);
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      const exifData = await this.parseExifData(blob);
      const orientation = exifData?.Orientation || 1;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let width = img.width;
        let height = img.height;
        if ([5, 6, 7, 8].includes(orientation)) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }
        switch (orientation) {
          case 2:
            ctx.transform(-1, 0, 0, 1, width, 0);
            break;
          case 3:
            ctx.transform(-1, 0, 0, -1, width, height);
            break;
          case 4:
            ctx.transform(1, 0, 0, -1, 0, height);
            break;
          case 5:
            ctx.transform(0, 1, 1, 0, 0, 0);
            break;
          case 6:
            ctx.transform(0, -1, 1, 0, 0, width);
            break;
          case 7:
            ctx.transform(0, -1, -1, 0, height, width);
            break;
          case 8:
            ctx.transform(0, -1, 1, 0, height, 0);
            break;
          default: break;
        }
        ctx.drawImage(img, 0, 0);
        this.imgSrc = canvas.toDataURL(exifData.format);
        URL.revokeObjectURL(imageUrl);
      };
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;
    } catch (error) {
      console.error('Error loading image or getting EXIF data:', error);
    }
  };

  /**
   * Prepares the component by computing the aspect ratio and adding a resize event listener.
   */
  prepare = () => {
    this.computeAspectRatio();
    window.addEventListener("resize", this.calculateFrameSize.bind(this));
  }

  /**
   * Displays the next image in the flip card sequence by updating the index and rotating the card.
   */
  displayFlipcard = () => {
    this.index = (this.index + 1) % (this.rows * this.columns);
    this.shiftImage(this.index);
    this.rotateBy = `${this.index * 180}deg`;
  }

  /**
   * Shifts the image position based on the current index.
   * @param {number} index - The current index of the image.
   */
  shiftImage = (index) => {
    const leftIndex = index % this.columns;
    const topIndex = Math.floor(index / this.columns);
    if (index % 2 === 0) {
      this.frontImgLeft = `${-this.frameWidth * leftIndex}rem`;
      this.frontImgTop = `${-this.frameHeight * topIndex}rem`;
    } else {
      this.backImgLeft = `${-this.frameWidth * leftIndex}rem`;
      this.backImgTop = `${-this.frameHeight * topIndex}rem`;
    }
  }

  static styles = css`
    img {
      max-width: unset !important;
    }
    .iaw-card {
      perspective: 10000px;
      -webkit-perspective: 10000px;
      scale: 0.95;
    }
    .iaw-card-inner {
      transition: transform 1.5s;
      transform-style: preserve-3d;
      width: var(--container-width);
      height: var(--container-height);
      transform: rotateY(var(--rotate-by));
    }
    .iaw-card-front,
    .iaw-card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    .iaw-front,
    .iaw-back {
      position: relative;
      object-fit: contain;
      object-position: center;
      height: var(--img-height);
      width: var(--img-width);
    }
    .iaw-card-back {
      transform: rotateY(180deg);
    }
    .iaw-card .iaw-card-inner .iaw-card-back .iaw-front {
      position: relative;
      top: var(--front-img-top);
      left: var(--front-img-left);
    }
    .iaw-card .iaw-card-inner .iaw-card-back .iaw-back {
      position: relative;
      top: var(--back-img-top);
      left: var(--back-img-left);
    }
  `;

  /**
   * Renders the flip card component.
   * @returns {TemplateResult} The HTML template for the component.
   */
  render() {
    return html`
      <div class="flipcard-viewer">
        <div class="iaw-card" @click="${this.displayFlipcard}" style="
            --rotate-by: ${this.rotateBy}; 
            --container-width: ${this.containerWidth}; 
            --container-height: ${this.containerHeight};
            --img-height: ${this.imgHeight}; 
            --img-width: ${this.imgWidth}; 
            --front-img-top: ${this.frontImgTop}; 
            --front-img-left: ${this.frontImgLeft}; 
            --back-img-top: ${this.backImgTop}; 
            --back-img-left: ${this.backImgLeft}; 
          ">
          <div class="iaw-card-inner">
            <div class="iaw-card-front">
              <img class="iaw-front" src="${this.imgSrc}" alt="image not found" @load="${this.prepare}"/>
            </div>
            <div class="iaw-card-back">
              <img class="iaw-back" src="${this.imgSrc}" alt="image not found" />
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("flipcard-viewer", FlipcardViewer);
