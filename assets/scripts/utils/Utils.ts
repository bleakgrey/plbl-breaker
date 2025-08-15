import { Vec3 } from 'cc';

export const expoLerp = (current: Vec3, target: Vec3, smoothing: number, deltaTime: number): Vec3 => {
	const factor = 1 - Math.exp(-smoothing * deltaTime);
	return Vec3.lerp(new Vec3(), current, target, factor);
}