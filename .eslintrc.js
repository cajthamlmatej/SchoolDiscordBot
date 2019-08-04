module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "no-unused-vars": "off",
        "camelcase": "error",
        "prefer-const": "error",
        "no-var": "error",
        "spaced-comment": ["error", "always"],
        "space-before-blocks": "error",
        "arrow-spacing": "error",
        "rest-spread-spacing": ["error", "always"],
        "curly": ["error", "multi"],
        "no-multiple-empty-lines": [
            1, {"max": 1, "maxEOF": 0, "maxBOF": 0}
        ],
        "no-console": 2,
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};