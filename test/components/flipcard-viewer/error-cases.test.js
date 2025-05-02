import { html, fixture, expect, waitUntil } from '@open-wc/testing';
import sinon from 'sinon';
import { FlipcardViewer } from '../../../src/components/flipcard-viewer/flipcard-viewer.js';

// Register the component only if it's not already registered
try {
  customElements.define('flipcard-viewer', FlipcardViewer);
} catch (e) {
  // Component already registered, ignore
}

describe('FlipcardViewer Error Cases', () => {
  let element;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleWarnSpy = sinon.spy(console, 'warn');
    consoleErrorSpy = sinon.spy(console, 'error');
  });

  afterEach(() => {
    consoleWarnSpy.restore();
    consoleErrorSpy.restore();
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  describe('Metadata Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      element = await fixture(html`<flipcard-viewer metadata-json="{invalid}"></flipcard-viewer>`);
      await element.updateComplete;
      
      // Wait for any error messages
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const hasErrorMessage = consoleErrorSpy.getCalls().some(call => {
        return typeof call.args[0] === 'string' && call.args[0].includes('Expected property name');
      }) || consoleWarnSpy.getCalls().some(call => {
        return typeof call.args[0] === 'string' && call.args[0].includes('Expected property name');
      });
      
      expect(hasErrorMessage, 'Should log an error with "Expected property name"').to.be.true;
      expect(element.mediaUrl).to.equal('');
    });

    it('should handle null metadata gracefully', async () => {
      element = await fixture(html`<flipcard-viewer metadata-json="null"></flipcard-viewer>`);
      await element.updateComplete;
      
      // Wait for any error messages
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorLogMessages = consoleErrorSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const warnLogMessages = consoleWarnSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const allMessages = [...errorLogMessages, ...warnLogMessages].join('\n');
      
      expect(allMessages.includes('Metadata parsed to null') || 
             allMessages.includes('No image property found'), 
             'Should log appropriate error for null metadata').to.be.true;
      
      expect(element.mediaUrl).to.equal('');
    });

    it('should handle missing image properties gracefully', async () => {
      element = await fixture(html`<flipcard-viewer metadata-json='{"properties":{}}'></flipcard-viewer>`);
      await element.updateComplete;
      
      // Wait for any error messages
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorLogMessages = consoleErrorSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const warnLogMessages = consoleWarnSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const allMessages = [...errorLogMessages, ...warnLogMessages].join('\n');
      
      expect(allMessages.includes('No image property found'), 
             'Should log appropriate error for missing image property').to.be.true;
      
      expect(element.mediaUrl).to.equal('');
    });
  });

  describe('Image Processing Error Handling', () => {
    it('should handle missing image source gracefully', async () => {
      element = await fixture(html`<flipcard-viewer metadata-json='{"image":""}'></flipcard-viewer>`);
      await element.updateComplete;
      
      // Wait for any error messages
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorLogMessages = consoleErrorSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const warnLogMessages = consoleWarnSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const allMessages = [...errorLogMessages, ...warnLogMessages].join('\n');
      
      expect(allMessages.includes('No image URL found'), 
             'Should log appropriate error for missing image URL').to.be.true;
      
      expect(element.isImagePrepared).to.be.false;
    });
  });

  describe('Frame Size Calculation Edge Cases', () => {
    beforeEach(async () => {
      element = await fixture(html`<flipcard-viewer metadata-json='{"image":"test.jpg"}'></flipcard-viewer>`);
      await element.updateComplete;
    });
    
    it('should handle zero dimensions gracefully', async () => {
      element.rows = 0;
      element.columns = 0;
      element.isThumbnail = false;
      element.displayFlipcard();
      
      // Wait for any warning messages
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorLogMessages = consoleErrorSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const warnLogMessages = consoleWarnSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const allMessages = [...errorLogMessages, ...warnLogMessages].join('\n');
      
      expect(allMessages.includes('Invalid rows or columns'), 
             'Should log appropriate warning for zero dimensions').to.be.true;
    });

    it('should handle negative dimensions gracefully', async () => {
      element.rows = -1;
      element.columns = -1;
      element.isThumbnail = false;
      element.displayFlipcard();
      
      // Wait for any warning messages
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorLogMessages = consoleErrorSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const warnLogMessages = consoleWarnSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const allMessages = [...errorLogMessages, ...warnLogMessages].join('\n');
      
      expect(allMessages.includes('Invalid rows or columns'), 
             'Should log appropriate warning for negative dimensions').to.be.true;
    });
  });

  describe('Image Shifting Edge Cases', () => {
    beforeEach(async () => {
      element = await fixture(html`<flipcard-viewer metadata-json='{"image":"test.jpg"}'></flipcard-viewer>`);
      await element.updateComplete;
    });

    it('should handle negative index gracefully', async () => {
      element.shiftImage(-1);
      
      // Wait for any warning messages
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorLogMessages = consoleErrorSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const warnLogMessages = consoleWarnSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const allMessages = [...errorLogMessages, ...warnLogMessages].join('\n');
      
      expect(allMessages.includes('Invalid index for image shifting'), 
             'Should log appropriate warning for negative index').to.be.true;
    });

    it('should handle missing frame dimensions gracefully', async () => {
      element.frameWidth = 0;
      element.frameHeight = 0;
      element.shiftImage(1);
      
      // Wait for any warning messages
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorLogMessages = consoleErrorSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const warnLogMessages = consoleWarnSpy.getCalls().map(call => 
        typeof call.args[0] === 'string' ? call.args[0] : ''
      );
      const allMessages = [...errorLogMessages, ...warnLogMessages].join('\n');
      
      expect(allMessages.includes('Frame dimensions not set'), 
             'Should log appropriate warning for missing frame dimensions').to.be.true;
    });
  });

  describe('Component Lifecycle Edge Cases', () => {
    it('should handle disconnectedCallback when resize observer exists', async () => {
      const originalClearTimeout = window.clearTimeout;
      const clearTimeoutSpy = sinon.spy();
      window.clearTimeout = clearTimeoutSpy;
      
      element = await fixture(html`<flipcard-viewer metadata-json='{"image":"test.jpg"}'></flipcard-viewer>`);
      await element.updateComplete;
      
      // Create a fake timer
      const fakeTimerId = 123;
      element._resizeTimer = fakeTimerId;
      
      // Call disconnectedCallback
      element.disconnectedCallback();
      
      // Verify clearTimeout was called
      expect(clearTimeoutSpy.calledWith(fakeTimerId)).to.be.true;
      
      // Restore original
      window.clearTimeout = originalClearTimeout;
    });

    it('should handle multiple attribute changes', async () => {
      element = await fixture(html`<flipcard-viewer></flipcard-viewer>`);
      await element.updateComplete;
      
      // First check no image URL
      expect(element.mediaUrl).to.equal('');
      
      // Set valid metadata with image
      element.metadataJson = '{"image":"test1.jpg"}';
      element.parseMetadata();
      await element.updateComplete;
      
      expect(element.mediaUrl).to.equal('test1.jpg');
      
      // Update to different image
      element.metadataJson = '{"image":"test2.jpg"}';
      element.parseMetadata();
      await element.updateComplete;
      
      expect(element.mediaUrl).to.equal('test2.jpg');
    });
  });
}); 