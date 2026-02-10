import type { ValueNode } from "graphql";
import { GraphQLScalarType, Kind } from "graphql";

export const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description:
    "The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).",
  serialize(value) {
    return value; // value sent to the client
  },
  parseValue(value) {
    return value; // value from the client (variables)
  },
  parseLiteral(ast) {
    return parseLiteral(ast);
  },
});

function parseLiteral(ast: ValueNode): unknown {
  switch (ast.kind) {
    case Kind.STRING:
      try {
        return JSON.parse(ast.value) as unknown;
      } catch {
        return ast.value;
      }
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
      return parseInt(ast.value, 10);
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT: {
      const value: Record<string, unknown> = {};
      ast.fields.forEach((field) => {
        value[field.name.value] = parseLiteral(field.value);
      });
      return value;
    }
    case Kind.LIST:
      return ast.values.map(parseLiteral);
    case Kind.NULL:
      return null;
    case Kind.VARIABLE:
    case Kind.ENUM:
      return undefined;
  }
}

export const scalarResolvers = {
  JSON: JSONScalar,
};
