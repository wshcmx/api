import { wshcmx, Route } from "../index";

type Authentication = {
  id: number;
  type: Route["access"];
};

export function authenticateUser(req: Request): Authentication | null {
  const userInit = tools_web.user_init(req, req.Query);

  if (!userInit.access) {
    wshcmx.utils.log.info(`Сессия ${wshcmx.utils.request.getHeader(req.Header, "SessionID")} не авторизована в связи с ${userInit.error_text}`, "passport");
    return null;
  }

  const id = req.Session.Env.curUserID;

  wshcmx.utils.log.info(`Пользователь "${id}" был авторизован`, "passport");

  return {
    id,
    type: "user"
  };
}

export function authenticateApplication(req: Request, xAppId: string): Authentication | null {
  if (StrCharCount(Trim(String(xAppId))) === 0) {
    wshcmx.utils.log.error("Заголовок \"x-app-id\" пуст", "passport");
    return null;
  }

  const login = req.AuthLogin;
  const password = req.AuthPassword;

  if (wshcmx.utils.type.isUndef(login) || wshcmx.utils.type.isUndef(password)) {
    wshcmx.utils.log.error(`Приложение "${xAppId}" не имеет доступа из-за некорректных логина и пароля`, "passport");
    return null;
  }

  const applicationDocument = tools.get_doc_by_key<RemoteApplicationDocument>("remote_application", "app_id", xAppId);

  if (applicationDocument === null) {
    wshcmx.utils.log.error(`Приложение [${xAppId}] не найдено в базе данных`, "passport");
    return null;
  }

  const madePassword = tools.make_password(password, false);
  let hasAccess = false;
  const credentials = applicationDocument.TopElem.credentials;
  let credentialDocument;

  for (let i = 0; i < credentials.ChildNum; i++) {
    credentialDocument = tools.open_doc<CredentialDocument>(credentials[i].id);

    if (credentialDocument === undefined) {
      wshcmx.utils.log.error(
        `Авторизационные данные по id "${credentials[i].id}" не найдены в базе данных`,
        "passport"
      );
      continue;
    }

    if (
      credentialDocument.TopElem.login == login
      && tools.make_password(credentialDocument.TopElem.password, true) == madePassword
    ) {
      hasAccess = true;
      break;
    }
  }

  if (!hasAccess) {
    wshcmx.utils.log.error(`Некорректный логин или пароля для приложения ${xAppId}`, "passport");

    return null;
  }

  return {
    id: applicationDocument.DocID,
    type: "application"
  };
}

/**
 * Проверяет авторизацию и возвращает объект пользователя или приложения.
 */
export function authenticate(req: Request) {
  const xAppId = wshcmx.utils.request.getHeader(req.Header, "x-app-id");

  if (wshcmx.utils.type.isUndef(xAppId)) {
    return authenticateUser(req);
  } else {
    return authenticateApplication(req, xAppId);
  }
}
