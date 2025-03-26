import { LitElement, html } from "lit";
import { styles } from './flipcard-styles.js';
import { processImage } from './image-processor.js';
import { calculateFrameSize, computeAspectRatio } from './frame-calculator.js';
import { handleError } from '../../utils/error-handling.js';
import { DEFAULT_ASPECT_RATIO, DEFAULT_FRAME_SIZE, RESIZE_DEBOUNCE_MS } from '../../utils/constants.js';

/**
 * FlipcardViewer is a custom web component that displays an interactive flip card
 * with images sourced from metadata. It handles image loading, EXIF data parsing,
 * and orientation correction for iOS and Safari browsers.
 */
export class FlipcardViewer extends LitElement {
  static styles = styles;

  static properties = {
    metadataJson: { type: String, attribute: "metadata-json" },
    gatewayUrl: { type: String, attribute: "gateway-url" },
    imgSrc: { type: String, state: true },
    mediaUrl: { type: String, state: true },
    rows: { type: Number, state: true },
    columns: { type: Number, state: true },
    rotateBy: { type: String, state: true },
    index: { type: Number, state: true },
    aspectRatio: { type: Number, state: true },
    frameWidth: { type: Number, state: true },
    frameHeight: { type: Number, state: true },
    imgWidth: { type: String, state: true },
    imgHeight: { type: String, state: true },
    containerWidth: { type: String, state: true },
    containerHeight: { type: String, state: true },
    frontImgTop: { type: String, state: true },
    frontImgLeft: { type: String, state: true },
    backImgTop: { type: String, state: true },
    backImgLeft: { type: String, state: true },
    isImagePrepared: { type: Boolean, state: true },
  };

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
    this.aspectRatio = DEFAULT_ASPECT_RATIO;
    this.frameWidth = DEFAULT_FRAME_SIZE;
    this.frameHeight = DEFAULT_FRAME_SIZE;
    this.imgWidth = `${DEFAULT_FRAME_SIZE}rem`;
    this.imgHeight = `${DEFAULT_FRAME_SIZE}rem`;
    this.containerWidth = `${DEFAULT_FRAME_SIZE}rem`;
    this.containerHeight = `${DEFAULT_FRAME_SIZE}rem`;
    this.frontImgTop = "0rem";
    this.frontImgLeft = "0rem";
    this.backImgTop = "0rem";
    this.backImgLeft = "0rem";
    this.isImagePrepared = false;
  }

  async connectedCallback() {
    super.connectedCallback();
    try {
      if (!this.metadataJson) {
        handleError(new Error('No metadata provided to FlipCard viewer'), 'Component initialization', true);
        return;
      }
      this.parseMetadata();

      if (!this.mediaUrl) {
        handleError(new Error('No image URL found in metadata'), 'Component initialization', true);
        return;
      }

      // Handle orientation correction for iOS and Safari
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      if (iOS || isSafari) {
        const processedImageUrl = await processImage(this.mediaUrl);
        if (processedImageUrl) {
          this.mediaUrl = processedImageUrl;
        }
      }

      this.imgSrc = this.mediaUrl;
      calculateFrameSize(this);
      window.addEventListener("resize", this.handleResize);
    } catch (error) {
      handleError(error, 'Component initialization');
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeTimer) clearTimeout(this._resizeTimer);
    window.removeEventListener("resize", this.handleResize);
  }

  parseMetadata() {
    try {
      if (!this.metadataJson || this.metadataJson === "") {
        handleError(new Error("No metadata provided"), "Parsing metadata", true);
        return;
      }

      const metadata = JSON.parse(this.metadataJson);

      if (!metadata) {
        handleError(new Error("Metadata parsed to null or undefined"), "Parsing metadata", true);
        return;
      }

      if (!metadata.image) {
        handleError(new Error("No image property found in metadata"), "Parsing metadata", true);
        return;
      }

      // Update media URL with gateway prefix if needed
      this.mediaUrl = (metadata.image.startsWith('ipfs://')) ?
        metadata.image.replace("ipfs://", this.gatewayUrl) :
        metadata.image;

      // Extract display properties if available, using defaults
      const display = metadata.properties?.display;
      this.rows = parseInt(display?.rows ?? 1);
      this.columns = parseInt(display?.columns ?? 1);
      if (isNaN(this.rows) || this.rows <= 0) this.rows = 1;
      if (isNaN(this.columns) || this.columns <= 0) this.columns = 1;
    } catch (error) {
      handleError(error, "Parsing metadata");
    }
  }

  displayFlipcard() {
    // Ensure rows and columns are valid
    if (!this.rows || !this.columns || this.rows < 1 || this.columns < 1) {
      handleError(new Error('Invalid rows or columns'), 'Displaying flipcard', true);
      return;
    }

    try {
      const totalCells = this.rows * this.columns;
      this.index = (this.index + 1) % totalCells;
      this.rotateBy = `${this.index * 180}deg`;
      this.shiftImage(this.index);
    } catch (error) {
      handleError(error, 'Displaying flipcard');
    }
  }

  shiftImage(index) {
    try {
      // Validate index
      if (typeof index !== 'number' || index < 0) {
        handleError(new Error('Invalid index for image shifting'), 'Shifting image', true);
        return;
      }

      // Validate required properties
      if (!this.frameWidth || !this.frameHeight) {
        handleError(new Error('Frame dimensions not set'), 'Shifting image', true);
        return;
      }

      // Calculate position based on index
      const leftIndex = index % this.columns;
      const topIndex = Math.floor(index / this.columns);

      // Set the position based on whether we're showing front or back
      if (index % 2 === 0) {
        this.frontImgLeft = `${-this.frameWidth * leftIndex}rem`;
        this.frontImgTop = `${-this.frameHeight * topIndex}rem`;
      } else {
        this.backImgLeft = `${-this.frameWidth * leftIndex}rem`;
        this.backImgTop = `${-this.frameHeight * topIndex}rem`;
      }
    } catch (error) {
      handleError(error, 'Shifting image');
    }
  }

  handleResize = () => {
    if (this._resizeTimer) {
      clearTimeout(this._resizeTimer);
    }

    this._resizeTimer = setTimeout(() => {
      calculateFrameSize(this);
    }, RESIZE_DEBOUNCE_MS);
  }

  prepare = async () => {
    if (this.isImagePrepared) return;

    try {
      this.isImagePrepared = true;
      await computeAspectRatio(this);
    } catch (error) {
      handleError(error, 'Preparing images');
      this.isImagePrepared = false;
    }
  }

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