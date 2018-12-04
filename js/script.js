// -----------------------------------------
//         VARIABLES & CONSTANTS
// -----------------------------------------

//
const pathPrefix =
    window.location.href === 'https://jelitter.github.io/Fruit-Machine-Game/'
        ? '/Fruit-Machine-Game'
        : '';

// DOM elements
let settings, info, toggleInfoButton, confetti, handle, fruit1, fruit2, fruit3;
let inputTheme, buttonClose;
let showInfo = false;

// Timestamp of the last stopped fruit
let lastStop = 0;

// Timestamp of the last started game
let gameStarted = 0;

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

    // Each fruit sound when rolling
    sounds: [],
    soundStop: new Audio(`${pathPrefix}/assets/sound/stop.wav`),
    soundWin: new Audio(`${pathPrefix}/assets/sound/win.wav`),
    soundLose: new Audio(`${pathPrefix}/assets/sound/lose.wav`),

    // Background position tracking, starting at a random position between 0px and 600px
    positions: [],
    intervals: [],

    // Fruits shouldn't be rolling on start
    rolling: Array(3).fill(false)
};

// -----------------------------------------
//         FUNCTIONS
// -----------------------------------------

// Start execution as soon as the page is fully loaded
document.addEventListener(
    'DOMContentLoaded',
    function() {
        // Get all DOM elements we're going to manipulate
        settings = document.getElementById('settings');
        toggleInfoButton = document.getElementById('toggle-info');
        info = document.getElementById('info');
        confetti = document.getElementById('confetti');
        handle = document.getElementById('handle');
        gameResults = document.getElementById('game-results');
        fruits.elements.push(document.getElementById('f-1'));
        fruits.elements.push(document.getElementById('f-2'));
        fruits.elements.push(document.getElementById('f-3'));

        inputTheme = document.getElementById('theme');
        buttonClose = document.getElementById('close');

        fruits.sounds = [
            new Audio(`${pathPrefix}/assets/sound/tick.wav`),
            new Audio(`${pathPrefix}/assets/sound/tick.wav`),
            new Audio(`${pathPrefix}/assets/sound/tick.wav`)
        ];
        fruits.sounds.forEach(s => {
            s.loop = true;
            s.volume = 0.4;
        });

        // Apply initial random positions
        resetFruitPositions();
        updateInfo();
        toggleInfo();
        addEventListeners();

        setInterval(() => {
            const val = (new Date().getTime() / 50) % 360;
            toggleInfoButton.style.setProperty(
                'filter',
                `hue-rotate(${val}deg)`
            );
        }, 16);
    },
    false
);

const getRandomPosition = () => {
    return Math.floor(Math.random() * 5) * fruits.fruitSize;
};

const resetFruitPositions = () => {
    // Game starts with fruits at random positions
    fruits.positions = [
        getRandomPosition(),
        getRandomPosition(),
        getRandomPosition()
    ];

    fruits.elements.forEach((fruit, index) => {
        fruit.style.setProperty('transition', 'ease-in');
        fruit.style.setProperty(
            'background-position',
            '0 ' + fruits.positions[index] + 'px'
        );
    });
};

const addEventListeners = () => {
    settings.addEventListener('click', event => {
        const background = document.getElementById('settings-background');
        background.style.setProperty('display', 'flex');
    });
    buttonClose.addEventListener('click', event => {
        console.log('Settings');
        const background = document.getElementById('settings-background');
        background.style.setProperty('display', 'none');
    });

    toggleInfoButton.addEventListener('click', event => toggleInfo());
    info.addEventListener('click', event => toggleInfo());

    handle.addEventListener('click', event => {
        if (fruits.gameFinished) {
            startGame();
        } else {
            console.log('Game in progress, please wait');
        }
    });

    inputTheme.addEventListener('click', event => {
        const checked = document.querySelector('input[name=theme]:checked')
            .value;
        setTheme(checked);
    });
};

