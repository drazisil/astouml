#!/usr/bin/env node
import { parse } from "./parser.js";
import { generateUml } from "./generator.js";
import { readFileSync, writeFileSync } from "node:fs";

export function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage: npx astouml <filename>");
    process.exit(1);
  }

  if (args.length > 1) {
    console.error("Too many arguments");
    process.exit(1);
  }

  const filename = args[0];

  console.log(`Generating UML diagram for ${filename}`);

  const file = readFileSync(filename, "utf-8")

  const ast = parse(file);
  console.log(ast);
  const uml = generateUml(ast);

  const outputFilename = filename.replace(/\.[^/.]+$/, ".puml");
  writeFileSync(outputFilename, uml);

  console.log(`UML diagram generated in ${outputFilename}`);

  process.exit(0);
}

main();
