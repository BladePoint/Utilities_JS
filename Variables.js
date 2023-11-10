export class Variables {
    constructor() {
        this.object = {};
    }
    getVar(property) {
        return this.object[property] || 0;
    }
    setVar(property, value) {
        this.object[property] = value;
    }
    incVar(property, amount = 1) {
        this.setVar(property, this.getVar(property) + amount);
    }
    decVar(property, amount = 1) {
        this.incVar(property, -amount);
    }
    reset() {
        this.object = {};
    }
}
