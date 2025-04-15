import { FlipcardViewer } from './components/flipcard-viewer/';
import { logger, LOG_LEVELS } from './utils/logger.js';

// Register the custom element
customElements.define('flipcard-viewer', FlipcardViewer);

// Export both default and named for flexibility
export { FlipcardViewer, logger, LOG_LEVELS };
export default FlipcardViewer; 