const startGame = () => {
    console.log('🔔 Starting new game');

    gameStarted = new Date().getTime();
    resetFruitPositions();
    fruits.gameFinished = false;
    fruits.stopRequested = false;
    fruits.rolling = Array(3).fill(true);
    hideConfetti();
    updateGameObject();
    // updateInfo();
    fruits.elements.forEach((fruit, index) => {
        const startDelay = index * fruits.startDelay;
        setTimeout(() => {
            console.log(`${fruits.status[index]} Rolling fruit`, index);
            rollFruit(fruit, index);
        }, startDelay);
    });

    setTimeout(() => {
        fruits.stopRequested = true;
        console.log(`🛑 Stopping now...`);
    }, fruits.rollsDuration);
};

const rollFruit = (fruit, index) => {
    // Each fruit has a random speed between 15 and 20 pixels per animation frame
    const thisStep = fruits.step + Math.floor(Math.random() * 5);

    // Start roulette sound
    fruits.sounds[index].play();

    // Blur image when starts rolling for speed effect
    fruit.style.setProperty('filter', 'blur(2px)');

    const interval = setInterval(() => {
        let pos = (fruits.positions[index] += thisStep);
        fruits.positions[index] = pos % (fruits.fruitSize * fruitNames.length);
        fruit.style.setProperty('background-position', '0 ' + pos + 'px');
        const now = new Date().getTime();

        if (
            fruits.stopRequested &&
            pos % fruits.fruitSize < 5 &&
            now - lastStop >= fruits.stopDelay
        ) {
            // Slow down the fruit when it's about to stop and add
            // a elastic bounce effect
            if (fruits.remaining < 0.5 + index * fruits.stopDelay) {
                console.log(
                    `Slowing down fruit ${index} at ${
                        fruits.remaining
                    } s. left...`
                );
                fruits.elements[index].style.setProperty(
                    'transition',
                    'all 300ms cubic-bezier(0,1.94,.78,.76)'
                );
                let pos = (fruits.positions[index] += thisStep * 2);
                fruits.positions[index] =
                    pos % (fruits.fruitSize * fruitNames.length);
                fruit.style.setProperty(
                    'background-position',
                    '0 ' + pos + 'px'
                );
            }

            // Snapping final position to a multiple of fruitSize (150px)
            const cut = fruits.positions[index] % fruits.fruitSize;
            if (cut > 0) {
                fruits.positions[index] -= cut;
                fruit.style.setProperty(
                    'background-position',
                    '0 ' + pos + 'px'
                );
            }

            lastStop = now;
            fruits.rolling[index] = false;
            fruits.sounds[index].pause();

            // Makes a stop sound, and a second stop sound a few miliseconds later for an bounce effect
            fruits.soundStop.play();
            setTimeout(() => {
                fruits.soundStop.volume = 0.2;
                fruits.soundStop.play();
                fruits.soundStop.volume = 1;
            }, 90 + Math.random() * 0.5);
            fruits.elements[index].style.setProperty('filter', 'blur(0px)');

            clearInterval(fruits.intervals[index]);

            // True when rolling values are [false, false, false]
            fruits.gameFinished = fruits.rolling.every(rolling => !rolling);
            if (fruits.gameFinished) {
                fruits.intervals = [];
            }
        }

        updateGameObject();
        updateInfo();
        if (fruits.gameFinished) {
            gameResults.textContent = fruits.result;
            console.log(`GAME FINISHED! ${fruits.status.join('')}`);
        }
    }, 16);

    fruits.intervals.push(interval);
};

const updateGameObject = () => {
    const status = fruits.positions.map(
        pos =>
            fruitNames[Math.floor((pos / fruits.fruitSize) % fruitNames.length)]
    );

    const uniqueFruits = status.reduce((result, current) => {
        return ~result.indexOf(current) ? result : result.concat(current);
    }, []).length;

    const result = fruits.gameFinished
        ? uniqueFruits < 3
            ? `${status.join('')} -> 🏆 YOU WIN: ${4 - uniqueFruits} equals!`
            : `${status.join('')} -> 💀 YOU LOSE  `
        : '❔';

    if (!fruits.gameFinished) {
        gameResults.textContent = status.join('');
    } else if (uniqueFruits < 3) {
        launchConfetti();
        fruits.soundWin.play();
    } else {
        fruits.soundLose.play();
    }

    const now = new Date().getTime();
    const diff = now - gameStarted;
    const remaining = (fruits.rollsDuration - diff) / 1000;

    // We make a copy of the Fruits object and add 3 more properties to it
    fruits = {
        ...fruits,
        status,
        result,
        remaining
    };
};

