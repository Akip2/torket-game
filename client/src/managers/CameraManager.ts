import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, ZOOM_CONST } from "@shared/const";
import type { CameraManagerOptions } from "@shared/types";

export default class CameraManager {
    private readonly camera: Phaser.Cameras.Scene2D.Camera;
    private readonly zoomSensitivity: number;
    private readonly zoomFollowStrength: number;
    private uiCamera?: Phaser.Cameras.Scene2D.Camera;

    private isPanningCamera = false;
    private panStart: { x: number, y: number } | null = null;
    private panOriginScroll: { x: number, y: number } | null = null;

    constructor(camera: Phaser.Cameras.Scene2D.Camera, options: CameraManagerOptions = {}) {
        this.camera = camera;
        this.zoomSensitivity = options.zoomSensitivity ?? ZOOM_CONST.SENSITIVITY;
        this.zoomFollowStrength = options.zoomFollowStrength ?? ZOOM_CONST.FOLLOW_STRENGTH;
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
        const worldBefore = this.camera.getWorldPoint(pointer.x, pointer.y);

        const zoomStep = deltaY > 0 ? 1 / this.zoomSensitivity : this.zoomSensitivity;
        const nextZoom = Phaser.Math.Clamp(this.camera.zoom * zoomStep, ZOOM_CONST.MIN_ZOOM, ZOOM_CONST.MAX_ZOOM);

        if (nextZoom === this.camera.zoom) {
            return;
        }

        this.camera.setZoom(nextZoom);

        // Important: refresh the matrix so getWorldPoint uses the new zoom immediately.
        this.camera.preRender();

        const worldAfter = this.camera.getWorldPoint(pointer.x, pointer.y);

        const diffX = worldAfter.x - worldBefore.x;
        const diffY = worldAfter.y - worldBefore.y;

        const follow = this.zoomFollowStrength;
        this.camera.setScroll(
            this.camera.scrollX - diffX * follow,
            this.camera.scrollY - diffY * follow
        );
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