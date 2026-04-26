declare namespace THREE {
	export class Euler {
		x: number;
		y: number;
		z: number;
		constructor(x?: number, y?: number, z?: number);
	}

	export class Quaternion {
		x: number;
		y: number;
		z: number;
		w: number;
		constructor(x?: number, y?: number, z?: number, w?: number);
		copy(q: Quaternion): Quaternion;
		setFromEuler(e: Euler): Quaternion;
	}

	export class Vector3 {
		x: number;
		y: number;
		z: number;
		constructor(x?: number, y?: number, z?: number);
		length(): number;
		lengthSq(): number;
		normalize(): Vector3;
		clone(): Vector3;
		subVectors(a: Vector3, b: Vector3): Vector3;
		addScaledVector(v: Vector3, s: number): Vector3;
		multiplyScalar(s: number): Vector3;
		applyAxisAngle(axis: Vector3, angle: number): Vector3;
		set(x: number, y: number, z: number): Vector3;
		distanceTo(other: Vector3): number;
		distanceToSquared(other: Vector3): number;
		lerp(v: Vector3, alpha: number): Vector3;
		add(v: Vector3): Vector3;
		copy(v: Vector3): Vector3;
		sub(v: Vector3): Vector3;
	}

	export class Color {
		constructor(hex?: number);
		setHex(n: number): void;
		lerp(c: Color, t: number): void;
	}

	export class Material {
		dispose(): void;
	}

	export class MeshBasicMaterial extends Material {
		constructor(params?: any);
		color: Color;
		opacity: number;
		transparent?: boolean;
		depthTest?: boolean;
		depthWrite?: boolean;
		emissive?: Color | number;
		emissiveIntensity?: number;
		side?: any;
	}

	export class MeshStandardMaterial extends Material {
		constructor(params?: any);
		color: Color;
		emissive?: Color | number;
		emissiveIntensity?: number;
		roughness?: number;
		metalness?: number;
		transparent?: boolean;
		opacity?: number;
	}

	export class Geometry {}
	export class PlaneGeometry extends Geometry {
		constructor(w?: number, h?: number, wSeg?: number, hSeg?: number);
		translate(x: number, y: number, z?: number): void;
	}
	export class BoxGeometry extends Geometry { constructor(...args: any[]); }
	export class SphereGeometry extends Geometry { constructor(...args: any[]); }
	export class ConeGeometry extends Geometry { constructor(...args: any[]); }
	export class CylinderGeometry extends Geometry { constructor(...args: any[]); }
	export class OctahedronGeometry extends Geometry { constructor(...args: any[]); }
	export class RingGeometry extends Geometry { constructor(...args: any[]); }
	export class Shape { }
	export class ShapeGeometry extends Geometry { constructor(shape: any); rotateX(v: number): void; }

	export class Object3D {
		position: Vector3;
		rotation: Euler;
		quaternion: Quaternion;
		scale: Vector3;
		children: Object3D[];
		visible: boolean;
		constructor();
		add(...objects: Object3D[]): void;
		remove(...objects: Object3D[]): void;
		clear(): void;
		lookAt(x: number, y: number, z: number): void;
		lookAt(v: Vector3): void;
		getWorldPosition(target: Vector3): Vector3;
		traverse(cb: (child: Object3D) => void): void;
		clone(): this;
	}

	export class Mesh extends Object3D {
		geometry: any;
		material: any;
		constructor(geometry?: any, material?: any);
	}

	export class Group extends Object3D { constructor(); }

	export class Scene extends Group {
		constructor();
		add(...objects: Object3D[]): void;
		remove(...objects: Object3D[]): void;
	}

	export class Camera extends Object3D {
		constructor();
	}

	export const DoubleSide: any;
	export const AdditiveBlending: any;
}

declare module 'three' {
	export = THREE;
}
