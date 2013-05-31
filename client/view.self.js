/* http://www.perbang.dk/rgbgradient/
    6 steps between: AFE500 and FF3B2E
        AFE500 E9EA08 EFBB11 F48E1A F96324 FF3B2E
*/

var tagColorPresets = {
    'BeginnerStudent': '#AFE500',
    'IntermediateStudent': '#E9EA08',
    'CollaboratingStudent': '#EFBB11',
    'CollaboratingTeacher': '#F48E1A',
    'IntermediateTeacher': '#F96324',
    'ExpertTeacher': '#FF3B2E',
    'Can': 'fuchsia',
    'Need': '#bbf',
    'Not': 'gray'
};

var tagAlias = {
    'BeginnerStudent': 'α',
    'IntermediateStudent': 'β',
    'CollaboratingStudent': 'γ',
    'CollaboratingTeacher': 'δ',
    'IntermediateTeacher': 'ε',
    'ExpertTeacher': 'ζ'
};

function newTagBarSaveButton(s, currentTag, tagBar, onSave) {
    var saveButton = $('<button>Save</button>');
    saveButton.addClass('WikiTagSave');
    saveButton.click(function() {
        if (currentTag==null) {
            alert('Choose a wikitag.');                
            return;                
        }

        var selTags = [];

        tagBar.find('div input').each(function() {
           var x = $(this);
           var c = x[0].checked;
           if (c) {
               var i = x.attr('id');
               var i = i.split('_')[1];
               selTags.push(i);
           }
        });
        if (selTags.length > 0) {
            var id = s.id() + '-' + currentTag;
            var o = objNew(id, currentTag);
            o.author = s.id();
            objAddTag(o, currentTag);

            for (var i = 0; i < selTags.length; i++) {
                objAddTag(o, selTags[i]);
            }

            
            s.pub(o, function(err) {
                $.pnotify({title: 'Error saving:', text: err, type:'error'});
            }, function() {
                s.notice(o);
                $.pnotify({title: 'Saved', text: currentTag});
            });                            
            
            if (onSave)
                onSave();
        }
        else {
            alert('Choose 1 or more tags to combine with the wikitag.');
        }
        
        
    });
    return saveButton;
}
function newTagBar(s, currentTag) {
    var tagBar = $('<div/>');

    //http://jqueryui.com/button/#checkbox
    var skillSet = $('<div/>');
    var canNeedSet = $('<div/>');

    function tbutton( tag, target) {
        var b = $('<input/>');
        var cid = uuid() + 'skill_' + tag + '_' + currentTag;
        b.attr('id', cid);
        b.attr('type', 'checkbox');            
        
        b.html(tag);
        b.click(function(event) {
            var t = event.target;
            if (t.checked) {
                target.children('input').each(function() {
                   var x = $(this);
                   if (x.attr('id')!=t.id) {
                       x.attr('checked', false);
                   }
                });
                target.buttonset('refresh');
            }
        });
        target.append(b);

        var tt = s.tag(tag);
        
        var tagname;
        var tooltip;
        if (tagAlias[tag]) {
            tagname = tagAlias[tag];            
            if (tt)
                tooltip = tt.name;
        }
        else 
            tagname = tt ? tt.name : tag;
        
        var l = $('<label for="' + cid + '">' + tagname + '</label>');
        l.attr('title', tooltip);
        l.attr('style','color:' + tagColorPresets[tag]);
        target.append(l);
        return b;
    }


    {
        tbutton('BeginnerStudent', skillSet);
        tbutton('IntermediateStudent', skillSet);
        tbutton('CollaboratingStudent', skillSet);
        tbutton('CollaboratingTeacher', skillSet);
        tbutton('IntermediateTeacher', skillSet);
        tbutton('ExpertTeacher', skillSet);
    }
    tagBar.append(skillSet);
    skillSet.buttonset();

    tagBar.append('<br/>');

    {
        tbutton('Can', canNeedSet);
        tbutton('Need', canNeedSet);
        tbutton('Not', canNeedSet);
    }
    tagBar.append(canNeedSet);                
    canNeedSet.buttonset();        

    tagBar.append('<br/>');        
    return tagBar;
}

