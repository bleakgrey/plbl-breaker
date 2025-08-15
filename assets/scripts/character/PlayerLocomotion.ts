import { _decorator, Component, Node, ParticleSystem, animation, lerp } from 'cc';
import PlayerMovement from './PlayerMovement'
import { handlesEvent } from '../utils/Events';
import { GameEvents } from '../GameEvents';
const { ccclass, property, disallowMultiple } = _decorator;

@ccclass('PlayerLocomotion')
@disallowMultiple(true)
export default class extends Component {
	@property(animation.AnimationController)
	animComp: animation.AnimationController;

	@property(PlayerMovement)
	movementComp: PlayerMovement;

	@property(Node)
	equipmentBoneNode: Node;

	@property(Node)
	equipmentNode: Node;

	@property(ParticleSystem)
	trailFx: ParticleSystem = null;

	lerpAmount = 15.0

	private isAttacking = false;
	private isMoving = false;
	private speedNormalized = 0.0;
	private attackNormalized = 0.0;
	private dt = 0.0;

	update(deltaTime: number) {
		this.dt = deltaTime;
		this.updateLocomotion();
		this.updateEquipment();
	}

	@handlesEvent(GameEvents.PLAYER_ATTACK_TOGGLED)
	private onAttackToggle(isAttacking: boolean) {
		this.isAttacking = isAttacking;
	}

	private updateLocomotion() {
		const isCurrentlyMoving = this.movementComp.getCurrentVelocity().length() > 0.1;
		const isCurrentlyAttacking = this.isAttacking;

		if (isCurrentlyMoving != this.isMoving) {
			this.updateTrail(isCurrentlyMoving)
		}
		this.isMoving = isCurrentlyMoving;

		this.speedNormalized = lerp(this.speedNormalized, isCurrentlyMoving ? 1.0 : 0.0, this.lerpAmount * this.dt);
		this.animComp.setValue('speedNorm', this.speedNormalized);

		this.attackNormalized = lerp(this.attackNormalized, isCurrentlyAttacking ? 1.0 : 0.0, this.lerpAmount * this.dt);
		this.animComp.setValue('attackNorm', this.attackNormalized);
		this.animComp.setValue('isAttacking', isCurrentlyAttacking);
		this.animComp.setLayerWeight(1, this.attackNormalized);
	}

	private updateEquipment() {
		this.equipmentNode.setWorldPosition(this.equipmentBoneNode.getWorldPosition())
		this.equipmentNode.setWorldRotation(this.equipmentBoneNode.getWorldRotation())
	}

	private updateTrail(isMoving: boolean) {
		if (isMoving) {
			this.trailFx?.play();
		}
		else {
			this.trailFx?.stopEmitting();
		}
	}
}


