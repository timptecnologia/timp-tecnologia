import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Diretivas eslint-disable sem uso viram erro (nada de supressões esquecidas)
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
  {
    rules: {
      // Proibido esconder erro de tipo; exceções exigem justificativa (@ts-expect-error com descrição)
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-ignore": true, "ts-nocheck": true, "ts-expect-error": "allow-with-description", minimumDescriptionLength: 10 },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Logs passam pelo logger central (redação de segredos/PII)
      "no-console": "error",
    },
  },
  {
    // O logger é o único ponto autorizado a escrever no console
    files: ["lib/logger/index.ts", "scripts/**/*.mjs"],
    rules: { "no-console": "off" },
  },
  {
    // Imagens de metadados (ImageResponse/Satori só aceita <img>): o plugin do Next já isenta
    // esses arquivos, mas a normalização de caminho dele falha no Windows (só troca o primeiro "\").
    // Fixar a isenção aqui deixa o lint igual no Windows e no Linux (CI).
    files: ["app/**/{opengraph-image,twitter-image,icon,apple-icon}.{js,jsx,ts,tsx}"],
    rules: { "@next/next/no-img-element": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    // Fonte de verdade de design: referência, não código de produção
    "design-reference/**",
  ]),
])

export default eslintConfig