function getKnowledgeCode(s, userid) {
    userid = userid.substring(5);
    
    var tags = s.getIncidentTags(userid, _.keys(tagColorPresets));                 
        
    
    for (var k in tags) {
        var l = tags[k];
        for (var i = 0; i < l.length; i++)            
            l[i] = l[i].substring(l[i].indexOf('-')+1, l[i].length);
    }
    
    tags['@'] = objSpacePointLatLng(self.object('Self-' + userid));    
    
    return JSON.stringify(tags,null,0);
}

function newTagBrowser(s) {
    var b = $('<div/>');
    
    var searchInput = $('<input placeholder="Search Wikipedia"/>');
    var searchInputButton = $('<button>&gt;&gt;&gt;</button>');
    searchInputButton.click(function() {
       gotoTag(searchInput.val(), true); 
    });
    b.append(searchInput);
    b.append(searchInputButton);
    
    var br = $('<div/>');
    br.addClass('WikiBrowser');
    
    
    var currentTag = 'Learning';
    
    function gotoTag(t,search) {        
        br.html('Loading...');
        currentTag = t;
        
        if (t == null) {
            $.get('/skill-home.html', function(d) {
               br.html('');
               br.append(d); 
s
            });
            
        }
        else {
            var url = search ? '/wiki/search/' + t : '/wiki/' + t + '/html';

            function newPopupButton(target) {
                var p = $('<a href="#" title="Popup">+</a>');
                p.click(function() {
                    var d = newPopup(target, {width: 400});
                    var tagBar = newTagBar(s, target);
                    var saveButton = newTagBarSaveButton(s, target, tagBar, function() {
                        d.dialog('close');
                    });

                    d.append(saveButton);        
                    d.prepend(tagBar);

                });
                return p;
            }
            
            $.get(url, function(d) {
               br.html('');
               br.append(d); 
               
               if (search) {
                    currentTag = $('.WIKIPAGEREDIRECTOR').html();
               }
               
               br.find('#top').remove();
               br.find('#siteSub').remove();
               br.find('#contentSub').remove();
               br.find('#jump-to-nav').remove();
               br.find('a').each(function(){
                   var t = $(this);
                   var h = t.attr('href');
                   t.attr('href', '#');
                   if (h) {
                    if (h.indexOf('/wiki') == 0) {
                        var target = h.substring(6);
                        t.click(function() {
                             gotoTag(target); 
                        });
                         
                        t.after(newPopupButton(target));
                    }
                   }
               });
               var lt = newPopupButton(currentTag);
               br.find('#firstHeading').append(lt);
            });
            
            //..
        }
    }
    gotoTag(currentTag);
        
    b.append(br);
    
    
    /*{
        var tagBar = newTagBar(s, currentTag);
        var saveButton = newTagBarSaveButton(s, currentTag, tagBar);
        
        b.append(saveButton);        
        b.prepend(tagBar);
    }*/
    
    return b;    
}

