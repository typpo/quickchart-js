import fs from 'fs';

import axios from 'axios';
import { stringify } from 'javascript-stringify';

import type { ChartConfiguration } from 'chart.js';

const SPECIAL_FUNCTION_REGEX: RegExp = /['"]__BEGINFUNCTION__(.*?)__ENDFUNCTION__['"]/g;

interface PostData {
  chart: string;
  width?: number;
  height?: number;
  format?: string;
  version?: string;
  backgroundColor?: string;
  devicePixelRatio?: number;
}

interface GradientFillOption {
  offset: number;
  color: string;
}

interface GradientDimensionOption {
  width?: number;
  height?: number;
}

function doStringify(chartConfig: ChartConfiguration): string | undefined {
  const str = stringify(chartConfig);
  if (!str) {
    return undefined;
  }
  return str.replace(SPECIAL_FUNCTION_REGEX, '$1');
}

class QuickChart {
  private host: string;
  private protocol: string;
  private baseUrl: string;
  private width: number;
  private height: number;
  private devicePixelRatio: number;
  private backgroundColor: string;
  private format: string;
  private version: string;

  private chart?: string;
  private apiKey?: string;
  private accountId?: string;

  constructor(apiKey?: string, accountId?: string) {
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

  setConfig(chartConfig: string | ChartConfiguration): QuickChart {
    this.chart = typeof chartConfig === 'string' ? chartConfig : doStringify(chartConfig);
    return this;
  }

  setWidth(width: number): QuickChart {
    this.width = width;
    return this;
  }

  setHeight(height: number): QuickChart {
    this.height = height;
    return this;
  }

  setBackgroundColor(color: string): QuickChart {
    this.backgroundColor = color;
    return this;
  }

  setDevicePixelRatio(ratio: number): QuickChart {
    this.devicePixelRatio = ratio;
    return this;
  }

  setFormat(fmt: string): QuickChart {
    this.format = fmt;
    return this;
  }

  setVersion(version: string): QuickChart {
    this.version = version;
    return this;
  }

  isValid(): boolean {
    if (!this.chart) {
      return false;
    }
    return true;
  }

  getUrl(): string {
    if (!this.isValid()) {
      throw new Error('You must call setConfig before getUrl');
    }
    const ret = new URL(`${this.baseUrl}/chart`);
    ret.searchParams.append('c', this.chart!);
    ret.searchParams.append('w', String(this.width));
    ret.searchParams.append('h', String(this.height));
    if (this.devicePixelRatio !== 1.0) {
      ret.searchParams.append('devicePixelRatio', String(this.devicePixelRatio));
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
    return ret.href;
  }

  getPostData(): PostData {
    if (!this.isValid()) {
      throw new Error('You must call setConfig creating post data');
    }

    const { width, height, chart, format, version, backgroundColor, devicePixelRatio } = this;
    const postData: PostData = {
      width,
      height,
      chart: chart!,
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
    return postData;
  }

  async getShortUrl(): Promise<string> {
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

  async toBinary(): Promise<Buffer> {
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

  async toDataUrl(): Promise<string> {
    const buf = await this.toBinary();
    const b64buf = buf.toString('base64');
    const type = this.format === 'svg' ? 'svg+xml' : 'png';
    return `data:image/${type};base64,${b64buf}`;
  }

  async toFile(pathOrDescriptor: string): Promise<void> {
    const buf = await this.toBinary();
    fs.writeFileSync(pathOrDescriptor, buf);
  }

  static getGradientFillHelper(
    direction: string,
    colors: string[],
    dimensions: GradientDimensionOption,
  ): string {
    return `__BEGINFUNCTION__getGradientFillHelper(${JSON.stringify(direction)}, ${JSON.stringify(
      colors,
    )}, ${JSON.stringify(dimensions)})__ENDFUNCTION__`;
  }

  static getGradientFill(
    colorOptions: GradientFillOption[],
    linearGradient: [number, number, number, number],
  ): string {
    return `__BEGINFUNCTION__getGradientFill(${JSON.stringify(colorOptions)}, ${JSON.stringify(
      linearGradient,
    )})__ENDFUNCTION__`;
  }

  static getImageFill(url: string): string {
    return `__BEGINFUNCTION__getImageFill(${JSON.stringify(url)})__ENDFUNCTION__`;
  }

  static pattern = {
    draw: function (
      shapeType: string,
      backgroundColor: string,
      patternColor: string,
      requestedSize: number,
    ): string {
      return `__BEGINFUNCTION__pattern.draw(${JSON.stringify(shapeType)}, ${JSON.stringify(
        backgroundColor,
      )}, ${JSON.stringify(patternColor)}, ${JSON.stringify(requestedSize)})__ENDFUNCTION__`;
    },
  };
}

export default QuickChart;
