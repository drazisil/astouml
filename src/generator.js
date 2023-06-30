/**
 * @fileoverview Generator for UML diagrams.
 * @module generator
 * @exports generateUml
 * @version 1.0.0
 * @since 1.0.0
 */

// Path: src/generator.js

/**
 * @typedef {import("./parser.js").Ast} Ast
 * @typedef {import("./parser.js").Class} Class
 * @typedef {import("./parser.js").Association} Association
 */

// Purpose: Generator for UML diagrams.
/**
 * Generates a UML diagram from an AST.
 * @param {Ast} ast The AST to generate the UML diagram from.
 * @returns {string} The UML diagram.
 */
export function generateUml(ast) {
  const classes = ast.classes
    .map((c) => {
      const attributes = c.attributes.map((a) => `    ${a}`).join("\n");
      const methods = c.methods.map((m) => `    ${m}`).join("\n");
      return `class ${c.name} {
            ${attributes}
            ${methods}

}`;
    })
    .join("\n\n");

    const associations = ast.associations
        .map((a) => `    ${a}`)
        .join("\n");

    return `@startuml

${classes}

${associations}

@enduml`;
}
