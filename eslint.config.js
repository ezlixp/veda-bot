import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import eslintConfigPrettier from "eslint-config-prettier"
import globals from "globals"

export default tseslint.config(
    {
        ignores: ["node_modules/", "dist/", "build/", "coverage/", ".next/", "*.log"],
    },

    eslint.configs.recommended,

    ...tseslint.configs.recommendedTypeChecked,

    {
        languageOptions: {
            globals: {
                ...globals.commonjs,
                ...globals.es2021,
                ...globals.node,
                client: "writable",
            },
            parserOptions: {
                project: ["./tsconfig.json"],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
        },
    },

    eslintConfigPrettier,
)
