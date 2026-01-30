import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import SoloActionPhase from "./SoloActionPhase";

export default class ShootingPhase extends SoloActionPhase {
    constructor(startTime: number, playerConcerned: { pseudo: string, playerId: string }) {
        super(PhaseTypes.Shooting, startTime, 30, playerConcerned);
    }
}