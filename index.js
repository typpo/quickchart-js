const fs = require('fs');

const axios = require('axios');
const { stringify } = require('javascript-stringify');

class QuickChart {
  constructor(apiKey, accountId) {
    this.apiKey = apiKey;
    this.accountId = accountId;

    this.host = 'quickchart.io';
    this.protocol = 'https';
    this.baseUrl = `${this.protocol}://${this.host}`;

    this.chart = undefined;
    this.width = 500;
    this.height = 300;
    this.devicePixelRatio = 1.0;
    this.backgroundColor = '#ffffff';
    this.format = 'png';
  }

  setConfig(chartConfig) {
    this.chart = stringify(chartConfig);
    return this;
  }

  setWidth(width) {
    this.width = parseInt(width, 10);
    return this;
  }

  setHeight(height) {
    this.height = parseInt(height, 10);
    return this;
  }

  setBackgroundColor(color) {
    this.backgroundColor = color;
    return this;
  }

  setDevicePixelRatio(ratio) {
    this.devicePixelRatio = parseFloat(ratio);
    return this;
  }

  setFormat(fmt) {
    this.format = fmt;
    return this;
  }

  isValid() {
    if (!this.chart) {
      return false;
    }
    return true;
  }

  getUrl() {
    if (!this.isValid()) {
      throw new Error('You must call setConfig before getUrl');
    }
    const ret = new URL(`${this.baseUrl}/chart`);
    ret.searchParams.append('c', this.chart);
    ret.searchParams.append('w', this.width);
    ret.searchParams.append('h', this.height);
    if (this.devicePixelRatio !== 1.0) {
      ret.searchParams.append('devicePixelRatio', this.devicePixelRatio);
    }
    if (this.backgroundColor !== 1.0) {
      ret.searchParams.append('bkg', this.backgroundColor);
    }
    if (this.format !== 1.0) {
      ret.searchParams.append('f', this.format);
    }
    return ret.href;
  }

  getPostData() {
    const { width, height, chart, format, backgroundColor, devicePixelRatio } = this;
    const postData = {
      width,
      height,
      chart,
    };
    if (format) {
      postData.format = format;
    }
    if (backgroundColor) {
      postData.backgroundColor = backgroundColor;
    }
    if (devicePixelRatio) {
      postData.devicePixelRatio = devicePixelRatio;
    }
    return postData;
  }

  async getShortUrl() {
    if (!this.isValid()) {
      throw new Error('You must call setConfig before getUrl');
    }

    const resp = await axios.post('https://quickchart.io/chart/create', this.getPostData());
    if (resp.status !== 200) {
      throw `Bad response code ${resp.status} from chart shorturl endpoint`;
    } else if (!resp.data.success) {
      throw 'Received failure response from chart shorturl endpoint';
    } else {
      return resp.data.url;
    }
  }

  async toBinary() {
    if (!this.isValid()) {
      throw new Error('You must call setConfig before getUrl');
    }

    const resp = await axios.post('https://quickchart.io/chart', this.getPostData(), {
      responseType: 'arraybuffer',
    });
    if (resp.status !== 200) {
      throw `Bad response code ${resp.status} from chart shorturl endpoint`;
    }
    return Buffer.from(resp.data, 'binary');
  }

  async toDataUrl() {
    const buf = await this.toBinary();
    const b64buf = buf.toString('base64');
    return `data:image/png;base64,${b64buf}`;
  }

  async toFile(pathOrDescriptor) {
    const buf = await this.toBinary();
    fs.writeFileSync(pathOrDescriptor, buf);
  }
}

module.exports = QuickChart;
