import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "off", // "warn"으로 설정하면 경고로 표시 (필요 시 "off"로 설정 가능)
        { vars: "all", args: "after-used", ignoreRestSiblings: true },
      ],
      "@typescript-eslint/no-explicit-any": "off", // 'any' 타입 사용 허용
      "@typescript-eslint/no-empty-interface": "off", // 빈 인터페이스 선언 허용
    },
  },
];

export default eslintConfig;
