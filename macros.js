/**
 * @typedef {import("./expand.js").Macro} Macro
 */

export const builtins = Object.freeze({ quote });

/** @type {Macro} */ export function quote(value) {
  return [value, { preventExpansion: true }];
}
