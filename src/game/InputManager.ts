import * as THREE from 'three';

export class InputManager {
  public keys: Record<string, boolean> = {};
  public mousePos: THREE.Vector2 = new THREE.Vector2();
  public isMouseDown: boolean = false;
  public isRightMouseDown: boolean = false;
  public consumableKeys: number[] = []; // Track consumable key presses (1, 2, 3)
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('mousemove', this.onMouseMove);
    canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('contextmenu', this.onContextMenu);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;

    // Handle consumable hotkeys (1, 2, 3)
    if (e.key === '1' || e.key === '2' || e.key === '3') {
      const slotIndex = parseInt(e.key) - 1;
      if (!this.consumableKeys.includes(slotIndex)) {
        this.consumableKeys.push(slotIndex);
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;

    // Handle consumable hotkeys (1, 2, 3)
    if (e.key === '1' || e.key === '2' || e.key === '3') {
      const slotIndex = parseInt(e.key) - 1;
      const idx = this.consumableKeys.indexOf(slotIndex);
      if (idx !== -1) {
        this.consumableKeys.splice(idx, 1);
      }
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = (e.clientX - rect.left) / rect.width * 2 - 1;
    this.mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) this.isMouseDown = true;
    if (e.button === 2) this.isRightMouseDown = true;
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) this.isMouseDown = false;
    if (e.button === 2) this.isRightMouseDown = false;
  };

  private onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  public cleanup() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
  }

  public reset() {
    this.keys = {};
    this.mousePos = new (THREE as any).Vector2();
    this.isMouseDown = false;
    this.isRightMouseDown = false;
    this.consumableKeys = [];
  }
}