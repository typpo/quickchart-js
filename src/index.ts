import fetch from 'cross-fetch';
import { stringify } from 'javascript-stringify';

import type { PathLike } from 'fs';
import type { FileHandle } from 'fs/promises';
import type { ChartConfiguration } from 'chart.js';
import type { Response } from 'cross-fetch';

const SPECIAL_FUNCTION_REGEX: RegExp = /['"]__BEGINFUNCTION__(.*?)__ENDFUNCTION__['"]/g;

const USER_AGENT = `quickchart-js/3.1.0`;

interface PostData {
  chart: string;
  width?: number;
  height?: number;
  format?: string;
  version?: string;
  backgroundColor?: string;
  devicePixelRatio?: number;
  key?: string;
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

function postJson(url: string, payload: PostData): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

class QuickChart {
  private host: string;
  private scheme: string;
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
    this.scheme = 'https';

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

  setHost(host: string): QuickChart {
    this.host = host;
    return this;
  }

  setScheme(scheme: string): QuickChart {
    this.scheme = scheme;
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

  private getBaseUrl(): string {
    return `${this.scheme}://${this.host}`;
  }

  private getUrlObject(): URL {
    if (!this.isValid()) {
      throw new Error('You must call setConfig before getUrl');
    }
    const ret = new URL(`${this.getBaseUrl()}/chart`);
    ret.searchParams.append('c', this.chart!);
    ret.searchParams.append('w', String(this.width));
    ret.searchParams.append('h', String(this.height));
    ret.searchParams.append('ref', 'qc-js');
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
    if (this.apiKey) {
      ret.searchParams.append('key', this.apiKey);
    }
    return ret;
  }

  getUrl(): string {
    return this.getUrlObject().href;
  }

  getSignedUrl(): string {
    if (!this.accountId || !this.apiKey) {
      throw new Error(
        'You must set accountId and apiKey in the QuickChart constructor to use getSignedUrl()',
      );
    }
    const crypto = require('crypto');
    const urlObj = this.getUrlObject();
    const chartStr = urlObj.searchParams.get('c');

    const signature = crypto.createHmac('sha256', this.apiKey).update(chartStr).digest('hex');
    urlObj.searchParams.append('sig', signature);
    urlObj.searchParams.append('accountId', this.accountId);
    urlObj.searchParams.delete('key');
    return urlObj.href;
  }

  getPostData(): PostData {
    if (!this.isValid()) {
      throw new Error('You must call setConfig creating post data');
    }

    const { width, height, chart, format, version, backgroundColor, devicePixelRatio, apiKey } =
      this;
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
    if (apiKey) {
      postData.key = apiKey;
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

    const resp = await postJson(`${this.getBaseUrl()}/chart/create`, this.getPostData());
    if (!resp.ok) {
      const quickchartError = resp.headers.get('x-quickchart-error');
      const details = quickchartError ? `\n${quickchartError}` : '';
      throw new Error(`Chart shorturl creation failed with status code ${resp.status}${details}`);
    }

    const json = (await resp.json()) as undefined | { success?: boolean; url?: string };
    if (!json || !json.success || !json.url) {
      throw new Error('Received failure response from chart shorturl endpoint');
    } else {
      return json.url;
    }
  }

  async toBinary(): Promise<Buffer> {
    if (!this.isValid()) {
      throw new Error('You must call setConfig before getUrl');
    }

    const resp = await postJson(`${this.getBaseUrl()}/chart`, this.getPostData());
    if (!resp.ok) {
      const quickchartError = resp.headers.get('x-quickchart-error');
      const details = quickchartError ? `\n${quickchartError}` : '';
      throw new Error(`Chart creation failed with status code ${resp.status}${details}`);
    }
    const data = await resp.arrayBuffer();
    return Buffer.from(data);
  }

  async toDataUrl(): Promise<string> {
    const buf = await this.toBinary();
    const b64buf = buf.toString('base64');
    const type = this.format === 'svg' ? 'svg+xml' : 'png';
    return `data:image/${type};base64,${b64buf}`;
  }

  async toFile(pathOrDescriptor: PathLike | FileHandle): Promise<void> {
    const fs = require('fs');
    const buf = await this.toBinary();
    fs.writeFileSync(pathOrDescriptor, buf);
  }

  static getGradientFillHelper(
    direction: string,
    colors: string[],
    dimensions?: GradientDimensionOption,
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
