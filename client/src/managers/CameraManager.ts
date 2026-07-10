import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "@shared/const";

export interface CameraManagerOptions {
    initialZoom?: number;
    minZoom?: number;
    maxZoom?: number;
    zoomSensitivity?: number;
    uiCamera?: Phaser.Cameras.Scene2D.Camera;
    worldBounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    initialCenter?: {
        x: number;
        y: number;
    };
}

export default class CameraManager {
    private readonly camera: Phaser.Cameras.Scene2D.Camera;
    private readonly minZoom: number;
    private readonly maxZoom: number;
    private readonly zoomSensitivity: number;
    private uiCamera?: Phaser.Cameras.Scene2D.Camera;

    private isPanningCamera = false;
    private panStart: { x: number, y: number } | null = null;
    private panOriginScroll: { x: number, y: number } | null = null;

    constructor(camera: Phaser.Cameras.Scene2D.Camera, options: CameraManagerOptions = {}) {
        this.camera = camera;
        this.minZoom = options.minZoom ?? 0.02;
        this.maxZoom = options.maxZoom ?? Number.POSITIVE_INFINITY;
        this.zoomSensitivity = options.zoomSensitivity ?? 1.1;
        this.uiCamera = options.uiCamera;

        this.initialize(options);
    }

    initialize(options: CameraManagerOptions = {}) {
        const worldBounds = options.worldBounds ?? {
            x: -50000,
            y: -50000,
            width: 100000,
            height: 100000,
        };
        const initialCenter = options.initialCenter ?? {
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT / 2,
        };
        const initialZoom = options.initialZoom ?? 1;

        this.camera.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);
        this.camera.setZoom(initialZoom);
        this.camera.centerOn(initialCenter.x, initialCenter.y);
        this.syncUiCamera();
    }

    setUiCamera(camera: Phaser.Cameras.Scene2D.Camera) {
        this.uiCamera = camera;
        this.syncUiCamera();
    }

    syncUiCamera() {
        if (!this.uiCamera) return;

        this.uiCamera.setViewport(0, 0, this.camera.width, this.camera.height);
        this.uiCamera.setScroll(0, 0);
        this.uiCamera.setZoom(1);
    }

    getUiViewportWidth() {
        return this.uiCamera?.width ?? this.camera.width;
    }

    getUiViewportHeight() {
        return this.uiCamera?.height ?? this.camera.height;
    }

    getUiViewportCenter() {
        return {
            x: this.getUiViewportWidth() / 2,
            y: this.getUiViewportHeight() / 2,
        };
    }

    handleWheel(pointer: Phaser.Input.Pointer, deltaY: number) {
        const worldPoint = this.camera.getWorldPoint(pointer.x, pointer.y);
        const zoomFactor = deltaY > 0 ? 1 / this.zoomSensitivity : this.zoomSensitivity;
        const nextZoom = this.camera.zoom * zoomFactor;

        if (nextZoom < this.minZoom || nextZoom > this.maxZoom) {
            return;
        }

        this.camera.setZoom(nextZoom);

        const updatedWorldPoint = this.camera.getWorldPoint(pointer.x, pointer.y);
        const deltaWorldX = updatedWorldPoint.x - worldPoint.x;
        const deltaWorldY = updatedWorldPoint.y - worldPoint.y;

        this.camera.setScroll(this.camera.scrollX - deltaWorldX, this.camera.scrollY - deltaWorldY);
    }

    handlePointerDown(pointer: Phaser.Input.Pointer): boolean {
        if (pointer.button === 1 || pointer.button === 2) {
            this.isPanningCamera = true;
            this.panStart = { x: pointer.x, y: pointer.y };
            this.panOriginScroll = { x: this.camera.scrollX, y: this.camera.scrollY };
            return false;
        }

        return true;
    }

    handlePointerUp(): boolean {
        if (this.isPanningCamera) {
            this.isPanningCamera = false;
            this.panStart = null;
            this.panOriginScroll = null;
            return false;
        }

        return true;
    }

    handlePointerMove(pointer: Phaser.Input.Pointer): boolean {
        if (!this.isPanningCamera || !this.panStart || !this.panOriginScroll) {
            return false;
        }

        const deltaX = pointer.x - this.panStart.x;
        const deltaY = pointer.y - this.panStart.y;
        const nextScrollX = this.panOriginScroll.x - deltaX / this.camera.zoom;
        const nextScrollY = this.panOriginScroll.y - deltaY / this.camera.zoom;

        this.camera.setScroll(nextScrollX, nextScrollY);
        return true;
    }

    getWorldPoint(pointer: Phaser.Input.Pointer) {
        return this.camera.getWorldPoint(pointer.x, pointer.y);
    }

    getCamera() {
        return this.camera;
    }
}
