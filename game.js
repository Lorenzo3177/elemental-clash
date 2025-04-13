const elements = ['Fire', 'Water', 'Earth', 'Air'];

let deck = [];
let playerHand = [];
let playerChain = [];
let botHand = [];
let botChain = [];
let vortexCards = [];
let storageCards = [];
let playerHP = 100;
let botHP = 100;
let playerShield = false;
let botShield = false;
let timeLeft = 120;
let timerId = null;
let botTimerId = null;
let eventTimerId = null;
let rushUsed = false;
let botDifficulty = 'medium';
let shards = localStorage.getItem('shards') ? parseInt(localStorage.getItem('shards')) : 0;
let upgrades = JSON.parse(localStorage.getItem('upgrades')) || { handSize: 4, hpBoost: 0, relicChance: 0 };
let botUpgrades = { handSize: 4, hpBoost: 0, relicChance: 0 }; 

// Загрузка звуков
window.isSoundEnabled = true; // Звук включён по умолчанию
window.sounds = {
    backgroundMusic: new Audio('assets/sounds/background-music.mp3'),
    cardPlace: new Audio('assets/sounds/card-place.mp3'),
    chainActivate: new Audio('assets/sounds/chain-activate.mp3'),
    rushActivate: new Audio('assets/sounds/rush-activate.mp3'),
    vortexDrop: new Audio('assets/sounds/vortex-drop.mp3'),
    eventTrigger: new Audio('assets/sounds/event-trigger.mp3'),
    buttonClick: new Audio('assets/sounds/button-click.mp3'),
    effectFire: new Audio('assets/sounds/effect-fire.mp3'),
    effectWater: new Audio('assets/sounds/effect-water.mp3'),
    effectEarth: new Audio('assets/sounds/effect-earth.mp3'),
    effectAir: new Audio('assets/sounds/effect-air.mp3'),
    missionComplete: new Audio('assets/sounds/mission-complete.mp3')
};

// Функция для воспроизведения звука
window.playSound = function(sound) {
    if (window.isSoundEnabled && sound) {
        console.log('Playing sound:', sound.src);
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.error('Sound playback failed:', error);
        });
    } else {
        console.log('Sound not played: isSoundEnabled =', window.isSoundEnabled, 'sound =', sound);
    }
};

// Список всех возможных Relics
const allRelics = [
    { name: 'Fire Blade', element: 'Fire', effect: 'boostDamage' },
    { name: 'Ocean Tear', element: 'Water', effect: 'doubleHeal' },
    { name: 'Eternal Stone', element: 'Earth', effect: 'permShield' },
    { name: 'Chaos Vortex', element: 'Air', effect: 'resetChains' }
];

let playerChainDiv, botChainDiv, handDiv, vortexDiv, storageDiv, playerHPDiv, botHPDiv, shardsDiv, timerDiv, eventTextDiv, activateBtn, rushBtn, resetBtn, backToMenuBtn;

function createDeck(useBotUpgrades = false) {
    deck = [];
    for (let i = 1; i <= 15; i++) {
        elements.forEach(element => deck.push({ number: i, element }));
    }
    allRelics.forEach(relic => {
        const relicChance = useBotUpgrades ? botUpgrades.relicChance : upgrades.relicChance;
        if (Math.random() < 0.2 + relicChance) {
            deck.push(relic);
            console.log(`Added Relic to deck: ${relic.name} (${relic.element})`);
        }
    });
    deck = deck.sort(() => Math.random() - 0.5);
}

function drawCard() {
    if (deck.length > 0) {
        return deck.pop();
    } else {
        // Если колода пуста, генерируем случайную карту (число от 1 до 15, случайная стихия)
        const number = Math.floor(Math.random() * 15) + 1;
        const element = elements[Math.floor(Math.random() * elements.length)];
        return { number, element };
    }
}

function setupBotUpgrades() {
    // 30% шанс, что бот будет прокачан
    if (Math.random() < 0.3) {
        // Прокачка бота не должна превышать прокачку игрока
        botUpgrades.handSize = Math.min(upgrades.handSize, 4 + Math.floor(Math.random() * (upgrades.handSize - 4 + 1)));
        botUpgrades.hpBoost = Math.min(upgrades.hpBoost, Math.floor(Math.random() * (upgrades.hpBoost / 10 + 1)) * 10);
        botUpgrades.relicChance = Math.min(upgrades.relicChance, Math.floor(Math.random() * (upgrades.relicChance / 0.1 + 1)) * 0.1);
        console.log(`Bot upgrades applied:`, botUpgrades);
    } else {
        botUpgrades = { handSize: 4, hpBoost: 0, relicChance: 0 };
        console.log(`Bot has no upgrades.`);
    }
}

