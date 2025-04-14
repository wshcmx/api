import { wshcmx } from "../index";

/**
 * Метод возвращает массив из перечисляемых свойств переданного объекта,
 * @param { Object } obj Объект
 * @returns { string[] } Ключи объекта
 */
export function keys(obj: Object): string[] {
  if (wshcmx.utils.type.isUndef(obj) || DataType(obj) != "object") {
    return [];
  }

  const keys = [];
  let key: XmlElem<unknown> | string;

  for (key in obj) {
    keys.push(ObjectType(key) == "XmElem" ? (key as unknown as XmlElem<unknown>).Name : key);
  }

  return keys;
}

export function excludeKeys(source: Object, keys: string[]) {
  const o = {};
  let key;

  for (key in source) {
    if (keys.indexOf(key) !== -1) {
      continue;
    }

    o.SetProperty(key, source[key]);
  }

  return o;
}

export function merge(o1: Object, o2: Object) {
  let key;

  for (key in o2) {
    try {
      if (DataType(o2[key]) == "object") {
        o1[key] = merge(o1[key] as Object, o2[key] as Object);
      } else {
        o1[key] = o2[key];
      }
    } catch {
      o1[key] = o2[key];
    }
  }

  return o1;
}
