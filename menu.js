const playBtn = document.getElementById('play-btn');
const campaignBtn = document.getElementById('campaign-btn');
const settingsBtn = document.getElementById('settings-btn');
const rulesBtn = document.getElementById('rules-btn');
const shopBtn = document.getElementById('shop-btn');
const backFromSettingsBtn = document.getElementById('back-from-settings-btn');
const backFromRulesBtn = document.getElementById('back-from-rules-btn');
const backFromCampaignBtn = document.getElementById('back-from-campaign-btn');
const backFromShopBtn = document.getElementById('back-from-shop-btn');
const botDifficultySelect = document.getElementById('bot-difficulty');
const themeSelect = document.getElementById('theme-select');
const campaignLevelsDiv = document.getElementById('campaign-levels');
const enableSoundBtn = document.getElementById('enable-sound-btn');
const shardsDisplay = document.getElementById('shards-display');
const shardsInShop = document.getElementById('shards-in-shop');

// Элементы магазина
const buyHandSizeBtn = document.getElementById('buy-hand-size');
const buyHpBoostBtn = document.getElementById('buy-hp-boost');
const buyRelicChanceBtn = document.getElementById('buy-relic-chance');
const handSizeLevel = document.getElementById('hand-size-level');
const handSizeCost = document.getElementById('hand-size-cost');
const hpBoostLevel = document.getElementById('hp-boost-level');
const hpBoostCost = document.getElementById('hp-boost-cost');
const relicChanceLevel = document.getElementById('relic-chance-level');
const relicChanceCost = document.getElementById('relic-chance-cost');

const campaignLevels = [
    { name: 'Pyrotech', difficulty: 'easy' },
    { name: 'Water Guardian', difficulty: 'medium' },
    { name: 'Stone Lord', difficulty: 'medium' },
    { name: 'Wind Master', difficulty: 'hard' },
    { name: 'Elemental Overlord', difficulty: 'hard' }
];

// Запускаем фоновую музыку при загрузке страницы, так как звук включён по умолчанию
window.addEventListener('DOMContentLoaded', () => {
    if (window.isSoundEnabled) {
        window.sounds.backgroundMusic.loop = true;
        window.playSound(window.sounds.backgroundMusic);
        console.log('Background music started on page load');
    }

    // Инициализация Shards и Upgrades из localStorage
    let shards = localStorage.getItem('shards') ? parseInt(localStorage.getItem('shards')) : 0;
    let upgrades = JSON.parse(localStorage.getItem('upgrades')) || { handSize: 4, hpBoost: 0, relicChance: 0 };

    // Отображаем Shards в главном меню
    shardsDisplay.textContent = `Shards: ${shards}`;
});

// Функция для обновления интерфейса магазина
function updateShopUI() {
    let shards = localStorage.getItem('shards') ? parseInt(localStorage.getItem('shards')) : 0;
    let upgrades = JSON.parse(localStorage.getItem('upgrades')) || { handSize: 4, hpBoost: 0, relicChance: 0 };

    // Обновляем отображение Shards
    shardsInShop.textContent = `Shards: ${shards}`;

    // Обновляем уровни улучшений и стоимость
    const handSizeUpgradeCost = 10 + (upgrades.handSize - 4) * 5; // 10, 15, 20...
    const hpBoostUpgradeCost = 15 + (upgrades.hpBoost / 10) * 5; // 15, 20, 25...
    const relicChanceUpgradeCost = 20 + (upgrades.relicChance / 0.1) * 5; // 20, 25, 30...

    handSizeLevel.textContent = upgrades.handSize;
    handSizeCost.textContent = handSizeUpgradeCost;
    hpBoostLevel.textContent = upgrades.hpBoost;
    hpBoostCost.textContent = hpBoostUpgradeCost;
    relicChanceLevel.textContent = `${Math.round(upgrades.relicChance * 100)}%`;
    relicChanceCost.textContent = relicChanceUpgradeCost;

    // Отключаем кнопки, если не хватает Shards
    buyHandSizeBtn.disabled = shards < handSizeUpgradeCost || upgrades.handSize >= 8; // Максимум 8 карт в руке
    buyHpBoostBtn.disabled = shards < hpBoostUpgradeCost || upgrades.hpBoost >= 50; // Максимум +50 HP
    buyRelicChanceBtn.disabled = shards < relicChanceUpgradeCost || upgrades.relicChance >= 0.5; // Максимум 50% шанса
}

campaignLevels.forEach((level, i) => {
    const btn = document.createElement('button');
    btn.textContent = `Level ${i + 1}: ${level.name}`;
    btn.addEventListener('click', () => {
        botDifficulty = level.difficulty;
        window.startGame(true, i + 1);
        window.playSound(window.sounds.buttonClick);
    });
    campaignLevelsDiv.appendChild(btn);
});

playBtn.addEventListener('click', () => {
    botDifficulty = botDifficultySelect.value;
    window.startGame();
    window.playSound(window.sounds.buttonClick);
});

campaignBtn.addEventListener('click', () => {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('campaign-screen').classList.remove('hidden');
    window.playSound(window.sounds.buttonClick);
});

