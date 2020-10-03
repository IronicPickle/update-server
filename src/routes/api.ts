import express, { Request, Response, NextFunction } from "express";
import wrap from "../utils/wrap";
import Archive from "../utils/Archive"

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

  res.download(archiveEntry.exePath, "DW Piper Setup.exe")

}));

export default router;