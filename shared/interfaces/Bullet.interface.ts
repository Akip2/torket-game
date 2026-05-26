import type { ExplosionInfo } from "@shared/types";
import type { IBasicBody } from "./BasicBody.interface";

export interface IBulletInterface extends IBasicBody {
    getExplosionInfo(): ExplosionInfo;
}