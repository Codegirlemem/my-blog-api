import { Request } from "express";
import { UserAuthPayload } from "./index.type.ts";

declare interface UserRequest extends Request {
  user?: UserAuthPayload;
}
