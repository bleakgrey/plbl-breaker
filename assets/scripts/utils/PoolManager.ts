import {
	_decorator,
	Component,
	instantiate,
	Node,
	NodePool,
	Prefab,
	Vec3,
} from "cc";
import { GameEvents } from "../GameEvents";

const { ccclass, property } = _decorator;

@ccclass("PoolConfig")
class PoolConfig {
	@property
	poolName: string = "";

	@property(Prefab)
	prefab: Prefab | null = null;

	@property
	size: number = 10;
}

@ccclass("PoolManager")
export class PoolManager extends Component {
	private static _instance: PoolManager | null = null;

	@property({ type: [PoolConfig] })
	pools: PoolConfig[] = [];

	private _nodePools: Map<string, NodePool> = new Map();
	private _defaultPrefab: Map<string, Prefab> = new Map();

	public static get instance(): PoolManager {
		return this._instance;
	}

	onLoad() {
		PoolManager._instance = this;
		this._initializePools();
	}

	private createInstance(prefab: Prefab, pool: NodePool) {
		const node = instantiate(prefab);
		node.on(GameEvents.RETURN_TO_POOL, () => {
			node.removeFromParent();
			node.setPosition(Vec3.ZERO);
			node.setRotationFromEuler(0, 0, 0);
			node.setScale(Vec3.ONE);
			
			pool.put(node);
		});
		return node;
	}

	private _initializePools() {
		this.pools.forEach((config) => {
			const { prefab, poolName } = config;
			if (prefab) {
				const pool = new NodePool();

				for (let i = 0; i < config.size; i++) {
					const node = this.createInstance(prefab, pool);
					pool.put(node);
				}

				this._nodePools.set(poolName, pool);
				this._defaultPrefab.set(poolName, prefab);
			}
		});
	}

	public get(name: string): Node | null {
		const pool = this._nodePools.get(name);

		if (pool && pool.size() > 0) {
			return pool.get();
		} else if (pool) {
			const prefab = this._defaultPrefab.get(name);
			const node = this.createInstance(prefab, pool);
			pool.put(node);

			return pool.get();
		}

		console.error(`No pool found for ${name}.`);
		return null;
	}
}
