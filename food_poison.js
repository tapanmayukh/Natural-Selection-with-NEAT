class Food {
    constructor() {
        this.pos = createVector(150 + Math.random() * (width - 2 * 150), 150 + Math.random() * (height - 2 * 150));
    }

    show() {
        strokeWeight(10);
        stroke('green');
        point(this.pos.x, this.pos.y);
    };
}

class Poison {
    constructor() {
        this.pos = createVector(150 + Math.random() * (width - 2 * 150), 150 + Math.random() * (height - 2 * 150));
    }

    show() {
        strokeWeight(10);
        stroke('red');
        point(this.pos.x, this.pos.y);
    };
}