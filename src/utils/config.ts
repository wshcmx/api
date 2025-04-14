import { wshcmx } from "../index";

export function init() {
  const configUrl = AbsoluteUrl("./../config.json", ".");

  if (!FilePathExists(UrlToFilePath(configUrl))) {
    const error = `Конфиг не существует по пути "${configUrl}"`;
    // eslint-disable-next-line no-alert
    alert(error);
    throw new Error(error);
  }

  wshcmx.config = tools.read_object(LoadUrlText(configUrl, {
    DetectContentCharset: true
  }));
  wshcmx.config.basepath = UrlToFilePath("./..").replace("\\", "/").split("/wt/web/")[1];

  // eslint-disable-next-line no-alert
  alert(`Конфиг "${configUrl}" загружен:\n${tools.object_to_text(wshcmx.config, "json")}`);
}
