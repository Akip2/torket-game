import { EXPLOSION_CONST } from "@shared/const";
import { Cursor } from "@shared/enums/Cursor.enum";
import { HudButton } from "@shared/enums/HudButton.enum";
import tinycolor from "tinycolor2";

const SERVER_URL: string = import.meta.env.VITE_SERVER_URL || "ws://localhost:2567";

let currentHudButton = HudButton.EndTurn;

export function lightenHexColor(hex: number, coef: number = 7.5) {
    const hexString = "#" + hex.toString(16).padStart(6, "0");

    return parseInt(
        tinycolor(hexString)
            .lighten(coef)
            .toHex()
        , 16
    );
}

export function darkenHexColor(hex: number, coef: number = 7.5) {
    return parseInt(tinycolor(hex.toString(16)).darken(coef).toHexString().replace("#", ""), 16);
}

export function getExplosionSpriteScale(explosionRadius: number) {
    return (explosionRadius / EXPLOSION_CONST.SPRITE_SIZE) * 1.75;
}

export function setCursor(
    cursor: Cursor,
    hotspotX: number = 16,
    hotspotY: number = 16
) {
    const canvas = document.getElementById("game-container")!;

    if (cursor === Cursor.Default) {
        canvas.style.cursor = "default";
    } else {
        canvas.style.cursor = `url(assets/cursors/${cursor}.png) ${hotspotX} ${hotspotY}, crosshair`;
    }
}

export function clearDomUi() {
    clearPrimaryDomUi();
    clearSecondaryUiRoot();
}

export function clearSecondaryUiRoot() {
    getSecondaryUiRoot().innerHTML = "";
}

export function clearPrimaryDomUi() {
    getPrimaryUiRoot().innerHTML = "";
}

export function getPrimaryUiRoot() {
    return document.getElementById("ui-container")!;
}

export function getSecondaryUiRoot() {
    return document.getElementById("secondary-ui-container")!;
}

export function getCloseButton(index: number = 0) {
    return document.getElementsByClassName("close-btn")[index];
}

export function getServerUrl() {
    return SERVER_URL;
}

export function showToast(message: string) {
    document.getElementById("toast")?.remove();

    const toast = document.createElement("div");
    toast.id = "toast";
    toast.textContent = message;
    toast.classList.add("toast");

    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("toast--visible"));

    setTimeout(() => {
        toast.classList.remove("toast--visible");
        toast.addEventListener("transitionend", () => toast.remove());
    }, 1000);
}

export function setButtonLoading(button: HTMLButtonElement, loading: boolean, loadingText: string = "Loading") {
    if (loading) {
        button.dataset.originalText = button.textContent || "";
        button.textContent = loadingText;
        button.disabled = true;
        button.classList.add("loading");
        button.setAttribute("aria-busy", "true");
        return;
    }

    button.disabled = false;
    button.classList.remove("loading");
    button.removeAttribute("aria-busy");
    button.textContent = button.dataset.originalText || button.textContent;
}

export function mountWithTransition(root: HTMLElement, html: string) {
    root.innerHTML = html;
    const popup = root.querySelector(".central-container");
    if (!popup) return;

    requestAnimationFrame(() => popup.classList.add("popup--visible"));
}

export async function loadFont(name: string, url: string): Promise<void> {
    const newFont = new FontFace(name, `url(${url})`);

    try {
        const loaded = await newFont.load();
        document.fonts.add(loaded);
    } catch (error) {
        throw error;
    }
}

export function displayHud() {
    const hud = document.getElementById("hud-top");
    const gameCanvas = document.getElementById("game-container");

    if (!hud || !gameCanvas) return;
    hud.style.display = "flex";
    gameCanvas.style.top = "var(--hud-height)";
    gameCanvas.style.height = "calc(100% - var(--hud-height))";
}

export function removeHud() {
    const hud = document.getElementById("hud-top");
    const gameCanvas = document.getElementById("game-container");

    if (!hud || !gameCanvas) return;
    hud.style.display = "none";
    gameCanvas.style.top = "0";
    gameCanvas.style.height = "100%";
}

function getCurrentHudButtonType() {
    return currentHudButton;
}

export function setupHudButtonCallbacks(hudCallbacks: Map<HudButton, () => void>) {
    const btn = document.getElementById("hud-btn") as HTMLButtonElement;
    if (!btn) return;

    btn.onclick = () => {
        btn.disabled = true;
        const buttonType = getCurrentHudButtonType() as HudButton;
        hudCallbacks.get(buttonType)?.();
    }
}

export function showHudButton(buttonType: HudButton, enabled: boolean = true) {
    const btn = document.getElementById("hud-btn") as HTMLButtonElement;
    if (!btn) return;

    btn.textContent = buttonType;
    btn.style.display = "block";
    btn.disabled = !enabled;

    currentHudButton = buttonType;
}

export function hideHudButton() {
    const btn = document.getElementById("hud-btn") as HTMLButtonElement;
    if (!btn) return;
    btn.style.display = "none";
}