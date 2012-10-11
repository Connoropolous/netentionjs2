/*
Indicator Plugin

contains code applicable to both client and server, though each
won't access the wrong code inadvertently as they are in separate
methods.
*/

var Indicator = {
    
    id: function() { "" },
    
    //list of named variables, their types, initial values, and limits, to generate UI controls for adjusting those variables
    options: function() { },
        
    //CLIENT called when this plugin is activated, to load and parse any necessary remote data (from web server)
    load: function() { },

    //CLIENT called when de-activated, in case there is opportunity to free memory using JS "delete" operator
    unload: function() { },
    
    /*CLIENT adjust result vector for the conditions calculated at a certain geopoint according to hueristics defined by option variables
    result vector includes any markers or labels to be drawn on the map*/
    updateLocal: function(geopoint, result) { },

    updateGlobal: function(onFinished) {     }
    
};

function analyzePointEvents(events, getMagnitude, geopoint) {
    var r = { };

    r.nearestDist = ASTRONOMICAL_DISTANCE;
    r.sumInvSquareDistTimesMagnitude = 0;

    for (var i = 0; i < events.length; i++) {
        
        var e = events[i];
        var magnitude = getMagnitude(e);

        var dist = geoDist( [ e.lat, e.lon ], geopoint );
        if (dist < r.nearestDist) {
            r.nearestDist = dist;
            r.nearest = e;
        }

        r.sumInvSquareDistTimesMagnitude += magnitude * (1 / (dist*dist));

    }

    return r;

}

function setSensor(sensorID, enabled) {
    var ce = "controlEnabled";
    var x = getSensorControls(sensorID);
    var defaultSensorImportance = 25;

    if (enabled) {
         x.addClass(ce);                   
         setInterest(sensorID, defaultSensorImportance, true, true);
    }
    else {
         x.removeClass(ce);
         setInterest(sensorID, 0, true, true);
    }
 }

 function getSensorItem(sensor) { return $('#sensor-' + sensor); }
 function getSensorControls(sensor) { return $('#sensorControl-' + sensor); }

 function setInterest(sensorID, newImportance, force, updateAll) {
     //console.log('sensor: ' + sensor + ' importance=' + newImportance);
     var oldImportance = sensorImportance[sensorID];
     if (force!=true) {
         if (oldImportance == newImportance)
             return;
     }

     var sensor = getSensorItem(sensorID);
     sensor.removeClass('sensorItem25');
     sensor.removeClass('sensorItem50');
     sensor.removeClass('sensorItem75');
     sensor.removeClass('sensorItem100');

     var controls = getSensorControls(sensorID);
     if (newImportance == 0) {
         controls.html('');
     }
     else {
         //if (oldImportance == 0) {
             var ch = '<input title="Importance" type="range" value="' + newImportance + 
                 '" min="25" max="100" step="25" alt="Importance" onChange="setInterest(\'' + sensorID + '\', this.value, false, true);" />';
             if (sensorClient[sensorID]!=undefined) {
                 if (sensorClient[sensorID].getControlHTML!=undefined) {
                     ch = ch + sensorClient[sensorID].getControlHTML();
                 }
             }

             controls.show();
             controls.html(ch);
         //}

         if (newImportance <= 25) {
             sensor.addClass('sensorItem25');
         }
         else if (newImportance <= 50) {
             sensor.addClass('sensorItem50');                    
         }
         else if (newImportance <= 75) {
             sensor.addClass('sensorItem75');                    
         }
         else /*if (newImportance <= 100)*/ {
             sensor.addClass('sensorItem100');                    
         }
     }

     sensorImportance[sensorID] = newImportance;

     if (updateAll==true) {
         saveInterests();
         update();
     }
 }

 function setSensorClient(sensorID, client) {
     sensorClient[sensorID] = client;
 }

 function updateSensorClient(s) {
     if (s!=null) {
         if (s['clientJS'] != undefined) {


             $.getScript(s['clientJS'])
                 .done(function(script, textStatus) {                                
                 })
                 .fail(function(jqxhr, settings, exception) {
                     console.error('Loading clientJS:');
                     console.dir( exception );
                     console.dir( jqxhr );
                 });  

         }
     }

 }

 function addSensor(target, sensor) {
     if (sensor.id === undefined) {
         //Blank placeholder sensor
         var ii = nextControlID++;
         sensor = {
             id: ii,
             name: sensor
         };
         var controlID = 'sensorControl-' + sensor.id;

         $(target).append('<li><div id="sensor-' + sensor.id + '" class="sensorItem"><input type="checkbox" onclick="setSensor(\'' + sensor.id + '\', this.checked)"/>' + sensor.name + '<div id="' + controlID + '" class="sensorControl controlDisabled">' + controls + '</div></div></li>');

         sensors[sensor.id] = sensor;
         sensorImportance[sensor.id] = 0;
     }
     else {
         //Defined sensor                    
         now.getSensor(sensor.id, updateSensorClient);                    


         var controlID = 'sensorControl-' + sensor.id;

         $(target).append('<li><div id="sensor-' + sensor.id + '" class="sensorItem"><input type="checkbox" onclick="setSensor(\'' + sensor.id + '\', this.checked)"/>' + sensor.name + '<div id="' + controlID + '" class="sensorControl controlDisabled">' + controls + '</div></div></li>');

         sensors[sensor.id] = sensor;
         sensorImportance[sensor.id] = 0;
     }


 }

 function addSensorCategory(name) {
     var i = 'sensorCategory-' + (nextCategoryID++);
     var h = '<li id="' + i + '"><b>' + name + '</b><ul>';
     h = h + '</ul></li>';
     $('#tree1').append(h);
     return '#' + i + ' ul';
 }

 var sensorsInitted = false;

 function initSensors() {

     $.getScript("/sensors.js", function(data, textStatus, jqxhr) {
         convertTrees(); //in mktree.js, adds buttons to expand/collapse children                                

         expandTree('tree1');

         sensorsInitted = true;

         loadInterests();

     });                                        

 }
