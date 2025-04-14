import { wshcmx } from "../index";

export function exec<T>(command: string) {
  return ArraySelectAll(tools.xquery<T>(command));
}

export function extract<T>(command: string) {
  const query = exec<T>(command);
  const result = [];
  let o;
  let field;

  for (let i = 0; i < query.length; i++) {
    o = {};

    for (field in query[i]) {
      field = field as unknown as XmlElem<unknown>;
      o.SetProperty(field.Name, extractQueryValue(field.Value));
    }

    result.push(o);
  }

  return result;
}

function extractQueryValue<T>(value: T) {
  if (wshcmx.utils.type.isDate(value)) {
    return StrMimeDate(value);
  }

  return value;
}