shopBtn.addEventListener('click', () => {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('shop-screen').classList.remove('hidden');
    updateShopUI(); // Обновляем интерфейс магазина
    window.playSound(window.sounds.buttonClick);
});

settingsBtn.addEventListener('click', () => {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('settings-screen').classList.remove('hidden');
    window.playSound(window.sounds.buttonClick);

    // Обновляем текст кнопки в зависимости от состояния звука
    enableSoundBtn.textContent = window.isSoundEnabled ? 'Disable Sound' : 'Enable Sound';

    // Обработчик для кнопки переключения звука
    if (enableSoundBtn) {
        enableSoundBtn.addEventListener('click', () => {
            window.isSoundEnabled = !window.isSoundEnabled;
            if (window.isSoundEnabled) {
                enableSoundBtn.textContent = 'Disable Sound';
                window.sounds.backgroundMusic.loop = true;
                window.playSound(window.sounds.backgroundMusic);
                console.log('Sound enabled, playing background music');
            } else {
                enableSoundBtn.textContent = 'Enable Sound';
                window.sounds.backgroundMusic.pause();
                window.sounds.backgroundMusic.currentTime = 0;
                console.log('Sound disabled, background music paused');
            }
            window.playSound(window.sounds.buttonClick);
        }, { once: true });
    }
});

rulesBtn.addEventListener('click', () => {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('rules-screen').classList.remove('hidden');
    window.playSound(window.sounds.buttonClick);
});

backFromSettingsBtn.addEventListener('click', () => {
    document.getElementById('settings-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    shardsDisplay.textContent = `Shards: ${localStorage.getItem('shards') || 0}`; // Обновляем Shards
    window.playSound(window.sounds.buttonClick);
});

backFromRulesBtn.addEventListener('click', () => {
    document.getElementById('rules-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    shardsDisplay.textContent = `Shards: ${localStorage.getItem('shards') || 0}`;
    window.playSound(window.sounds.buttonClick);
});

backFromCampaignBtn.addEventListener('click', () => {
    document.getElementById('campaign-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    shardsDisplay.textContent = `Shards: ${localStorage.getItem('shards') || 0}`;
    window.playSound(window.sounds.buttonClick);
});

backFromShopBtn.addEventListener('click', () => {
    document.getElementById('shop-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    shardsDisplay.textContent = `Shards: ${localStorage.getItem('shards') || 0}`;
    window.playSound(window.sounds.buttonClick);
});

themeSelect.addEventListener('change', () => {
    document.body.className = `theme-${themeSelect.value}`;
    localStorage.setItem('theme', themeSelect.value);
    window.playSound(window.sounds.buttonClick);
});

if (localStorage.getItem('theme')) {
    themeSelect.value = localStorage.getItem('theme');
    document.body.className = `theme-${localStorage.getItem('theme')}`;
}

// Обработчики для покупки улучшений
buyHandSizeBtn.addEventListener('click', () => {
    let shards = parseInt(localStorage.getItem('shards')) || 0;
    let upgrades = JSON.parse(localStorage.getItem('upgrades')) || { handSize: 4, hpBoost: 0, relicChance: 0 };
    const cost = 10 + (upgrades.handSize - 4) * 5;

    if (shards >= cost && upgrades.handSize < 8) {
        shards -= cost;
        upgrades.handSize += 1;
        localStorage.setItem('shards', shards);
        localStorage.setItem('upgrades', JSON.stringify(upgrades));
        updateShopUI();
        window.playSound(window.sounds.buttonClick);
    } else {
        alert('Not enough Shards or max level reached!');
    }
});

buyHpBoostBtn.addEventListener('click', () => {
    let shards = parseInt(localStorage.getItem('shards')) || 0;
    let upgrades = JSON.parse(localStorage.getItem('upgrades')) || { handSize: 4, hpBoost: 0, relicChance: 0 };
    const cost = 15 + (upgrades.hpBoost / 10) * 5;

    if (shards >= cost && upgrades.hpBoost < 50) {
        shards -= cost;
        upgrades.hpBoost += 10;
        localStorage.setItem('shards', shards);
        localStorage.setItem('upgrades', JSON.stringify(upgrades));
        updateShopUI();
        window.playSound(window.sounds.buttonClick);
    } else {
        alert('Not enough Shards or max level reached!');
    }
});

buyRelicChanceBtn.addEventListener('click', () => {
    let shards = parseInt(localStorage.getItem('shards')) || 0;
    let upgrades = JSON.parse(localStorage.getItem('upgrades')) || { handSize: 4, hpBoost: 0, relicChance: 0 };
    const cost = 20 + (upgrades.relicChance / 0.1) * 5;

    if (shards >= cost && upgrades.relicChance < 0.5) {
        shards -= cost;
        upgrades.relicChance += 0.1;
        localStorage.setItem('shards', shards);
        localStorage.setItem('upgrades', JSON.stringify(upgrades));
        updateShopUI();
        window.playSound(window.sounds.buttonClick);
    } else {
        alert('Not enough Shards or max level reached!');
    }
});