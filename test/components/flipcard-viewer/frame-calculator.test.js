import { calculateFrameSize, calculateScreenSize, computeAspectRatio, getDocumentFontSize } from '../../../src/components/flipcard-viewer/frame-calculator.js';
import { DEFAULT_FRAME_SIZE } from '../../../src/utils/constants.js';
import { expect } from '@open-wc/testing';
import sinon from 'sinon';

describe('Frame Calculator', () => {
  let element;
  let consoleErrorStub;
  let consoleWarnStub;
  let getComputedStyleStub;

  beforeEach(() => {
    // Create mock element
    element = {
      frameWidth: 100,
      frameHeight: 100,
      aspectRatio: 1,
      rows: 1,
      columns: 1,
      imgWidth: '100rem',
      imgHeight: '100rem',
      containerWidth: '100rem',
      containerHeight: '100rem',
      offsetWidth: 100,
      offsetHeight: 100,
      parentElement: {
        offsetWidth: 100,
        offsetHeight: 100
      }
    };

    // Create stubs for console methods
    consoleErrorStub = sinon.stub(console, 'error');
    consoleWarnStub = sinon.stub(console, 'warn');

    // Mock getComputedStyle
    getComputedStyleStub = sinon.stub(window, 'getComputedStyle').returns({
      getPropertyValue: (prop) => {
        if (prop === 'font-size') return '16px';
        if (prop === 'width') return '100px';
        if (prop === 'height') return '100px';
        return '0px';
      }
    });

    // Mock document.documentElement
    sinon.stub(document, 'documentElement').get(() => ({
      style: {}
    }));
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getDocumentFontSize', () => {
    it('should return the document font size', () => {
      const fontSize = getDocumentFontSize();
      expect(fontSize).to.equal(16);
    });

    it('should return default font size if cannot get computed style', () => {
      getComputedStyleStub.returns({
        getPropertyValue: () => 'invalid'
      });

      const fontSize = getDocumentFontSize();
      expect(fontSize).to.equal(16);
    });
  });

  describe('calculateScreenSize', () => {
    it('should calculate screen size correctly', () => {
      calculateScreenSize(element);

      // 100px / 16px * 0.9 = 5.625rem
      expect(element.frameWidth).to.be.closeTo(5.625, 0.1);
      expect(element.frameHeight).to.be.closeTo(5.625, 0.1);
    });

    it('should handle invalid dimensions gracefully', () => {
      element.offsetWidth = 0;
      element.offsetHeight = 0;
      getComputedStyleStub.returns({
        getPropertyValue: () => '0px'
      });

      calculateScreenSize(element);

      expect(element.frameWidth).to.equal(DEFAULT_FRAME_SIZE);
      expect(element.frameHeight).to.equal(DEFAULT_FRAME_SIZE);
    });

    it('should handle errors in screen size calculation', () => {
      getComputedStyleStub.throws(new Error('Test error'));

      calculateScreenSize(element);

      expect(consoleErrorStub.calledWith('Calculating screen size: Test error')).to.be.true;
      expect(element.frameWidth).to.equal(DEFAULT_FRAME_SIZE);
      expect(element.frameHeight).to.equal(DEFAULT_FRAME_SIZE);
    });
  });

  describe('calculateFrameSize', () => {
    it('should calculate frame size correctly for landscape orientation', () => {
      element.aspectRatio = 2; // width is twice the height
      calculateFrameSize(element);
      expect(element.frameHeight).to.be.lessThan(element.frameWidth);
      expect(element.frameWidth / element.frameHeight).to.be.closeTo(element.aspectRatio, 0.1);
    });

    it('should calculate frame size correctly for portrait orientation', () => {
      element.aspectRatio = 0.5; // height is twice the width
      element.frameWidth = 100;
      element.frameHeight = 100;

      calculateFrameSize(element);

      expect(element.frameWidth).to.be.lessThan(element.frameHeight);
      expect(element.frameWidth / element.frameHeight).to.be.closeTo(element.aspectRatio, 0.1);
    });
  });

  describe('computeAspectRatio', () => {
    it('should handle missing image source gracefully', async () => {
      element.imgSrc = '';

      await computeAspectRatio(element);

      expect(consoleWarnStub.calledWith('Aspect ratio calculation: No image source available')).to.be.true;
      expect(element.aspectRatio).to.equal(1);
    });

    it('should calculate aspect ratio correctly', async () => {
      element.imgSrc = 'test-image.jpg';

      // Mock Image
      const originalImage = window.Image;
      window.Image = class MockImage {
        constructor() {
          this.crossOrigin = '';
          setTimeout(() => {
            this.width = 200;
            this.height = 100;
            if (this.onload) this.onload();
          }, 10);
        }
      };

      const clock = sinon.useFakeTimers();
      const promise = computeAspectRatio(element);
      clock.tick(20);
      await promise;

      expect(element.aspectRatio).to.equal(2); // 200/100 = 2

      // Restore mocks
      window.Image = originalImage;
      clock.restore();
    });

    it('should handle image load errors gracefully', async () => {
      element.imgSrc = 'test-image.jpg';

      // Mock Image with error
      const originalImage = window.Image;
      window.Image = class MockImage {
        constructor() {
          this.crossOrigin = '';
          setTimeout(() => {
            if (this.onerror) this.onerror(new Error('Image load error'));
          }, 10);
        }
      };

      const clock = sinon.useFakeTimers();
      const promise = computeAspectRatio(element);
      clock.tick(20);
      try {
        await promise;
      } catch (e) {
        // Expected to catch the error
      }

      expect(consoleErrorStub.calledWith('Calculating aspect ratio: Image load error')).to.be.true;
      expect(element.aspectRatio).to.equal(1);

      // Restore mocks
      window.Image = originalImage;
      clock.restore();
    });
  });
}); 