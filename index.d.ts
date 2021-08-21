declare module 'quickchart-js' {
  import * as ChartJS from 'chart.js';

  class QuickChart {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(apiKey?: string, accountId?: string);

    public setConfig(config: ChartJS.ChartConfiguration): QuickChart;
    public setWidth(width: number): QuickChart;
    public setHeight(height: number): QuickChart;
    public setBackgroundColor(color: string): QuickChart;
    public setDevicePixelRatio(ratio: number): QuickChart;
    public setFormat(fmt: string): QuickChart;

    public getUrl(): string;
    public getShortUrl(): Promise<string>;
    public toBinary(): Promise<Buffer>;
    public toDataUrl(): Promise<string>;
    public toFile(
      pathOrDescriptor: string | number | Buffer | URL
    ): Promise<void>;
  }

  export = QuickChart;
}
