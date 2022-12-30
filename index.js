import { readFileSync } from "node:fs";
import * as process from "node:process";
import { compile } from "./compile.js";
import { read } from "./read.js";

const file = readFileSync(process.argv[2], { encoding: "utf-8" });
console.log(compile(read(file)));
