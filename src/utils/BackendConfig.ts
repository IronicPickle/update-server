import fs from "fs";
import path from "path";
import { logger } from "../app";
import { Validator, Schema } from "jsonschema";

interface BackendConfigSchema {
  port: number,
  archivePath: string
}

const defaultBackendConfig: BackendConfigSchema = {
  port: 8081,
  archivePath: "./archive"
}

export let backendConfig: BackendConfigSchema = JSON.parse(JSON.stringify(defaultBackendConfig));

const backendConfigSchema: Schema = {
  type: "object",
  properties: {
    port: { type: "number" },
    archivePath: { type: "string" }
  }
}

const validator = new Validator();

export default class BackendConfig {
  private static path = "./config/backend.json";

  public static load() {

    return new Promise((resolve, reject) => {
      fs.readFile(this.path, { encoding: "utf-8" }, (err: NodeJS.ErrnoException | null, data: string) => {
        if(err) {
          this.generate();
          return resolve();
        }

        try {
          const parsedData = JSON.parse(data);
          const validation = validator.validate(parsedData, backendConfigSchema);
          if(!validation.valid) return reject(`[Backend Config] backend.json does not match schema:\n  ${validation.errors.join("\n  ")}`);
          
          backendConfig = parsedData;
          logger.info("[Backend Config] Loaded backend.json file");
          resolve();
        } catch(err) {
          reject(`[Backend Config] ${err}`);
        }
        
      });
    });

  }

  private static generate() {

    if(!fs.existsSync(path.dirname(this.path))) fs.mkdirSync(path.dirname(this.path));

    fs.writeFileSync(this.path, JSON.stringify(defaultBackendConfig, null, 2));
    logger.info("[Backend Config] Generated default backend.json file");

  }

}