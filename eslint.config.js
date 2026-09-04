import { defineConfig } from "lint-staged/config"

export default defineConfig([
    {
        env: {
            commonjs: true,
            es2021: true,
            node: true,
        },
        parser: "@typescript-eslint/parser",
        plugins: ["@typescript-eslint"],
        extends: [
            "eslint:recommended",
            "prettier",
            "plugin:@typescript-eslint/recommended",
            "plugin:@typescript-eslint/recommended-requiring-type-checking",
        ],
        parserOptions: {
            project: ["./tsconfig.json"],
        },
        globals: {
            client: "writable",
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
        },
        ignores: [
            // Logs
            "logs",
            "*.log",
            "npm-debug.log*",
            "yarn-debug.log*",
            "yarn-error.log*",
            "lerna-debug.log*",

            // Diagnostic reports
            "report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json",

            // Runtime data
            "pids",
            "*.pid",
            "*.seed",
            "*.pid.lock",

            // Directory for instrumented libs
            "lib-cov",

            // Coverage directory
            "coverage",
            "*.lcov",
            ".nyc_output",

            // Build & dependencies
            ".grunt",
            "bower_components",
            ".lock-wscript",
            "build/Release",
            "node_modules/",
            "jspm_packages/",
            "typings/",
            "*.tsbuildinfo",

            // Caches & env
            ".npm",
            ".eslintcache",
            ".rpt2_cache/",
            ".rts2_cache_cjs/",
            ".rts2_cache_es/",
            ".rts2_cache_umd/",
            ".node_repl_history",
            "*.tgz",
            ".yarn-integrity",
            ".env",
            ".env.test",
            ".cache",

            // Framework outputs
            ".next",
            ".nuxt",
            "dist",
            ".vuepress/dist",
            ".serverless/",
            ".fusebox/",
            ".dynamodb/",
            ".tern-port",
        ],
    },
])
