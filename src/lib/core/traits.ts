export type Traits = object & {
  [k: string]: JSONValue;
};

export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONPrimitive = string | number | boolean | null;
export type JSONObject = { [member: string]: JSONValue };
export type JSONArray = Array<JSONValue>;

export const TRAITS_PERSISTENCE_KEY_PREFIX = 'journify_user_traits_';