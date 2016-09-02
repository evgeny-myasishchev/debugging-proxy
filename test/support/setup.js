process.env.NODE_ENV = 'test';

const _ = require('lodash');
const chai = require('chai');

chai.use(require('sinon-chai'));

// Prevent styles imports in jsx
require.extensions['.css'] = _.noop;