window.startGame = function(isCampaign = false, campaignLevel = null) {
    // Обновляем upgrades из localStorage перед началом игры
    upgrades = JSON.parse(localStorage.getItem('upgrades')) || { handSize: 4, hpBoost: 0, relicChance: 0 };

    // Настройка прокачки бота
    setupBotUpgrades();

    playerChainDiv = document.getElementById('player-chain');
    botChainDiv = document.getElementById('bot-chain');
    handDiv = document.getElementById('hand');
    vortexDiv = document.getElementById('vortex');
    storageDiv = document.getElementById('storage');
    playerHPDiv = document.getElementById('player-hp');
    botHPDiv = document.getElementById('bot-hp');
    shardsDiv = document.getElementById('shards');
    timerDiv = document.getElementById('timer');
    eventTextDiv = document.getElementById('event-text');
    activateBtn = document.getElementById('activate-btn');
    rushBtn = document.getElementById('rush-btn');
    resetBtn = document.getElementById('reset-btn');
    backToMenuBtn = document.getElementById('back-to-menu-btn');

    if (!playerChainDiv || !botChainDiv || !handDiv || !vortexDiv || !storageDiv || !playerHPDiv || !botHPDiv || !shardsDiv || !timerDiv || !eventTextDiv || !activateBtn || !rushBtn || !resetBtn || !backToMenuBtn) {
        console.error('One or more DOM elements not found. Check your HTML IDs.');
        return;
    }

    createDeck();
    playerHand = [];
    playerChain = [drawCard()];
    botHand = [];
    botChain = [drawCard()];
    vortexCards = [];
    storageCards = [];
    playerHP = 100 + upgrades.hpBoost;
    botHP = 100 + botUpgrades.hpBoost + (isCampaign ? campaignLevel * 10 : 0);
    playerShield = false;
    botShield = false;
    timeLeft = 120;
    rushUsed = false;
    for (let i = 0; i < upgrades.handSize; i++) {
        playerHand.push(drawCard());
    }
    for (let i = 0; i < botUpgrades.handSize; i++) {
        botHand.push(drawCard());
    }
    render();
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('campaign-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    timerId = setInterval(updateTimer, 1000);
    const botInterval = botDifficulty === 'easy' ? 4000 : botDifficulty === 'medium' ? 3000 : 2000;
    botTimerId = setInterval(() => botPlay(campaignLevel), botInterval);
    eventTimerId = setInterval(triggerEvent, 20000);
};

function updateTimer() {
    timeLeft--;
    timerDiv.textContent = `Time: ${timeLeft}`;
    if (timeLeft <= 0 || playerHP <= 0 || botHP <= 0) {
        endGame();
    }
}

function endGame() {
    clearInterval(timerId);
    clearInterval(botTimerId);
    clearInterval(eventTimerId);
    const winner = playerHP <= 0 ? 'Bot' : botHP <= 0 ? 'Player' : playerHP > botHP ? 'Player' : 'Bot';
    if (winner === 'Player') {
        shards += botDifficulty === 'easy' ? 5 : botDifficulty === 'medium' ? 10 : 15;
        localStorage.setItem('shards', shards);
        window.playSound(window.sounds.missionComplete);
    }
    alert(`Clash Over! Winner: ${winner} (Player HP: ${playerHP}, Bot HP: ${botHP})`);
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    if (window.isSoundEnabled) {
        window.sounds.backgroundMusic.pause();
        window.sounds.backgroundMusic.currentTime = 0;
    }
}

function render() {
    if (!playerChainDiv || !botChainDiv || !handDiv || !vortexDiv || !storageDiv || !playerHPDiv || !botHPDiv || !shardsDiv || !timerDiv || !eventTextDiv || !activateBtn || !rushBtn) {
        console.error('DOM elements not initialized in render');
        return;
    }

    playerChainDiv.innerHTML = playerChain.map(card => 
        `<div class="card placed ${card.element}">${card.number || card.name} ${card.element}</div>`
    ).join('');
    botChainDiv.innerHTML = botChain.map(card => 
        `<div class="card placed ${card.element}">${card.number || card.name} ${card.element}</div>`
    ).join('');
    handDiv.innerHTML = playerHand.map((card, i) => 
        `<div class="card ${card.element}" draggable="true" ondragstart="dragStart(event, ${i}, 'hand')">${card.number || card.name} ${card.element}</div>`
    ).join('');
    vortexDiv.innerHTML = vortexCards.map(card => 
        `<div class="card placed ${card.element}">${card.number || card.name} ${card.element}</div>`
    ).join('');
    storageDiv.innerHTML = storageCards.map((card, i) => 
        `<div class="card ${card.element}" draggable="true" ondragstart="dragStart(event, ${i}, 'storage')">${card.number || card.name} ${card.element}</div>`
    ).join('');
    playerHPDiv.textContent = `Player HP: ${playerHP}${playerShield ? ' (Shield)' : ''}`;
    botHPDiv.textContent = `Bot HP: ${botHP}${botShield ? ' (Shield)' : ''}`;
    shardsDiv.textContent = `Shards: ${shards}`;
    activateBtn.disabled = playerChain.length < 4;
    rushBtn.disabled = playerChain.length < 6 || rushUsed;
}

function isValidMove(card, chain) {
    if (!card || !chain || chain.length === 0) return false;

    const lastCard = chain[chain.length - 1];
    if (!lastCard) return false;

    // Relics можно добавлять всегда
    if (!card.number) return true;

    // 1. Проверяем, совпадает ли стихия с последней картой
    if (card.element === lastCard.element) return true;

    // 2. Проверяем, совпадает ли номер с последней картой
    if (card.number === lastCard.number) return true;

    // 3. Проверяем, отличается ли номер на ±1 от любой карты в цепочке
    for (let chainCard of chain) {
        if (chainCard.number && Math.abs(card.number - chainCard.number) === 1) {
            return true;
        }
    }

    return false;
}

function playCard(index, source, target) {
    let card;
    if (source === 'hand') {
        card = playerHand[index];
    } else if (source === 'storage') {
        card = storageCards[index];
    }

    if (target === 'chain') {
        if (isValidMove(card, playerChain)) {
            playerChain.push(card);
            window.playSound(window.sounds.cardPlace);
            if (source === 'hand') {
                playerHand.splice(index, 1);
                if (playerHand.length < upgrades.handSize) {
                    const newCard = drawCard();
                    if (newCard) playerHand.push(newCard);
                }
            } else if (source === 'storage') {
                storageCards.splice(index, 1);
            }
        } else {
            alert('Invalid move! Card must be ±1 from any card in the chain, same element, or same number as the last card.');
        }
    } else if (target === 'vortex') {
        vortexCards.push(card);
        window.playSound(window.sounds.vortexDrop);
        handleVortexDrop(card);
        if (source === 'hand') {
            playerHand.splice(index, 1);
            if (playerHand.length < upgrades.handSize) {
                const newCard = drawCard();
                if (newCard) playerHand.push(newCard);
            }
        } else if (source === 'storage') {
            storageCards.splice(index, 1);
        }
    } else if (target === 'storage' && source === 'hand') {
        if (storageCards.length < 3) {
            storageCards.push(card);
            window.playSound(window.sounds.cardPlace);
            playerHand.splice(index, 1);
            if (playerHand.length < upgrades.handSize) {
                const newCard = drawCard();
                if (newCard) playerHand.push(newCard);
            }
        } else {
            alert('Storage is full! Take a card back to hand first.');
        }
    } else if (target === 'hand' && source === 'storage') {
        if (playerHand.length < upgrades.handSize) {
            playerHand.push(card);
            window.playSound(window.sounds.cardPlace);
            storageCards.splice(index, 1);
        } else {
            alert('Hand is full! Play or discard a card first.');
        }
    }
    render();
}

function handleVortexDrop(card) {
    const vortexSameElement = vortexCards.filter(c => c.element === card.element).length;
    if (vortexSameElement >= 3) {
        playerHP += 10;
        vortexCards = [];
    } else if (card.number >= 10 && vortexCards.some(c => c.number >= 10)) {
        let relic = deck.find(c => !c.number);
        if (!relic) {
            relic = allRelics[Math.floor(Math.random() * allRelics.length)];
            console.log(`No Relic in deck, selected random Relic: ${relic.name} (${relic.element})`);
        } else {
            console.log(`Found Relic in deck: ${relic.name} (${relic.element})`);
            deck.splice(deck.indexOf(relic), 1);
        }
        playerHand.push(relic);
        vortexCards = [];
    } else if (vortexCards.length >= 5) {
        botHP -= 10;
        vortexCards = [];
    }
}

function activateChain(isPlayer) {
    const chain = isPlayer ? playerChain : botChain;
    let targetHP = isPlayer ? botHP : playerHP;
    let targetShield = isPlayer ? botShield : playerShield;
    const targetDiv = isPlayer ? botChainDiv : playerChainDiv;
    let damage = Math.floor(chain.reduce((sum, card) => sum + (card.number || 0), 0) * 0.75);

    const relics = chain.filter(card => card.name);
    let relicEffect = relics.length > 0 ? relics[0].effect : null;

    const elementCount = chain.reduce((acc, card) => {
        if (card.element) acc[card.element] = (acc[card.element] || 0) + 1;
        return acc;
    }, {});

    if (chain.length >= 5) {
        const combo = checkCombo(elementCount);
        if (combo) {
            applyCombo(combo, isPlayer);
            resetChain(isPlayer);
            return;
        }
    }

    let maxElement = null;
    let maxCount = 0;
    for (let element in elementCount) {
        if (elementCount[element] >= 3 && elementCount[element] > maxCount) {
            maxElement = element;
            maxCount = elementCount[element];
        }
    }

    if (relicEffect) {
        switch (relicEffect) {
            case 'boostDamage': damage *= 1.5; break;
            case 'doubleHeal': if (maxElement === 'Water') playerHP += damage; break;
            case 'permShield': if (isPlayer) playerShield = true; else botShield = true; break;
            case 'resetChains': playerChain = [drawCard()]; botChain = [drawCard()]; break;
        }
    }

    if (maxElement) {
        const isEnhanced = maxCount >= 4;
        switch (maxElement) {
            case 'Fire':
                damage *= isEnhanced ? 3 : 2;
                window.playSound(window.sounds.effectFire);
                break;
            case 'Water':
                if (isPlayer) playerHP += isEnhanced ? damage : Math.floor(damage / 2);
                else botHP += isEnhanced ? damage : Math.floor(damage / 2);
                window.playSound(window.sounds.effectWater);
                break;
            case 'Earth':
                if (isPlayer) playerShield = true;
                else botShield = true;
                window.playSound(window.sounds.effectEarth);
                break;
            case 'Air':
                const targetHand = isPlayer ? botHand : playerHand;
                targetHand.sort(() => Math.random() - 0.5);
                if (targetHand.length > 0) targetHand.pop();
                window.playSound(window.sounds.effectAir);
                break;
        }
    }

    if (isPlayer) {
        if (botShield) {
            botHP -= Math.floor(damage * 0.5);
            botShield = false;
        } else {
            botHP -= damage;
        }
        window.playSound(window.sounds.chainActivate);
    } else {
        if (playerShield) {
            playerHP -= Math.floor(damage * 0.5);
            playerShield = false;
        } else {
            playerHP -= damage;
        }
    }
    targetDiv.classList.add('attacked');
    setTimeout(() => targetDiv.classList.remove('attacked'), 500);
    resetChain(isPlayer);
}

function checkCombo(elementCount) {
    const counts = Object.values(elementCount).sort((a, b) => b - a);
    if (counts[0] >= 2 && counts[1] >= 2) {
        const comboElements = Object.keys(elementCount).filter(e => elementCount[e] >= 2);
        if (comboElements.includes('Fire') && comboElements.includes('Water')) return 'steam';
        if (comboElements.includes('Earth') && comboElements.includes('Air')) return 'dustStorm';
        if (comboElements.includes('Fire') && comboElements.includes('Air')) return 'fireWhirl';
        if (comboElements.includes('Water') && comboElements.includes('Earth')) return 'mud';
    }
    return null;
}

function applyCombo(combo, isPlayer) {
    let damage = Math.floor((isPlayer ? playerChain : botChain).reduce((sum, card) => sum + (card.number || 0), 0) * 0.75);
    if (isPlayer) {
        if (combo === 'steam') {
            botHP -= damage;
            playerHP += Math.floor(damage / 2);
            window.playSound(window.sounds.effectFire);
            window.playSound(window.sounds.effectWater);
        }
        if (combo === 'dustStorm') {
            botHand.splice(0, 2);
            playerShield = true;
            window.playSound(window.sounds.effectEarth);
            window.playSound(window.sounds.effectAir);
        }
        if (combo === 'fireWhirl') {
            botHP -= damage * 2;
            if (botChain.length > 1) botChain.pop();
            window.playSound(window.sounds.effectFire);
            window.playSound(window.sounds.effectAir);
        }
        if (combo === 'mud') {
            botHP -= damage;
            window.playSound(window.sounds.effectWater);
            window.playSound(window.sounds.effectEarth);
        }
    } else {
        if (combo === 'steam') {
            playerHP -= damage;
            botHP += Math.floor(damage / 2);
            window.playSound(window.sounds.effectFire);
            window.playSound(window.sounds.effectWater);
        }
        if (combo === 'dustStorm') {
            playerHand.splice(0, 2);
            botShield = true;
            window.playSound(window.sounds.effectEarth);
            window.playSound(window.sounds.effectAir);
        }
        if (combo === 'fireWhirl') {
            playerHP -= damage * 2;
            if (playerChain.length > 1) playerChain.pop();
            window.playSound(window.sounds.effectFire);
            window.playSound(window.sounds.effectAir);
        }
        if (combo === 'mud') {
            playerHP -= damage;
            window.playSound(window.sounds.effectWater);
            window.playSound(window.sounds.effectEarth);
        }
    }
}

function rushOfElements() {
    if (playerChain.length >= 6 && !rushUsed) {
        let damage = Math.floor(playerChain.reduce((sum, card) => sum + (card.number || 0), 0) * 1.5);
        const elementCount = playerChain.reduce((acc, card) => {
            if (card.element) acc[card.element] = (acc[card.element] || 0) + 1;
            return acc;
        }, {});

        for (let element in elementCount) {
            if (elementCount[element] >= 3) {
                const isEnhanced = elementCount[element] >= 4;
                switch (element) {
                    case 'Fire':
                        damage *= isEnhanced ? 3 : 2;
                        window.playSound(window.sounds.effectFire);
                        break;
                    case 'Water':
                        playerHP += isEnhanced ? damage : Math.floor(damage / 2);
                        window.playSound(window.sounds.effectWater);
                        break;
                    case 'Earth':
                        playerShield = true;
                        window.playSound(window.sounds.effectEarth);
                        break;
                    case 'Air':
                        botHand.sort(() => Math.random() - 0.5);
                        if (botHand.length > 0) botHand.pop();
                        window.playSound(window.sounds.effectAir);
                        break;
                }
            }
        }

        if (botShield) {
            botHP -= Math.floor(damage * 0.5);
            botShield = false;
        } else {
            botHP -= damage;
        }
        botChainDiv.classList.add('attacked');
        setTimeout(() => botChainDiv.classList.remove('attacked'), 500);
        resetChain(true);
        rushUsed = true;
        if (botHP < 0) botHP = 0;
        window.playSound(window.sounds.rushActivate);
    }
}

function botPlay(campaignLevel) {
    const validCardIndex = botHand.findIndex(card => isValidMove(card, botChain));
    const shouldActivate = botChain.length >= 4 && Math.random() > (botDifficulty === 'easy' ? 0.8 : botDifficulty === 'medium' ? 0.6 : 0.4);
    const shouldReset = botChain.length > 2 && validCardIndex === -1 && Math.random() > 0.9;

    if (validCardIndex !== -1 && botChain.length < 6 && !shouldActivate) {
        botChain.push(botHand[validCardIndex]);
        window.playSound(window.sounds.cardPlace);
        botHand.splice(validCardIndex, 1);
        if (botHand.length < botUpgrades.handSize) {
            const newCard = drawCard();
            if (newCard) botHand.push(newCard);
        }
    } else if (shouldActivate) {
        activateChain(false);
    } else if (shouldReset) {
        resetChain(false);
    }
    if (campaignLevel) applyCampaignLogic(campaignLevel);
    render();
}

function applyCampaignLogic(level) {
    switch (level) {
        case 1: if (botChain.some(c => c.element === 'Fire')) activateChain(false); break; // Pyrotech
        case 2: if (botHP < 80 && botChain.some(c => c.element === 'Water')) activateChain(false); break; // Water Guardian
        case 3: if (!botShield && botChain.some(c => c.element === 'Earth')) activateChain(false); break; // Stone Lord
        case 4: if (playerHand.length > 2 && botChain.some(c => c.element === 'Air')) activateChain(false); break; // Wind Master
    }
}

function resetChain(isPlayer) {
    if (isPlayer) {
        const newCard = drawCard();
        playerChain = newCard ? [newCard] : [];
        window.playSound(window.sounds.cardPlace);
    } else {
        const newCard = drawCard();
        botChain = newCard ? [newCard] : [];
        window.playSound(window.sounds.cardPlace);
        if (botHand.length < botUpgrades.handSize) {
            const newCard = drawCard();
            if (newCard) botHand.push(newCard);
        }
    }
    render();
}

function triggerEvent() {
    const events = [
        { name: 'Elemental Storm', effect: () => { playerChain = [drawCard()]; botChain = [drawCard()]; } },
        { name: 'Gift of Elements', effect: () => { playerHand.push(deck.find(c => !c.number) || drawCard()); botHand.push(deck.find(c => !c.number) || drawCard()); } },
        { name: 'Shadow of Balance', effect: () => { const minHP = Math.min(playerHP, botHP); playerHP = minHP; botHP = minHP; } }
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    eventTextDiv.textContent = `Event: ${event.name}`;
    event.effect();
    setTimeout(() => eventTextDiv.textContent = '', 3000);
    window.playSound(window.sounds.eventTrigger);
    render();
}

// Drag-and-drop
function dragStart(event, index, source) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ index, source }));
    event.target.classList.add('dragging');
}

