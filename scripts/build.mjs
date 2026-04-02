import {chmod,copyFile,mkdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const rootDir=path.resolve(__dirname,"..");
const sourceFile=path.join(rootDir,"src","server.js");
const distDir=path.join(rootDir,"dist");
const targetFile=path.join(distDir,"server.js");

await mkdir(distDir,{recursive: true});
await copyFile(sourceFile,targetFile);
await chmod(targetFile,0o755);
