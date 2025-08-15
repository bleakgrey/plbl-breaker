import { _decorator, Component, CCInteger, sys, director } from 'cc';
import { gameEventTarget, handlesEvent } from 'db://assets/scripts/utils/Events';
import { GameEvents } from 'db://assets/scripts/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('PlayableManager')
export default class extends Component {
	@property
	iOsUrl: string = '';

	@property
	androidUrl: string = '';

	@property(CCInteger)
	clicksToRedirect: number = 999;

	onLoad() {
		//@ts-ignore
		window.gameReady && window.gameReady();

		//@ts-ignore
		window.super_html && window.super_html.game_ready();

		//@ts-ignore
		window.super_html && (window.super_html.appstore_url = this.iOsUrl);

		//@ts-ignore
		window.super_html && (window.super_html.google_play_url = this.androidUrl);
	}

	@handlesEvent(GameEvents.INPUT_UP)
	onInputUp() {
		this.clicksToRedirect--;

		if (this.clicksToRedirect <= 0) {
			gameEventTarget.emit(GameEvents.REDIRECT)
		}
	}

	@handlesEvent(GameEvents.REDIRECT)
	onRedirectProcessing() {
		const url = /android/i.test(navigator.userAgent) ? this.androidUrl : this.iOsUrl;
		console.log(`Redirect to: ${url}`)

		// @ts-ignore
		window.gameEnd && window.gameEnd();

		//@ts-ignore
		window.super_html && window.super_html.game_end();

		try {
			// @ts-ignore
			window.AdRedirectProcessing && window.AdRedirectProcessing();

			//@ts-ignore
			window.super_html && window.super_html.download();
		} catch (e) {
			window[decodeURIComponent('%6c') + 'ocation'].href = url;
		}
	}
}
