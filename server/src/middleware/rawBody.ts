import { Request, Response, NextFunction } from "express";

export default function captureRawBody(req: Request, _res: Response, next: NextFunction) {
  req.rawBody = undefined;
  next();
}
