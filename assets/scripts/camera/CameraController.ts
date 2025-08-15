import { _decorator, Camera, Component, Node, tween, v3, Vec3, view, math } from 'cc';

import { GameEvents } from 'db://assets/scripts/GameEvents';
import { expoLerp } from 'db://assets/scripts/utils/Utils';
import { gameEventTarget } from 'db://assets/scripts/utils/Events';

const { ccclass, property, disallowMultiple } = _decorator;

@ccclass('CameraSetup')
class CameraSetup {
	@property(Node)
	target: Node;

	@property
	followDistanceP: number = 10;
	@property
	followDistanceL: number = 10;
	@property
	thetaDeg: number = 0;
	@property
	phiDeg: number = 0;

	@property
	isOrthoCamera: boolean = false;

	@property({
		visible() {
			return !!this.isOrthoCamera;
		},
	})
	orthoHeightP: number = 5;

	@property({
		visible() {
			return !!this.isOrthoCamera;
		},
	})
	orthoHeightL: number = 5;
}

@ccclass('CameraController')
@disallowMultiple(true)
export default class extends Component {
	@property(Node)
	targetProxy: Node;

	@property([CameraSetup])
	cameraSetups: CameraSetup[] = [];

	@property
	shakeMagnitude: number = 3;

	private _cTarget: Node;
	private _cSetupIndex: number = 0;
	private _cDist: number = 0;
	private _cTheta: number = 0;
	private _cPhi: number = 0;
	private _cShakeAngle: number = 0;
	private _cOrthoHeigth: number = 0;
	private _isActiveTransition: boolean = false;

	onEnable() {
		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	start() {
		this._updateCurrentParameters();
		this._positionCamera();
	}

	private smoothing = 10;

	lateUpdate(dt: number) {
		if (!this._cTarget || this._isActiveTransition || dt <= 0 || isNaN(dt)) return;

		const target = this._cTarget.worldPosition;
		const current = this.targetProxy.worldPosition;

		const newPos = expoLerp(current, target, this.smoothing, dt);
		this.targetProxy.setWorldPosition(newPos);

		this._positionCamera();
	}

	private _subscribeEvents(isOn: boolean): void {
		const func: string = isOn ? 'on' : 'off';

		view[func]('canvas-resize', this.onCanvasResize, this);
		gameEventTarget[func](GameEvents.CAMERA_TRANSITION, this.action, this);
	}

	private _positionCamera() {
		const targetPos = this.targetProxy.worldPosition;

		const x = targetPos.x + this._cDist * Math.sin(this._cTheta) * Math.sin(this._cPhi);
		const y = targetPos.y + this._cDist * Math.cos(this._cTheta);
		const z = targetPos.z + this._cDist * Math.sin(this._cTheta) * Math.cos(this._cPhi);

		const xAngle = this._cTheta * 180 / Math.PI - 90 + this._cShakeAngle;
		const yAngle = this._cPhi * 180 / Math.PI;

		this.node.setWorldPosition(x, y, z);
		this.node.eulerAngles = new Vec3(xAngle, yAngle, 0);
	}

	private _updateCurrentParameters() {
		const isLand = view.getVisibleSize().width > view.getVisibleSize().height;

		const cSetup = this.cameraSetups[this._cSetupIndex];

		this._cTarget = cSetup.target;
		this._cDist = isLand ? cSetup.followDistanceL : cSetup.followDistanceP;
		this._cTheta = cSetup.thetaDeg / 180 * Math.PI;
		this._cPhi = cSetup.phiDeg / 180 * Math.PI;

		this._cOrthoHeigth = isLand ? cSetup.orthoHeightL : cSetup.orthoHeightP;

		const targetPos = this._cTarget.worldPosition;
		this.targetProxy.setWorldPosition(targetPos);

		cSetup.isOrthoCamera && this.adjustOrthoHeight(this._cOrthoHeigth, 0.2);
	}

	onCanvasResize() {
		this._updateCurrentParameters();
	}

	action(setupIndex: number, time: number = 0.8, cb: () => void) {
		this._isActiveTransition = true;

		const newSetup = this.cameraSetups[setupIndex];
		const currSetup = this.cameraSetups[this._cSetupIndex];
		this._cTarget = newSetup.target;
		const isLand = view.getVisibleSize().width > view.getVisibleSize().height;

		this._cSetupIndex = setupIndex;

		const dPos = Vec3.subtract(new Vec3, newSetup.target.worldPosition.clone(), currSetup.target.worldPosition.clone());

		tween(this.targetProxy)
			.by(time, { worldPosition: dPos }, {
				onUpdate: (target, ratio) => {
					this._cDist = isLand ? newSetup.followDistanceL * ratio + currSetup.followDistanceL * (1 - ratio) :
						newSetup.followDistanceP * ratio + currSetup.followDistanceP * (1 - ratio);
					this._cTheta = (newSetup.thetaDeg * ratio + currSetup.thetaDeg * (1 - ratio)) / 180 * Math.PI;
					this._cPhi = (newSetup.phiDeg * ratio + currSetup.phiDeg * (1 - ratio)) / 180 * Math.PI;

					this._positionCamera();

				},
				easing: 'sineInOut',
			})
			.call(() => {
				this.scheduleOnce(() => {
					this._isActiveTransition = false;
				}, 0.1);

				cb?.();
			})
			.start();
	}

	adjustOrthoHeight(newHeight: number, duration: number = 0.5) {
		const camera = this.node.getComponent(Camera);
		const initialHeight = camera.orthoHeight;
		const t = { value: 0 };

		tween(t)
			.to(duration, { value: 1 }, {
				easing: 'linear',
				onUpdate: () => {
					camera.orthoHeight = initialHeight + t.value * (newHeight - initialHeight);
				},
			})
			.start();
	}
}
