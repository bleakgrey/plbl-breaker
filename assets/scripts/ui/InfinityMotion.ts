import { _decorator, CCInteger, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("InfinityMotion")
export default class extends Component {
	@property(CCInteger)
	a = 100;

	@property(CCInteger)
	speed = 2;
	
	private time = 0;

	update(dt) {
		this.time += dt * this.speed;

		let x = this.a * Math.sin(this.time);
		let y = this.a * Math.sin(this.time) * Math.cos(this.time);

		this.node.setPosition(x, y, 0); // for 2D, Z stays 0
	}
}
