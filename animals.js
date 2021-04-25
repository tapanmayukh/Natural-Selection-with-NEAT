class Animal {
    constructor() {
        this.prev_dir = null;
        this.r = 8;
        this.lifetime = 150;
        this.food_eaten = 0;
        this.dead = false;
        this.boundary = false;

        let temp = Math.random();
        if (temp < 0.25) {
            this.pos = createVector(3 * this.r, 2 * this.r + Math.random() * (height - 8 * this.r));
        }
        else if (temp < 0.5) {
            this.pos = createVector(width - 3 * this.r, 2 * this.r + Math.random() * (height - 8 * this.r));
        }
        else if (temp < 0.75) {
            this.pos = createVector(2 * this.r + Math.random() * (width - 8 * this.r), 3 * this.r);
        }
        else {
            this.pos = createVector(2 * this.r + Math.random() * (width - 8 * this.r), height - 3 * this.r);
        }
        this.speed = 10;
    }

    check_boundaries() {
        if (!this.dead) {
            if ((this.pos.x > width - this.r) || (this.pos.x < this.r) || (this.pos.y < this.r) || (this.pos.y > height - this.r)) {
                this.dead = true;
                this.boundary = true;
            }
        }
    };

    get_score() {
        let score = 5 * this.food_eaten + (150 + this.food_eaten * 15 - this.lifetime) / 100;
        if (this.boundary) {
            score = score - 3;
        }

        if (score < 0) {
            score = 0;
        }
        return score;
    };

    update(foods, poisons, dir) {
        if (!this.dead) {            
            if (dir === 0) {
                this.pos.x = this.pos.x - this.speed;
            }
            else if (dir === 1) {
                this.pos.x = this.pos.x + this.speed;
            }
            else if (dir === 2) {
                this.pos.y = this.pos.y - this.speed;
            }
            else if (dir === 3) {
                this.pos.y = this.pos.y + this.speed;
            }

            this.lifetime = this.lifetime - 1;
            if (this.lifetime == 0) {
                this.dead = true;
            }

            if (!this.prev_dir) {
                this.prev_dir = dir;
            }
            else if (this.prev_dir == 0 && dir == 1) {
                this.dead = true;
            }
            else if (this.prev_dir == 1 && dir == 0) {
                this.dead = true;
            }
            else if (this.prev_dir == 2 && dir == 3) {
                this.dead = true;
            }
            else if (this.prev_dir == 3 && dir == 2) {
                this.dead = true;
            }

            let food_idx = this.nearest_food(foods);
            if (food_idx !== null && (this.pos.dist(foods[food_idx].pos) < 2 * this.r)) {
                foods.splice(food_idx, 1);
                this.food_eaten++;
                this.lifetime = this.lifetime + 15;
            }

            let poison_idx = this.nearest_poison(poisons);
            if (poison_idx !== null && (this.pos.dist(poisons[poison_idx].pos) < 2 * this.r)) {
                poisons.splice(poison_idx, 1);
                this.dead = true;
            }
        }
    };

    show() {
        if (!this.dead) {
            strokeWeight(1);
            stroke(255);
            fill(127, 127, 127);
            circle(this.pos.x, this.pos.y, 2 * this.r);
        }
    };

    nearest_food(foods) {
        let min_dist = Infinity;
        let idx = null;
        for (let i = 0; i < foods.length; i++) {
            let dist = this.pos.dist(foods[i].pos);
            if (dist < min_dist) {
                idx = i;
                min_dist = dist;
            }
        }

        return idx;
    };

    nearest_poison(poisons) {
        let min_dist = Infinity;
        let idx = null;
        for (let i = 0; i < poisons.length; i++) {
            let dist = this.pos.dist(poisons[i].pos);
            if (dist < min_dist) {
                idx = i;
                min_dist = dist;
            }
        }

        return idx;
    };

    get_inputs(foods, poisons) {
        let inputs = [];
        
        inputs[0] = map(this.pos.x, 0, width, 0, 1);
        inputs[1] = map(this.pos.y, 0, height, 0, 1);

        let food_idx = this.nearest_food(foods);
        if (food_idx) {
            inputs[2] = map(foods[food_idx].pos.x, 150, width - 150, 0, 1);
            inputs[3] = map(foods[food_idx].pos.y, 150, height - 150, 0, 1);
        }
        else {
            inputs[2] = 0;
            inputs[3] = 0;
        }

        let poison_idx = this.nearest_poison(poisons);
        if (poison_idx) {
            inputs[4] = map(poisons[poison_idx].pos.x, 150, width - 150, 0, 1);
            inputs[5] = map(poisons[poison_idx].pos.y, 150, height - 150, 0, 1);
        }
        else {
            inputs[4] = 0;
            inputs[5] = 0;
        }

        return inputs;
    };
}