function newSelfTagList(s, user, c) {

    var b = $('<div/>');
         
    var tags = s.getIncidentTags(user.id.substring(5), _.keys(tagColorPresets));            
    
    //var svbp = $('<div/>').attr('class', 'SelfViewButtonPanel');
    
    /*svbp.append(addButton = $('<button class="SelfAddTagButton">+</button>'));
    ownButton.click(function() {
        c.html(newSelfSummary(s, user));
    });
    addButton.click(function() {
        c.html(newTagBrowser(s));        
    });
    
    
    b.append(svbp);*/

    function newTagWidget(x, i) {
        var name
        var o = s.getObject(i);
        if (o) {
            var tags = objTags(o);
            var otherTags = _.without(tags, x);  
            var b = $('<div>' +  + '</div>');
            var a = $('<a href="#">' + otherTags[0] + '</a>');
            a.click(function() {
                newPopupObjectView(i);
            });
            a.appendTo(b);
        }
        return b;        
    }
    
    function addTagSection(x) {
        if (!x) return;
        
        var cl = tags[x];
        
        var color = tagColorPresets[x] || 'gray';
        
        var xn = s.tag(x).name;
        b.append('<div><h4><span style="padding-right: 0.2em; background-color: ' + color + '">&nbsp;&nbsp;</span>&nbsp;' + xn + '</h4></div>');
        
        for (var i = 0; i < cl.length; i++) {
            b.append(newTagWidget(x, cl[i]));
        }
        
        b.append('<br/>');
    }
    var k = _.keys(tags);
    if (k.length > 0) {

        var pinnedSections = ['ExpertTeacher', 'IntermediateTeacher', 'CollaboratingTeacher', 'CollaboratingStudent', 'IntermediateStudent', 'BeginnerStudent' ];
        for (var i = 0; i < pinnedSections.length; i++) {
            var p = pinnedSections[i];
            if (_.contains(k, p)) {
                addTagSection(p);
                k = _.without(k, p);
            }        
        }


        //ADD buttons for each tag
        for (var i = 0; i < k.length; i++) {
            addTagSection(k[i]);
        }
    }
    else {
        if (user) {
            var own = (user.id === s.myself().id);
            b.append('Click ');

            var addLink = $('<button><b>+ Tag</b></button>' );
            if (own) {
                addLink.click(function() {
                    c.html(newTagBrowser(s));           
                });
            }
            else {
                addLink.click(function() {
                    alert('Feature not available yet.');
                });
            }
            b.append(addLink);
            b.append(' to add tags to describe ' + (own ? 'yourself' : user.name));
        }
        
    }
    
    return b;
}

