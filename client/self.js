var interestStrength = { };
var interests = []; //current set of interests
var sensorClient = { };

var sensorsInitted = false;
var connected = false;

var defaultInitialInterest = 25;

function loadInterests() {
    interestStrength = Self.get('interests');
    if (interestStrength == null) {
        interestStrength = { };    
    }

    for (var k in interestStrength) {
        var s = getInterestItem(k);
        var v = interestStrength[k];


        if (v > 0) {
            addInterest(k, true, false);
            setInterest(k, v, true, false);
        }
    }

    updateSelf();


}

function loadSelf() {
    var n = Self.get("name");
    if (n == undefined) {
        n = 'Anonymous';
        Self.set("name", n);
    }

    $('#selfName').val( n );
}

function saveInterests() {
    var si = { };
    for (var k in interestStrength) {
        var v = interestStrength[k];
        if (v > 0) {
            si[k] = v;
        }
    }
    Self.set('interests', si);
}

function saveSelf() {
    var n = $('#selfName').val();
    Self.set("name", n);

    updateStatus();
}


function updateSelfUI() {
    var h = '';
    h = h + '<h1>' + Self.get('name') + '</h1>';

    h = h + '<a href="javascript:setLocation()">Geolocation</a>: ' + (Self.get('geolocation') == undefined ? 'Unknown' : Self.get('geolocation')) + '</h1>';
    
    //...
}

function getSelfSnapshot() {
    return {
        name: Self.get('name'),
        geolocation: Self.get('geolocation'),
        interests: Self.get('interests')
    };
}

function connectSelf() {
    socket.emit('connectSelf', Self.get('clientID'));
}
function updateSelf() {
    if (!connected) {
        connectSelf();
        connected = true;
    }
    socket.emit('updateSelf', getSelfSnapshot());
}

function getInterestItem(sensor) { return $('#Interest-' + interestElements[sensor]); }
function getInterestControls(sensor) { return $('#InterestControl-' + interestElements[sensor]); }

function setInterest(sensorID, newImportance, force, updateAll) {
    //console.log('sensor: ' + sensor + ' importance=' + newImportance);
    var oldImportance = interestStrength[sensorID];
    if (force!=true) {
        if (oldImportance == newImportance)
            return;
    }

    var sensor = getInterestItem(sensorID);
    sensor.removeClass('interestItem25');
    sensor.removeClass('interestItem50');
    sensor.removeClass('interestItem75');
    sensor.removeClass('interestItem100');

    var controls = getInterestControls(sensorID);
    
    //if (oldImportance == 0) {
        var ch = $('<span class="ImportanceButtons"/>');

        function addButton(label, value) {
            var b = $('<button>').html(label);
            b.click(function(event) {
            	setInterest( sensorID, value, false, true)
            	event.stopImmediatePropagation();            	
            });
            
            if (value!=0)
            	b.addClass('interestItem'+value);
            ch.append(b);        	
        }
        addButton('&#9587', 0);
        addButton('&nbsp;&nbsp;', 25);
        addButton('&nbsp;&nbsp;', 50);
        addButton('&nbsp;&nbsp;', 75);        
        addButton('&nbsp;&nbsp;', 100);
        
        if (sensorClient[sensorID]!=undefined) {
            if (sensorClient[sensorID].getControlHTML!=undefined) {
                ch.append( sensorClient[sensorID].getControlHTML() );
            }
        }

        controls.show();
        controls.html(ch);
    //}

    if (newImportance == 0) {
        if (confirm('Remove ' + sensorID + ' ?')) {
            removeInterest(sensorID);
        }
        else {
            setInterest(sensorID, oldImportance, true, false);
        }
    }
    else {
        if (newImportance <= 25) {
            sensor.addClass('interestItem25');
        }
        else if (newImportance <= 50) {
            sensor.addClass('interestItem50');                    
        }
        else if (newImportance <= 75) {
            sensor.addClass('interestItem75');                    
        }
        else /*if (newImportance <= 100)*/ {
            sensor.addClass('interestItem100');                    
        }

        interestStrength[sensorID] = newImportance;
    }

    if (updateAll==true) {
        saveInterests();
        updateSelf();
    }
}

