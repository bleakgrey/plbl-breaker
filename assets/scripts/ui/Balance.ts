import { _decorator, Component, Label, Node, Sprite, UITransform, tween, Vec3 } from "cc";
import { handlesEvent } from "../utils/Events";
import { GameEvents } from "../GameEvents";
import Strings from "../Strings";
const { ccclass, property } = _decorator;

@ccclass("Balance")
export default class extends Component {
	@property(Sprite)
	bg: Sprite;

	@property(Sprite)
	fg: Sprite;

	@property(Label)
	label: Label;

	@property(Sprite)
	icon: Sprite;

	private get bgTransform() {
		return this.bg.getComponent(UITransform);
	}
	private get fgTransform() {
		return this.fg.getComponent(UITransform);
	}

	private lastValue = 0;

	@handlesEvent(GameEvents.UPDATE_BALANCE)
	private onBalanceUpdate(value: number, maxValue: number) {
		const percent = value / maxValue;
		const fullWidth = this.bgTransform.width;
		const targetWidth = fullWidth * percent;

		this.label.string = Strings.BALANCE
			.replace("{0}", String(value))
			.replace("{1}", String(maxValue));

		tween(this.fgTransform)
			.to(0.15, { width: targetWidth }, { easing: "circIn" })
			.start();

		if (this.icon) {
			if (this.lastValue > value) {
				tween(this.icon.node)
					.set({ angle: 360 })
					.to(0.5, { angle: 0 }, { easing: "circInOut" })
					.start();
			} else {
				tween(this.icon.node)
					.set({ scale: new Vec3(1.25, 1.25, 1.25) })
					.to(0.25, { scale: Vec3.ONE }, { easing: "bounceOut" })
					.start();
			}
		}

		this.lastValue = value;
	}
}
