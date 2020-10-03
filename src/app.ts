import NodeServer from "./server/NodeServer";
import winston, { transports } from "winston";
import { exit } from "process";
import BackendConfig from "./utils/BackendConfig";
import figlet from "figlet";
import Archive from "./utils/Archive";

const logLevel = (process.env.NODE_ENV === "production" ? "info" : "debug");

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.simple(),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "./log/error.log", level: "error" }),
    new transports.File({ filename: "./log/combined.log" })
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: "./log/exceptions.log" })
  ]
});

console.log("\n#==================================================================#");
console.log(`${figlet.textSync(" Update Server", { font: "Doom" })}`);
console.log("#==================================================================#\n");

export let nodeServer: NodeServer;

logger.info("[Node] Initialising");
BackendConfig.load().then(() => {
  const environment = process.env.NODE_ENV;
  logger.info(`[Node] Environment: ${environment}`);

  nodeServer = new NodeServer()
  nodeServer.start().then(() => {
    logger.info(`[Node] Listening on: ${nodeServer.port}`);
  }).catch((err: Error) => {
    logger.error(err);
    exit();
  });

  Archive.load().then(() => {
    logger.info(`[Archive Manager] Archive loaded`);
    logger.info(`[Archive Manager]   | Path: ${Archive.path}`);
    logger.info(`[Archive Manager]   | Available Versions: ${Archive.archive.length}`);
  }).catch((err) => {
    logger.error(err);
    exit();
  });

}).catch((err: Error) => {
  logger.error(err);
  exit();
});