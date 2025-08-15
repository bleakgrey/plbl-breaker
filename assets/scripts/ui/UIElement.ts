import { _decorator, CCBoolean, Component, Enum, tween, UIOpacity } from 'cc';
import { UIElements } from '../UIElements';
import { handlesEvent } from '../utils/Events';
import { GameEvents } from '../GameEvents';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('UIElement')
@requireComponent(UIOpacity)
export default class extends Component {
	@property({
		type: Enum(UIElements),
	})
	id = UIElements.INVALID;

	@property(CCBoolean)
	isVisible = true;

	opacity: UIOpacity;

	start() {
		this.onVisibilityChanged();
	}

	@handlesEvent(GameEvents.UI_ELEMENT_SHOW)
	protected onElemShow(element: UIElements) {
		if (element !== this.id) {
			return
		}

		this.isVisible = true;
		this.onVisibilityChanged();
	}

	@handlesEvent(GameEvents.UI_ELEMENT_HIDE)
	protected onElemHide(element: UIElements) {
		if (element !== this.id) {
			return
		}

		this.isVisible = false;
		this.onVisibilityChanged();
	}

	protected onVisibilityChanged() {
		if (this.isVisible) {
			this.onShow();
		}
		else {
			this.onHide();
		}
	}

	protected onShow() {
		tween(this.node.getComponent(UIOpacity))
			.to(0.4, { opacity: 255 })
			.start();
	}

	protected onHide() {
		tween(this.node.getComponent(UIOpacity))
			.to(0.1, { opacity: 0 })
			.start();
	}
}


