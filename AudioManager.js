import { Tween } from './Tween.js';
import { noop } from './constants.js';

export class AudioManager {
    static fadeOut(audio, duration, onComplete=noop) {
        if (audio.paused) {
            onComplete();
            return;
        } else {
            const startVolume = audio.volume;
            const completeTween = () => {
                Tween.putInstance(tween);
                audio.pause();
                audio.volume = startVolume;
                onComplete();
            }
            const tween = Tween.getInstance({
                targetObject: audio,
                targetProperty: 'volume',
                propertyValue: 0,
                duration,
                onComplete: completeTween
            });
            tween.animate();
        }
    }
    constructor() {}
}