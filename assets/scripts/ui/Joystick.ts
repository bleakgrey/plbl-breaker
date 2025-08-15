import { _decorator, Camera, Component, director, Node, tween, UIOpacity, v2, Vec2, Vec3 } from 'cc';

import { gameEventTarget, handlesEvent } from 'db://assets/scripts/utils/Events';
import { GameEvents } from 'db://assets/scripts/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('Joystick')
export default class extends Component {
	@property(Node)
	stick: Node;

	@property
	considerCameraRotation: boolean = true;

	@property
	maxRadius: number = 100;

	private _isActive = false;
	private _uiOpacity: UIOpacity;
	private _isWork = true;

	private _screenPos = new Vec3();
	private _cJoystickWorldPos: Vec3 = new Vec3();

	uiCamera: Camera = null;
	mainCamera: Camera = null;

	onLoad() {
		this._uiOpacity = this.getComponent(UIOpacity);
		[this.mainCamera, this.uiCamera] = director.getScene().getComponentsInChildren(Camera);
	}

	onEnable() {
		this._uiOpacity.opacity = 0;
	}

	isOnJoystick = true;

	@handlesEvent(GameEvents.JOYSTICK_TOGGLE)
	private onJoystickToggle(isOn: boolean) {
		this.isOnJoystick = isOn;

		if (!isOn) {
			this.onJoystickMoveEnd();
		}
	}

	@handlesEvent(GameEvents.INPUT_DOWN)
	private onJoystickMoveStart(startPos: Vec2) {
		if (!this.isOnJoystick) {
			return;
		}
		if (!this._isWork) {
			this._isActive = false;
			return;
		}

		this._isActive = true;

		// tween(this._uiOpacity)
		// 	.showOpacity(0.05, 'sineIn')
		// 	.start();
		
		this._uiOpacity.opacity = 255;

		this._screenPos.set(startPos.x, startPos.y, 0);
		const startWorldPos = this.uiCamera.screenToWorld(this._screenPos);
		// const startWorldPos = this.uiCamera.screenToWorld(new Vec3(startPos.x, startPos.y, 0));
		this.node.worldPosition = startWorldPos;
		this.stick.setPosition(Vec3.ZERO);

		gameEventTarget.emit(GameEvents.JOYSTICK_MOVE_START);
	}

	@handlesEvent(GameEvents.INPUT_UP)
	@handlesEvent(GameEvents.INPUT_CANCEL)
	private onJoystickMoveEnd() {
		if (!this._isWork) {
			this._isActive = false;
			return;
		}

		this._isActive = false;

		this._uiOpacity.opacity = 0;
		// tween(this._uiOpacity)
		// 	.hideOpacity(0.05, 'sineOut')
		// 	.start();

		gameEventTarget.emit(GameEvents.JOYSTICK_MOVE_END);
	}

	@handlesEvent(GameEvents.INPUT_MOVE)
	private onJoystickMove(cTouchPos: Vec2, dPos: Vec2) {
		if (!this.isOnJoystick) {
			return;
		}

		if (!this._isWork) {
			this._isActive = false;
			return;
		}

		if (this._isActive) {
			this._screenPos.set(cTouchPos.x, cTouchPos.y, 0);
			this.uiCamera.screenToWorld(this._screenPos, this._cJoystickWorldPos);

			// this.uiCamera.screenToWorld(new Vec3(cTouchPos.x, cTouchPos.y, 0), this._cJoystickWorldPos);

			const delta = this._cJoystickWorldPos.subtract(this.node.worldPosition);
			const radius = Math.min(this.maxRadius, delta.length());
			delta.normalize();
			const offset = delta.multiplyScalar(radius);

			const force = radius / this.maxRadius < 0.05 ? 0 : 1;

			const direction = this.considerCameraRotation
				? this._getDirectionVectorRelativeToCamera(dPos, this.mainCamera.node).multiplyScalar(force)
				: dPos.multiplyScalar(force);

			this.stick.setPosition(offset);

			gameEventTarget.emit(GameEvents.JOYSTICK_MOVE, direction.normalize());
		}
	}

	private _getDirectionVectorRelativeToCamera = (direction: Vec2, camera: Node): Vec2 => {
		const angle = camera.eulerAngles.y * Math.PI / 180;

		const cosAngle = Math.cos(angle);
		const sinAngle = Math.sin(angle);

		const rotatedX = direction.x * cosAngle - direction.y * sinAngle;
		const rotatedY = direction.x * sinAngle + direction.y * cosAngle;

		return v2(rotatedX, rotatedY);
	};
}
