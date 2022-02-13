import fetchMock from 'jest-fetch-mock';

import QuickChart from '../src/index';

test('basic chart, no auth', () => {
  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  expect(qc.getUrl()).toContain('Hello+world');
  expect(qc.getUrl()).toContain('/chart?');
  expect(qc.getUrl()).toContain('w=500');
  expect(qc.getUrl()).toContain('h=300');
});

test('basic chart with auth', () => {
  const qc = new QuickChart('abc123', '12345');
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  expect(qc.getUrl()).toContain('Hello+world');
  expect(qc.getUrl()).toContain('/chart?');
  expect(qc.getUrl()).toContain('w=500');
  expect(qc.getUrl()).toContain('h=300');
  expect(qc.getUrl()).toContain('key=abc123');
});

test('basic chart with auth, signed', () => {
  const qc = new QuickChart('abc123', '12345');
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  const url = qc.getSignedUrl();
  expect(url).toContain('Hello+world');
  expect(url).toContain('/chart?');
  expect(url).toContain('w=500');
  expect(url).toContain('h=300');

  expect(url).not.toContain('key=');
  expect(url).toContain('accountId=12345');
  expect(url).toContain('sig=');
});

test('basic chart, string', () => {
  const qc = new QuickChart();
  qc.setConfig(`{
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  }`);

  expect(qc.getUrl()).toContain('Hello+world');
  expect(qc.getUrl()).toContain('/chart?');
  expect(qc.getUrl()).toContain('w=500');
  expect(qc.getUrl()).toContain('h=300');
});

test('basic chart with gradient', () => {
  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: {
      labels: ['Hello world', 'Foo bar'],
      datasets: [
        {
          label: 'Foo',
          data: [1, 2],
          backgroundColor: QuickChart.getGradientFillHelper('horizontal', ['red', 'green']),
        },
      ],
    },
  });

  expect(qc.getUrl()).toContain('Hello+world');
  expect(qc.getUrl()).toContain('/chart?');
  expect(qc.getUrl()).toContain('w=500');
  expect(qc.getUrl()).toContain('h=300');
  expect(qc.getUrl()).toContain('getGradientFillHelper');
});

test('basic chart, width and height', () => {
  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  qc.setWidth(800).setHeight(500);

  expect(qc.getUrl()).toContain('Hello+world');
  expect(qc.getUrl()).toContain('w=800');
  expect(qc.getUrl()).toContain('h=500');
});

test('basic chart, other params', () => {
  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  qc.setBackgroundColor('#000000').setDevicePixelRatio(2.0).setFormat('svg').setVersion('3');

  expect(qc.getUrl()).toContain('Hello+world');
  expect(qc.getUrl()).toContain('devicePixelRatio=2');
  expect(qc.getUrl()).toContain('f=svg');
  expect(qc.getUrl()).toContain('bkg=%23000000');
  expect(qc.getUrl()).toContain('v=3');
});

test('js chart', () => {
  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May'],
      datasets: [
        {
          label: 'Dogs',
          data: [50, 60, 70, 180, 190],
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              // @ts-ignore
              callback: function (value) {
                return '$' + value;
              },
            },
          },
        ],
      },
    },
  });

  expect(qc.getUrl()).toContain('Dogs');
  expect(qc.getUrl()).toContain('callback%3Afunction+%28value');
});

test('postdata for basic chart, no auth', () => {
  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  const postData = qc.getPostData();
  expect(postData.chart).toContain('Hello world');
  expect(postData.width).toEqual(500);
  expect(postData.height).toEqual(300);
  expect(postData.format).toEqual('png');
  expect(postData.backgroundColor).toEqual('#ffffff');
  expect(postData.devicePixelRatio).toBeCloseTo(1);
});

