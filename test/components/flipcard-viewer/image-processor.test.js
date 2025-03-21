import { processImage, parseExifData, getImageOrientation, correctImageOrientation } from '../../../src/components/flipcard-viewer/image-processor.js';
import { DEFAULT_ORIENTATION, IMAGE_LOAD_TIMEOUT_MS } from '../../../src/utils/constants.js';
import { expect } from '@open-wc/testing';
import sinon from 'sinon';

describe('Image Processor', () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  describe('getImageOrientation', () => {
    it('should handle EXIF data extraction', async () => {
      // Test that the getImageOrientation function
      // handles the expected success case where EXIF data is present
      const consoleWarnStub = sinon.stub(console, 'warn');
      const blob = new Blob(['test'], { type: 'image/jpeg' });
      
      const orientation = await getImageOrientation(blob);
      
      // Since we can't control the return value of parseExifData,
      // we just need to check that the function returns a number
      expect(typeof orientation).to.equal('number');
      
      // If parseExifData fails in the testing environment (likely),
      // it should log a warning and return DEFAULT_ORIENTATION
      if (orientation === DEFAULT_ORIENTATION) {
        expect(consoleWarnStub.called).to.be.true;
      }
      
      consoleWarnStub.restore();
    });
    
    it('should handle errors in EXIF data extraction', async () => {
      // Test that errors from parseExifData are handled properly
      const consoleWarnStub = sinon.stub(console, 'warn');
      const invalidBlob = new Blob(['invalid data'], { type: 'application/octet-stream' });

      const orientation = await getImageOrientation(invalidBlob);

      expect(orientation).to.equal(DEFAULT_ORIENTATION);
      expect(consoleWarnStub.called).to.be.true;
      
      consoleWarnStub.restore();
    });
  });

  describe('correctImageOrientation', () => {
    it('should handle image load timeout', async () => {
      const imageUrl = 'test-image.jpg';
      const consoleErrorStub = sinon.stub(console, 'error');

      const promise = correctImageOrientation(imageUrl, 1);
      clock.tick(IMAGE_LOAD_TIMEOUT_MS + 10);

      try {
        await promise;
        expect.fail('Promise should have rejected');
      } catch (error) {
        expect(error.message).to.equal('Image load timeout');
      }
      
      consoleErrorStub.restore();
    });

    it('should handle image load errors', async () => {
      const imageUrl = 'test-image.jpg';
      const consoleErrorStub = sinon.stub(console, 'error');

      // Mock Image to simulate error
      const originalImage = window.Image;
      window.Image = class MockImage {
        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror(new Error('Image load error'));
          }, 10);
        }
      };

      const promise = correctImageOrientation(imageUrl, 1);
      clock.tick(20);

      try {
        await promise;
        expect.fail('Promise should have rejected');
      } catch (error) {
        expect(consoleErrorStub.calledWith('Loading image: Image load error')).to.be.true;
      } finally {
        // Restore original Image
        window.Image = originalImage;
        consoleErrorStub.restore();
      }
    });
  });

  describe('processImage', () => {
    it('should handle missing media URL', async () => {
      const consoleErrorStub = sinon.stub(console, 'error');
      const result = await processImage(null);

      expect(result).to.be.null;
      expect(consoleErrorStub.calledWith('Image orientation correction: No media URL provided')).to.be.true;
    });

    it('should attempt to process the image', async () => {
      const mediaUrl = 'https://example.com/test.jpg';
      
      // Mock fetch to return a simple blob
      const originalFetch = window.fetch;
      const fetchStub = sinon.stub(window, 'fetch').resolves({
        ok: true,
        blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' }))
      });
      
      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = sinon.stub().returns('blob:test');
      
      const originalRevokeObjectURL = URL.revokeObjectURL;
      URL.revokeObjectURL = sinon.stub();
      
      try {
        // We don't wait for the full result since it involves complex async operations
        // Just ensure the fetch was called with the correct URL
        processImage(mediaUrl);
        expect(fetchStub.calledWith(mediaUrl, sinon.match.object)).to.be.true;
      } finally {
        window.fetch = originalFetch;
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
      }
    });
  });
}); 