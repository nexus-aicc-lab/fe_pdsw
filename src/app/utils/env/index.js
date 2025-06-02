// import dotenv from "dotenv";
// import { findUp } from "find-up";
// import { realpathSync, writeFileSync } from "fs";

// // .env파일 탐색
// const envFilePath = await findUp(".env");
// // .env파일 내의 환경변수 정보 Object로 파싱
// const parsed = dotenv.config({ path: envFilePath }).parsed || {};

// // 클라이언트 HTML에 주입되어 있는 스크립트 파일 주소
// const scriptFilePath = `${realpathSync(process.cwd())}/public/env.js`;
// // 스크립트 파일에 window._env 객체에 parsed를 할당하도록 함
// writeFileSync(scriptFilePath, `window._env = ${JSON.stringify(parsed)}`);

// console.log("env file parsed. create window._env object...");