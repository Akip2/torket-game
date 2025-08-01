export function getTextWidth(text: string, fontSize: string) {
    return text.length * fontSizeToNumber(fontSize) * 0.7;
}

export function fontSizeToNumber(fontSize: string): number {
    return parseFloat(fontSize.substring(0, fontSize.length - 2));
}