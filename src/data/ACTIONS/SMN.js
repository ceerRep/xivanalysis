import PETS from '../PETS'

export default {
	// -----
	// Player
	// -----
	SUMMON_III: {
		id: 180,
		name: 'Summon III',
		icon: 'https://xivapi.com/i/002000/002680.png',
		onGcd: true,
		castTime: 3000,
	},

	FESTER: {
		id: 181,
		name: 'Fester',
		icon: 'https://xivapi.com/i/002000/002676.png',
		cooldown: 5000,
	},

	TRI_BIND: {
		id: 182,
		name: 'Tri-bind',
		icon: 'https://xivapi.com/i/002000/002678.png',
		onGcd: true,
		castTime: 2500,
	},

	ENKINDLE: {
		id: 184,
		name: 'Enkindle',
		icon: 'https://xivapi.com/i/002000/002677.png',
		cooldown: 180000,
	},

	PAINFLARE: {
		id: 3578,
		name: 'Painflare',
		icon: 'https://xivapi.com/i/002000/002681.png',
		cooldown: 5000,
	},

	RUIN_III: {
		id: 3579,
		name: 'Ruin III',
		icon: 'https://xivapi.com/i/002000/002682.png',
		onGcd: true,
		castTime: 2500, // This is reduced to instant during DWT
	},

	TRI_DISASTER: {
		id: 3580,
		name: 'Tri-disaster',
		icon: 'https://xivapi.com/i/002000/002683.png',
		cooldown: 60000,
	},

	DREADWYRM_TRANCE: {
		id: 3581,
		name: 'Dreadwyrm Trance',
		icon: 'https://xivapi.com/i/002000/002684.png',
		cooldown: 20000,
	},

	DEATHFLARE: {
		id: 3582,
		name: 'Deathflare',
		icon: 'https://xivapi.com/i/002000/002685.png',
		cooldown: 15000,
	},

	// Both SMN and SCH have Aetherpact, but they're different skills
	SMN_AETHERPACT: {
		id: 7423,
		name: 'Aetherpact',
		icon: 'https://xivapi.com/i/002000/002687.png',
		cooldown: 120000,
	},

	BIO_III: {
		id: 7424,
		name: 'Bio III',
		icon: 'https://xivapi.com/i/002000/002689.png',
		onGcd: true,
	},

	MIASMA_III: {
		id: 7425,
		name: 'Miasma III',
		icon: 'https://xivapi.com/i/002000/002690.png',
		onGcd: true,
		castTime: 2500,
	},

	RUIN_IV: {
		id: 7426,
		name: 'Ruin IV',
		icon: 'https://xivapi.com/i/002000/002686.png',
		onGcd: true,
	},

	SUMMON_BAHAMUT: {
		id: 7427,
		name: 'Summon Bahamut',
		icon: 'https://xivapi.com/i/002000/002691.png',
		cooldown: 30000,
	},

	ENKINDLE_BAHAMUT: {
		id: 7429,
		name: 'Enkindle Bahamut',
		icon: 'https://xivapi.com/i/002000/002693.png',
		cooldown: 13000,
	},

	// -----
	// Pet
	// -----
	// Garuda-egi
	WIND_BLADE: {
		id: 792,
		name: 'Wind Blade',
		icon: 'https://xivapi.com/i/002000/002711.png',
		pet: PETS.GARUDA_EGI.id,
	},

	SHOCKWAVE: {
		id: 793,
		name: 'Shockwave',
		icon: 'https://xivapi.com/i/002000/002713.png',
		cooldown: 90000,
		pet: PETS.GARUDA_EGI.id,
	},

	AERIAL_SLASH: {
		id: 794,
		name: 'Aerial Slash',
		icon: 'https://xivapi.com/i/002000/002712.png',
		cooldown: 30000,
		pet: PETS.GARUDA_EGI.id,
	},

	CONTAGION: {
		id: 795,
		name: 'Contagion',
		icon: 'https://xivapi.com/i/002000/002714.png',
		cooldown: 60000,
		pet: PETS.GARUDA_EGI.id,
	},

	AERIAL_BLAST: {
		id: 796,
		name: 'Aerial Blast',
		icon: 'https://xivapi.com/i/002000/002715.png',
		pet: PETS.GARUDA_EGI.id,
	},

	// Titan-egi
	TITAN_EGI_ATTACK: {
		id: 1346,
		name: 'Attack',
		icon: '',
		pet: PETS.TITAN_EGI.id,
	},

	ROCK_BUSTER: {
		id: 787,
		name: 'Rock Buster',
		icon: 'https://xivapi.com/i/002000/002701.png',
		pet: PETS.TITAN_EGI.id,
	},

	MOUNTAIN_BUSTER: {
		id: 788,
		name: 'Mountain Buster',
		icon: 'https://xivapi.com/i/002000/002702.png',
		cooldown: 15000,
		pet: PETS.TITAN_EGI.id,
	},

	EARTHEN_WARD: {
		id: 789,
		name: 'Earthen Ward',
		icon: 'https://xivapi.com/i/002000/002703.png',
		cooldown: 120000,
		pet: PETS.TITAN_EGI.id,
	},

	LANDSLIDE: {
		id: 790,
		name: 'Landslide',
		icon: 'https://xivapi.com/i/002000/002704.png',
		cooldown: 40000,
		pet: PETS.TITAN_EGI.id,
	},

	EARTHEN_FURY: {
		id: 791,
		name: 'Earthen Fury',
		icon: 'https://xivapi.com/i/002000/002705.png',
		pet: PETS.TITAN_EGI.id,
	},

	// Ifrit-egi
	IFRIT_EGI_ATTACK: {
		id: 1347,
		name: 'Attack',
		icon: '',
		pet: PETS.IFRIT_EGI.id,
	},

	CRIMSON_CYCLONE: {
		id: 797,
		name: 'Crimson Cyclone',
		icon: 'https://xivapi.com/i/002000/002721.png',
		cooldown: 40000,
		pet: PETS.IFRIT_EGI.id,
	},

	BURNING_STRIKE: {
		id: 798,
		name: 'Burning Strike',
		icon: 'https://xivapi.com/i/002000/002722.png',
		pet: PETS.IFRIT_EGI.id,
	},

	RADIANT_SHIELD: {
		id: 799,
		name: 'Radiant Shield',
		icon: 'https://xivapi.com/i/002000/002723.png',
		cooldown: 60000,
		pet: PETS.IFRIT_EGI.id,
	},

	FLAMING_CRUSH: {
		id: 800,
		name: 'Flaming Crush',
		icon: 'https://xivapi.com/i/002000/002724.png',
		cooldown: 30000,
		pet: PETS.IFRIT_EGI.id,
	},

	INFERNO: {
		id: 801,
		name: 'Inferno',
		icon: 'https://xivapi.com/i/002000/002725.png',
		pet: PETS.IFRIT_EGI.id,
	},

	// Any pet 'cus it's weirdass
	DEVOTION: {
		id: 7450,
		name: 'Devotion',
		icon: 'https://xivapi.com/i/002000/002688.png',
		// No pet reference, can't actually determine anything from it
	},

	// Demi-bahamut
	WYRMWAVE: {
		id: 7428,
		name: 'Wyrmwave',
		icon: 'https://xivapi.com/i/002000/002692.png',
		pet: PETS.DEMI_BAHAMUT.id,
	},

	AKH_MORN: {
		id: 7449,
		name: 'Akh Morn',
		icon: 'https://xivapi.com/i/002000/002694.png',
		pet: PETS.DEMI_BAHAMUT.id,
	},
}
