const TOTAL = 100;
const food_num = 40;
const poison_num = 20;
let animals = [];
let foods = [];
let poisons = [];
let neat;
let gen;

let config = {
    model: [
        {nodeCount: 6, type: "input"},
        {nodeCount: 4, type: "output", activationfunc: activation.SOFTMAX}
    ],
    mutationRate: 0.15,
    crossoverMethod: crossover.RANDOM,
    mutationMethod: mutate.RANDOM,
    populationSize: TOTAL
};

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < food_num; i++) {
        foods[i] = new Food();
    }

    for (let i = 0; i < poison_num; i++) {
        poisons[i] = new Poison();
    }

    for (let i = 0; i < TOTAL; i++) {
        animals[i] = new Animal();
    }

    neat = new NEAT(config);
    frameRate(30);
}

function draw() {
    background(0);

    for (let animal of animals) {
        animal.show();
    }
    for (let food of foods) {
        food.show();
    }
    for (let poison of poisons) {
        poison.show();
    }

    for (let i = 0; i < TOTAL; i++) {
        neat.setInputs(animals[i].get_inputs(foods, poisons), i);
    }

    textSize(32);
    fill(255);
    stroke(0);
    text("Generation: " + String(neat.generation + 1), 30, 30);

    neat.feedForward();
    let decisions = neat.getDecisions();
    for (let i = 0; i < TOTAL; i++) {
        animals[i].update(foods, poisons, decisions[i]);
        animals[i].check_boundaries();
    }

    let finish = true;
    for (let i = 0; i < animals.length; i++) {
        if (!animals[i].dead) {
            finish = false;
            break;
        }
    }
    if (finish) {
        for (let i = 0; i < TOTAL; i++) {
            neat.setFitness(animals[i].get_score(), i);
            animals[i] = new Animal();
        }
        for (let i = 0; i < food_num; i++) {
            foods[i] = new Food();
        }
        for (let i = 0; i < poison_num; i++) {
            poisons[i] = new Poison();
        }
        neat.doGen();
    }
}