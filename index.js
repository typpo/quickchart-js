const axios = require('axios');
const { stringify } = require('javascript-stringify');

const SPECIAL_FUNCTION_REGEX = /['"]__BEGINFUNCTION__(.*?)__ENDFUNCTION__['"]/g;

function doStringify(chartConfig) {
  const str = stringify(chartConfig);
  return str.replace(SPECIAL_FUNCTION_REGEX, '$1');
}

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
    this.version = '2.9.4';
  }

  setConfig(chartConfig) {
    this.chart = typeof chartConfig === 'string' ? chartConfig : doStringify(chartConfig);
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

  setVersion(version) {
    this.version = version;
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
    if (this.backgroundColor) {
      ret.searchParams.append('bkg', this.backgroundColor);
    }
    if (this.format) {
      ret.searchParams.append('f', this.format);
    }
    if (this.version) {
      ret.searchParams.append('v', this.version);
    }
    if (this.apiKey) {
      ret.searchParams.append('key', this.apiKey);
    }
    return ret.href;
  }

  getPostData() {
    const {
      width,
      height,
      chart,
      format,
      version,
      backgroundColor,
      devicePixelRatio,
      apiKey,
    } = this;
    const postData = {
      width,
      height,
      chart,
    };
    if (format) {
      postData.format = format;
    }
    if (version) {
      postData.version = version;
    }
    if (backgroundColor) {
      postData.backgroundColor = backgroundColor;
    }
    if (devicePixelRatio) {
      postData.devicePixelRatio = devicePixelRatio;
    }
    if (apiKey) {
      postData.key = apiKey;
    }
    return postData;
  }

  async getShortUrl() {
    if (!this.isValid()) {
      throw new Error('You must call setConfig before getUrl');
    }
    if (this.host !== 'quickchart.io') {
      throw new Error('Short URLs must use quickchart.io host');
    }

    const resp = await axios.post(`${this.baseUrl}/chart/create`, this.getPostData());
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

    const resp = await axios.post(`${this.baseUrl}/chart`, this.getPostData(), {
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
    const type = this.format === 'svg' ? 'svg+xml' : 'png';
    return `data:image/${type};base64,${b64buf}`;
  }

  async toFile(pathOrDescriptor) {
    const fs = require('fs');
    const buf = await this.toBinary();
    fs.writeFileSync(pathOrDescriptor, buf);
  }
}

QuickChart.getGradientFillHelper = function (direction, colors, dimensions) {
  return `__BEGINFUNCTION__getGradientFillHelper(${JSON.stringify(direction)}, ${JSON.stringify(
    colors,
  )}, ${JSON.stringify(dimensions)})__ENDFUNCTION__`;
};

QuickChart.getGradientFill = function (colorOptions, linearGradient) {
  return `__BEGINFUNCTION__getGradientFill(${JSON.stringify(colorOptions)}, ${JSON.stringify(
    linearGradient,
  )})__ENDFUNCTION__`;
};

QuickChart.getImageFill = function (url) {
  return `__BEGINFUNCTION__getImageFill(${JSON.stringify(url)})__ENDFUNCTION__`;
};

QuickChart.pattern = {};
QuickChart.pattern.draw = function (shapeType, backgroundColor, patternColor, requestedSize) {
  return `__BEGINFUNCTION__pattern.draw(${JSON.stringify(shapeType)}, ${JSON.stringify(
    backgroundColor,
  )}, ${JSON.stringify(patternColor)}, ${JSON.stringify(requestedSize)})__ENDFUNCTION__`;
};

module.exports = QuickChart;
