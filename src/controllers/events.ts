import { wshcmx, Route } from "../index";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/event",
    callback: "getEvent",
    access: "user",
    params: {
      id: {
        type: "number",
        store: "query",
        description: "Id мероприятия"
      }
    }
  }, {
    method: "GET",
    pattern: "/events",
    callback: "getEvents",
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

type GetEventParams = {
  id: number;
};

export function getEvent(_req: Request, res: Response, params: GetEventParams) {
  const eventDocument = tools.open_doc<EventDocument>(params.id);

  if (eventDocument === undefined) {
    return wshcmx.utils.response.notFound(res, "Мероприятие не найдено");
  }

  return wshcmx.utils.response.ok(res, wshcmx.services.events.getDetails(params.id));
}

export function getEvents(req: Request, res: Response) {
  return wshcmx.utils.response.ok(res, wshcmx.utils.paginator.gather(wshcmx.services.events.getEvents(), req.Query));
}
