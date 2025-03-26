import { FlipcardViewer } from './components/flipcard-viewer/';

// Register the custom element
customElements.define('flipcard-viewer', FlipcardViewer);

// Export both default and named for flexibility
export { FlipcardViewer };
export default FlipcardViewer; 