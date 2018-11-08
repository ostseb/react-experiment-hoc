export default function(weights) {
    var totalWeight = 0,
        i,
        random;

    for (i = 0; i < weights.length; i++) {
        totalWeight += parseInt(weights[i]);
    }

    random = Math.random() * totalWeight;

    for (i = 0; i < weights.length; i++) {
        if (random < parseInt(weights[i])) {
            return i;
        }

        random -= parseInt(weights[i]);
    }

    return -1;
};