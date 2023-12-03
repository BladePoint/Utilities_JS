import { noop } from './constants.js';

export class Tween {
    static pool = [];
    static getInstance(options) {
        let tween;
        if (Tween.pool.length > 0) {
            tween = Tween.pool.pop();
            tween.parseOptions(options);
        } else tween = new Tween(options);
        return tween;
    }
    static putInstance(tween) {
        tween.reset();
        Tween.pool.push(tween);
    }
    static tweenOpacity(element, endOpacity, durationInSeconds, onComplete=noop, delayInSeconds=0) {
        const tween = Tween.getInstance({
            targetObject: element.style,
            targetProperty:'opacity',
            propertyValue: endOpacity,
            duration: durationInSeconds * 1000,
            onComplete: cleanUp
        });
        setTimeout(tween.animate, delayInSeconds*1000);
        function cleanUp() {
            Tween.putInstance(tween);
            onComplete();
        }
    }
    constructor(options) {
        this.isStopped = true;
        this.parseOptions(options);
        this.updateTween = this.updateTween.bind(this);
        this.animate = this.animate.bind(this);
    }
    parseOptions(options) {
        const {targetObject, targetProperty, propertyValue, duration, onUpdate=noop, onComplete=noop} = options;
        this.targetObject = targetObject;
        this.targetProperty = targetProperty;
        this.propertyValue = propertyValue;
        this.duration = duration;
        this.onUpdate = onUpdate;
        this.onComplete = onComplete;
        this.startValue = this.targetObject[this.targetProperty];
        this.deltaValue = propertyValue - this.startValue;
        this.startTime = null;
    }
    updateTween(timestamp) {
        if (this.isStopped) return;
        this.startTime = this.startTime || timestamp;
        const decimalProgress = Math.min(1, (timestamp - this.startTime) / this.duration);
        const decimalRemaining = 1 - decimalProgress;
        this.targetObject[this.targetProperty] = this.startValue*decimalRemaining + this.deltaValue*decimalProgress;
        this.onUpdate();
        if (decimalProgress < 1) requestAnimationFrame(this.updateTween);
        else {
            this.isStopped = true;
            this.onComplete();
        }
    }
    animate() {
        this.isStopped = false;
        requestAnimationFrame(this.updateTween);
    }
    kill() {
        this.isStopped = true;
    }
    reset() {
        this.kill();
        this.targetObject = null;
        this.targetProperty = null;
        this.propertyValue = null;
        this.duration = null;
        this.onUpdate = noop;
        this.onComplete = noop;
        this.startValue = null;
        this.startTime = null;
    }
}