function newInterest(i) {
    return {
        id: i,
        name: i
    };
}

//function eid(myid) { 
//	return myid.replace(/(:|\.\/)/g,'\\$1');
//}

var urlInterests = {};
var nextURLInterest = 0;
var interestElements = {};
var selectedInterests = [];

function addInterest(i, force, update) {

    if (force!=true)
        if (interestStrength[i]!=undefined) //prevent adding duplicate
            return;

    var ni = newInterest(i);
    interests.push(ni);

    var eid = ni.id;
    var ename = ni.name;
    
    //use a sequential element ID instead of putting the URL in the element (which may contain invalid characters for jQuery selectors)
    if (i.indexOf('http://')==0) {
    	eid = 'URL'+nextURLInterest;
    	nextURLInterest++;
    }    
    
	var ss = $('<div id="Interest-' + eid + '" class="InterestItem"></div>');
    $('#CurrentInterests').append(ss);
    ss.click(function() {
    	var s = ss.data('selected');
    	s = !s;
    	ss.data('selected', s);
    	
    	if (s) {
    		ss.addClass('interestSelected');
    		selectedInterests.push(i);
    	}
    	else {
    		ss.removeClass('interestSelected');
    		selectedInterests.splice(selectedInterests.indexOf(i),1);
    	}
    	
    	if (selectedInterests.length > 0) {
    		$('#NewObjectFromInterestsWrapper').show();
    	}
    	else {
    		$('#NewObjectFromInterestsWrapper').hide();
    	}
    		
    });
    
    ss.append('<span id="InterestControl-' + eid + '"></span>');
    ss.append(ename);
    ss.append($('<br>'));
    
    //annotate the interest with extra controls and menus
    if (i.indexOf('http://')==0) {
    	var cortexitButton = $('<button>Read</button>');
    	cortexitButton.click(function() {
    		showCortexit(i);
    	});
    	ss.append(cortexitButton);    
    }
    
//    var types = getProperties(i);
//    if (types.length > 0) {
//        
//        var tm = '<ul class="sf-menu"><li><a href="#">[+]</a><ul>';
//        for (var j = 0; j < types.length; j++) {
//            var v = types[j];
//            if (isCommonProperty(v)) {
//                //do not add
//            }
//            else if (schema.properties[v].comment.indexOf('legacy spelling')!=-1) {
//
//            }
//            else {
//                tm += '<li><a href="#">' + v + '</a></li>';
//            }             
//        }
//        tm += '</ul></li></ul>';
//        
//        var r = $(tm);
//        r.prependTo('#Interest-' + eid);
//        r.superfish();
//        //$('#Interest-' + i + ' ul').superfish();
//        //$('#Interest-' + i).append(tm);
//        
//    }

    if (update == undefined)
        update = true;
    
    interestElements[i] = eid;
    
    setInterest(i, defaultInitialInterest, true, update);
    
}

function addURL() {
	var url = window.prompt("Webpage URL","http://");
	addInterest(url, true, true);
}

function removeInterest(i) {
    getInterestItem(i).fadeOut();
    delete interestStrength[i];
}

