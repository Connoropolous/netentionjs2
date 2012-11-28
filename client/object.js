/**
 * @author seh
 */
var types = { };

function addType(t) {
	types[t.uri] = t;
}

var lastTypeMenu;
function updateTypes() {
	if (lastTypeMenu)
		lastTypeMenu.remove();
	
	var t = newTypeMenu();
	$('#Menu').append(t);
	lastTypeMenu = t;
}

// [ normalized match, absolute match ] 
function getRelevance(x) {
	if (!x.type)
		return 0;
	x.type = getTypeArray(x.type);	
	
	var total = 0, interest = 0;
	for (var i in interestStrength) {
		total += interestStrength[i];
	}
	if (total == 0)
		return 0;
	
	for (var i = 0; i < x.type.length; i++) {
		var t = x.type[i];
		if (interestStrength[t] > 0) {
			interest += interestStrength[t];
		}
		
	}
	
	var v = interest / total;
	
	if (soonFactor > 0) {
		if (x.when) {
			//TODO Fix this math
			var ageFactor = Math.exp( -1 * (Date.now() - x.when) / 1000.0 / 60.0 / 60.0  );
			v *= (ageFactor * (1.0 - soonFactor) );
		}
		else {
			v *= 0.5;
		}
	}
	if (nearestFactor > 0) {
		//...
	}
	
	return v;
}

function newObjectView(x) {
	var r = getRelevance(x);
	
	var fs = (1.0 + r/2.0)*100.0 + '%';
	
	var d = $('<div class="objectView" style="font-size:' + fs + '">');
	var xn = x.name;
	var authorID = ''; //Self.get('clientID');
	if (x.author) {
		var a = x.author;
		var ci = a.indexOf('<');
		if (ci!=-1) {
			a = a.substring(0, ci-1);
			authorID = x.author.substring(ci+1, x.author.length-1);
		}
		else {
			authorID = x.author;
		}
		
		xn = a + ': ' + xn;
	}
	
	var authorClient = clients[authorID];
	if (authorClient) {		
		d.append(getAvatar(authorClient.emailHash).attr('align', 'left'));
	}

	if (x.name) {
		d.append('<h1>' + xn + '</h1>');
	}
	
	/*
	if (x.type) {
		if (x.type.length) {
			d.append('<h3>' + JSON.stringify(x.type, null, 2) + '</h3>');
		}
		else
			d.append('<h3>' + x.type + '</h3>');
	}
	*/
	
	if (x.geolocation) {
		var dist = '?';
		if (Self.get('geolocation'))
			dist = geoDist(x.geolocation, Self.get('geolocation'));
		
		d.append('<h3>' + JSON.stringify(x.geolocation) + ' ' + dist + ' km away</h3>');
	}
	d.append('<h3>Relevance:' + parseInt(r*100.0)   + '%</h3>');
	
	if (x.text) {
		d.append('<p>' + x.text + '</p>');
	}
	
	return d;
}

function getAvatar(emailHash) {
	return $("<img>").attr("src","http://www.gravatar.com/avatar/" + emailHash + "&s=200");
}

function clearInterests() {
	interestStrength = { };
	interests = [ ];
	
	updateSelf();
	updateSelfUI();
}