document.addEventListener('DOMContentLoaded', () => {
    playerChainDiv = document.getElementById('player-chain');
    botChainDiv = document.getElementById('bot-chain');
    handDiv = document.getElementById('hand');
    vortexDiv = document.getElementById('vortex');
    storageDiv = document.getElementById('storage');

    if (playerChainDiv) {
        playerChainDiv.addEventListener('dragover', e => { e.preventDefault(); playerChainDiv.classList.add('drag-over'); });
        playerChainDiv.addEventListener('dragleave', () => playerChainDiv.classList.remove('drag-over'));
        playerChainDiv.addEventListener('drop', e => {
            e.preventDefault();
            const { index, source } = JSON.parse(e.dataTransfer.getData('text/plain'));
            playCard(index, source, 'chain');
            playerChainDiv.classList.remove('drag-over');
        });
        playerChainDiv.addEventListener('dragend', e => e.target.classList.remove('dragging'));
    }

    if (vortexDiv) {
        vortexDiv.addEventListener('dragover', e => { e.preventDefault(); vortexDiv.classList.add('drag-over'); });
        vortexDiv.addEventListener('dragleave', () => vortexDiv.classList.remove('drag-over'));
        vortexDiv.addEventListener('drop', e => {
            e.preventDefault();
            const { index, source } = JSON.parse(e.dataTransfer.getData('text/plain'));
            playCard(index, source, 'vortex');
            vortexDiv.classList.remove('drag-over');
        });
    }

    if (storageDiv) {
        storageDiv.addEventListener('dragover', e => { e.preventDefault(); storageDiv.classList.add('drag-over'); });
        storageDiv.addEventListener('dragleave', () => storageDiv.classList.remove('drag-over'));
        storageDiv.addEventListener('drop', e => {
            e.preventDefault();
            const { index, source } = JSON.parse(e.dataTransfer.getData('text/plain'));
            playCard(index, source, 'storage');
            storageDiv.classList.remove('drag-over');
        });
        storageDiv.addEventListener('dragend', e => e.target.classList.remove('dragging'));
    }

    if (handDiv) {
        handDiv.addEventListener('dragover', e => { e.preventDefault(); handDiv.classList.add('drag-over'); });
        handDiv.addEventListener('dragleave', () => handDiv.classList.remove('drag-over'));
        handDiv.addEventListener('drop', e => {
            e.preventDefault();
            const { index, source } = JSON.parse(e.dataTransfer.getData('text/plain'));
            playCard(index, source, 'hand');
            handDiv.classList.remove('drag-over');
        });
        handDiv.addEventListener('dragend', e => e.target.classList.remove('dragging'));
    }

    activateBtn = document.getElementById('activate-btn');
    rushBtn = document.getElementById('rush-btn');
    resetBtn = document.getElementById('reset-btn');
    backToMenuBtn = document.getElementById('back-to-menu-btn');

    if (activateBtn) {
        activateBtn.addEventListener('click', () => {
            activateChain(true);
            window.playSound(window.sounds.buttonClick);
        });
    }

    if (rushBtn) {
        rushBtn.addEventListener('click', () => {
            rushOfElements();
            window.playSound(window.sounds.buttonClick);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetChain(true);
            window.playSound(window.sounds.buttonClick);
        });
    }

    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            endGame();
            window.playSound(window.sounds.buttonClick);
        });
    }
});
