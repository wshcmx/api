import { wshcmx, Route } from "../index";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/list",
    callback: "getList",
    access: "both",
    summary: "Получения стандартного списка по параметрам",
    params: {
      name: {
        type: "string",
        optional: false
      }
    }
  }, {
    method: "GET",
    pattern: "/lists",
    callback: "getAllLists",
    access: "both",
    summary: "Получение стандартных списков по параметрам",
    params: {
      sort: {
        type: "string",
        store: "query",
        optional: true,
        val: "asc",
        example: "asc"
      }
    }
  }];
}

type GetListParams = {
  name: string;
};

export function getList(_req: Request, res: Response, params: GetListParams) {
  let list;

  if (common.PathExists(params.name)) {
    list = common.EvalPath<XmlMultiElem<unknown>>(params.name);
  } else if (lists.PathExists(params.name)) {
    list = lists.EvalPath<XmlMultiElem<unknown>>(params.name);
  } else {
    return wshcmx.utils.response.notFound(res, "Список не найден");
  }

  return wshcmx.utils.response.ok(res, ArrayExtract(list, "({ id: id.Value, name: name.Value })"));
}

type GetAllListsParams = {
  sort: string;
};

export function getAllLists(_req: Request, res: Response, params: GetAllListsParams) {
  return wshcmx.utils.response.ok(
    res,
    ArraySort(
      ArrayUnion(
        ArrayExtract(lists as unknown as XmlMultiElem<unknown>, "This.Name"),
        ArrayExtract(common as unknown as XmlMultiElem<unknown>, "This.Name")
      ),
      "This",
      StrLowerCase(params.sort) === "desc" ? "-" : "+"
    )
  );
}
