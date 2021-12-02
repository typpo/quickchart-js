const QuickChart = require('../build/quickchart.cjs');

const qc = new QuickChart('abc123', '12345');

qc.setConfig({
  type: 'bar',
  data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
});
qc.setWidth(500).setHeight(300).setBackgroundColor('transparent');

console.log(qc.getSignedUrl());
// https://quickchart.io/chart?c=%7Btype%3A%27bar%27%2Cdata%3A%7Blabels%3A%5B%27Hello+world%27%2C%27Foo+bar%27%5D%2Cdatasets%3A%5B%7Blabel%3A%27Foo%27%2Cdata%3A%5B1%2C2%5D%7D%5D%7D%7D&w=500&h=300&bkg=transparent&f=png&v=2.9.4&sig=0c4cf0eb43b200bf523407f403412932cdeccb8d2a9317731ff18c7b887b5c78&accountId=12345