const hideConfetti = () => {
    confetti.style.setProperty('transition', '1000ms ease-in-out');
    confetti.style.setProperty(
        'transform',
        'scale3d(0.1,0.1,1) rotate3d(0,0,0,360deg)'
    );
    setTimeout(() => {
        confetti.style.setProperty(
            'transform',
            'translateY(-100%) scale3d(0.05,0.05,1)'
        );
    }, 3000);
};

const launchConfetti = () => {
    confetti.style.setProperty('transition', '3000ms ease-in-out');
    confetti.style.setProperty('transform', ' scale3d(1,1,1)');
    setTimeout(() => {
        confetti.style.setProperty(
            'transform',
            'translateY(0%) scale3d(1,1,1)'
        );
    }, 3000);
};

const toggleInfo = () => {
    showInfo = !showInfo;
    info.style.setProperty('bottom', showInfo ? '60px' : '-90%');
    info.style.setProperty(
        'transform',
        showInfo
            ? 'perspective(4em) rotateX(0deg)'
            : 'perspective(4em) rotateX(15deg)'
    );
    toggleInfoButton.textContent = `${showInfo ? ' ▼' : ' ▲'} Game info`;
};

const updateInfo = () => {
    const remaining = fruits.remaining ? `${fruits.remaining} s.` : null;

    const infoObject = {
        ...fruits,
        remaining
    };

    // Game object property we won't display as game info
    const discard = [
        'elements',
        'sounds',
        'soundStop',
        'soundWin',
        'soundLose',
        'result'
    ];
    if (!remaining) {
        discard.push('remaining');
    }
    discard.forEach(d => delete infoObject[d]);

    delete infoObject.intervals;
    info.children[0].textContent = 'Game Info';
    info.children[1].textContent = JSON.stringify(infoObject, null, 2);
};

const setTheme = name => {
    const themes = {
        white: {
            backgroundColor: 'whitesmoke',
            fruitFrameColor: 'linen',
            settingsButton: 'cog-black.svg',
            toggleInfoButton: 'slategray',
            gameResults: 'red',
            handle: 'handle-white.png',
            handleBase: 'handle-base-white.png'
        },
        orange: {
            backgroundColor: 'orange',
            fruitFrameColor: '#c34803',
            settingsButton: 'cog-white.svg',
            toggleInfoButton: '#c34803',
            gameResults: 'whitesmoke',
            handle: 'handle.png',
            handleBase: 'handle-base.png'
        }
    };

    const theme = themes[name];

    const body = document.getElementsByTagName('body')[0];
    const fruits = document.getElementsByClassName('fruits')[0];
    const imgHandle = document.getElementById('handle');
    const imgHandleBase = document.getElementById('handle-base');

    body.style.setProperty('background-color', theme.backgroundColor);
    fruits.style.setProperty('background-color', theme.fruitFrameColor);
    toggleInfoButton.style.setProperty(
        'background-color',
        theme.toggleInfoButton
    );
    gameResults.style.setProperty('color', theme.gameResults);
    settings.style.setProperty(
        'background-image',
        `url(${pathPrefix}/assets/img/${theme.settingsButton}`
    );
    imgHandle.style.setProperty(
        'background-image',
        `url(${pathPrefix}/assets/img/${theme.handle}`
    );
    imgHandleBase.style.setProperty(
        'background-image',
        `url(${pathPrefix}/assets/img/${theme.handleBase}`
    );
};

const fruitNames = ['🔔', '🍇', '🍒', '7️⃣', '🍋'];
