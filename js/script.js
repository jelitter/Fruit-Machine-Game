// -----------------------------------------
//         VARIABLES & CONSTANTS
// -----------------------------------------

// -----------------------------------------
//         FUNCTIONS
// -----------------------------------------

// DOM elements
let settings, handle, fruit1, fruit2, fruit3;

// Timestamp of the last stopped fruit
let lastStop = 0;

let fruits = {
    // Fruit with and height
    fruitSize: 150,
    // Default roll speed in pixels per animation frame
    step: 15,

    // Delay until next fruit starts rolling on a new game
    startDelay: 200,

    // Delay until next fruit stops rolling on finishing game
    stopDelay: 1000,

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
        gameResults = document.getElementById('game-results');
        debug = document.getElementById('debug');
        fruits.elements.push(document.getElementById('f-1'));
        fruits.elements.push(document.getElementById('f-2'));
        fruits.elements.push(document.getElementById('f-3'));

        // Apply initial random positions
        resetFruitPositions();
        // updateDebug();
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
    debug.children[0].textContent = 'Game Info';
    fruits.elements.forEach((fruit, index) => {
        const startDelay = index * fruits.startDelay;
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

    // Blur image when starts rolling for speed effect
    fruit.style.setProperty('filter', 'blur(2px)');

    const interval = setInterval(() => {
        const pos = (fruits.positions[index] += thisStep);
        fruit.style.setProperty('background-position', '0 ' + pos + 'px');
        const now = new Date().getTime();

        if (
            fruits.stopRequested &&
            pos % fruits.fruitSize < 5 &&
            now - lastStop >= fruits.stopDelay
        ) {
            lastStop = now;
            fruits.rolling[index] = false;
            fruits.elements[index].style.setProperty('filter', 'blur(0px)');

            clearInterval(fruits.intervals[index]);

            // True when rolling values are [false, false, false]
            fruits.gameFinished = fruits.rolling.every(rolling => !rolling);
            if (fruits.gameFinished) {
                fruits.intervals = [];
            }
        }

        updateGameObject();
        updateDebug();
        if (fruits.gameFinished) {
            gameResults.textContent = fruits.result;
            console.log('GAME FINISHED');
        }
    }, 16);

    fruits.intervals.push(interval);
};

const updateGameObject = () => {
    const status = fruits.positions.map(
        pos => fruitNames[Math.floor((pos / fruits.fruitSize) % 5)]
    );

    const uniqueFruits = status.reduce((result, current) => {
        return ~result.indexOf(current) ? result : result.concat(current);
    }, []).length;

    const result = fruits.gameFinished
        ? uniqueFruits < 3
            ? `🏆 YOU WIN: ${4 - uniqueFruits} equals!`
            : `💀 YOU LOSE`
        : '❔';

    if (!fruits.gameFinished) {
        gameResults.textContent = status.join('  ');
    }

    fruits = {
        ...fruits,
        status,
        result
    };
};

const updateDebug = () => {
    debug.children[1].textContent = JSON.stringify(fruits, null, 2);
};

const fruitNames = ['🔔', '🍇', '🍒', '7️⃣', '🍋'];
