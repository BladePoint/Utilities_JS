export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
export function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}
export function secondsToHHMMSS(seconds) {
    seconds = Math.round(seconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const HH = hours > 0 ? (hours < 10 ? '0' + hours : hours) + ':' : '';
    const MM = minutes < 10 ? '0' + minutes : minutes;
    const SS = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    return `${HH}${MM}:${SS}`;
}
