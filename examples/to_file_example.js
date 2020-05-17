const fs = require('fs');

const QuickChart = require('../index');

const qc = new QuickChart();

qc.setConfig({
  type: 'bar',
  data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
});
qc.setWidth(500).setHeight(300).setBackgroundColor('transparent');

async function saveChart() {
  // Write file to disk
  await qc.toFile('/tmp/chart.png');
}
saveChart();
