var util = require('../client/util.js');

function Attention(memoryMomentum) {
	var that = {
			momentum: memoryMomentum,
			since: { },
			values: { },
			totals: { },
			summary: function() { return [ that.values, that.totals ]; },
			notice : function(o, strength) {
				var i = o.uuid;
				
				var prevStrength = that.values[i];				
				var prevSince = that.since[i];
				
				if (that.values[i] == undefined) {
					that.values[i] = 0;
				}
					
				that.values[i] += strength;
				
				var now = Date.now();
				if (prevStrength != undefined) {
					var dt = now - prevSince;
					if (that.totals[i] == undefined) {
						that.totals[i] = 0;
					}
					that.totals[i] += dt * 0.5 * (strength + prevStrength);
				}
				
				that.since[i] = now;
				
				
			},
			refresh: function(o) {
				that.notice(o, 0);
			},
			update : function() {
				//refresh
				for (var k in that.values) {
					that.refresh(k);
				}
				
				//FORGET: decrease and remove lowest
				for (var k in that.values) {
					that.values[k] *= memoryMomentum;
				}
				
				//SPREAD: ...
				
			}
	};
	
	
	return that;
}


exports.Attention = Attention;

/*var a = newAttention(0.5);
a.update();
console.log(a.summary());
a.notice('a', 1.0);
console.log(a.summary());
a.update();
console.log(a.summary());
a.notice('b', 1.0);
console.log(a.summary());
a.update(); console.log(a.summary());
a.update(); console.log(a.summary());*/

