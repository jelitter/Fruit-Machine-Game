// -----------------------------------------
//         VARIABLES & CONSTANTS
// -----------------------------------------

// -----------------------------------------
//         FUNCTIONS
// -----------------------------------------

// DOM elements
let settings, handle, fruit1, fruit2, fruit3;

const fruits = {
    // Fruit with and height
    fruitSize: 150,
    // Default roll speed in pixels per animation frame
    step: 15,

    // Rolls stop after this time (ms)
    rollsDuration: 5000,

    // To track when the rolls should stop,
    // each fruit then will stop once it's fully displayed
    stopRequested: false,

    // Game can be in progress for a short time while fruits stop rolling
    gameFinished: true,

    // Fruits DOM elements
    elements: [],

    // Background position tracking, starting at a random position between 0px and 600px
    positions: [],
    intervals: [],

    // Fruits shouldn't be rolling on start
    rolling: Array(3).fill(false)
};

// Start execution as soon as the page is fully loaded
document.addEventListener(
    'DOMContentLoaded',
    function() {
        settings = document.getElementById('settings');
        handle = document.getElementById('handle');
        fruits.elements.push(document.getElementById('f-1'));
        fruits.elements.push(document.getElementById('f-2'));
        fruits.elements.push(document.getElementById('f-3'));

        // Apply initial random positions
        resetFruitPositions();
        addEventListeners();
    },
    false
);

const getRandomPosition = () => {
    return Math.floor(Math.random() * 5) * fruits.fruitSize;
};

const resetFruitPositions = () => {
    fruits.positions = [
        getRandomPosition(),
        getRandomPosition(),
        getRandomPosition()
    ];
    fruits.positions.forEach((pos, index) => {
        fruits.elements[index].style.setProperty(
            'background-position',
            '0 ' + pos + 'px'
        );
    });
};

const addEventListeners = () => {
    settings.addEventListener('click', event => {
        console.log('Settings');
    });

    handle.addEventListener('click', event => {
        if (fruits.gameFinished) {
            startRolls();
        } else {
            console.log('Game in progress, please wait');
        }
    });
};

const startRolls = () => {
    console.log('🔔 Starting new game');
    resetFruitPositions();
    fruits.gameFinished = false;
    fruits.stopRequested = false;
    fruits.rolling = Array(3).fill(true);
    fruits.elements.forEach((fruit, index) => {
        const startDelay = index * 1000;
        setTimeout(() => {
            console.log('🍒 Rolling fruit', index);
            rollFruit(fruit, index);
        }, startDelay);
    });

    setTimeout(() => {
        fruits.stopRequested = true;
        console.log(`🛑 Stopping now...`);
    }, fruits.rollsDuration);
};

const rollFruit = (fruit, index) => {
    // Random speed between 15 and 20 pixels per animation frame
    const thisStep = fruits.step + Math.floor(Math.random() * 5);

    const interval = setInterval(() => {
        const pos = (fruits.positions[index] += thisStep);
        fruit.style.setProperty('background-position', '0 ' + pos + 'px');

        if (fruits.stopRequested && pos % fruits.fruitSize < 5) {
            fruits.rolling[index] = false;
            clearInterval(fruits.intervals[index]);
            // fruits.intervals.splice(index, 1);

            // console.log(`🛑 Fruit ${index} stopped.`);

            // True when rolling values are [false, false, false]
            fruits.gameFinished = fruits.rolling.every(rolling => !rolling);
            if (fruits.gameFinished) {
                fruits.intervals = [];
            }
            // console.log(JSON.stringify(fruits.rolling));

            console.log('GAME FINISHED');
            console.log('\n\n\n' + JSON.stringify(fruits, null, 2));
        }

        // console.clear();
        console.log('\n\n\n' + JSON.stringify(fruits, null, 2));
    }, 16);

    fruits.intervals.push(interval);
};

// const stopRolls = () => {
//     fruits.interval.forEach(int => {
//         clearInterval(int);
//     });
//     console.log('🛑 Rolls stopped.');
// };
