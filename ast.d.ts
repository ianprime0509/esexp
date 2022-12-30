import { Expression } from "estree";
export * from "estree";

export interface ListExpression {
  type: "ListExpression";
  elements: Array<Expression>;
}

declare module "estree" {
  interface ExpressionMap {
    ListExpression: ListExpression;
  }
}
