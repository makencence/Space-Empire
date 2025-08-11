class SpaceEmpireGame {
    constructor() {
        this.gameState = {
            credits: 100,
            energy: 0,
            research: 0,
            population: 10,
            prestigeCrystals: 0,
            buildings: {},
            achievements: [],
            totalScore: 100,
            prestigeCount: 0,
            startTime: Date.now(),
            totalPlayTime: 0,
            notificationsEnabled: true
        };

        this.buildings = {
            solarPanel: {
                name: "🔆 Panneau Solaire",
                description: "Génère 1 énergie/sec",
                baseCost: 50,
                costMultiplier: 1.15,
                production: { energy: 1 }
            },
            mine: {
                name: "⛏️ Mine",
                description: "Génère 2 crédits/sec",
                baseCost: 100,
                costMultiplier: 1.2,
                production: { credits: 2 }
            },
            laboratory: {
                name: "🧪 Laboratoire",
                description: "Génère 0.5 recherche/sec",
                baseCost: 200,
                costMultiplier: 1.25,
                production: { research: 0.5 }
            },
            habitat: {
                name: "🏠 Habitat",
                description: "Génère 0.2 population/sec",
                baseCost: 300,
                costMultiplier: 1.3,
                production: { population: 0.2 }
            },
            powerPlant: {
                name: "🏭 Centrale Électrique",
                description: "Génère 10 énergie/sec",
                baseCost: 1000,
                costMultiplier: 1.4,
                production: { energy: 10 }
            },
            factory: {
                name: "🏗️ Usine Automatisée",
                description: "Génère 25 crédits/sec",
                baseCost: 5000,
                costMultiplier: 1.5,
                production: { credits: 25 }
            },
            university: {
                name: "🎓 Université Galactique",
                description: "Génère 5 recherche/sec",
                baseCost: 10000,
                costMultiplier: 1.6,
                production: { research: 5 }
            },
            megaCity: {
                name: "🌃 Méga-Cité",
                description: "Génère 10 population/sec",
                baseCost: 25000,
                costMultiplier: 1.7,
                production: { population: 10 }
            },
            spaceStation: {
                name: "🛸 Station Spatiale",
                description: "Génère 50 de tout/sec",
                baseCost: 100000,
                costMultiplier: 2.0,
                production: { credits: 50, energy: 50, research: 50, population: 5 }
            },
            dysonSphere: {
                name: "☀️ Sphère de Dyson",
                description: "Génère 500 énergie/sec",
                baseCost: 1000000,
                costMultiplier: 2.5,
                production: { energy: 500 }
            }
        };

        this.achievements = [
            { id: 'first_building', name: 'Premier Bâtiment', description: 'Achetez votre premier bâtiment', requirement: () => this.getTotalBuildings() >= 1, reward: 100 },
            { id: 'energy_master', name: 'Maître de l\'Énergie', description: 'Atteignez 1000 énergie', requirement: () => this.gameState.energy >= 1000, reward: 500 },
            { id: 'rich_empire', name: 'Empire Riche', description: 'Atteignez 10000 crédits', requirement: () => this.gameState.credits >= 10000, reward: 1000 },
            { id: 'scientist', name: 'Scientifique', description: 'Atteignez 500 recherche', requirement: () => this.gameState.research >= 500, reward: 750 },
            { id: 'populated', name: 'Peuplé', description: 'Atteignez 100 population', requirement: () => this.gameState.population >= 100, reward: 800 },
            { id: 'first_prestige', name: 'Premier Prestige', description: 'Effectuez votre premier prestige', requirement: () => this.gameState.prestigeCount >= 1, reward: 5000 },
            { id: 'space_lord', name: 'Seigneur de l\'Espace', description: 'Possédez une Station Spatiale', requirement: () => (this.gameState.buildings.spaceStation || 0) >= 1, reward: 10000 },
            { id: 'builder', name: 'Architecte', description: 'Possédez 50 bâtiments au total', requirement: () => this.getTotalBuildings() >= 50, reward: 2000 },
            { id: 'millionaire', name: 'Millionnaire', description: 'Atteignez 1M de crédits', requirement: () => this.gameState.credits >= 1000000, reward: 50000 },
            { id: 'dyson_builder', name: 'Constructeur de Dyson', description: 'Construisez une Sphère de Dyson', requirement: () => (this.gameState.buildings.dysonSphere || 0) >= 1, reward: 100000 },
            { id: 'time_player', name: 'Joueur Dévoué', description: 'Jouez pendant 1 heure', requirement: () => this.getTotalPlayTime() >= 3600000, reward: 5000 },
            { id: 'prestige_master', name: 'Maître du Prestige', description: 'Effectuez 5 prestiges', requirement: () => this.gameState.prestigeCount >= 5, reward: 25000 }
        ];

        this.production = { credits: 0, energy: 0, research: 0, population: 0 };
        this.saveModalType = 'export';
        
        this.init();
        this.startGameLoop();
    }

    init() {
        this.loadGame();
        this.renderBuildings();
        this.updateDisplay();
        this.checkAchievements();
        this.showNotification('🚀 Bienvenue dans Space Empire !', 'success');
    }

    getTotalBuildings() {
        return Object.values(this.gameState.buildings).reduce((sum, count) => sum + count, 0);
    }

    getTotalPlayTime() {
        return this.gameState.totalPlayTime + (Date.now() - this.gameState.startTime);
    }

    calculateGlobalMultiplier() {
        return 1 + (this.gameState.prestigeCrystals * 0.1);
    }

    getBuildingCost(buildingKey) {
        const building = this.buildings[buildingKey];
        const count = this.gameState.buildings[buildingKey] || 0;
        return Math.floor(building.baseCost * Math.pow(building.costMultiplier, count));
    }

    canAffordBuilding(buildingKey) {
        const cost = this.getBuildingCost(buildingKey);
        return this.gameState.credits >= cost;
    }

    buyBuilding(buildingKey) {
        if (this.canAffordBuilding(buildingKey)) {
            const cost = this.getBuildingCost(buildingKey);
            this.gameState.credits -= cost;
            this.gameState.buildings[buildingKey] = (this.gameState.buildings[buildingKey] || 0) + 1;
            
            const building = this.buildings[buildingKey];
            this.showNotification(`🏗️ ${building.name} construit !`, 'success');
            
            this.updateDisplay();
            this.renderBuildings();
            this.checkAchievements();
            this.saveGame();
        }
    }

    calculateProduction() {
        const multiplier = this.calculateGlobalMultiplier();
        const production = { credits: 0, energy: 0, research: 0, population: 0 };

        for (const [buildingKey, count] of Object.entries(this.gameState.buildings)) {
            const building = this.buildings[buildingKey];
            if (building && count > 0) {
                for (const [resource, amount] of Object.entries(building.production)) {
                    production[resource] += amount * count * multiplier;
                }
            }
        }

        this.production = production;
        return production;
    }

    updateResources() {
        const production = this.calculateProduction();
        
        for (const [resource, amount] of Object.entries(production)) {
            this.gameState[resource] += amount;
        }

        // Calculer le score total
        this.gameState.totalScore = Math.floor(
            this.gameState.credits + 
            this.gameState.energy * 2 + 
            this.gameState.research * 5 + 
            this.gameState.population * 10 +
            this.gameState.prestigeCrystals * 10000
        );
    }

    calculatePrestigeReward() {
        if (this.gameState.totalScore < 1000000) return 0;
        return Math.floor(Math.sqrt(this.gameState.totalScore / 1000000));
    }