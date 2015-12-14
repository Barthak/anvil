/**
 * 
 */

(function() {"use strict";
	
	ANVIL.core.Game = function () {};
	
	ANVIL.core.Game.prototype = {
		
		init : function () {
			console.info(this+': initializing...');
			
			this.load();

			$('#information').unbind();
			$('#information').click(function() {
				$(this).addClass('hidden');
			});

			this.blacksmith = new ANVIL.core.Blacksmith(this);
			this.items = new ANVIL.item.Collection(this);
			this.inventory = new ANVIL.inventory.Collection(this);
			
			var r = $('#resources');
			r.empty();
			
			var resources = {
				assorted: {total: this.get('crafting_assorted'), increment: 0, title: 'Reusable Part', c: 'brown'},
				magic: {total: this.get('crafting_magic'), increment: 0, title: 'Arcane Dust', c: 'blue'},
				rare: {total: this.get('crafting_rare'), increment: 0, title: 'Veiled Crystal', c: 'yellow'},
			};

			var d;
			for(var rs in resources) {
				d = $('<div title="'+resources[rs].title+'" class="item small '+resources[rs].c+'"></div>').appendTo(r);				
				
				$('<div class="crafting '+rs+'"><span id="resource-crafting_'+rs+'">'+resources[rs].total+'</span></div>').appendTo(d);
			}
			
			d = $('<div title="Gold" class="item small brown gold"></div>').appendTo(r);				
			$('<div class="crafting gold"></div><div id="resource-gold">'+this.get('gold')+'</div>').appendTo(d);
			
			$('<div class="clear"></div>').appendTo(r);
			
			this.updateLevel(this.get('level'));
			
		},
		
		updateLevel : function (lvl) {
			$('.blacksmith-level-number').each(function(){
				$(this).html(lvl);
			});
		},
		
		load : function () {
			var loaded = localStorage.getItem('anvil');
			if(!loaded) {
				this._settings = $.extend({}, ANVIL.settings);
			} else {
				this._settings = JSON.parse(loaded);
			}
		},
		
		unlock : function(unlock) {
			var unlocked = this.get('unlocked');
			var a = unlocked.concat(unlock);
						
			a.filter(function(itm,i,a){
			    return i==a.indexOf(itm);
			});
			this.set('unlocked', a);
			this.items.populateAvailableItems();
		},
		
		get : function (key) {

			return (typeof this._settings[key] != 'undefined') ? this._settings[key] : null;
		},

		set : function (key, value) {
			this._settings[key] = value;
			localStorage.setItem('anvil', JSON.stringify(this._settings));
			
			if(key == 'level') {
				this.updateLevel(value);
				return;
			}
			
			var resource = $('#resource-'+key);
			if(resource) {
				resource.html(value);
			}
		},
		
		update : function (key, add) {
			var current = this.get(key);
			var nVal = current + add;
			if(nVal < 0) {
				// throw error
				return;
			}
			this.set(key, nVal);
		},
		
		reset : function () {
			localStorage.removeItem('anvil');
			this.init();
		},

		information : function (msg, type) {
			
			$('#information').html(msg);
			$('#information').removeClass('hidden');
			
		},
		
		toggleFrame : function (frame, cb) {
			$('.content-frame').each(function() {
				$(this).addClass('hidden');
			});
			$("#"+frame).removeClass('hidden');
			if(cb) {
				this.blacksmith[cb]();
			}
		},
				
		toString : function () {
			return "game.anvil.org.dalines";
		}
		
	};
	
	ANVIL.core.Blacksmith = function () {
		
		this._vendorItem = null;
		this.init();
	};
	
	ANVIL.core.Blacksmith.prototype = {
		
		init : function () {
			console.info(this+': initializing...');
			
			// TODO: Load state of previous run -> local storage.
			
			this.setItem(null);
			
			
			$('#forge').click($.proxy(this.forgeItem, this));
			$('#vendor-purchase').click($.proxy(this.buyItem, this));
			$('#train-blacksmith').click($.proxy(this.trainBlacksmith, this));			
			$('#selected-item').click($.proxy(this.selectItem, this));

			this.initVendor();
			
		},
		
		getCurrent : function () {
			return this._current;
		},
		
		selectItem : function () {
			var item = this.getCurrent();
			if(item) {
				// warn user than progress will be lost.
			}
			
			$('#item-picker-container').removeClass('hidden');
			
			
		},
		
		setItem : function(instance) {
			console.warn("INSTAN", instance);
			this._current = instance;
			this.setActionOverview('blacksmith', instance?instance.price:null);

			var img = instance ? instance.backref : 'x';
			var desc = $('.item-description');
			
			$('#selected-item').css("background-image", "url('http://media.dalin.es/anvil/item/"+img+".png')");
			desc.empty();
			$('#item-picker-container').addClass('hidden');
			this.progress(true);
			if(instance) {
				var p = '#item-progress';
				var w = 800;
				var steps = instance.getSteps();
				var spacer = w/(steps-1);
				var s;
				for(var i=0; i < steps; i++) {
					s = $('<div class="scrubber-icon step-'+(i+1)+'"></div>');
					s.css('left', Math.round(spacer*i)+25);
					s.appendTo(p);
				}
				
				instance.display(desc, true);
				$('#level-requirement').html(instance.level);
				$('#item-level-info').removeClass('hidden');
				
			} else {
				$('#item-level-info').addClass('hidden');
			}
		},
		
		progress : function(reset) {
			var item = this.getCurrent();
			var p = $('#item-progress');
			
			if(!item || reset) {
				p.empty();
				$('div.scrubber-icon').each(function(){
					$(this).remove();
				});
				return;
			}
			
			if(!item.isPaid()) {
				if(this._makePurchase(1, item.price)) {
					item.set('paid', true);
				} else {
					this.setItem(null);
					return;
				}
			}
			
			if(item.progress()) {
				// FINISHED!
				this.finishItem();
				return;
			}
			
			var current = item.getProgress();
			$('.scrubber-icon.step-'+current).addClass('scrubber-on');
			
		},
		
		finishItem : function () {
			var item = this.getCurrent();
			ANVIL.instance.inventory.append(item.finalize());
			this.progress(true);
			this.setItem(null);
			item.display();
		},
		
		forgeItem : function () {
			console.info(this+': forging item...');
			
			// check if an item is selected.
			var item = this.getCurrent();
			if(!item) {
				ANVIL.instance.information('Please select an item you want to forge.');
				
				return;
			}
			
			
			/*$('#forge').shake();*/
			
			this.progress();
			
		},
		
		initTraining : function () {
			var c = $('#training-content');
			c.empty();

			var cl = ANVIL.instance.get('level');
			var next = ANVIL.config.leveling[cl+1];
			
			$(
				'<h2>'+gettext('Blacksmith')+'</h2>'+
				'<h3>'+gettext('Level')+' <span class="next-level">'+(cl+1)+'</span></h3>'+
				'<h2>'+'ADEPT'+'</h2>'+ // Fixme
				
				'<p>'+gettext('Train the blacksmith to increase experience, learn new recipes and level up')+'</p>'+			
				'<h2>'+gettext('Rewards for training')+'</h2>'
			).appendTo(c);
		
			this.setActionOverview('training', next.price);
			var item, u = $('<div class="unlock"></div>').appendTo(c);
			for(var i in next.unlock) {
				item = ANVIL.item.MAP[next.unlock[i]];
				$('<div>'+item.title+'</div>').appendTo(u);
			}
		},
		
		trainBlacksmith : function () {
			
			var cl = ANVIL.instance.get('level');
			var next = ANVIL.config.leveling[cl+1];
			
			if(this._makePurchase(1, next.price)) {
				ANVIL.instance.set('level', cl+1);
				ANVIL.instance.unlock(next.unlock);
				this.initTraining();
			}
			
		},
		
		initVendor : function () {
			
			var c = $('#vendor');
			c.empty();
			
			var m, li;
			for(var i in ANVIL.config.crafting) {
				m = ANVIL.config.crafting[i];
				li = $(
					'<li class="'+m.id+'">'+
						'<div class="price">'+
							'<span>'+m.price.gold+'</span> '+
							'<span class="crafting gold small"></span>'+
						'</div>'+
						'<div class="icon">'+
							'<span title="'+m.title+'" class="item small '+m.cls+'">'+
								'<span class="crafting '+m.id+'"><span id="resource-'+m.id+'-stock"></span></span>'+									
							'</span>'+
						'</div>'+
						'<div class="desc">'+
							'<span class="name">'+m.title+'</span><br />'+
							'<span>'+gettext('Crafting material')+'</span>'+
						'</div>'+
						'<div class="clear"></div>'+								
					'</li>');
				li.click({item: m.id}, $.proxy(function(e) {
					$('#vendor li').each(function(){$(this).removeClass('selected');});
					$('#vendor li.'+e.data.item).addClass('selected');
					
					this._vendorItem = ANVIL.config.crafting[e.data.item];
					this.setActionOverview('stock-frame', ANVIL.config.crafting[e.data.item].price);
					
				}, this));
				li.appendTo(c);
			}
			
		},
		
		setActionOverview : function (frame, price) {
			
			var o = $('#'+frame+' .action-overview');
			o.empty();
			
			console.info('item', o);
			
			if(!price) {
				return;
			}
			
			var m, material, mats = price.material;
			
			if(price.gold) {
				$('<div><span class="brown name">'+gettext('Cost')+': </span><span>'+price.gold+'</span> '+
					'<span class="crafting gold small inline"></span></div>').appendTo(o);
			}
			
			var mc = $('<div></div>').appendTo(o);
			if(mats) {
				$('<span class="brown name">'+gettext('Materials')+': </span>').appendTo(mc);
				
				for(var i in mats) {
					m = ANVIL.config.crafting[i];
					$(
						'<span title="'+m.title+'" class="item small '+m.cls+'">'+
							'<span class="crafting '+m.id+'"><span>'+(mats[i]===null?'':mats[i])+'</span></span>'+									
						'</span>'
					).appendTo(mc);
				}
			} else {
				$('<span class="item small bitbucket"></span>').appendTo(mc);
			}
		},
		
		buyItem : function () {
			if(!this._vendorItem) {
				return ANVIL.instance.information(gettext('Please select a Vendor item.'));
			}
			
			var total = 1; // FIXME
			if(this._makePurchase(total, this._vendorItem.price)) {
				ANVIL.instance.update('crafting_'+this._vendorItem.id, total);
			}
		},
		
		_makePurchase : function (total, price) {
			console.info(this+': making purchase...');
			console.warn("price", price);
			if(total > price.max) {
				ANVIL.instance.information(gettext('You cannot buy more than %(max)s of this item.'));
				return false;
			}
			
			var gold = price.gold ? price.gold*total : 0;
			if(gold > ANVIL.instance.get('gold')) {
				ANVIL.instance.information(gettext('Insufficient gold to make this purchase.'));
				return false;
			}
			var t, m, mats = {};
			for(var i in price.material) {
				m = price.material[i];
				if(!m) continue;
				t = m*total;
				if(t > ANVIL.instance.get('crafting_'+i)) {
					ANVIL.instance.information(gettext('Insufficient %(material)s to make this purchase.'));
					return false;
				}
				mats[i] = t;
			}
			
			// Validated, make purchase
			ANVIL.instance.update('gold', -1*gold);
			for(i in mats) {
				m = mats[i];
				ANVIL.instance.update('crafting_'+i, -1*m);
			}
			return true;
			
		},
		
		toString : function () {
			return "blacksmith.anvil.org.dalines";
		}
	
	};
	
	
	jQuery.fn.shake = function() {
	    this.each(function(i) {
	        $(this).css({ "position": "relative" });
	        for (var x = 1; x <= 3; x++) {
	            $(this).animate({ left: -2 }, 10).animate({ left: 0, top: -1 }, 50).animate({ left: 2, top: -1 }, 10).animate({ left: 0, top: 0 }, 50);
	        }
	    });
	    return this;
	};
	
	ANVIL.instance = new ANVIL.core.Game();
	ANVIL.instance.init();
	
})();
