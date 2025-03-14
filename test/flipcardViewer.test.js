import { FlipcardViewer } from '../src/flipcardViewer.js';
import { expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';

describe('FlipcardViewer', () => {
  let element;

  beforeEach(() => {
    element = new FlipcardViewer();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should be defined', async () => {
      const metadataJson = JSON.stringify({
        "name":"Prismatic-Erratic",
        "image":"ipfs://QmWBYvRXYPfETdY1UVz7HwrSdf7kdjmMuzqL4iuZGCdCoK",
        "properties":{
            "display":{
                "layout":"interactive:grid",
                "action":"click",
                "transition":"flip",
                "rows":"1",
                "columns":"2"
            },
            "Content-Type":"multipart/image"
        }
      })
      const element = await fixture(html`<flipcard-viewer metadata-json=${metadataJson} gateway-url="https://ipfs.metaversis.io/ipfs/" />`);
      const flipcardViewer = document.querySelector('flipcard-viewer');
      expect(element).to.exist
      expect(flipcardViewer).to.exist
    });
    
  it('should parse metadata correctly', () => {
    element.metadataJson = JSON.stringify({
      image: 'ipfs://somehash',
      properties: { display: { rows: 3, columns: 4 } }
    });
    element.parseMetadata();
    expect(element.mediaUrl).to.equal('https://www.ipfs.io/ipfs/somehash');
    expect(element.rows).to.equal(3);
    expect(element.columns).to.equal(4);
  });
  
  it('should handle invalid JSON in parseMetadata', () => {
    const consoleErrorStub = sinon.stub(console, 'error');
    element.metadataJson = 'invalid json';
    element.parseMetadata();
    expect(consoleErrorStub.calledOnce).to.be.true;
  });

  it('should calculate screen size correctly', () => {
    sinon.stub(window, 'innerWidth').value(1920);
    sinon.stub(window, 'innerHeight').value(1080);
    sinon.stub(document.documentElement, 'style').value({ fontSize: '16px' });
    element.calculateScreenSize();
    expect(element.frameWidth).to.be.closeTo(108, 0.1);
    expect(element.frameHeight).to.be.closeTo(60.75, 0.1);
  });

  it('should compute aspect ratio correctly', (done) => {
    element.mediaUrl = 'https://example.com/image.jpg';
    element.columns = 2;
    element.rows = 2;
    const imageStub = sinon.stub(window, 'Image').returns({
      src: '',
      onload: sinon.stub(),
      width: 400,
      height: 200,
      set src(value) {
        this.onload();
      }
    });
    element.computeAspectRatio();
    setTimeout(() => {
      expect(element.aspectRatio).to.equal(1);
      done();
    }, 0);
  });

  it('should load image and correct orientation', async () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves({
      blob: async () => new Blob(),
    });
    const parseExifDataStub = sinon.stub(element, 'parseExifData').resolves({ Orientation: 1 });
    await element.loadImageAndCorrectOrientation();
    expect(fetchStub.calledOnce).to.be.true;
    expect(parseExifDataStub.calledOnce).to.be.true;
  });

  it('should display flipcard correctly', () => {
    element.rows = 2;
    element.columns = 2;
    const shiftImageSpy = sinon.spy(element, 'shiftImage');
    element.displayFlipcard();
    expect(element.index).to.equal(1);
    expect(element.rotateBy).to.equal('180deg');
    expect(shiftImageSpy.calledOnce).to.be.true;
  });

  it('should shift image correctly', () => {
    element.frameWidth = 10;
    element.frameHeight = 10;
    element.columns = 2;
    element.shiftImage(1);
    expect(element.backImgLeft).to.equal('-10rem');
    expect(element.backImgTop).to.equal('0rem');
  });
});
