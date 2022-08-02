export type Traits = object & {
  [k: string]: JSONValue;
};

export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONPrimitive = string | number | boolean | null;
export type JSONObject = { [member: string]: JSONValue };
export type JSONArray = Array<JSONValue>;

export const USER_TRAITS_PERSISTENCE_KEY = "journifyio_user_traits";
export const GROUP_TRAITS_PERSISTENCE_KEY = "journifyio_group_traits";
