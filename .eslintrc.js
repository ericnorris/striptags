module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
    },
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
        indent: ["error", 4],
        "linebreak-style": ["error", "unix"],
        "prettier/prettier": "error",
        quotes: ["error", "double", { avoidEscape: true }],
        semi: ["error", "always"],
    },
};
