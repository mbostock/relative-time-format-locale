const fs = require("fs");
const path = require("path");

const input = "node_modules/relative-time-format/locale";

const locales = fs.readdirSync(input).filter(locale => {
  return fs.statSync(path.join(input, locale)).isDirectory()
      && fs.existsSync(path.join(input, locale, "index.js"));
});

if (!fs.existsSync("build")) {
  fs.mkdirSync("build");
}

for (const locale of locales) {
  const outpath = path.join("build", locale + ".js");
  console.log(outpath);
  fs.writeFileSync(outpath, `export {default} from "relative-time-format/locale/${locale}/index.js";
`);
}

fs.writeFileSync("rollup.config.js", `import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import node from "rollup-plugin-node-resolve";
import {terser} from "rollup-plugin-terser";

const config = {
  plugins: [
    node(),
    commonjs(),
    json(),
    terser()
  ],
  output: {
    format: "amd"
  }
};

export default [
  {...config, input: "index.js", output: {...config.output, file: ${JSON.stringify(`dist/relative-time-format.js`)}}},
  ${locales.map(l => `{...config, input: ${JSON.stringify(`build/${l}.js`)}, output: {...config.output, file: ${JSON.stringify(`dist/${l}.js`)}}}`).join(",\n  ")}
];
`);
