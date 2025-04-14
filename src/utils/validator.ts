import { wshcmx, RouteParameter, RouteParameters } from "..";

function normalizeScheme(scheme: RouteParameters) {
  let type;
  let key;
  let schemeProperty;

  for (key in scheme) {
    schemeProperty = scheme[key] as RouteParameter;
    type = schemeProperty.GetOptProperty("type") as RouteParameter["type"];

    if (wshcmx.availableParametersTypes.indexOf(type) === -1) {
      throw new Error(`Некорректно определен тип параметра ${key} - "${type}"\nДоступные параметры: ${wshcmx.availableParametersTypes.join(", ")}`);
    }

    schemeProperty.SetProperty("store", schemeProperty.GetOptProperty("store", "query"));
    schemeProperty.SetProperty("optional", schemeProperty.GetOptProperty("optional", false));
    schemeProperty.SetProperty("description", schemeProperty.GetOptProperty("description", null));
    schemeProperty.SetProperty("val", schemeProperty.GetOptProperty("val", null));
    schemeProperty.SetProperty("nullable", schemeProperty.GetOptProperty("nullable", false));
    schemeProperty.SetProperty("min", schemeProperty.GetOptProperty("min"));
    schemeProperty.SetProperty("max", schemeProperty.GetOptProperty("max"));
    schemeProperty.SetProperty("format", schemeProperty.GetOptProperty("format", null));
    schemeProperty.SetProperty("items", schemeProperty.GetOptProperty("items", null));

    if (type == "array" && wshcmx.availableParametersTypes.indexOf(schemeProperty.items) === -1) {
      throw new Error(`Некорректно определен тип элемента массива ${key} - ${schemeProperty.items}\nДоступные типы: ${wshcmx.availableParametersTypes.join(", ")}`);
    }
  }

  return scheme;
}

function convertParameterValue(key: string, parameter: ParsedParameter, scheme: RouteParameter) {
  if (parameter === null) {
    return null;
  }

  const value = parameter.value;
  const type = scheme.type;
  const min = scheme.min;
  const max = scheme.max;
  const format = scheme.format;
  let convertedValue;

  if (type == "string" && format != "date") {
    convertedValue = IsEmptyValue(value) ? value : Trim(tools_web.convert_xss(String(value)));
    const stringLength = StrCharCount(String(convertedValue));

    if (min !== undefined && stringLength < min) {
      throw new Error(`Параметр ${key} должен быть минимум длины ${min}`);
    }

    if (max !== undefined && stringLength > max) {
      throw new Error(`Параметр ${key} должен быть минимум длины ${max}`);
    }

    return convertedValue;
  } else if (type == "number") {
    convertedValue = scheme.format === "real" ? OptReal(value, null) : OptInt(value, null);

    if (min !== undefined && convertedValue !== null && convertedValue < min) {
      throw new Error(`Параметр ${key} должен быть не меньше ${min}`);
    }

    if (max !== undefined && convertedValue !== null && convertedValue > max) {
      throw new Error(`Параметр ${key} должен быть не больше ${max}`);
    }

    return convertedValue;
  } else if (type == "date" || type == "string" && format == "date") {
    return OptDate(value, null);
  } else if (type == "boolean") {
    return tools_web.is_true(value);
  } else if (type == "array") {
    return wshcmx.utils.type.makeArraySafe(
      (wshcmx.utils.type.isString(value) ? tools.read_object(value) : value) as unknown[],
      scheme.items
    );
  } else if (type == "object") {
    return wshcmx.utils.type.isString(value) ? tools.read_object(value) : value;
  } else {
    throw new Error(`Невозможно определить тип переменной ${key}`);
  }
}

type ParsedParameter = {
  store: RouteParameter["store"];
  value: unknown
};

type ParsedParameters = {
  [key: string]: ParsedParameter;
};

function parseParameters(req: Request) {
  const parameters: ParsedParameters = {};
  let key;

  const bodyParameters = tools.read_object<Object>(req.Body);

  for (key in bodyParameters) {
    parameters.SetProperty(key, {
      store: "body",
      value: bodyParameters[key]
    });
  }

  const queryParameters = req.Query;

  for (key in queryParameters) {
    parameters.SetProperty(key, {
      store: "query",
      value: queryParameters[key]
    });
  }

  return parameters;
}

export function parse(
  req: Request,
  scheme: RouteParameters
) {
  if (
    wshcmx.utils.type.isUndef(scheme)
    || !wshcmx.utils.type.isObject(scheme)
    || wshcmx.utils.object.keys(scheme).length === 0
  ) {
    return {};
  }

  scheme = normalizeScheme(scheme);
  const parameters = parseParameters(req);

  let key;
  let parameter;
  let schemeParameter;
  let parameterValue;
  let defaultValue;
  const result = {};

  for (key in scheme) {
    parameter = parameters.GetOptProperty(key, null);
    schemeParameter = scheme[key] as RouteParameter;

    if (parameter === null && !schemeParameter.optional) {
      throw new Error(`Параметр ${key} обязателен`);
    }

    if (parameter !== null && parameter.store != schemeParameter.store) {
      throw new Error(`Параметр ${key} должен быть передан в ${schemeParameter.store}`);
    }

    parameterValue = convertParameterValue(key, parameter, schemeParameter);

    defaultValue = schemeParameter.GetOptProperty("val", null);

    if (!wshcmx.utils.type.isNull(defaultValue) && wshcmx.utils.type.isNull(parameterValue)) {
      parameterValue = defaultValue;
    }

    if (
      !schemeParameter.optional
      && (
        schemeParameter.type == "string" && !wshcmx.utils.type.isString(parameterValue)
        || schemeParameter.type == "number" && !wshcmx.utils.type.isNumber(parameterValue)
        || schemeParameter.type == "boolean" && !wshcmx.utils.type.isBoolean(parameterValue)
        || schemeParameter.type == "array" && !wshcmx.utils.type.isArray(parameterValue)
        || schemeParameter.type == "object" && !wshcmx.utils.type.isObject(parameterValue)
      )
    ) {
      throw new Error(`Принимаемый параметр ${key} должен иметь тип ${schemeParameter.type}: ${parameterValue}`);
    }

    if (parameterValue === null && !schemeParameter.nullable) {
      throw new Error(`Параметр ${key} не может быть null`);
    }

    result.SetProperty(key, parameterValue);
  }

  return result;
}
