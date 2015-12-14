
(function(){
	ANVIL.item.WEAPONS = {
		sword: {
			title: gettext('Short Sword'),
			type: gettext('Sword'),
			hands: 1,
			level: 1,
			minDamage: [2, 3],
			maxDamage: [4, 5],
			attackSpeed: 1.4,
			steps: 10,
			baseprice: 100,
			price: {
				gold: 0,
				material: {assorted: 5, magic: 2},
				max: 1
			},
			rarity: 'normal',
			affixes: []
		},
		dagger: {
			title: gettext('Simple Dagger'),
			type: gettext('Dagger'),
			hands: 1,
			level: 1,
			minDamage: [1, 2],
			maxDamage: [3, 4],
			attackSpeed: 1.5,
			steps: 5,
			baseprice: 50,
			price: {
				gold: 0,
				material: {assorted: 5},
				max: 1
			},
			rarity: 'normal',
			affixes: []
		},
		bow: {
			title: gettext('Short Bow'),
			type: gettext('Bow'),
			hands: 2,
			level: 2,
			minDamage: [1, 2],
			maxDamage: [8, 9],
			attackSpeed: 1.4,
			steps: 10,
			baseprice: 140,
			price: {
				gold: 0,
				material: {assorted: 4, magic: 4},
				max: 1
			},
			rarity: 'normal',
			affixes: []
		},
		axe: {
			title: gettext('Hand Axe'),
			type: gettext('Axe'),
			hands: 1,
			level: 2,
			minDamage: [2, 3],
			maxDamage: [3, 4],
			attackSpeed: 1.3,
			steps: 5,
			baseprice: 70,
			price: {
				gold: 0,
				material: {assorted: 2, magic: 2},
				max: 1
			},
			rarity: 'normal',
			affixes: []
		},
		sabre: {
			title: gettext('Sabre'),
			type: gettext('Sword'),
			hands: 1,
			level: 3,
			minDamage: [4, 5],
			maxDamage: [8, 10],
			attackSpeed: 1.4,
			steps: 10,
			baseprice: 170,
			price: {
				gold: 0,
				material: {assorted: 2, magic: 2, rare: 1},
				max: 1
			},
			rarity: 'normal',
			affixes: []
		},
		mace: {
			title: gettext('Mace'),
			type: gettext('Mace'),
			hands: 1,
			level: 3,
			minDamage: [6, 7],
			maxDamage: [10, 12],
			attackSpeed: 1.2,
			steps: 10,
			baseprice: 220,
			price: {
				gold: 0,
				material: {assorted: 2, magic: 4, rare: 1},
				max: 1
			},
			rarity: 'normal',
			affixes: []
		},
		
	};
})();


