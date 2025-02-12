import { join } from "path";
import { getConfig, getState } from "./env";
import { ROOT } from "./env";

export async function t(key, args = {}, forceLangToUse) {
  const { locale: loc } = await getState();
  // Get key from ./locales/{locale}/comments.json
  // Read file and parse JSON
  const locale = forceLangToUse ?? loc;
  const config = await getConfig();
  const assertions = config.curriculum?.assertions?.[locale];
  if (!assertions) {
    return key;
  }
  const comments = await import(join(ROOT, assertions), {
    assert: { type: "json" },
  });

  // Get value from JSON
  const value = comments.default[key];
  // Replace placeholders in value with args
  const result =
    Object.values(args)?.length > 0
      ? value.replace(/\{\{(\w+)\}\}/g, (_, m) => args[m])
      : value;
  // Return value
  return result;
}
