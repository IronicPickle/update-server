import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import path from "path";
import { Express } from "express-serve-static-core";
import routes from "./routes";
import http from "http";
import { logger } from "../app";
import { backendConfig } from "../utils/BackendConfig";

export default class NodeServer {
  public port: number;

  private server: Express;
  private httpInstance: http.Server | null;
  private publicPath: string;

  constructor() {
    this.port = backendConfig.port;

    this.server = express();
    this.httpInstance = null;
    
    this.publicPath = path.join(__dirname, "../../client/build");
    this.server.use(express.static(this.publicPath));

    this.server.use(bodyParser.urlencoded({ extended: false }));
    this.server.use(bodyParser.json());
  }

  start() {
    return new Promise((resolve, reject) => {
      const server = this.server;
      const port = this.port;

      this.httpInstance = server.listen(port, () => {
        if(!this.httpInstance) {
          reject("[HTTP] No HTTP instance found"); return;
        }

        server.all("*", (req: Request, res: Response, next: NextFunction) => {
          logger.http(`[${req.method}] ${req.url} from ${req.ip}`);
          return next();
        });

        for(const i in routes) {
          server.use(i, routes[i]);
          logger.info(`[Node] Registered route '${i}'`);
        }
        
        server.all("*", (req: Request, res: Response, next: NextFunction) => {
          res.status(404).send("Not found");

          return next();
        });

        resolve();
      });
      
    });
  }
}
