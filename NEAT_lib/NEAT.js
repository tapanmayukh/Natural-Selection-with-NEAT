class NEAT {
	constructor(config) {
		this.creatures = [];
		this.oldCreatures = [];
		this.model = config.model;
		this.exportModel = [];
		this.populationSize = config.populationSize || 500;
		this.mutationRate = config.mutationRate || 0.05;
		this.crossoverMethod = config.crossoverMethod || crossover.RANDOM;
		this.mutationMethod = config.mutationMethod || mutate.RANDOM;
		this.generation = 0;

		for (let i = 0; i < this.model.length; i++) {
			let data = Object.assign({}, this.model[i]);
			if (this.model[i].activationfunc) {
				data.activationfunc = data.activationfunc.name;
				this.exportModel.push(data);
			} else {
				this.exportModel.push(data);
			}
		}

		for (let i = 0; i < this.populationSize; i++) {
			this.creatures.push(new Creature(this.model));
		}
	}

	mutate() {
		for (let i = 0; i < this.populationSize; i++) {
			let genes = this.creatures[i].flattenGenes();
			genes = this.mutationMethod(genes, this.mutationRate);
			this.creatures[i].setFlattenedGenes(genes);
		}
	};

	crossover() {
		for (let i = 0; i < this.populationSize; i++) {
			this.oldCreatures = Object.assign([], this.creatures);
			let parentx = this.pickCreature();
			let parenty = this.pickCreature();

			let genes = this.crossoverMethod(parentx.flattenGenes(), parenty.flattenGenes());
			this.creatures[i].setFlattenedGenes(genes);
		}
	};

	pickCreature() {
		let sum = 0;
		for (let i = 0; i < this.oldCreatures.length; i++) {
			sum += Math.pow(this.oldCreatures[i].score, 2);
		}

		for (let i = 0; i < this.oldCreatures.length; i++) {
			this.oldCreatures[i].fitness = Math.pow(this.oldCreatures[i].score, 2) / sum;
		}
		let index = 0;
		let r = Math.random();
		while (r > 0) {
			r -= this.oldCreatures[index].fitness;
			index += 1;
		}
		index -= 1;
		return this.oldCreatures[index];
	};

	setFitness(fitness, index) {
		this.creatures[index].score = fitness;
	};

	feedForward() {
		for (let i = 0; i < this.creatures.length; i++) {
			this.creatures[i].feedForward();
		}
	};

	doGen() {
		this.crossover();
		this.mutate();
		this.generation++;
		console.log('Generation: ' + this.generation);
	};

	bestCreature() {
		let index = 0;
		let max = -Infinity;
		for (let i = 0; i < this.oldCreatures.length; i++) {
			if (this.oldCreatures[i].fitness > max) {
				max = this.oldCreatures[i].fitness;
				index = i;
			}
		}
		return index;
	};

	getDecisions() {
		let result = [];

		for (let i = 0; i < this.creatures.length; i++) {
			result.push(this.creatures[i].decision());
		}
		return result;
	};

	setInputs(array, index) {
		this.creatures[index].setInputs(array);
	};
}

class Creature {
	constructor(model) {
		this.network = new Network(model);

		this.fitness = 0;
		this.score = 0;
	}

	flattenGenes() {
		let genes = [];

		for (let i = 0; i < this.network.layers.length - 1; i++) {
			for (let w = 0; w < this.network.layers[i].nodes.length; w++) {
				for (let e = 0; e < this.network.layers[i].nodes[w].weights.length; e++) {
					genes.push(this.network.layers[i].nodes[w].weights[e]);
				}
			}

			for (let w = 0; w < this.network.layers[i].bias.weights.length; w++) {
				genes.push(this.network.layers[i].bias.weights[w]);
			}
		}

		return genes;
	};

	setFlattenedGenes(genes) {
		for (let i = 0; i < this.network.layers.length - 1; i++) {
			for (let w = 0; w < this.network.layers[i].nodes.length; w++) {
				for (let e = 0; e < this.network.layers[i].nodes[w].weights.length; e++) {
					this.network.layers[i].nodes[w].weights[e] = genes[0];
					genes.splice(0, 1);
				}
			}

			for (let w = 0; w < this.network.layers[i].bias.weights.length; w++) {
				this.network.layers[i].bias.weights[w] = genes[0];
				genes.splice(0, 1);
			}
		}
	};

	feedForward() {
		this.network.feedForward();
	};

	setInputs(inputs) {
		this.network.layers[0].setValues(inputs);
	};

