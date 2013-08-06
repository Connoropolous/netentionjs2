/* version 1.1 - 05-26-2013 */

var themes = {
    "ui-lightness":'Bright',
    "ui-darkness":'Dark',
    "_matrix-green":'Matrix (green)',
    "_matrix-red":'Matrix (red)',
    "_matrix-blue":'Matrix (blue)',
    "_space": 'Space',
    "_cybernetic": 'Cybernetic',
    "_notebook": 'Notebook',
    "_rainforest": 'Rainforest',
    "black-tie": 'Black Tie',
    "blitzer": 'Blitzer',
    "cupertino": 'Cupertino',
    "dark-hive": 'Dark Hive',
    "dot-luv": 'Dot Luv',
    "excite-bike": 'Excite Bike',
    "flick": 'Flick',
    "hot-sneaks": 'Hot Sneaks',
    "humanity": 'Humanity',
    "le-frog": 'Le Frog',
    "mint-choc": 'Mint Chocolate',
    "overcast": 'Overcast',
    "pepper-grinder": 'Pepper Grinder',
    "redmond": 'Redmond',
    "smoothness": 'Smoothness',
    "south-street": 'South Street',
    "start": 'Start',
    "sunny": 'Sunny',
    "swanky-purse": 'Swanky Purse',
    "trontastic": 'Trontastic',
    "vader": 'Vader'    
};

function renderOptions(s, o, v) {
   
    $('#Options').show();

    var themeSelect = $('<select id="themeSelect"/>');    
    for (var k in themes) {
        themeSelect.append($('<option id="' + k + '">' + themes[k] + '</option>' ));
    }
    themeSelect.change(function() {
        var t = $(this).children(":selected").attr("id");
        setTheme(t);
    });

    v.append('<h1>Theme</h1>');
    v.append(themeSelect);
    
    v.append('<h1>Plugins</h1>');
    
    var plugins = newDiv();
   
    updatePlugins(plugins);
    v.append(plugins);
    
    /*
                        <!--
                        <li class="dropdown-submenu">
                            <a tabindex="-1" href="#"><img alt="options" src="icon/manage.png"/>Options</a>
                            <ul class="dropdown-menu">
                                <li><a href="#">Listen to all Channels</a></li>
                                <li><a href="#">Silence</a></li>
                                <li><a href="javascript:confirmClear()">Clear Local Memory</a></li>
                            </ul>
                        </li>
                        -->
                      <hr>
                        <a href="/plugins.html" target="_blank"><img alt="plugins" src="icon/workflow.png"/>Plugins</a>
                        <!-- <li><a href="/tests.html"><img alt="system tests" src="icon/vote.png"/>System Tests</a></li> -->
                        <!-- <li><a href="/#/team"><img alt="team" src="icon/user-group.png"/>Team</a></li> -->
                        <!--<li><a href="/#/new">New</a></li><br/>-->
                        <!-- <li><a href="/#/tags"><img alt="tags: src="icon/back-to-ou.png"/>Tags</a></li> -->
                        <a href="/#/help">Help</a>
                        
                        <br/>
                        <div id="ViewOptions"></div>
                        <div id="ViewSelect" class="ViewSelectNormal"></div>

                    <!-- <a class="btn" href="#">Location</a> -->
                </div>
    */
    
}

            function updatePlugins(p) {                
                self.getPlugins(function(pl) {

                    p.html('');
                    for (var kk in pl) {
                        (function() {
                            var k = kk;
                            var pu = pl[k];

                            var pd = $('<div class="PluginID ui-widget-header"></div>');
                            pd.append('<h3><a target="_blank" href="/plugin/' + pu.filename + '">' + k + '</a></h3>');

                            if (pu.description)
                                pd.append('<span>' + pu.description + '</span>');

                            if (!(pu.valid == false)) {
                                pd.append('<br/>');
                                if (pu.enabled) {
                                    pd.addClass('PluginEnabled');

                                    var b = $('<button>Disable</button>');
                                    b.click(function() {
                                       self.setPlugin(k, false, function(err) {
                                            if (!err)  {
                                                updatePlugins(p);
                                                //notify
                                            }
                                            else {
                                                $.pnotify({
                                                    title: 'Unable to configure plugin',
                                                    text: err                       
                                                }); 
                                            }
                                       }); 
                                    });
                                    pd.append('<span>Currently enabled.</span>&nbsp;');
                                    pd.append(b);
                                }
                                else {
                                    pd.addClass('PluginDisabled');

                                    var b = $('<button>Enable</button>');
                                    b.click(function() {
                                       self.setPlugin(k, true, function(err) {
                                            if (!err)  {
                                                updatePlugins(p);
                                                //notify
                                            }
                                            else {
                                                $.pnotify({
                                                    title: 'Unable to configure plugin',
                                                    text: err                       
                                                }); 
                                            }
                                       }); 
                                    });
                                    pd.append('<span>Currently disabled.</span>&nbsp;');
                                    pd.append(b);                            
                                }
                            }
                            else {
                                pd.addClass('PluginInvalid');
                            }
        //                    var ps = $('<div class="PluginSettings"></div>');
        //                    if (pu.valid) {
        //                        
        //                            
        //                        //ps.append(px);
        //                    }
        //                    else {
        //                        ps.html('' + JSON.stringify(pu) + '</div>');
        //                    }
        //                    pd.append(ps);

                            p.append(pd);
                        })();

                    }
                });
            }
            
            /*$(document).ready(function(){
                netention(function(self) {
                    window.self = self;
                    
                    $('#PluginList').html('Loading...');
                    self.on('change:plugins', updatePlugins);
                    self.getPlugins();
                    
                    
                });
            });*/
