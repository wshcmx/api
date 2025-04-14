type Utils = {
  array: typeof import("./utils/array");
  assert: typeof import("./utils/assert");
  config: typeof import("./utils/config");
  fs: typeof import("./utils/fs");
  log: typeof import("./utils/log");
  object: typeof import("./utils/object");
  paginator: typeof import("./utils/paginator");
  passport: typeof import("./utils/passport");
  query: typeof import("./utils/query");
  request: typeof import("./utils/request");
  response: typeof import("./utils/response");
  router: typeof import("./utils/router");
  type: typeof import("./utils/type");
  url: typeof import("./utils/url");
  validator: typeof import("./utils/validator");
};

type Services = {
  events: typeof import("./services/events");
  file: typeof import("./services/file");
};

export type RouteParameter = {
  type: "boolean" | "number" | "string" | "date" | "array" | "object";
  format?: "real" | "date";
  val?: string | number | boolean | null | Date | Object;
  optional?: boolean;
  nullable?: boolean;
  min?: number;
  max?: number;
  example?: string | number | string[] | number[];
  items?: string;
  store?: "query" | "body";
  description?: string;
};

export type RouteParameters = {
  [key: string]: RouteParameter;
};

export type Route = {
  method: "GET" | "POST" | "PUT";
  pattern: string;
  callback: string;
  url?: string;
  access: "user" | "application" | "both" | "anonymous" | "dev";
  params?: RouteParameters;
  summary?: string;
};

export type Config = typeof import("./config.json") & {
  env: "production" | "development";
  basepath: string;
  version: string;
  pattern: string;
  stderr: boolean;
};

export namespace wshcmx {
  export const availableParametersTypes = [
    "boolean",
    "number",
    "string",
    "date",
    "array",
    "object"
  ];

  export let routes: Route[] = [];
  export let config: Config = {} as Config;
  export const basepath: string | null = null;

  export const maxFileSize = 5 * 1024 * 1024;
  export const supportedFilesExts = [".docx", ".doc", ".xlsx", ".xls", ".txt", ".zip"];

  export const utils: Utils = {
    array: undefined!,
    assert: undefined!,
    config: undefined!,
    fs: undefined!,
    log: undefined!,
    object: undefined!,
    paginator: undefined!,
    passport: undefined!,
    query: undefined!,
    request: undefined!,
    response: undefined!,
    router: undefined!,
    type: undefined!,
    url: undefined!,
    validator: undefined!
  };

  export const services: Services = {
    events: undefined!,
    file: undefined!
  };

  export function loadInternals(container: Utils | Services, url: string) {
    const type = FileName(url);
    const files = ReadDirectory(url);
    let fileName;

    for (let i = 0; i < files.length; i++) {
      fileName = FileName(UrlToFilePath(files[i])).split(".")[0];
      container.SetProperty(fileName, OpenCodeLib(files[i]));
      // eslint-disable-next-line no-alert
      alert(`${fileName} был успешно загружен в ${type} - хэш "${Md5Hex(LoadUrlData(files[i]))}"`);
    }
  }

  export function init() {
    loadInternals(utils, "./utils");
    loadInternals(services, "./services");
    utils.config.init();
    utils.router.init();
    // eslint-disable-next-line no-alert
    alert(`API готово: ${config.pattern}`);
    // eslint-disable-next-line no-alert
    alert(`Для проверки API обратитесь по адресу:\n\t${""}${config.pattern}/v1/ping`);
  }
}