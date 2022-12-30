/**
 * @typedef {import("./ast.js").Expression} Expression
 * @typedef {import("./ast.js").Node} Node
 */

import * as astring from "astring";
import { expand } from "./expand.js";

const generator = Object.assign({}, astring.GENERATOR, {
  ListExpression(node, state) {
    const expanded = expand(node);
    if (expanded.type === "ListExpression") {
      this.ArrayExpression(expanded, state);
    } else {
      this[expanded.type](expanded, state);
    }
  },
});

/**
 * @param input {Expression}
 * @returns {string}
 */
export function compile(input) {
  return astring.generate(input, { generator });
}
