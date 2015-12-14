(function() {"use strict";
	
	ANVIL.item.Handler = function (item, conf) {
		this.backref = item;
		this.init(conf);
	};
	ANVIL.item.Handler.prototype = {
		
		init : function (conf) {
			this.setConf(conf);
			
			this._progress = 0;
		},
		
		setConf : function (conf) {
			var allowed = [];
			this._conf = {
				title: conf.title ? conf.title : this.backref
			};
			for(var i in conf) {
				this[i] = conf[i];
			}
		},
		
		get : function (key) {
			return this._conf[key] ? this._conf[key] : null;
		},
		
		set : function(key, value) {
			console.info(this+': setting "'+key+'" to "'+value+'"...');
			this._conf[key] = value;
		},

		progress : function () {
			this._progress += 1;
			return this._progress > this.steps;
		},
		
		getProgress : function () {
			return this._progress;
		},
		
		isFinished : function () {
			return this.get('finished');
		},
		
		isPaid : function () {
			return this.get('paid');
		},
		
		finalize : function () {
			
			console.info(this+': finalizing item...');
			this.set('finished', true);
			
			if(this.category == 'weapon') {
				//this.set('dps', );	
				
				var min = this._randomFromInterval(this.minDamage[0], this.minDamage[1]);
				var max = this._randomFromInterval(this.maxDamage[0], this.maxDamage[1]);
				var damage = this._randomFromInterval(min, max);
				var dps = damage*this.attackSpeed;
				this.set('damage', damage.toFixed(1));
				this.set('dps', dps.toFixed(1));
				this.set('price', parseInt(this.baseprice+Math.floor(dps*10), 10));
				
				return this;
			}
			return this;
		},
		
		_randomFromInterval : function (min, max) {
			return Math.floor(Math.random()*(max-min+1)+min);
		},
		
		getSteps : function () {
			return this.steps;
		},
		
		display : function (c, skipImage, attach) {
			skipImage = skipImage ? skipImage : false;
			c = c || $('#item-card');
			c.unbind();
			c.click($.proxy(this.destroy, this));
			c.empty();
			
			var head = $('<div class="tooltip-head"></div>');
			head.appendTo(c);
			
			$('<h3>'+this.get('title')+'</h3>').appendTo(head);
			
			if(!skipImage) {
				var icon = $('<div class="icon"></div>');
				icon.appendTo(c);
				
				var inset = $('<div class="gradient"></div>');
				inset.appendTo(icon);
				
				var img = $('<img src="http://media.dalin.es/anvil/item/'+this.backref+'.png" />');
				img.appendTo(inset);
			}
			
			if(this.category == 'weapon') {
				$(
					'<div class="heading">'+
					'<div class="type">'+this.type+'</div><div class="extra faded">1-Hand</div>'+
					'<div class="number highlight">'+this.getDPS()+'</div><div class="number-info faded">Damage Per Second</div>'+
					'<div class="breakdown highlight">'+this.getBreakdown()+' <span class="faded">Damage</span></div>'+
					'<div class="aps highlight">'+this.attackSpeed+' <span class="faded">Attacks per second</span></div>'+
					'</div>'
				).appendTo(c); // gettext
			}
			
			var fin = $('<div class="final"></div>').appendTo(c);
			if(this.level > 1) {
				$('<div><span>'+gettext('Required Level')+': </span><span class="highlight">'+this.level+'</span></div>').appendTo(fin);
			}

			if(this.isFinished()) {
				$('<div><span>'+gettext('Sell Value')+': </span><span class="highlight">'+this.getSellPrice()+'</span> <span class="crafting gold small"></span></div>').appendTo(fin);
			} else {
				$('<div><span>'+gettext('Minimal Sell Value')+': </span><span class="highlight">'+this.getSellPrice()+'</span> <span class="crafting gold small"></span></div>').appendTo(fin);
			}
			
			if(attach) {
				c.css({
			        left: ($(attach).offset().left + $(attach).width()) + "px"
			    });
			} else {
				c.css({
					left: "calc(50% - 175px)"
				});
			}
			
			c.removeClass('hidden');
			return c;
		},
		
		getSellPrice : function () {

			if(this.isFinished()) {
				return this.get('price');
			}
			return this.baseprice;
		},
		
		getDPS : function () {
			if(this.isFinished()) {
				return this.get('dps');
			}
			var min = this.minDamage[1]*this.attackSpeed;
			var max = this.maxDamage[0]*this.attackSpeed;
			return min.toFixed(1)+'-'+max.toFixed(1);
		},
		
		getBreakdown : function () {
			if(this.isFinished()) {
				return this.get('damage');
			}
			return '('+this.minDamage[0]+'-'+this.minDamage[1]+')-('+this.maxDamage[0]+'-'+this.maxDamage[1]+')';
		},
		
		destroy : function () {
			// TODO only in case army is not unlocked
			if(this.isFinished()) {
				this.sell();
			}
			
			$('#item-card').empty();
			$('#item-card').addClass('hidden');
			$('#item-card').unbind();
		},
		
		sell : function () {
			console.info(this+': selling item for '+this.get('price')+'...');
			console.warn('oring', parseInt(ANVIL.instance.get('gold'), 10));
			console.warn('adddd', parseInt(this.get('price'), 10));
			ANVIL.instance.set('gold', parseInt(ANVIL.instance.get('gold'), 10)+parseInt(this.get('price'), 10));
		},
		
		toString : function () {
			return this.backref+'.item.anvil.org.dalines';
		}
		
	};
	
	ANVIL.item.MAP = {};
	
	
	ANVIL.item.Collection = function () {
		this.init();
	};
	
	ANVIL.item.Collection.prototype = {
		
		init : function () {
			console.info(this+': initializing...');
			
			this.populateMap();
			this.populateAvailableItems();
			
		},

		populateMap : function () {
			var w = ANVIL.item.WEAPONS;
			for(var backref in w) {
				ANVIL.item.MAP[backref] = w[backref];
				ANVIL.item.MAP[backref].category = 'weapon';
			}
		},

		populateAvailableItems : function () {
			
			var picker = $('#item-picker');
			picker.empty();
			
			var img, item, backref, unlocked = ANVIL.instance.get('unlocked');
			for(var i in unlocked) {
				backref = unlocked[i];
				item = ANVIL.item.MAP[backref];
				img = $('<div class="item '+item.rarity+'"><div class="gradient"><img src="http://media.dalin.es/anvil/item/'+backref+'.png" class="'+backref+'" /></div></div>');
				
				img.click({item: backref}, $.proxy(this.selectItem, this));
				img.mouseover({item: backref}, $.proxy(this.showItem, this));
				img.mouseout($.proxy(this.hideItem, this));
				
				img.appendTo(picker);
			}
			
		},
		
		showItem : function (e) {
			var item = e.data.item;
			var obj = ANVIL.item.MAP[item];
			var inst = new ANVIL.item.Handler(item, obj);
			inst.display(null, null, e.target);
		},
		
		hideItem : function (e) {
			$('#item-card').addClass('hidden');
			$('#item-card').empty();
		},
		
		selectItem : function (e) {
			var item = e.data.item;
			var obj = ANVIL.item.MAP[item];
			ANVIL.instance.blacksmith.setItem(new ANVIL.item.Handler(item, obj));
		},

		toString : function () {
			return "collection.item.anvil.org.dalines";
		}
	};
	
})();