function initSelfUI() {
    applyTemplate("#presetTemplate", [

        //{ name: "1st World Civilization", desc: "The amenities and benefits of the world's most advanced societies." },                            
        { name: "Camping", desc: "Camping in nature, away from civilization." },                            
        //{ name: "3rd World Civilization", desc: "Developing regions must be ready to adapt to environmental problems." },                     
        { name: "Food", desc: "Edible and drinkable substances" },
        { name: "Disaster", desc: "When evacuation becomes a priority, avoid disaster with a set of minimal but critical concerns." },                            
        { name: "Wellness", desc: "Healthcare, hospital, pharmacies, etc..." }
    ], "#presetsSurvive" );    

    applyTemplate("#presetTemplate", [

        { name: "Fun", desc: "Entertainment and enjoyment" },           
        { name: "Explore", desc: "Discover something new" },           
        { name: "Adventure", desc: "Adventure, quest, or surprising opportunity" },
        { name: "Learn", desc: "Educational resources" },
        { name: "Relax", desc: "Chill out, do nothing, sleep" }
    ], "#presetsGrow" );

    applyTemplate("#presetTemplate", [

        { name: "Labor", desc: "Work and jobs that pay" },           
        { name: "Volunteer", desc: "Opportunities to contribute" },           
        { name: "Rescue", desc: "Help, liberate, or assist those in need or distress" },
        { name: "Meet", desc: "Meet new people" }

    ], "#presetsShare" );


    $('#EditMenu #DoMenu').after('<li><a href="#">Have</a>' + loadTypeMenu(null, getSchemaRoots()) + '</li>');
    $('#EditMenu').superfish(); 

}


function toggleProfile() {
    $('#Profile').toggle(500);
}

var cortexitID = 0;
function showCortexit(url) {
    socket.emit('getSentencized', url, function(s) {
    	var cid = 'cortexit-' + cortexitID;
    	var d = $('<div id="' + cid + '" style="position:fixed; height:90%; top: 3%; width: 90%; left: 5%;"></div>');
    	for (var i = 0; i < s.length; i++) {
    		d.append($('<p>' + s[i] + '</p>'));
    	}
    	$('body').append(d);
    	cortexit(cid, {
    		onClose: function() {
    			d.hide();
    		}
    	});
    	cortexitID++;
    });	
}

function getTypeLabel(t) {
	return t;
}

function getTypeProperties(t) {
	return [
		{ name: 'Property A' },
		{ name: 'Property B' }
	        ];
}

function initObjectEditor(ele, object) {
	var e = $('#' + ele);

	var name = object.name;
	
	$('<input class="nameInput" type="text" autofocus="true" placeholder="Title" value="' + name + '"></input>').appendTo(e);
	
	var typeMenu = $('<div data-role="navbar" class="typeMenu"></div>');
	
	var addTypeButton = $('<div data-role="collapsible" data-collapsed="true"><h3>+</h3></div>');
	addTypeButton.collapsible();
	addTypeButton.appendTo(typeMenu);
	
	{
		for (i = 0; i < object.types.length; i++) {
			var t = object.types[i];
			var m = $('<div data-role="collapsible" data-collapsed="true" class="typeCollapsible"></div>');
			$('<h3>' + getTypeLabel(t) + '</h3>').appendTo(m);
			
			var props = getTypeProperties(t);
			for (p = 0; p < props.length; p++) {						
				$('<p/>').html( $('<a/>').attr('href', '#').html(props[p].name)).appendTo(m);						
			}
			
			m.collapsible();
								
			m.appendTo(typeMenu);
			
		}
	}
	typeMenu.appendTo(e);
	
	var valueArea = $('<div class="valueArea"></div>');
	for (var j = 0; j < object.values.length; j++) {
		var v = object.values[j];
		var vs = JSON.stringify(v);
		var ivs = $('<input class="valueInput" type="text"/>');
		ivs.attr('value', vs);
		ivs.appendTo(valueArea);
	}
	valueArea.appendTo(e);
	
	var eBottom = $('<div class="eBottom"></div>');
	{
		var deleteButton = $('<a href="#" data-role="button" data-icon="delete" data-inline="true">Delete</a>');
		deleteButton.button();
		deleteButton.appendTo(eBottom);

		var updateButton = $('<a href="#" data-role="button" data-icon="check" data-theme="b" data-inline="true" class="updateButton">Update</a>');
		updateButton.button();
		updateButton.appendTo(eBottom);
	}			
	eBottom.appendTo(e);
	
	$.mobile.changePage();
}

function newObjectFromInterests() {
	$('#SelfContent').html('');
	
	initObjectEditor('SelfContent', {
		id: '[uuidhere]',
		types: selectedInterests,
		name: 'Untitled',
		values: []
	});
	
}