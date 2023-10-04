const core = require('@actions/core');

async function setup() {
  // Get version of tool to be installed
  core.info('Output to the actions build log')
  core.notice('This is a message that will also emit an annotation')
  core.debug('Inside try block');
}

module.exports = setup
