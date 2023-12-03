import { noop } from './constants.js';

export class AudioManager {
    static fadeOut(audio, duration, onComplete=noop) {
        if (audio.paused) {
            onComplete();
            return;
        } else {
            var startTime = null;
            var startVolume = audio.volume;
            function fade(timestamp) {
                startTime = startTime || timestamp;
                var elapsed = timestamp - startTime;
                var progress = elapsed / duration;
                if (progress < 1) {
                    audio.volume = startVolume * (1 - progress);
                    requestAnimationFrame(fade);
                } else {
                    audio.pause();
                    audio.volume = startVolume;
                    onComplete();
                }
            }
            requestAnimationFrame(fade);
        }
    }
    constructor() {}
}