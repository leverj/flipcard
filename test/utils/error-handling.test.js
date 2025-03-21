import { handleError } from '../../src/utils/error-handling.js';
import { expect } from '@open-wc/testing';
import sinon from 'sinon';

describe('Error Handling', () => {
  let consoleErrorStub;
  let consoleWarnStub;

  beforeEach(() => {
    consoleErrorStub = sinon.stub(console, 'error');
    consoleWarnStub = sinon.stub(console, 'warn');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should log errors correctly', () => {
    const error = new Error('Test error');
    const context = 'Test context';

    handleError(error, context);

    expect(consoleErrorStub.calledWith('Test context: Test error')).to.be.true;
    expect(consoleWarnStub.called).to.be.false;
  });

  it('should log warnings when isWarning is true', () => {
    const error = new Error('Test warning');
    const context = 'Test context';

    handleError(error, context, true);

    expect(consoleWarnStub.calledWith('Test context: Test warning')).to.be.true;
    expect(consoleErrorStub.called).to.be.false;
  });

  it('should handle string errors', () => {
    const error = 'String error message';
    const context = 'Test context';

    handleError(error, context);

    expect(consoleErrorStub.calledWith('Test context: String error message')).to.be.true;
  });

  it('should handle errors with no message property', () => {
    const error = { /* empty object */ };
    const context = 'Test context';

    handleError(error, context);

    expect(consoleErrorStub.calledWith('Test context: [object Object]')).to.be.true;
  });

  it('should handle null errors', () => {
    const error = null;
    const context = 'Test context';

    handleError(error, context);

    expect(consoleErrorStub.calledWith('Test context: null')).to.be.true;
  });

  it('should handle undefined errors', () => {
    const error = undefined;
    const context = 'Test context';

    handleError(error, context);

    expect(consoleErrorStub.calledWith('Test context: undefined')).to.be.true;
  });
}); 