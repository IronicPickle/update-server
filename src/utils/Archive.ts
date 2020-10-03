import fs from "fs"
import path from "path"
import { backendConfig } from "../utils/BackendConfig"
import { logger } from "../app";

interface ArchiveStructure {
  version: string,
  versionInt: number,
  dirPath: string,
  exePath: string
}

export default class Archive {
  public static path: string;
  public static archive: ArchiveStructure[] = [];

  public static load() {

    return new Promise((resolve, reject) => {

      if(!require.main) return reject("Couldn't get root directory");
      const rootDir = path.dirname(require.main?.filename);
      if(!backendConfig.archivePath) return reject("Couldn't get archive path");
      this.path = path.join(rootDir, "../", backendConfig.archivePath)

      if(!fs.existsSync(this.path)) this.generate();

      const fileNames = fs.readdirSync(this.path);
      this.archive = [];

      logger.info(`[Archive Manager] Validating versions`);

      for(const i in fileNames) {
        const fileName = fileNames[i];
        const dirPath = path.join(this.path, fileName);
        const exePath = path.join(dirPath, "/DW Piper Setup.exe");

        const fileNameParts = fileName.split(".");
        const filteredNameParts = fileNameParts.filter(part => !Number.isNaN(Number(part)));
        if(filteredNameParts.length !== 3) {
          logger.error(`[Archive Manager]  | INVALID NAME: '${fileName}'`);
        } else if(!fs.lstatSync(dirPath).isDirectory() || !fs.existsSync(exePath)) {
          logger.error(`[Archive Manager]  | INVALID STRUCTURE: '${fileName}'`);
        } else {
          const fileNameInt = Number(filteredNameParts.join(""));
          this.archive.push({ version: fileName, versionInt: fileNameInt, dirPath, exePath });
        }
        
      }

      this.archive.sort((a, b) => b.versionInt - a.versionInt)

      resolve();

    });
  }

  private static generate() {
    
    fs.mkdirSync(this.path);
    logger.info(`[Archive Manager] Generated default archive directory\n  | Path: ${this.path}`);

  }


}