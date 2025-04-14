import { wshcmx, Route } from "../index";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/position",
    callback: "getPosition",
    access: "user",
    params: {
      id: {
        type: "number"
      }
    }
  }, {
    method: "GET",
    pattern: "/positions",
    callback: "getPositions",
    access: "user",
    params: {
      page: {
        type: "number",
        val: 1,
        optional: true
      },
      per_page: {
        type: "number",
        val: 100,
        optional: true
      }
    }
  }];
}

type GetPositionParams = {
  id: number;
}

export function getPosition(req: Request, res: Response, params: GetPositionParams) {
  const positionDocument = tools.open_doc<PositionDocument>(params.id);

  if (positionDocument === undefined) {
    return wshcmx.utils.response.notFound(res, `Должности по id ${params.id} не существует`);
  }

  const hasAccess = tools_web.check_access(
    positionDocument.TopElem,
    req.Session.Env.curUserID,
    req.Session.Env.curUser,
    req.Session
  );

  if (!hasAccess) {
    return wshcmx.utils.response.forbidden(res, `У вас нет доступа к должности ${positionDocument.DocID}`);
  }

  return wshcmx.utils.response.ok(
    res,
    {
      id: positionDocument.DocID,
      code: positionDocument.TopElem.code.Value,
      name: positionDocument.TopElem.name.Value,
      org_id: positionDocument.TopElem.org_id.Value,
      org_name: (positionDocument.TopElem.org_id.OptForeignElem?.name.Value),
      subdivision_id: positionDocument.TopElem.parent_object_id.Value,
      subdivision_name: (positionDocument.TopElem.parent_object_id.OptForeignElem?.name.Value),
      position_date: positionDocument.TopElem.position_date.Value,
      position_finish_date: positionDocument.TopElem.position_finish_date.Value,
      is_position_finished: positionDocument.TopElem.is_position_finished.Value,
      is_boss: positionDocument.TopElem.is_boss.Value,
      position_common_id: positionDocument.TopElem.position_common_id.Value,
      position_common_name: (positionDocument.TopElem.position_common_id.OptForeignElem?.name.Value),
      position_family_id: positionDocument.TopElem.position_family_id.Value,
      position_family_name: (positionDocument.TopElem.position_family_id.OptForeignElem?.name.Value)
    }
  );
}


export function getPositions(_req: Request, res: Response, params: Object) {
  return wshcmx.utils.response.ok(
    res,
    wshcmx.utils.paginator.gather(
      wshcmx.utils.query.extract("for $e in positions return $e"),
      params
    )
  );
}
