import {
	_decorator,
	BoxCollider,
	CCInteger,
	Component,
	ITriggerEvent,
	Mesh,
	MeshRenderer,
	Node,
	randomRangeInt,
	ParticleSystem,
} from "cc";
import { gameEventTarget, handlesEvent } from "../utils/Events";
import { GameEvents, IDamageEvent } from "../GameEvents";
import Health from "../gameplay/Health";

const { ccclass, property, disallowMultiple } = _decorator;

@ccclass("PlayerWeaponLevel")
export class PlayerWeaponLevel {
	@property(Mesh)
	mesh: Mesh;

	@property(CCInteger)
	damageMin = 1;

	@property(CCInteger)
	damageMax = 1;
}

@ccclass("PlayerWeaponBehavior")
@disallowMultiple(true)
export default class extends Component {
	@property(BoxCollider)
	colliderComp: BoxCollider;

	@property(MeshRenderer)
	weaponMeshComp: MeshRenderer;

	@property([PlayerWeaponLevel])
	levels: PlayerWeaponLevel[] = [];

	@property(ParticleSystem)
	trailFx: ParticleSystem = null;

	private currentLevel: PlayerWeaponLevel;
	private isAttacking = false;
	private overlappingNodes: Set<Node> = new Set();

	onEnable() {
		this.colliderComp.on("onTriggerEnter", this.onCollisionEnter, this);
		this.colliderComp.on("onTriggerExit", this.onCollisionExit, this);
	}
	onDisable() {
		this.colliderComp.off("onTriggerEnter", this.onCollisionEnter, this);
		this.colliderComp.off("onTriggerExit", this.onCollisionExit, this);
	}
	start() {
		this.onUpgrade(1);
		this.onUpdateState();
	}

	private onCollisionEnter(ev: ITriggerEvent) {
		const node = ev.otherCollider.node;
		if (!node.getComponent(Health)) {
			return;
		}

		if (!this.overlappingNodes.has(node)) {
			this.overlappingNodes.add(node);
			this.onUpdateState();
		}
	}

	private onCollisionExit(ev: ITriggerEvent) {
		const node = ev.otherCollider.node;

		if (this.overlappingNodes.has(node)) {
			this.overlappingNodes.delete(node);
			this.onUpdateState();
		}
	}

	private onUpdateState() {
		const isAttacking = this.overlappingNodes.size > 0;
		if (isAttacking != this.isAttacking) {
			gameEventTarget.emit(GameEvents.PLAYER_ATTACK_TOGGLED, isAttacking);
		}

		this.isAttacking = isAttacking;
		
		if (isAttacking) {
			this.trailFx.rateOverTime.constant = 60;
		}
		else {
			this.trailFx.rateOverTime.constant = 0;
		}
	}

	@handlesEvent(GameEvents.PLAYER_ATTACK_HIT)
	private onAnimHitEvent() {
		for (const node of this.overlappingNodes) {
			const ev: IDamageEvent = {
				node,
				instigator: this.node,
				blocked: false,
				amount: randomRangeInt(
					this.currentLevel.damageMin,
					this.currentLevel.damageMax,
				),
			};
			gameEventTarget.emit(GameEvents.DAMAGE_INFLICT, ev);
		}
	}

	@handlesEvent(GameEvents.DIED)
	private onNodeDied(node: Node) {
		this.overlappingNodes.delete(node);
		this.onUpdateState();
	}

	@handlesEvent(GameEvents.PLAYER_UPGRADE)
	private onUpgrade(level: number) {
		this.currentLevel = this.levels[level];
		this.weaponMeshComp.mesh = this.currentLevel.mesh;
	}
}
