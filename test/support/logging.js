const logger = require('../../app/lib/logger').get();

module.exports = {
  hook: () => {
    beforeEach(function logBefore() { // eslint-disable-line (we need "this")
      logger.info('============================================================');
      logger.info(`Starting test "'${this.currentTest.fullTitle()}'"`);
      logger.info('============================================================');
    });

    afterEach(function logAfter() { // eslint-disable-line (we need "this")
      logger.info('==================================================================================');
      logger.info(`Test ${this.currentTest.state}: '${this.currentTest.fullTitle()}'`);
      logger.info('==================================================================================');
      logger.info('\n');
    });
  },
};
