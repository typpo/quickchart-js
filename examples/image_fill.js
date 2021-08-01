const QuickChart = require('../index');

const config = {
  type: 'radar',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [
      {
        backgroundColor: QuickChart.getImageFill(
          'https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569__340.jpg',
        ),
        borderColor: 'green',
        borderWidth: 1,
        pointRadius: 0,
        data: [1, 2, 3],
      },
    ],
  },
  options: {
    legend: {
      display: false,
    },
    scale: {
      ticks: {
        beginAtZero: true,
      },
      angleLines: {
        display: false,
      },
      pointLabels: {
        display: false,
      },
    },
  },
};

const myChart = new QuickChart();
myChart.setConfig(config);

myChart.toFile('/tmp/chart.png');
