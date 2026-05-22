import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "out/**",
            "build/**",
            "dist/**",
            "coverage/**",
            "next-env.d.ts",
        ],
    },
    {
        extends: compat.extends("next/core-web-vitals", "next/typescript"),
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
            "prefer-const": "off",
            "react/no-unescaped-entities": "off",
        },
    },
]);
