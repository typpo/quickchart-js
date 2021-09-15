const axios = require('axios');

const QuickChart = require('../index');

jest.mock('axios');

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
    status: 200,
    data: {
      success: true,
      url: 'https://quickchart.io/chart/render/9a560ba4-ab71-4d1e-89ea-ce4741e9d232',
    },
  };
  axios.post.mockImplementationOnce(() => Promise.resolve(mockResp));

  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  await expect(qc.getShortUrl()).resolves.toEqual(mockResp.data.url);
  expect(axios.post).toHaveBeenCalled();
});

test('getShortUrl for chart bad status code', async () => {
  const mockResp = {
    status: 502,
  };
  axios.post.mockImplementationOnce(() => Promise.resolve(mockResp));

  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  await expect(qc.getShortUrl()).rejects.toContain('Bad response code');
  expect(axios.post).toHaveBeenCalled();
});

test('getShortUrl api failure', async () => {
  const mockResp = {
    status: 200,
    data: {
      success: false,
    },
  };
  axios.post.mockImplementationOnce(() => Promise.resolve(mockResp));

  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  await expect(qc.getShortUrl()).rejects.toContain('failure response');
  expect(axios.post).toHaveBeenCalled();
});

test('toBinary, no auth', async () => {
  const mockResp = {
    status: 200,
    data: Buffer.from('bWVvdw==', 'base64'),
  };
  axios.post.mockImplementationOnce(() => Promise.resolve(mockResp));

  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  await expect(qc.toBinary()).resolves.toEqual(mockResp.data);
  expect(axios.post).toHaveBeenCalled();
});

test('toBinary, no auth', async () => {
  const mockResp = {
    status: 200,
    data: Buffer.from('bWVvdw==', 'base64'),
  };
  axios.post.mockImplementationOnce(() => Promise.resolve(mockResp));

  const qc = new QuickChart();
  qc.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
  });

  await expect(qc.toDataUrl()).resolves.toEqual('data:image/png;base64,bWVvdw==');
  expect(axios.post).toHaveBeenCalled();
});

test('no chart specified throws error', async () => {
  const qc = new QuickChart();
  expect(() => {
    qc.getUrl();
  }).toThrow();
});
