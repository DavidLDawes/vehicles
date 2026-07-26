// jest-environment-jsdom does not expose the Node `structuredClone` global on
// its window object, but fake-indexeddb relies on it to clone stored records.
// This wraps the default jsdom environment and copies it over.
const JSDOMEnvironment = require('jest-environment-jsdom').default;

class JSDOMEnvironmentWithStructuredClone extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);
    this.global.structuredClone = structuredClone;
  }
}

module.exports = JSDOMEnvironmentWithStructuredClone;
