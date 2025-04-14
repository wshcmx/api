import { wshcmx, Route } from "../index";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/ping",
    callback: "pong",
    access: "anonymous",
    summary: "Проверка API"
  }, {
    method: "GET",
    pattern: "/nerd/routes",
    callback: "getRoutes",
    access: "dev",
    summary: "Получение списка всех роутов приложения"
  }, {
    method: "GET",
    pattern: "/nerd/check/app/auth",
    callback: "checkAppAuth",
    access: "application",
    summary: "Проверка авторизации приложения"
  }];
}

export function pong(_req: Request, res: Response) {
  return wshcmx.utils.response.ok(res, "pon1g");
}

export function getRoutes(_req: Request, res: Response) {
  return wshcmx.utils.response.ok(res, wshcmx.routes);
}

export function checkAppAuth(req: Request, res: Response) {
  const xAppId = wshcmx.utils.request.getHeader(req.Header, "x-app-id");
  return wshcmx.utils.response.ok(res, wshcmx.utils.passport.authenticateApplication(req, xAppId!));
}
