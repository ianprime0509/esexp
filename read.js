/**
 * @typedef {import("./ast.js").ArrayExpression} ArrayExpression
 * @typedef {import("./ast.js").Expression} Expression
 * @typedef {import("./ast.js").Identifier} Identifier
 * @typedef {import("./ast.js").ListExpression} ListExpression
 * @typedef {import("./ast.js").Literal} Literal
 * @typedef {import("./ast.js").ObjectExpression} ObjectExpression
 * @typedef {import("./ast.js").Property} Property
 *
 * @typedef {{ pos: number }} State
 */

/**
 * @param input {string}
 * @returns {Expression | null}
 */
export function read(input) {
  return readExpression(input, { pos: 0 });
}

/**
 * @param input {string}
 * @returns {Array<Expression>}
 */
export function readAll(input) {
  /** @type {Array<Expression>} */ const expressions = [];
  /** @type {Expression | null} */ let expression;
  const state = { pos: 0 };
  while ((expression = readExpression(input, state)) !== null) {
    expressions.push(expression);
  }
  return expressions;
}

const identChar = /[\p{Letter}_$\d]/u;
const spaceChar = /[\s,]/;

/**
 * @param input {string}
 * @param state {State}
 * @returns {Expression | null}
 */
function readExpression(input, state) {
  skipWhile(input, state, spaceChar);
  if (state.pos === input.length) {
    return null;
  } else if (input[state.pos] === "(") {
    return readList(input, state);
  } else if (input[state.pos] === "[") {
    return readArray(input, state);
  } else if (input[state.pos] === "{") {
    return readObject(input, state);
  } else if (input[state.pos] === '"') {
    return readString(input, state);
  } else if (input[state.pos] === ":") {
    state.pos++;
    return {
      type: "Literal",
      value: readIdentifier(input, state).name,
    };
  } else if (/\d/.test(input[state.pos])) {
    return readNumber(input, state);
  } else if (identChar.test(input[state.pos])) {
    return readIdentifier(input, state);
  } else {
    throw new Error(`Unexpected character: ${input[state.pos]}`);
  }
}

/**
 * @param input {string}
 * @param state {State}
 * @returns {ArrayExpression}
 */
function readArray(input, state) {
  state.pos++;
  const elements = readElements(input, state, "]");
  state.pos++;
  return {
    type: "ArrayExpression",
    elements,
  };
}

/**
 * @param input {string}
 * @param state {State}
 * @returns {ListExpression}
 */
function readList(input, state) {
  state.pos++;
  const elements = readElements(input, state, ")");
  state.pos++;
  return {
    type: "ListExpression",
    elements,
  };
}

/**
 * @param input {string}
 * @param state {State}
 * @param closeChar {string}
 * @returns {Array<Expression>}
 */
function readElements(input, state, closeChar) {
  /** @type {Array<Expression>} */ const elements = [];
  while (state.pos < input.length) {
    skipWhile(input, state, spaceChar);
    if (input[state.pos] === closeChar) {
      return elements;
    }
    const element = readExpression(input, state);
    if (element === null) {
      throw new Error("Expected list element");
    }
    elements.push(element);
  }
  throw new Error("Unexpected end of expression");
}

/**
 * @param input {string}
 * @param state {State}
 * @returns {ObjectExpression}
 */
function readObject(input, state) {
  state.pos++;
  /** @type {Array<Property>} */ const properties = [];
  while (state.pos < input.length) {
    skipWhile(input, state, spaceChar);
    if (input[state.pos] === "}") {
      state.pos++;
      return {
        type: "ObjectExpression",
        properties,
      };
    }

    const key = readExpression(input, state);
    if (key === null) {
      throw new Error("Expected property key");
    }
    const value = readExpression(input, state);
    if (value === null) {
      throw new Error("Expected property value");
    }
    if (key.type === "Literal" && typeof key.value === "string") {
      // TODO: validate that value is a valid JS identifier
      properties.push({
        type: "Property",
        key: { type: "Identifier", name: key.value },
        value,
        kind: "init",
        computed: false,
        method: false,
        shorthand: false,
      });
    } else {
      properties.push({
        type: "Property",
        key,
        value,
        kind: "init",
        computed: true,
        method: false,
        shorthand: false,
      });
    }
  }
  throw new Error("Unexpected end of object");
}

/**
 * @param input {string}
 * @param state {State}
 * @returns {Literal}
 */
function readString(input, state) {
  // TODO: escape characters
  const start = ++state.pos;
  skipWhile(input, state, /[^"]/);
  const end = state.pos++;
  return {
    type: "Literal",
    value: input.substring(start, end),
  };
}

/**
 * @param input {string}
 * @param state {State}
 * @returns {Identifier}
 */
function readIdentifier(input, state) {
  // TODO: character validation, kebab-case conversion
  const start = state.pos;
  skipWhile(input, state, identChar);
  return {
    type: "Identifier",
    name: input.substring(start, state.pos),
  };
}

/**
 * @param input {string}
 * @param state {State}
 * @returns {Literal}
 */
function readNumber(input, state) {
  const start = state.pos;
  // TODO: decimals, separators, 0x, etc.
  skipWhile(input, state, /\d/);
  return {
    type: "Literal",
    value: Number.parseFloat(input.substring(start, state.pos)),
  };
}

/**
 * @param input {string}
 * @param state {State}
 * @param regex {RegExp}
 * @returns {void}
 */
function skipWhile(input, state, regex) {
  while (state.pos < input.length && regex.test(input[state.pos])) {
    state.pos++;
  }
}
