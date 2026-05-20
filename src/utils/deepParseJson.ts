const isNumString = (str: string) => !isNaN(Number(str));

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | Record<string, unknown> | unknown[];

function deepParseJson(value: JsonValue): JsonValue {
  if (typeof value === "string") {
    if (isNumString(value)) {
      return value;
    }
    try {
      return deepParseJson(JSON.parse(value) as JsonValue);
    } catch {
      return value;
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepParseJson(item as JsonValue));
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        deepParseJson(item as JsonValue),
      ]),
    );
  }

  return value;
}

export default deepParseJson;
