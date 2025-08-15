import {
	_decorator,
	Component,
	math,
	Vec2,
	Vec3,
	Quat,
} from 'cc';

import { MoveObject } from 'db://assets/scripts/utils/MoveObject';
import { gameEventTarget, handlesEvent } from 'db://assets/scripts/utils/Events';
import { GameEvents } from 'db://assets/scripts/GameEvents';
import { RigidBody } from 'cc';

const { ccclass, property, disallowMultiple } = _decorator;

@ccclass('PlayerMovement')
@disallowMultiple(true)
export default class extends Component {
	@property
	moveSpeed: number = 10;

	@property
	interRadius: number = 3;

	private _bodyComp: RigidBody;
	private _currentVelocity: Vec3 = new Vec3();
	private _targetQuat = new Quat();
	private _startWorldPos: Vec3 = new Vec3();

	moveObject: MoveObject = null;

	velocity: Vec3 = new Vec3();

	onLoad() {
		this._bodyComp = this.node.getComponent(RigidBody)
		this._bodyComp.useGravity = false
		this._bodyComp.allowSleep = false

		this._startWorldPos.set(this.node.worldPosition);
		this.moveObject = new MoveObject(this.node, this.moveSpeed);
	}

	update(dt: number) {
		if (this._currentVelocity.lengthSqr() > 0) {
			Vec3.copy(this.velocity, this._currentVelocity).multiplyScalar(dt);
			this.updateRotation(dt);
		}

		this._bodyComp.setLinearVelocity(this._currentVelocity)
		this._bodyComp.setAngularVelocity(Vec3.ZERO)
	}

	@handlesEvent(GameEvents.JOYSTICK_MOVE)
	private onJoystickMove(direction: Vec2) {
		if (direction.lengthSqr() > 0) {
			this._currentVelocity.set(direction.x * this.moveSpeed, 0, -direction.y * this.moveSpeed);
		}
	}

	@handlesEvent(GameEvents.JOYSTICK_MOVE_END)
	private onJoystickMoveEnd() {
		this._currentVelocity.set(Vec3.ZERO);
		gameEventTarget.emit(GameEvents.SOUND_STOP, 'step');
	}

	private updateRotation(deltaTime: number) {
		const targetAngle = math.toDegree(Math.atan2(this._currentVelocity.x, this._currentVelocity.z));

		Quat.fromEuler(this._targetQuat, 0, targetAngle, 0);
		const currentQuat = this.node.rotation.clone();
		const smoothedQuat = new Quat();
		const factor = 1 - Math.exp(-15 * deltaTime);

		Quat.slerp(smoothedQuat, currentQuat, this._targetQuat, factor);

		this.node.rotation = smoothedQuat;
	}

	public getCurrentVelocity() {
		return this._currentVelocity
	}
}
