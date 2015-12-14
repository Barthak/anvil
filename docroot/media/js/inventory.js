(function() {"use strict";

	ANVIL.inventory.Collection = function () {
		this.init();
	};
	
	ANVIL.inventory.Collection.prototype = {
		
		init : function () {
			console.info(this+': initializing...');
		},
		
		append : function (item) {
			// assert finalized item.
			if(!item.isFinished()) {
				// error
				return null;
			}
			
			return item;
		},
		
		toString : function () {
			return "collection.inventory.anvil.org.dalines";
		}
	};

})();
