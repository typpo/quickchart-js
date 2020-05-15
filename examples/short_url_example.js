const QuickChart = require('../index');

const qc = new QuickChart();

// Fill the chart with data from 0 to 100
const data = [...Array(100).keys()];
qc.setConfig({
  type: 'bar',
  data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data }] },
});

// Print the regular URL...
console.log(qc.getUrl());
// https://quickchart.io/chart?c=%7Btype%3A%27bar%27%2Cdata%3A%7Blabels%3A%5B%27Hello+world%27%2C%27Foo+bar%27%5D%2Cdatasets%3A%5B%7Blabel%3A%27Foo%27%2Cdata%3A%5B0%2C1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%2C10%2C11%2C12%2C13%2C14%2C15%2C16%2C17%2C18%2C19%2C20%2C21%2C22%2C23%2C24%2C25%2C26%2C27%2C28%2C29%2C30%2C31%2C32%2C33%2C34%2C35%2C36%2C37%2C38%2C39%2C40%2C41%2C42%2C43%2C44%2C45%2C46%2C47%2C48%2C49%2C50%2C51%2C52%2C53%2C54%2C55%2C56%2C57%2C58%2C59%2C60%2C61%2C62%2C63%2C64%2C65%2C66%2C67%2C68%2C69%2C70%2C71%2C72%2C73%2C74%2C75%2C76%2C77%2C78%2C79%2C80%2C81%2C82%2C83%2C84%2C85%2C86%2C87%2C88%2C89%2C90%2C91%2C92%2C93%2C94%2C95%2C96%2C97%2C98%2C99%5D%7D%5D%7D%7D&w=500&h=300&bkg=%23ffffff&f=png

// That's a long URL! Maybe we want a shorter version (requires an HTTP request to QuickChart.io)
async function printShortUrl() {
  const url = await qc.getShortUrl();
  console.log(url);
}
printShortUrl();
// https://quickchart.io/chart/render/f-a1d3e804-dfea-442c-88b0-9801b9808401
// Much shorter and more manageable :)