	decision() {
		let index = -1;
		let max = -Infinity;
		for (let i = 0; i < this.network.layers[this.network.layers.length - 1].nodes.length; i++) {
			if (this.network.layers[this.network.layers.length - 1].nodes[i].value > max) {
				max = this.network.layers[this.network.layers.length - 1].nodes[i].value;
				index = i;
			}
		}
		return index;
	};
}

class Network {
	constructor(model) {
		this.layers = [];
		this.model = model;

		for (let i = 0; i < model.length; i++) {
			this.layers.push(new Layer(model[i].nodeCount, model[i].type, model[i].activationfunc));
		}

		for (let i = 0; i < this.layers.length - 1; i++) {
			this.layers[i].connect(this.layers[i + 1].nodes.length);
		}
	}

	feedForward() {
		for (let i = 0; i < this.layers.length - 1; i++) {
			this.layers[i].feedForward(this.layers[i + 1]);
		}
	};
}

class Layer {
	constructor(nodeCount, type, activationfunc) {
		this.nodes = [];
		this.bias = undefined;
		this.type = type;
		this.activationfunc = activationfunc;

		for (let i = 0; i < nodeCount; i++) {
			this.nodes.push(new Node());
		}

		if (this.type !== "output")
			this.bias = new Node();
	}

	connect(count) {
		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].initWeights(count);
		}

		if (this.bias !== undefined)
			this.bias.initWeights(count);
	};

	feedForward(layer) {
		for (let i = 0; i < this.bias.weights.length; i++) {
			layer.nodes[i].value = 0;
		}

		for (let i = 0; i < this.nodes.length; i++) {
			for (let w = 0; w < this.nodes[i].weights.length; w++) {
				layer.nodes[w].value += this.nodes[i].value * this.nodes[i].weights[w];
			}
		}

		for (let w = 0; w < this.bias.weights.length; w++) {
			layer.nodes[w].value += this.bias.weights[w];
		}

		if (layer.activationfunc.name !== "SOFTMAX")
			for (let w = 0; w < layer.nodes.length; w++)
				layer.nodes[w].value = layer.activationfunc(layer.nodes[w].value);
		else
			layer.setValues(layer.activationfunc(layer.getValues()));
	};

	getValues() {
		let result = [];
		for (let i = 0; i < this.nodes.length; i++) {
			result.push(this.nodes[i].value);
		}
		return result;
	};

	setValues(values) {
		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].value = values[i];
		}
	};
}

class Node {
	constructor() {
		this.value = 0;
		this.weights = [];
	}

	initWeights(count) {
		for (let i = 0; i < count; i++) {
			this.weights.push((Math.random() * 2) - 1);
		}
	};
}

let activation = {
	RELU: function (x) {
		if (x > 0) return x;
		else return 0;
	},
	TANH: function (x) {
		return Math.tanh(x);
	},
	SIGMOID: function (x) {
		return (1 / (1 + Math.exp(-x)));
	},
	LEAKY_RELU: function (x) {
		if (x > 0) return x;
		else return (x * 0.01);
	},
	SOFTMAX: function (array) {
		let sum = 0;
		let result = [];
		for (let i = 0; i < array.length; i++) {
			sum += Math.exp(array[i]);
		}
		for (let i = 0; i < array.length; i++) {
			result.push(Math.exp(array[i]) / sum);
		}
		return result;
	}
}

let crossover = {
	// Randomly take genes from parent_x or parent_y and return newly created genes.
	RANDOM: function (genesx, genesy) {
		let newGenes = [];

		for (let i = 0; i < genesx.length; i++) {
			if (Math.random() < 0.5) newGenes.push(genesx[i]);
			else newGenes.push(genesy[i]);
		}

		return newGenes;
	},
	 // Takes a starting and an ending point in parent_x's genes removes the genes in between and replaces them with parent_y's genes.
	SLICE: function (genesx, genesy) {
		let start = Math.floor(Math.random() * (genesx.length));
		let end = Math.floor(Math.random() * (genesx.length - start + 2)) + start + 1;
		let cutPart = genesx.splice(start, end);

		Array.prototype.splice.apply(genesy, [start, cutPart.length].concat(cutPart));

		return genesy;

	}
}

let mutate = {
	// Randomly sets the weights to a completely random value.
	RANDOM: function (genes, mutationRate) {
		for (let i = 0; i < genes.length; i++) {
			if (Math.random() < mutationRate) genes[i] = (Math.random() * 2) - 1;
		}
		return genes;
	}
}

