import typescript from "@rollup/plugin-typescript";

export default [
    {
        input: "src/striptags.ts",
        output: [
            {
                format: "es",
                dir: "lib/",
            },
        ],
        plugins: [typescript({ declaration: true, declarationDir: "lib", outDir: "lib" })],
    },
    {
        input: "src/striptags.ts",
        output: [
            {
                format: "cjs",
                file: "bundle/striptags.js",
            },
        ],
        plugins: [typescript()],
    },
];
