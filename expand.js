/**
 * @typedef {import("./ast.js").Expression} Expression
 * @typedef {import("./ast.js").ListExpression} ListExpression
 * @typedef {import("./ast.js").Node} Node
 *
 * @typedef {(...args: Array<Expression>) => Node | [Node, Partial<ExpansionOptions>]} Macro
 * @typedef {{ preventExpansion: boolean }} ExpansionOptions
 */

import { builtins } from "./macros.js";

/**
 * @param input {ListExpression}
 * @param options {Partial<{
 *   macros: Record<string, Macro>,
 *   recursive: boolean,
 * }>}
 * @returns {Node}
 */
export function expand(input, { macros = builtins, recursive = true } = {}) {
  if (input.elements.length < 1 || input.elements[0].type !== "Identifier") {
    return input;
  }
  const macro = macros[input.elements[0].name];
  if (!macro) {
    return {
      type: "CallExpression",
      callee: input.elements[0],
      arguments: input.elements.slice(1),
      optional: false,
    };
  }
  const output = macro(...input.elements.slice(1));
  const expanded = Array.isArray(output) ? output[0] : output;
  const { preventExpansion = false } = Array.isArray(output) ? output[1] : {};
  if (recursive && !preventExpansion && expanded.type === "ListExpression") {
    return expand(expanded, { macros, recursive });
  } else {
    return expanded;
  }
}