test('postdata for basic chart with auth', () => {
  const qc = new QuickChart('abc123', '12345');
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  const postData = qc.getPostData();
  expect(postData.chart).toContain('Hello world');
  expect(postData.width).toEqual(500);
  expect(postData.height).toEqual(300);
  expect(postData.format).toEqual('png');
  expect(postData.backgroundColor).toEqual('#ffffff');
  expect(postData.devicePixelRatio).toBeCloseTo(1);
  expect(postData.key).toEqual('abc123');
});

test('postdata for basic chart with params', () => {
  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  qc.setWidth(400)
    .setHeight(200)
    .setFormat('svg')
    .setBackgroundColor('transparent')
    .setDevicePixelRatio(2.0);

  const postData = qc.getPostData();
  expect(postData.chart).toContain('Hello world');
  expect(postData.width).toEqual(400);
  expect(postData.height).toEqual(200);
  expect(postData.format).toEqual('svg');
  expect(postData.backgroundColor).toEqual('transparent');
  expect(postData.devicePixelRatio).toBeCloseTo(2);
});

test('postdata for js chart', () => {
  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May'],
      datasets: [
        {
          label: 'Dogs',
          data: [50, 60, 70, 180, 190],
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              // @ts-ignore
              callback: function (value) {
                return '$' + value;
              },
            },
          },
        ],
      },
    },
  });

  qc.setWidth(400)
    .setHeight(200)
    .setFormat('svg')
    .setBackgroundColor('transparent')
    .setDevicePixelRatio(2.0);

  const postData = qc.getPostData();
  expect(postData.chart).toContain('callback:function (val');
  expect(postData.width).toEqual(400);
  expect(postData.height).toEqual(200);
  expect(postData.format).toEqual('svg');
  expect(postData.backgroundColor).toEqual('transparent');
  expect(postData.devicePixelRatio).toBeCloseTo(2);
});

test('getShortUrl for chart, no auth', async () => {
  const mockResp = {
    success: true,
    url: 'https://quickchart.io/chart/render/9a560ba4-ab71-4d1e-89ea-ce4741e9d232',
  };
  fetchMock.mockResponseOnce(JSON.stringify(mockResp));

  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  await expect(qc.getShortUrl()).resolves.toEqual(mockResp.url);
});

test('getShortUrl for chart js error', async () => {
  fetchMock.mockResponseOnce(() => {
    throw new Error('Request timed out');
  });

  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  await expect(qc.getShortUrl()).rejects.toThrow('Request timed out');
});

test('getShortUrl for chart bad status code', async () => {
  fetchMock.mockResponseOnce('', {
    status: 502,
  });

  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  await expect(qc.getShortUrl()).rejects.toThrow('failed with status code');
});

test('getShortUrl for chart bad status code with error detail', async () => {
  fetchMock.mockResponseOnce('', {
    status: 400,
    headers: {
      'x-quickchart-error': 'foo bar',
    },
  });

  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  await expect(qc.getShortUrl()).rejects.toThrow('foo bar');
});

test('getShortUrl api failure', async () => {
  fetchMock.mockResponseOnce(
    JSON.stringify({
      success: false,
    }),
  );

  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  await expect(qc.getShortUrl()).rejects.toThrow('failure response');
  expect(fetch).toHaveBeenCalled();
});

test('toBinary, no auth', async () => {
  const mockData = Buffer.from('bWVvdw==', 'base64');
  // https://github.com/jefflau/jest-fetch-mock/issues/218
  fetchMock.mockResponseOnce(() => Promise.resolve({ body: mockData as unknown as string }));

  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  await expect(qc.toBinary()).resolves.toEqual(mockData);
});

test('toDataUrl, no auth', async () => {
  fetchMock.mockResponseOnce(() =>
    Promise.resolve({ body: Buffer.from('bWVvdw==', 'base64') as unknown as string }),
  );

  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  await expect(qc.toDataUrl()).resolves.toEqual('data:image/png;base64,bWVvdw==');
});

test('no chart specified throws error', async () => {
  const qc = new QuickChart();
  expect(() => {
    qc.getUrl();
  }).toThrow();
});
