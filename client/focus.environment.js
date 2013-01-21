/* raw environment / climate interface similar to ClimateViewer and early GSS prototypes */

//http://p2pfoundation.net/NORA_Commons_Resource_Model
// @ "was last modified on 19 January 2013, at 04:45."

//TODO include 'Terraform' button allowing people to specify desired climate/geology/etc... for a given region

var EnvironmentFocus = {
    
    start: function(self, target) {
        var nf = $('#EnvironmentFocus');
        nf.show();
        
        nf.html('');


        var t = { };
        
        /*
        Air and Atmosphere
            air quality near the Earth’s surface
            air quality affecting the ozone layer
            gaseous composition of the atmosphere, including greenhouse gases
        
        Water
            fresh water (surface, groundwater)
            brackish and estuarine water
            marine water
            ice (glaciers, ice caps, permafrost)
        
        Land
            land for agriculture and forestry (annual crops, horticulture, gardens, orchards, grazing and range land, forest plantations, freshwater aquaculture etc.)
            land for nature preservation
            land used for mining
            land used for industrial manufacturing and energy generation
            urban (residential and commercial) land
            land used for waste disposal
        
        Energy
            fossil fuels
            solar (photovoltaic, solar thermal, building design)
            wind energy (used for wind power, sailing ships)
            energy from water (rivers, tides, ocean currents)
            geothermal energy
            energy from biological sources (wood and other fuels, organic waste)
            animal power
            human power (e.g., cycling, seesaws to power water pumps)
            Minerals
            iron and other ferrous metals
            non-ferrous metals
            rare earths
            common rocks and gravel (e.g., granite, marble, slate)
            clay
            gems
        
        Living things (plants, animals, fungi, micro-organisms)
            crop plants (genetic diversity and resilience)
            domesticated animals (genetic diversity and resilience)
            plant species (as well as larger taxonomic groups or vegetation types)
            animal species (as well as larger taxonomic groups)
            habitats and ecosystems
        
        Physical, human-made assets
            buildings and the spaces around them
            transportation infrastructure
            communications and information infrastructure
            the built structures of cities and towns
            vehicles and transport equipment
            furniture and household appliances
            industrial equipment and machinery
            repositories of knowledge (libraries)
            works of art, craft, cultural artifacts etc.
        */
        
        /*
        nf.append('<h3>Shelter</h3>');
        nf.append(newTagSliders(
            self,
            [ 'Bridge', 'Homeless Shelter',  'Hotel', 'Camping', 'CouchSurf', 'Hostel', 'Apartment', 'RealEstate', 'Occupy' ]
        , t, setFocusWithTagSliderResult));
        */
    
        
                        
    },
    
    set: function(x) {
        
        
    },
    
    stop: function(target) {
        $('#ClimateFocus').hide();
    },
    
    clear: function() {
    
    },
    
    get : function() {
//        var x = { };
//        var f = this.self.focus();
//        
//    
//        x.uri = f.uri;
//        x.tag = f.tag;
//        x.tagStrength = f.tagStrength;
//                        
//        if (!x.author)
//            x.author = this.self.get('clientID');
//        x.when = Date.now();
//        
//        x.name = $('#FocusName').val();
//        
//        var fdv = $('#FocusDescription').val();
//        if (fdv.length > 0)
//            x.text = fdv;
//        
//        x.values = [];
//        
//        var pe = this.propertyEdits;
//        for (var p = 0; p < pe.length; p++) {
//            var px = pe[p];
//            x.values.push( { uri: px.data('property'), value: px.data('value')() } );
//        }
//        
//        if (this.focusMap) {
//            var r = this.focusMap.location();    
//            x.geolocation = [ r.lat, r.lon ];
//        }
//        
//        return x;

        return { };
        
    }
};

