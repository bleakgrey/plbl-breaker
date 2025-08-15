import {
	_decorator,
	CCInteger,
	Component,
	math,
	MeshRenderer,
	Quat,
	randomRange,
	tween,
	Vec3,
	Vec4,
} from "cc";
import { gameEventTarget, handlesEvent } from "../utils/Events";
import { GameEvents, IBubbleEvent, IDamageEvent } from "../GameEvents";
import { provide, unprovide } from "../utils/Locator";
import { GameServices } from "../GameServices";
import Strings from "../Strings";
const { ccclass, property, disallowMultiple } = _decorator;

@ccclass("Health")
@disallowMultiple(true)
export default class extends Component {
	@property(CCInteger)
	maxValue: number = 1;

	@property(MeshRenderer)
	flashMeshComp: MeshRenderer;

	private value: number;

	private flashState = new Vec4(1, 1, 1, 1);

	private damageColor = math.Color.fromHEX(new math.Color(), "#cd544f");

	getValue() {
		return this.value;
	}

	isDead() {
		return this.getValue() <= 0;
	}

	onLoad() {
		this.value = this.maxValue;
		provide(GameServices.DESTRUCTIBLE, this.node);
	}

	@handlesEvent(GameEvents.DAMAGE_INFLICT)
	private onDamageInflicted(ev: IDamageEvent) {
		if (ev.node == this.node) {
			this.takeDamage(ev);
		}
	}

	private takeDamage(ev: IDamageEvent) {
		this.playBounceAnim();
		gameEventTarget.emit(GameEvents.DAMAGE_TAKEN, ev);

		const textRange = 0.45;
		const bubbleEvent: IBubbleEvent = {
			text: Strings.BLOCKED,
			tint: math.Color.GRAY,
			worldPos: ev.node.getWorldPosition().clone().add3f(
				randomRange(-textRange, textRange),
				randomRange(-textRange, textRange),
				randomRange(-textRange, textRange),
			),
		};

		if (!ev.blocked) {
			this.playFlashAnim();
		}

		if (ev.blocked) {
			gameEventTarget.emit(GameEvents.BUBBLE, bubbleEvent);
		} else {
			bubbleEvent.text = String(ev.amount);
			bubbleEvent.tint = this.damageColor;
			gameEventTarget.emit(GameEvents.BUBBLE, bubbleEvent);

			this.value -= ev.amount;

			if (this.isDead()) {
				this.die();
			}
		}
	}

	private die() {
		unprovide(GameServices.DESTRUCTIBLE, this.node);
		gameEventTarget.emit(GameEvents.DIED, this.node);

		this.playDeathAnim();
	}

	private playBounceAnim() {
		tween(this.flashMeshComp.node)
			.by(0, { scale: new Vec3(0.1, 0.1, 0.1) })
			.by(0.15, { scale: new Vec3(-0.1, -0.1, -0.1) }, {
				easing: "bounceOut",
			})
			.start();
	}

	private playFlashAnim() {
		const matInstance = this.flashMeshComp.getMaterialInstance(0);
		matInstance.setProperty(
			"albedoScaleAndCutoff",
			this.flashState,
		);

		tween(this.flashState)
			.set({ x: 10, y: 10, z: 10, w: 10 })
			.to(0.1, { x: 1, y: 1, z: 1, w: 1 }, {
				onUpdate: (target, ratio) => {
					matInstance.setProperty(
						"albedoScaleAndCutoff",
						this.flashState,
					);
				},
			})
			.start();
	}

	private playDeathAnim() {
		tween(this.flashMeshComp.node)
			.to(0.3, { scale: Vec3.ZERO }, { easing: "bounceOut" })
			.start();

		tween(this.flashMeshComp.node)
			.by(0.3, {
				position: new Vec3(0, -1, 0),
				rotation: new Quat(0.1, 0.1, 0.1),
			})
			.call(() => {
				this.node.destroy();
			})
			.start();
	}
}
