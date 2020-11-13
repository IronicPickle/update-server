import fs from "fs";
import path from "path";
import express, { Request, Response, NextFunction } from "express";
import wrap from "../utils/wrap";
import Archive from "../utils/Archive"
import { logger } from "../app";

const router = express.Router();

router.get("/latestVersion", wrap(async (req: Request, res: Response, next: NextFunction) => {

  const archiveEntry = Archive.archive[0];

  if(archiveEntry == null) return res.status(404).send();

  const { version, versionInt } = archiveEntry;
    res.status(200).send(JSON.stringify({ version, versionInt }))

}));

router.get("/download", wrap(async (req: Request, res: Response, next: NextFunction) => {

  const { v } = req.query;
  const archiveEntry = Archive.archive.find(archiveEntry => archiveEntry.version === v);

  if(archiveEntry == null) return res.status(404).send();

  const fileName = path.basename(archiveEntry.exePath);

  res.download(archiveEntry.exePath, fileName)

}));

router.get("/changelog", wrap(async (req: Request, res: Response, next: NextFunction) => {

  const { v } = req.query;
  const archiveEntry = Archive.archive.find(archiveEntry => archiveEntry.version === v);

  if(archiveEntry == null) return res.status(404).send();

  let changelog = null
  try {
    changelog = fs.readFileSync(archiveEntry.changelogPath, { encoding: "utf-8" })
  } catch {}

  if(changelog == null) {
    logger.error(`Can't find changelog for version: ${v}`)
    return res.status(404).send()
  }

  try {
    changelog = JSON.parse(changelog)
    res.status(200).send({ changelog })
  } catch {
    logger.error(`Can't parse changelog json for version: ${v}`)
    res.status(500).send()
  }

}));

export default router;