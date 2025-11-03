declare module 'ua-parser-js' {
  interface IUAParser {
    getResult(): UAParserResult;
    setUA(ua: string): IUAParser;
    getUA(): string;
    getDevice(): UAParserDevice;
    getOS(): UAParserOS;
    getBrowser(): UAParserBrowser;
    getCPU(): UAParserCPU;
    getEngine(): UAParserEngine;
  }

  interface UAParserResult {
    ua: string;
    browser: UAParserBrowser;
    device: UAParserDevice;
    engine: UAParserEngine;
    os: UAParserOS;
    cpu: UAParserCPU;
  }

  interface UAParserBrowser {
    name?: string;
    version?: string;
    major?: string;
  }

  interface UAParserDevice {
    model?: string;
    type?: string;
    vendor?: string;
  }

  interface UAParserEngine {
    name?: string;
    version?: string;
  }

  interface UAParserOS {
    name?: string;
    version?: string;
  }

  interface UAParserCPU {
    architecture?: string;
  }

  class UAParser implements IUAParser {
    constructor(ua?: string);
    getResult(): UAParserResult;
    setUA(ua: string): UAParser;
    getUA(): string;
    getDevice(): UAParserDevice;
    getOS(): UAParserOS;
    getBrowser(): UAParserBrowser;
    getCPU(): UAParserCPU;
    getEngine(): UAParserEngine;
  }

  export = UAParser;
}

