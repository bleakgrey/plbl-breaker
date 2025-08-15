import { _decorator, Node, tween, Tween, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

export interface IMoveObject {
	calcDuration(start: Vec3, end: Vec3): void;

	rotateTowards(pos: Vec3): void;

	moveTo(wPositions: Vec3[], delay?: number, repeat?: number): Promise<void>;
}

@ccclass('MoveObject')
export class MoveObject implements IMoveObject {
	private _object: Node;

	private readonly _speed: number = 3;
	private _direction: Vec3 = new Vec3();

	private _start: Vec3 = new Vec3();
	private _end: Vec3 = new Vec3();

	constructor(node: Node, speed: number) {
		this._object = node;
		this._speed = speed;
	}

	calcDuration(start: Vec3, end: Vec3) {
		this._start.set(start);
		this._end.set(end);

		return this._start.subtract(this._end).length() / this._speed;
	}

	rotateTowards(pos: Vec3) {
		const currentPos = this._object.worldPosition;

		Vec3.subtract(this._direction, currentPos, pos.clone());
		this._direction.normalize();

		Tween.stopAllByTag(Number(this._object.uuid));

		tween(this._object)
			.tag(Number(this._object.uuid))
			.to(0.15, { forward: this._direction })
			.start();
	}

	moveTo(wPositions: Vec3[], delay: number = 0, repeat: number = 1): Promise<void> {
		return new Promise((resolve) => {
			tween(this._object)
				.delay(delay)
				.sequence(
					...wPositions.map((wPos, i, arr) => {
						const prevPos = i === 0 ? this._object.worldPosition : arr[i - 1];
						const duration = this.calcDuration(prevPos, wPos);
						wPos.y = this._object.worldPosition.y;
						
						return tween()
							.to(duration, { worldPosition: wPos }, {
								onStart: () => {
									this.rotateTowards(wPos);
								},
							});
					}),
				)
				.union()
				.repeat(repeat)
				.call(() => {
					resolve();
				})
				.start();
		});
	}
}