function newSelfSummary(s, user, content) {
    var editable = (user.id === s.myself().id);
    
    var c = $('<div/>');        
    $.get('/self.header.html', function(d) {
        c.prepend(d);        
    });

    var tags = { };

    var np = $('<div/>');
    np.addClass('SelfMeta');
    
    var nameInput = $('<input type="text" placeholder="Name"/>');
    nameInput.val(user.name);
    np.append(nameInput);
    np.append('<br/>');
    var emailInput = $('<input type="text" placeholder="E-Mail"/>');
    emailInput.val(user.email);
    np.append(emailInput);

    if (!editable) {
        nameInput.attr('readonly', true);
        emailInput.attr('readonly', true);
    }
    
    np.append('<br/><br/>');
    
    var exportButton = $('<button>Export..</button>');
    exportButton.click(function() {
        var p = newPopup('Code @ ' + new Date(), {width: 400, height: 400});
        p.html('<textarea class="SelfCode" readonly="true">' + getKnowledgeCode(s, user.id) + '</textarea>');
    });
    np.append(exportButton);

    if (editable) {
        var tagButton = $('<button title="Add tags to describe your self"><b>+ Tag</b></button>');
        tagButton.click(function() {
            content.html(newTagBrowser(s));
        });
        np.append(tagButton);
    }
    else {
        var tagButton = $('<button title="Add tags to describe ' + user.name + '"><b>+ Tag</b></button>');
        tagButton.click(function() {
            alert('Feature not available yet.');
        });
        np.append(tagButton);
    }
    

    c.append(np);

    var bio = $('<div id="Bio"/>');
    bio.html('');

    //http://en.wikipedia.org/wiki/HResume

    var objarea = $('<div id="BioText"></div>');        
    if (editable)
        objarea.attr('contenteditable', 'true');
    
    var biotext = objDescription(user);
    if (!biotext) {
        objarea.html('<h2>Biography</h2>objective / summary / contact method / experience / achievements / eduction / skills / qualifications / affiliations / publications');
    }
    else {
        objarea.html(biotext);
    }
    
    bio.append(objarea);
 
    if (editable) {
        var resetButton = $('<button>Reset</button>');    
        bio.append(resetButton);
    
        var saveButton = $('<button><b>Save</b></button>');
        bio.append(saveButton);

        saveButton.click(function() {
           var m = s.myself();
           m.name = nameInput.val();
           m.email = emailInput.val();
           objRemoveDescription(m);
           objAddDescription(m, objarea.html());
           objTouch(m);

           s.pub(m, function(err) {
               $.pnotify({
                  title: 'Unable to save Self.',
                  type: 'Error',
                  text: err
               });           
           }, function() {
               s.notice(m);
               $.pnotify({
                  title: 'Self Saved.'            
               });           
           });

        });
    }

    var cm = $('<div id="SelfMap"/>');
    c.append(cm);
    c.append(bio);

    var location = objSpacePointLatLng(user);

    later(function() {        
        var lmap = initLocationChooserMap('SelfMap', location, 7, editable ? undefined : false );
        cm.append('<br/>');
        var locAnon = $('<select><option>Exact Location</option><option>Anonymize 1km</option><option>Anonymize 10km</option><option>No Location</option></select>');
        locAnon.change(function() {
            //0.1 = ~10km
            //0.01 = ~1km
           alert('Feature not available yet'); 
        });
        //cm.append(locAnon);

        lmap.onClicked = function(l) {
            if (editable) {
                tags['@'] = [ l.lon, l.lat ];
                objSetFirstValue( s.myself(), 'spacepoint', {lat: l.lat, lon: l.lon, planet: 'Earth'} );            
            }
        };
    });

    c.append('<div style="clear: both"/>');

    //var kc = $('<div id="KnowledgeChart"/>');

    /*var st = _.groupBy(_.without(_.keys(tags), '@'), function(t) { return tags[t]; });                

    function displayKnowledgeSection(n, t) {
        kc.append('<span class="KnowledgeSectionLabel" style="background-color: ' + levelColor[n] + '">&nbsp;&nbsp;</span>&nbsp;');
        kc.append('<span class="KnowledgeSectionLabel">' + levelLabel[n] + '</span>');
        for (var x=0; x < t.length; x++) {
            var i = t[x];
            var l = $('<p/>');
            var ki = $('<a href="/wiki/' + i + '">' + i + '</a>');
            l.append(ki);
            kc.append(l);                    
        }
        kc.append('<br/>');
    }

    if (st[3]) displayKnowledgeSection(3, st[3]);
    if (st[2]) displayKnowledgeSection(2, st[2]);
    if (st[1]) displayKnowledgeSection(1, st[1]);
    if (st[-1]) displayKnowledgeSection(-1, st[-1]);
    if (st[-2]) displayKnowledgeSection(-2, st[-2]);
    if (st[-3]) displayKnowledgeSection(-3, st[-3]);*/

    //c.append(kc);


    /*c.append('<div id="KnowledgeCodeLabel">Knowedge Code:</div>');
    var p = $('<pre>');
    p.html(JSON.stringify(tags));
    c.append(p);*/
                

    return c;
}


function newRoster(s, selectUser) {
    var users = s.objectsWithTag('User');

    var d = newDiv();

    var anonymous = [];
    
    function h(x) {
        var sx = renderObjectSummary(s, x, null, 0.5, 0);        
        if (x.id === s.myself().id) {
            sx.find('h1 a').append(' (me)');
            d.prepend(sx);            
        }
        else {
            d.append(sx);
        }
        sx.click(function() {
            if (selectUser)
                selectUser(x); 
        });        
    }
    
    for (var i = 0; i < users.length; i++) {
        var x = s.object(users[i]);
        if (x.name === 'Anonymous') {
            anonymous.push(x);
            continue;
        }
        h(x);
    }
    
    for (var i = 0; i < anonymous.length; i++) {
        var x = anonymous[i];
        h(x);
    }
    return d;
}

function hoursFromNow(n) {
    return Date.now() + 60.0 * 60.0 * 1000.0 * n;
}

function newTagChooserWidget(time, selected, onClose) {
    var d = newDiv();
    
    var e = newDiv();
    e.appendTo(d);
    e.addClass('SelfTimeTagTree');
    
    $('.TagChoice').remove();
    
    var p = {
        target: e,
        newTagDiv: function(id, content) {
            var ti = getTagIcon(id);
            if (ti)
                content = '<img style="height: 1em" src="' + ti + '"/>' + content;
            return {
                label: ('<input id="' + id + '" class="TagChoice" type="checkbox"' + (_.contains(selected, id) ? 'selected' : '') + '>' + content + '</input>')
            };
        }        
    };
    updateTypeTree(p);    
    
    
    var b = $('<button>Save</button>');
    b.click(function() {
        var newTags = [];
        $('.TagChoice').each(function(x) {
            var t = $(this);
            var tag = t.attr('id');
            if (t.is(':checked'))
                newTags.push(tag);
        });
        onClose(newTags);
    });
    d.prepend(b);
    
    return d;
}

