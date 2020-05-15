const QuickChart = require('../index');

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
qc.setWidth(500).setHeight(300).setBackgroundColor('#0febc2');

console.log(qc.getUrl());
// https://quickchart.io/chart?c=%7Btype%3A%27bar%27%2Cdata%3A%7Blabels%3A%5B%27January%27%2C%27February%27%2C%27March%27%2C%27April%27%2C%27May%27%5D%2Cdatasets%3A%5B%7Blabel%3A%27Dogs%27%2Cdata%3A%5B50%2C60%2C70%2C180%2C190%5D%7D%5D%7D%2Coptions%3A%7Bscales%3A%7ByAxes%3A%5B%7Bticks%3A%7Bcallback%3Afunction+%28value%29+%7B%0A++return+%27%24%27+%2B+value%3B%0A%7D%7D%7D%5D%7D%7D%7D&w=500&h=300&bkg=%230febc2&f=png
