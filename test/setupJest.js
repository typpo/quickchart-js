const fetchMock = require('jest-fetch-mock');

// quickchart-js uses the global `fetch` (available natively in Node 18+), so we
// mock the global rather than a `cross-fetch` module.
fetchMock.enableMocks();