function newSelfTimeList(s, x, container) {

    var now = Date.now();    
    var plan = x.plan;
    if (!plan)
        plan = { };
    
    var numHours = 72;

    function save() {
        if (x.id !== s.myself().id)
            return;
        var me = s.myself();
        plan = { };
        for (var i = 0; i < numHours; i++) {
            var tt = planSlotTimes[i];
            if (planSlots[i].length > 0)
                plan[tt] = planSlots[i];
            
        }
        me.plan = plan;
        container.html(newSelfTimeList(s,self.myself(),container));
        /*s.notice(me);
        s.pub(me, function(err) {
            $.pnotify({
               title: 'Unable to save Self.',
               type: 'Error',
               text: err
            });           
        }, function() {
            $.pnotify({
               title: 'Self Saved.'            
            });           
        });*/
    }
    
    var planTimes = _.keys(plan);
    
    var time = Date.now();
    
    var d = newDiv();
    
    var planSlotTimes = { };
    var planSlots = { };
    
    console.log('load: ', plan);
    for (var i = 0; i < numHours; i++) {
        var endtime = time + 60.0 * 60.0 * 1000.0 * 1.0;
        var timed = new Date(time);
        var t = newDiv();
        t.addClass('SelfTimePeriod');
        
        t.html(timed.toLocaleDateString() + ': ' + timed.toLocaleTimeString());
        
        var plans = [];
        for (var k = 0; k < planTimes.length; k++) {
            var pp = planTimes[k];
            if ((pp >= time) && (pp <= endtime))
                plans.push(plan[pp]);
        }
        planSlotTimes[i] = time;
        planSlots[i] = plans;
        
        t.append('<br/>');
        t.append(plans);
        if (plans.length > 0)
            t.addClass('SelfTimeFilled');

        if (x.id === s.myself().id) { //only edit own plan
            (function(i, time, endtime) {
                t.click(function() {
                    var targetTime = (time + endtime)/2.0;
                    var d = newPopup("Select Tags for " + new Date(targetTime), {width: 300, modal: true});
                    d.append(newTagChooserWidget(targetTime, planSlots[i], function(results) {
                        planSlots[i] = results;
                        later(function() {
                            save();                    
                            d.dialog('close');                        
                        });
                        //container.html(newSelfTimeList(s, x, container));
                    }));
                });
            })(i, time, endtime);
        }
        
        d.append(t);
        time += 60.0 * 60.0 * 1000.0 * 1.0;
    }
    
    return d;
}

function renderSelf(s, o, v) {
       
    var frame = newDiv().attr('class','SelfView');
    
    var roster = newRoster(s);
    roster.addClass('SelfRoster');
    
    var contentTags = newDiv().attr('class', 'SelfViewTags');
    var contentTime = newDiv().attr('class', 'SelfViewTime');
    var content = newDiv().attr('class', 'SelfViewContent');
    
    frame.append(roster);
    frame.append(content);

    var currentUser = self.myself();
    
    function summaryUser(x) {
        currentUser = x;
        content.html('');
        content.append(newSelfSummary(s, x, content));
        content.append(contentTags);       
        content.append(contentTime);       
        updateTags(x);
    }
    
    function updateTags(x) {
        contentTags.html(newSelfTagList(s, x, content));
        contentTime.html(newSelfTimeList(s, x, contentTime));
        roster.html(newRoster(s, function(x) {
            summaryUser(x);
        }));
    }
    
    summaryUser(currentUser);
    
    v.append(frame);
        
    frame.onChange = function() {
        updateTags(currentUser);
        //update user summary?
    };
    
    return frame;
    
}

