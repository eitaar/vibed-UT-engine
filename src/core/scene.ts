import type { Application, Container } from "pixi.js";
import type { SceneManager } from "./scene-manager";
export interface Scene {
	container: Container;
	init: (app: Application, sceneManager: SceneManager) => Promise<void>;
	update: (dt: number) => void;
	destroy: () => void;
}
