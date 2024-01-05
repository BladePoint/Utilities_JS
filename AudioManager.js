import { Tween } from './Tween.js';
import { noop } from './constants.js';
import { clamp } from './mathUtils.js';

export class AudioManager {
    static VO = 'voiceOver';
    static BGM = 'backgroundMusic';
    static SFX = 'soundEffects';
    static LOADED_METADATA = 'loadedmetadata';
    static TIME_UPDATE = 'timeupdate';
    static ENDED = 'ended';
    static fadeOutAudio(audio, duration, onComplete=noop) {
        if (audio.paused) {
            onComplete();
            return;
        } else {
            const startInternalVolume = audio.internalVolume;
            const completeTween = () => {
                Tween.putInstance(tween);
                audio.pause();
                audio.internalVolume = startInternalVolume;
                onComplete();
            }
            const tween = Tween.getInstance({
                targetObject: audio,
                targetProperty: 'internalVolume',
                propertyValue: 0,
                duration,
                onComplete: completeTween
            });
            tween.animate();
        }
    }
    constructor() {
        this.tracks = {};
        this._settingVolume = 1;
        this._internalVolume = 1;
    }
    set settingVolume(decimal) {
        this._settingVolume = decimal;
        this.updatePlayingVolume();
    }
    set internalVolume(decimal) {
        this.internalVolume = decimal;
        this.updatePlayingVolume();
    }
    get volume() {return this._settingVolume * this._internalVolume;}
    updatePlayingVolume() {
        for (let trackName in this.tracks) {
            const track = this.tracks[trackName];
            track.updatePlayingVolume();
        }
    }
    addTrack(trackName) {
        if (this.tracks.hasOwnProperty(trackName)) throw new Error(`AudioManager.addTrack: Track "${trackName}" already exists.`);
        else this.tracks[trackName] = new AudioTrack(trackName);
    }
    getTrack(trackName) {
        if (this.tracks.hasOwnProperty(trackName)) return this.tracks[trackName];
        else throw new Error(`AudioManager.getTrack: Track "${trackName}" does not exist.`);
    }
    setTrackVolume(trackName, decimal) {
        const track = this.getTrack(trackName);
        track.settingVolume = decimal;
    }
    /*fadeOutTrack(trackName, duration, onComplete=noop) {
        const track = getTrack(trackName);
        const startInternal = track.internalVolume;
            const completeTween = () => {
                Tween.putInstance(tween);
                track.pausePlaying();
                track.internalVolume = startVolume;
                onComplete();
            }
            const tween = Tween.getInstance({
                targetObject: track,
                targetProperty: 'internalVolume',
                propertyValue: 0,
                duration,
                onComplete: completeTween
            });
            tween.animate();
    }*/
    newAudio(id, trackName) {
        const track = this.getTrack(trackName);
        return new AudioEx(id, track, this);
    }
}
class AudioTrack {
    constructor(name) {
        this.name = name;
        this._settingVolume = 1;
        this._internalVolume = 1;
        this.playing = {};
    }
    set settingVolume(decimal) {
        this._settingVolume = decimal;
        this.updatePlayingVolume();
    }
    get internalVolume() {return this._internalVolume;}
    set internalVolume(decimal) {
        this.internalVolume = decimal;
        this.updatePlayingVolume();
    }
    get volume() {return this._settingVolume * this._internalVolume;}
    addPlaying(id, audio) {
        this.playing[id] = audio;
    }
    removePlaying(id) {
        if (this.playing.hasOwnProperty(id)) delete this.playing[id];
        else throw new Error(`AudioTrack.removePlaying: Track "${this.name}" is not playing an AudioEx with id "${id}".`)
    }
    updatePlayingVolume() {
        for (let id in this.playing) {
            const audio = this.playing[id];
            audio.updateVolume();
        }
    }
    pausePlaying() {
        for (let id in this.playing) {
            const audio = this.playing[id];
            audio.pause();
        }
    }
}

export class AudioEx {
    constructor(id, track, audioManager) {
        this._audio = new Audio();
        this.id = id;
        this.track = track;
        this.audioManager = audioManager;
        this._internalVolume = 1;
        this.metadataCallback = undefined;
        this.updateCallback = undefined;
        this.endCallback = undefined;
    }
    set src(sourceString) {this._audio.src = sourceString;}
    get duration() {return this._audio.duration;}
    get currentTime() {return this._audio.currentTime;}
    set currentTime(time) {this._audio.currentTime = time;}
    get paused() {return this._audio.paused;}
    get internalVolume() {return this._internalVolume;}
    set internalVolume(decimal) {
        this._internalVolume = decimal;
        this.updateVolume();
    }
    addMetadataListener(callback) {
        this.metadataCallback = callback;
        this._audio.addEventListener(AudioManager.LOADED_METADATA, this.interceptMetadataListener);
    }
    interceptMetadataListener = (evt) => {this.metadataCallback(this);}
    removeMetadataListener() {
        this._audio.removeEventListener(AudioManager.LOADED_METADATA, this.interceptMetadataListener);
        this.metadataCallback = null;
    }
    addUpdateListener(callback) {
        this.updateCallback = callback;
        this._audio.addEventListener(AudioManager.TIME_UPDATE, this.interceptUpdateListener);
    }
    interceptUpdateListener = (evt) => {this.updateCallback(this);}
    removeUpdateListener() {
        this._audio.removeEventListener(AudioManager.TIME_UPDATE, this.interceptUpdateListener);
        this.updateCallback = null;
    }
    addEndListener(callback) {
        this.endCallback = callback;
        this._audio.addEventListener(AudioManager.ENDED, this.interceptEndListener);
    }
    interceptEndListener = (evt) => {this.endCallback(this);}
    removeEndListener() {
        this._audio.removeEventListener(AudioManager.ENDED, this.interceptEndListener);
        this.endCallback = null;
        this.track.removePlaying(this.id);
    }
    updateVolume() {this._audio.volume = this.audioManager.volume * this.track.volume * this._internalVolume;}
    play() {
        this.track.addPlaying(this.id, this);
        this.updateVolume();
        this._audio.play();
    }
    pause() {this._audio.pause();}
}