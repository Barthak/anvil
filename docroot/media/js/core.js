
var gettext = function(txt) {
	return txt;
};

var ANVIL = {
	core: {},
	item: {},
	settings: {
		gold: 2000,
		level: 1,
		crafting_assorted: 100,
		crafting_magic: 50,
		crafting_rare: 10,
		unlocked: ['sword', 'dagger']
	},
	inventory: {}
};

ANVIL.config = {
	
	leveling: [
		null,
		{
			unlock: ['sword', 'dagger'],
			price: {
				gold: 0,
				material: null,
				max: 1
			},
		}, {
			unlock: ['bow', 'axe'],
			price: {
				gold: 2000,
				material: null,
				max: 1
			},
		}, {
			unlock: ['sabre', 'mace'],
			price: {
				gold: 2000,
				material: null,
				max: 1
			},
		},
	],
	
	crafting: {
		assorted: {
			title: gettext('Reusable Part'),
			id: 'assorted',
			price: {
				gold: 10,
				material: {assorted: null},
				max: 1000
			},
			level: 1,
			desc: 'TODO',
			cls: 'brown'
		}, 
		magic: {
			title: gettext('Arcane Dust'),
			id: 'magic',
			price: {
				gold: 25,
				material: {magic: null},
				max: 1000
			},
			level: 1,
			desc: 'TODO',
			cls: 'blue'
		}, 
		rare: {
			title: gettext('Veiled Crystal'),
			id: 'rare',
			price: {
				gold: 100,
				material: {rare: null},
				max: 1000
			},
			level: 1,
			desc: 'TODO',
			cls: 'yellow'
		}
	}
	
};