function newObjectEdit(x) {
	var d = $('<div>');

	var sc = $('<div id="SelfContent"></div>');
	{
		sc.append('<div id="CurrentInterests"/>');
		sc.append('<div id="InterestActions"><div id="NewObjectFromInterestsWrapper"  style="display: none"></div>');
		
	}


	var b = $('<div/>').attr('style', 'text-align: center');
	
	var sa = $('<input type="range" min="0" max="100" value="0"/>');
	sa.change(function() {
		nearestFactor = sa.val() / 100.0;
		updateDataView();
	});
	b.append('Anywhere'); b.append(sa); b.append('Nearest<br/>');
	
	var sb = $('<input type="range" min="0" max="100" value="0"/>');
	sb.change(function() {
		soonFactor = sb.val() / 100.0;
		updateDataView();
	});
	b.append('Anytime'); b.append(sb); b.append('Recent<br/>');

	b.append('<br/>');
	b.append('<br/>');
	sc.append(b);
	
	var expandedDesc = false;
	var expandedMap = false;
	
	//var mi = $('<textarea rows="1" class="MessageSubject"/>');
	var mi = $('<input type="text" class="MessageSubject"/>');
	var md = $('<textarea class="MessageDescription" rows="5" /><br/>');
	
    mi.keyup(function(event) {
 
    	if (!expandedDesc) {
            if (event.keyCode==13) {
        		sendMessage(saveForm());
            }
      	}
    });
	
	var map;

	var ed = $('<div>');
	var emid = uuid();
	var em = $('<div id="' + emid + '" style="width: 100%; height: 200px">');
	
	var ex = $('<div>');
	
	var b = $('<button>+ Description</buton>');
	b.click(function() {
		expandedDesc = true;
		ex.show();
		ed.show();
		b.hide();
	});
	var c = $('<button>+ Location</buton>');
	c.click(function() {
		expandedMap = true;
		
		ex.show();
		em.show();
		c.hide();
		map = initLocationChooserMap(emid);
	});
	
	
	function saveForm() {
		if (!x) x = { };
		
		x.uuid = uuid();
		x.name = mi.val();
		
      	mi.val('');		
		
		if (expandedDesc) {
			x.text = md.val(); 
		}
		
		md.val('');
		
		if (map) {
			var tb = map.targetLocation.geometry.bounds;
			//TODO make this a funciton to get the center of a bounds, or find an existing one
			var avX = (tb.left + tb.right)/2.0;
			var avY = (tb.top + tb.bottom)/2.0;
			var p = new OpenLayers.LonLat(avX,avY);
			p = p.transform(toProjection, fromProjection);
			x.geolocation = [p.lat, p.lon];
		}
		
		ex.hide();
		em.hide();
		ed.hide();
		b.show();
		c.show();
		expandedDesc = false;
		
		return x;
	}
	
	md.appendTo(ed);
	$('<button>Attach</button>').appendTo(ex);
	
	var sendButton = $('<button><b>Save</b></button>');
	sendButton.click(function() {
		sendMessage(saveForm());
	});
	sendButton.appendTo(ex);
	sendButton.wrap('<div style="float:right">');
	
	
	ed.hide();
	em.hide();
	ex.hide();
	
	mi.appendTo(d);
	$('<br/>').appendTo(d);

	b.appendTo(d);
	c.appendTo(d);
	
	ed.appendTo(d);
	em.appendTo(d);
	
	if (x) {
		if (x.name)
			mi.val(x.name);
		
		var desc = '';
		
		if (x.text) {
			desc = desc + x.text + "\n\n";
		}
		
		
		if (x.values) {
			for (p in x.values) {
				var pr = x.values[p];
				for (v in pr) {
					var t = v + ': ' + pr[v]; 
					desc = desc + t + "\n";
				}
			}
		}
		
		if (d.length > 0) {
			md.val(desc);
			b.click();			
		}
			
	}
	
	sc.appendTo(d);
	ex.appendTo(d);


	return d;
}


function newTypeMenu() {
	var x = $('<ul class="sf-menu"/>');
	
	var m = { };
	for (var k in types) {
		var t = types[k];
		var path = k.split('.');
		if (path.length > 1) {
			if (!m[path[0]]) m[path[0]] = [];
			m[path[0]].push( path[1] ); 
		}
		else {
			
		}
	}
	for (var mm in m) {
		var menu = m[mm];
		var y = $('<li><a href="#">' + mm + '</a></li>');
		var u = $('<ul/>');
		y.append(u);
		for (var l = 0; l < menu.length; l++) {
			//console.dir(menu[l]);
			var iid = mm + '.' + menu[l];
			u.append('<li><a href="javascript:addInterest(\'' + iid + '\', false, true);">' +  menu[l] + '&nbsp;<span class="' + encodeInterestForElement(iid) + '-s"/></a></li>');
			
		}
		x.append(y);
	}
	
	
	setInterval(function() {
    	$.getJSON('/attention', function(a) {
			for (var i in a) {
				
				var t = a[i];
				var l = i;
				var attention = t[1]; //(t[1] - min) / (max - min);
				var instances = t[0];
				var name = t[2] || l;
				//console.log(name, instances, attention);
				
				var v = $('.' + encodeInterestForElement(i) + '-s');
				if (v)
					v.html(instances + ',' + attention);
			}
    	});
	}, 2000);
	
	return x.superfish();
}