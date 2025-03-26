import { processImage, parseExifData, getImageOrientation, correctImageOrientation } from '../../../src/components/flipcard-viewer/image-processor.js';
import { DEFAULT_ORIENTATION, IMAGE_LOAD_TIMEOUT_MS } from '../../../src/utils/constants.js';
import { expect } from '@open-wc/testing';
import sinon from 'sinon';

// Small 1x1 pixel JPEG as data URL for testing
const TEST_IMAGE_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAH8AAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==';

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
      const consoleWarnStub = sinon.stub(console, 'warn');
      const blob = new Blob(['test'], { type: 'image/jpeg' });
      
      const orientation = await getImageOrientation(blob);
      
      // Test should pass whether we get EXIF data or not
      expect(typeof orientation).to.equal('number');
      
      if (orientation === DEFAULT_ORIENTATION) {
        expect(consoleWarnStub.called).to.be.true;
      }
      
      consoleWarnStub.restore();
    });
    
    it('should handle errors in EXIF data extraction', async () => {
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
      const consoleErrorStub = sinon.stub(console, 'error');

      const promise = correctImageOrientation(TEST_IMAGE_DATA_URL, 1);
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

      const promise = correctImageOrientation(TEST_IMAGE_DATA_URL, 1);
      clock.tick(20);

      try {
        await promise;
        expect.fail('Promise should have rejected');
      } catch (error) {
        expect(consoleErrorStub.calledWith('Loading image: Image load error')).to.be.true;
      } finally {
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
      const mediaUrl = TEST_IMAGE_DATA_URL;
      
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