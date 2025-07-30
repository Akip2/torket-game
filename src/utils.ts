import { GAME_HEIGHT, GAME_WIDTH } from "./const";
import type { HorizontalEnum } from "./enums/horizontal.enum";
import type { VerticalEnum } from "./enums/vertical.enum";

export function getTextWidth(text: string, fontSize: string) {
    return text.length * fontSizeToNumber(fontSize) * 0.7;
}

export function fontSizeToNumber(fontSize: string): number {
    return parseFloat(fontSize.substring(0, fontSize.length - 2));
}

export function generateHorizontalValue(objectWidth: number, placement: HorizontalEnum) {
    return (GAME_WIDTH / 2) + (placement * (GAME_WIDTH / 2)) + ((objectWidth / 2) * -placement);
}

export function generateVerticalValue(objectHeight: number, placement: VerticalEnum) {
    return (GAME_HEIGHT / 2) + (placement * (GAME_HEIGHT / 2)) + ((objectHeight / 2) * -placement);
}