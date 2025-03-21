import { FlipcardViewer } from '../../../src/components/flipcard-viewer/index.js';
import { DEFAULT_ASPECT_RATIO, DEFAULT_FRAME_SIZE, RESIZE_DEBOUNCE_MS } from '../../../src/utils/constants.js';
import { expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';

describe('FlipcardViewer', () => {
  let element;

  // Test data
  const validMetadata = {
    name: "Test Image",
    image: "ipfs://QmWBYvRXYPfETdY1UVz7HwrSdf7kdjmMuzqL4iuZGCdCoK",
    properties: {
      display: {
        layout: "interactive:grid",
        action: "click",
        transition: "flip",
        rows: "2",
        columns: "2"
      },
      "Content-Type": "multipart/image"
    }
  };

  const validMetadataJson = JSON.stringify(validMetadata);

  // Setup and teardown
  beforeEach(() => {
    element = new FlipcardViewer();
  });

  afterEach(() => {
    sinon.restore();
  });

  // Component Initialization Tests
  describe('Component Initialization', () => {
    it('should be defined', async () => {
      const element = await fixture(html`
        <flipcard-viewer 
          metadata-json=${validMetadataJson} 
          gateway-url="https://ipfs.metaversis.io/ipfs/"
        ></flipcard-viewer>
      `);
      expect(element).to.exist;
      expect(element.tagName.toLowerCase()).to.equal('flipcard-viewer');
    });

    it('should initialize with default values', () => {
      expect(element.metadataJson).to.equal('');
      expect(element.gatewayUrl).to.equal('https://www.ipfs.io/ipfs/');
      expect(element.imgSrc).to.equal('');
      expect(element.mediaUrl).to.equal('');
      expect(element.rows).to.equal(1);
      expect(element.columns).to.equal(1);
      expect(element.index).to.equal(0);
      expect(element.rotateBy).to.equal('0deg');
      expect(element.aspectRatio).to.equal(DEFAULT_ASPECT_RATIO);
      expect(element.frameWidth).to.equal(DEFAULT_FRAME_SIZE);
      expect(element.frameHeight).to.equal(DEFAULT_FRAME_SIZE);
    });
  });

  // Metadata Handling Tests
  describe('Metadata Handling', () => {
    it('should parse valid metadata correctly', () => {
      element.metadataJson = validMetadataJson;
      element.gatewayUrl = 'https://ipfs.metaversis.io/ipfs/';
      element.parseMetadata();
      expect(element.mediaUrl).to.equal('https://ipfs.metaversis.io/ipfs/QmWBYvRXYPfETdY1UVz7HwrSdf7kdjmMuzqL4iuZGCdCoK');
      expect(element.rows).to.equal(2);
      expect(element.columns).to.equal(2);
    });

    it('should handle missing metadata gracefully', () => {
      const consoleWarnStub = sinon.stub(console, 'warn');
      element.metadataJson = '';
      element.parseMetadata();
      expect(consoleWarnStub.calledWith('Parsing metadata: No metadata provided')).to.be.true;
    });
  });

  // Flip Card Display Tests
  describe('Flip Card Display', () => {
    it('should display flipcard correctly', () => {
      element.rows = 2;
      element.columns = 2;
      const shiftImageSpy = sinon.spy(element, 'shiftImage');

      element.displayFlipcard();

      expect(element.index).to.equal(1);
      expect(element.rotateBy).to.equal('180deg');
      expect(shiftImageSpy.calledOnce).to.be.true;
    });

    it('should handle invalid rows/columns gracefully', () => {
      const consoleWarnStub = sinon.stub(console, 'warn');
      element.rows = 0;
      element.columns = 0;

      element.displayFlipcard();

      expect(consoleWarnStub.calledWith('Displaying flipcard: Invalid rows or columns')).to.be.true;
    });
  });

  // Event Handling Tests
  describe('Event Handling', () => {
    it('should add and remove resize event listener', async () => {
      const addEventListenerSpy = sinon.spy(window, 'addEventListener');
      const removeEventListenerSpy = sinon.spy(window, 'removeEventListener');

      const element = await fixture(html`
        <flipcard-viewer 
          metadata-json=${validMetadataJson} 
          gateway-url="https://ipfs.metaversis.io/ipfs/"
        ></flipcard-viewer>
      `);
      expect(addEventListenerSpy.calledWith('resize', sinon.match.func)).to.be.true;
      element.remove();
      expect(removeEventListenerSpy.calledWith('resize', sinon.match.func)).to.be.true;
      addEventListenerSpy.restore();
      removeEventListenerSpy.restore();
    });

    it('should implement debouncing for resize events', () => {
      expect(typeof element.handleResize).to.equal('function');      
      const setTimeoutStub = sinon.stub(window, 'setTimeout').returns(123);
      element.calculateFrameSize = sinon.stub();
      element.handleResize();
      expect(setTimeoutStub.calledOnce).to.be.true;
      expect(setTimeoutStub.firstCall.args[1]).to.equal(RESIZE_DEBOUNCE_MS);
      expect(element.calculateFrameSize.called).to.be.false;
    });
  });
}); 