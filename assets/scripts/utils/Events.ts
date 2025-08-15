import { _decorator, EventTarget, Component } from 'cc';

type HandlerMeta = { eventName: any; methodName: string; isLocal: boolean };

const META_HANDLERS_MAP = new WeakMap<object, HandlerMeta[]>();
export const gameEventTarget = new EventTarget();

export function handlesEvent(eventName: any, isLocal = false) {
    return function (target: Component, propertyKey: string) {
        if (!META_HANDLERS_MAP.has(target)) {
            META_HANDLERS_MAP.set(target, []);
        }
        META_HANDLERS_MAP.get(target)!.push({ eventName, methodName: propertyKey, isLocal });

        // Patch only once per prototype, not per class in inheritance chain
        const proto = target.constructor.prototype;
        if (!(proto as any).__eventDecoratorPatched) {
            (proto as any).__eventDecoratorPatched = true;

            const origOnEnable = proto.onEnable;
            const origOnDisable = proto.onDisable;

            proto.onEnable = function (...args: any[]) {
                // Collect metadata from the entire prototype chain
                let currentProto = Object.getPrototypeOf(this);
                const collectedMeta: HandlerMeta[] = [];
                while (currentProto) {
                    const meta = META_HANDLERS_MAP.get(currentProto);
                    if (meta) collectedMeta.push(...meta);
                    currentProto = Object.getPrototypeOf(currentProto);
                }

                for (const { eventName, methodName, isLocal } of collectedMeta) {
                    const eventTarget = isLocal ? this.node : gameEventTarget;
                    if (this[methodName]) {
                        eventTarget.on(eventName, this[methodName], this);
                    }
                }

                if (origOnEnable) origOnEnable.apply(this, args);
            };

            proto.onDisable = function (...args: any[]) {
                let currentProto = Object.getPrototypeOf(this);
                const collectedMeta: HandlerMeta[] = [];
                while (currentProto) {
                    const meta = META_HANDLERS_MAP.get(currentProto);
                    if (meta) collectedMeta.push(...meta);
                    currentProto = Object.getPrototypeOf(currentProto);
                }

                for (const { eventName, methodName, isLocal } of collectedMeta) {
                    const eventTarget = isLocal ? this.node : gameEventTarget;
                    if (eventTarget && this[methodName]) {
                        eventTarget.off(eventName, this[methodName], this);
                    }
                }

                if (origOnDisable) origOnDisable.apply(this, args);
            };
        }
    };
}
