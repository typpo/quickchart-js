const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();
jest.setMock('cross-fetch', fetchMock);
