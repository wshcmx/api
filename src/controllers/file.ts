import { wshcmx, Route } from "../index";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/file",
    callback: "getFile",
    access: "user",
    summary: "Получение файла",
    params: {
      id: {
        type: "number"
      }
    }
  }, {
    method: "PUT",
    pattern: "/file",
    callback: "uploadFile",
    access: "user",
    summary: "Загрузка файлов",
    params: {
      name: {
        type: "string",
        store: "body",
        description: "Название загружаемого файла"
      },
      content: {
        type: "string",
        store: "body",
        description: "Контент загружаемого файла"
      }
    }
  }];
}

type GetFileParams = {
  id: number;
};

export function getFile(req: Request, res: Response, params: GetFileParams) {
  const resourceDocument = tools.open_doc<ResourceDocument>(params.id);

  if (resourceDocument === undefined) {
    return wshcmx.utils.response.notFound(res, "Ресурс не найден");
  }

  const hasAccess = tools_web.check_access(
    resourceDocument.TopElem,
    req.Session.Env.curUserID,
    req.Session.Env.curUser,
    req.Session
  );

  if (!hasAccess) {
    return wshcmx.utils.response.forbidden(res, "Доступ к ресурсу запрещен");
  }

  return wshcmx.utils.response.binary(res, resourceDocument);
}

type GetUploadFileParams = {
  name: string;
  content: string;
}

export function uploadFile(req: Request, res: Response, params: GetUploadFileParams) {
  const name = params.name;
  const content = Base64Decode(params.content);
  const extension = UrlPathSuffix(name);
  const size = StrLen(content);

  if (wshcmx.supportedFilesExts.indexOf(extension) === -1) {
    return wshcmx.utils.response.unsupportedMediaType(res);
  }

  if (size > wshcmx.maxFileSize) {
    return wshcmx.utils.response.forbidden(res, "Размер файла превышает максимально загружаемый размер");
  }

  const checksum = Md5Hex(content);
  let resourceDocument = tools.get_doc_by_key<ResourceDocument>("resource", "checksum", checksum);

  if (resourceDocument === null) {
    resourceDocument = wshcmx.services.file.create(req.Session.Env.curUserID, content, name);
  }

  return wshcmx.utils.response.ok(
    res,
    {
      id: resourceDocument.DocID,
      name,
      extension,
      sha: checksum,
      size,
      download_url: wshcmx.utils.url.getDownloadFileUrl(resourceDocument.DocID),
      created: resourceDocument.TopElem.doc_info.creation.date.Value,
      modified: resourceDocument.TopElem.doc_info.modification.date.Value
    },
    201
  );
}
