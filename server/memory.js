var util = require('../client/util.js');

var minAttention = 0.05; //TODO make parameter

function Attention(memoryMomentum) {
	var that = {
			momentum: memoryMomentum,
			since: { },
			values: { },
			totals: { },
			remove: function(x) {
				delete that.since[x];
				delete that.values[x];
				delete that.totals[x];
			},
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
				//REFRESH
				for (var k in that.values) {
					that.refresh(k);
				}

				//FORGET: decrease and remove lowest
				for (var k in that.values) {
					that.values[k] *= memoryMomentum;
					if (that.values[k] < minAttention) {
						that.remove(k);
					}
				}
				
				//SPREAD: ...
				//	TODO follow incidence structure to determine target spread nodes				
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

