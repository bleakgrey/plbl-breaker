import { GameServices } from "../GameServices";

const SERVICE_MAP: Map<GameServices, any[]> = new Map();

export function provide<T>(token: GameServices, what: T) {
	const existing = SERVICE_MAP.get(token) ?? [];
	existing.push(what);
	SERVICE_MAP.set(token, existing);
}

export function unprovide<T>(token: GameServices, what: T) {
	const existing = SERVICE_MAP.get(token);
	if (!existing) return;

	const filtered = existing.filter(service => service !== what);
	if (filtered.length > 0) {
		SERVICE_MAP.set(token, filtered);
	} else {
		SERVICE_MAP.delete(token);
	}
}

export function locateOne<T>(token: GameServices): T {
	const services = SERVICE_MAP.get(token);

	if (!services || services.length === 0) {
		throw new Error(`No service of type "${token}" is currently available`);
	}

	return services[0];
}

export function locateAll<T>(token: GameServices): T[] {
	return [...(SERVICE_MAP.get(token) ?? [])];
}
