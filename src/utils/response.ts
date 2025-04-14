import { wshcmx } from "../index";

function json<T>(
  res: Response,
  payload: T,
  status = 200,
  message: unknown = null
) {
  res.ContentType = "application/json; charset=utf-8;";

  if (status !== 200) {
    res.SetRespStatus(status, String(message));
  }

  res.Write((wshcmx.utils.type.isPrimitive(payload) ? payload : tools.object_to_text(payload, "json")) as string);
}

export function abort(res: Response, message: unknown, status: number = 500) {
  message = (
    wshcmx.utils.type.isError(message) && wshcmx.config.env != "development"
      ? message.message
      : RValue(message)
  ) as string;

  json(
    res,
    { error: message },
    status,
    message
  );
}

export function ok<T>(res: Response, data: T, status = 200) {
  json(
    res,
    data,
    status
  );
}

export function notModified(res: Response) {
  ok(res, null, 304);
}

export function badRequest(res: Response, message: string) {
  abort(res, message, 400);
}

export function unauthorized(res: Response, message = "Необходима авторизация") {
  abort(res, message, 401);
}

export function forbidden(res: Response, message = "Доступ запрещён") {
  abort(res, message, 403);
}

export function notFound(res: Response, message: string) {
  abort(res, message, 404);
}

export function methodNotAllowed(res: Response, message: string = "Метод не разрешен") {
  abort(res, message, 405);
}

export function unsupportedMediaType(res: Response, message: string = "Данный тип файла не поддерживается") {
  abort(res, message, 415);
}

export function unprocessableContent(res: Response, message: unknown) {
  abort(res, message, 422);
}

export function binary(res: Response, file: ResourceDocument) {
  if (!file.TopElem.file_source.HasValue || file.TopElem.file_source.Value === null) {
    return;
  }

  if (!file.TopElem.file_url.HasValue || file.TopElem.file_url.Value === null) {
    return;
  }

  const binary = new Binary();
  const url = tools.file_source_get_file_to_save_url(
    file.TopElem.file_source.Value,
    file.DocID,
    file.TopElem.file_url.Value
  );
  binary.LoadFromUrl(url);
  res.ContentType = tools_web.url_std_content_type(url);
  res.AddHeader("Content-Disposition", `attachment; filename=${UrlEncode(file.TopElem.name.Value)}`);
  res.Stream.WriteBinary(binary);
}
