/**
 *
 * Valikoihin liittyvä js. Koko sivustolla käytössä olevat tapahtumat.
 *
 */
$(document).ready(function(){
    $(".hamburger").click(function(){$(this).next(".dropdown").slideToggle();});

    //Aseta taittovalikot toimintakuntoon
    $(".controller-subwindow").hide()
    $(".subwindow-opener").click(function(){ 
        //Avaa tai sulje tarkemmat fonttien muokkaussäätimet ym
        $(this).next().slideToggle(); 
        $(this).toggleClass("opened");
    });

});

/**
*
* Sisältää javascript-koodin messudetaljisivua varten.
*
*/

$(document).ready(function(){
    if($("body").hasClass("servicelist")){
        //Siirtyminen messudetaljinäkymään
        $(".datarow").click(function(){
            if($("#respfilter").val()=="Yleisnäkymä") window.location="servicedetails.php?id=" + this.id.replace(/[^_]+_/,"");
        });
        //Suodattaminen vastuun mukaan
        $("#respfilter") .change(function(){
            if(!this.value.match(/----/)) window.location="servicelist.php?filterby=" + this.value;
        });

        //Lisää jaottelu kuukausien mukaan
        var months = ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'];
        $(".servicedate").each(function(){
            var thismonth = months[$(this).text().split(".")[1] *1-1];
            if($(document).find("h2:contains("+ thismonth + ")").length==0) $(this).parents(".datarow").before("<h2>"+ thismonth + "</h2>");
        });
    }
});

//Yleisluontoisia apufunktioita
//
//


/**
 *
 * Skrollaa jokin elementti keskelle ruutua
 *
 * @param object $el jquery-olio, joka halutaan keskelle
 *
 */
function ScrollToCenter($el){
  //https://stackoverflow.com/questions/18150090/jquery-scroll-element-to-the-middle-of-the-screen-instead-of-to-the-top-with-a
  var elOffset = $el.offset().top;
  var elHeight = $el.height();
  var windowHeight = $(window).height();
  var offset;
  if (elHeight < windowHeight) {
    offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
  }
  else {
    offset = elOffset;
  }
  console.log(offset);
  var speed = 700;
  $('html, body').animate({scrollTop:offset}, speed);

}

/**
 *
 * Sumenna tausta esim. kelluvan valikon alta
 *
 */
function BlurContent(){
    $(".blurcover").remove();
    $("<div class='blurcover'></div>").css({height:$("body").height(),width:$("body").width()}).prependTo($("body"));
}

/**
 * Periytymisen järjestämistä helpottava funktio.
 * https://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
 *
 * @param function base olio, joka peritään
 * @param function sub olio, joka perii
 *
 */
function extend(base, sub) {
  var origProto = sub.prototype;
  sub.prototype = Object.create(base.prototype);
  for (var key in origProto)  {
     sub.prototype[key] = origProto[key];
  }
  // The constructor property was set wrong, let's fix it
  Object.defineProperty(sub.prototype, 'constructor', { 
    enumerable: false, 
    value: sub 
  });
}


/**
 *
 * Luo esikatselukuvan esimerkiksi taustakuvalle tai muulle ulkoasussa muokatttavalle elementille.
 *
 * @param object $div elementti, jonka sisällä esikatselu toteutetaan
 * @param string  filename, tarkasteltavan elementin tiedostonimi
 *
 */
function Preview($div, filename){
    $("<img>").attr({"src":"assets/" + filename,
        "height":"100%",
        "width":"100%",
        "object-fit":"contain",
    }).appendTo($div.find(".preview").html(""));
}

/**
*
* Sisältää javascript-koodin 
* kommenttien prosessoimista varten
*
*/

var loaderpath = "php/loaders";


/**
 *
 * Laajenna näkyviin uuden kommentin kirjoituskenttä
 *
 */
function ExpandCommentField(){
    $(this).animate({"height":"6em"}); 
    var $details = $(this).parent().parent().find(".commentdetails:eq(0)");
    $details.show();
    ScrollToCenter($details);
}



/**
 *
 * Lataa kaikki kommentit tietokannasta dokumenttiin
 *
 */
function LoadComments(){
    $.post(loaderpath + "/loadcomments.php", {id:$("#service_id").val()}, function(data){
        $(".loadedcomments").html(data);
        $(".newcomment").val("");
        $(".commentator").val("");
        $(".newcomment:eq(0)").height("3em");
        $(".comment comment-insert-controls").hide()
        $(".commentdetails").hide()
        $("select").prop('selectedIndex',0);
        $(".comment-answer-link")
            .click(CreateCommentAnswerField)
            .each(function(){
            //Muuta vastauslinkin tekstiä ketjujen osalta
            if($(this).parent().parent().find(".comment").length>0) $(this).text("Jatka viestiketjua");
        });
        //Huom! Varmistetan, ettei tallennustapahtuma tule sidotuksi kahdesti
        $(".savecomment").unbind("click",SaveComment);
        $(".savecomment").bind("click",SaveComment);
        $(".newcomment:eq(0)").click(ExpandCommentField);
    });
}

/**
 *
 * Tallenna syötetty kommentti
 *
 */
function SaveComment(){
    console.log("raz!");
    $container = $(this).parent().parent().parent();
    var theme = "";
    var replyto = 0;
    var id = $container.parent().attr("id");
    if(id){
        replyto = id.replace(/c_/,"");
    }
    if($container.find("select").length>0){
        theme = $container.find("select").get(0).selectedIndex>1 ? $container.find("select").val() : "";
    }
    var queryparams = {id:$("#service_id").val(),
                       theme: theme,
                       content:$container.find(".newcomment").val(),
                       commentator:$container.find(".commentator").val(),
                       replyto:replyto
                      };
    $.post(loaderpath + "/savecomment.php",queryparams).done(LoadComments);
}

/**
 *
 * Syötä tekstikenttä kommenttiin tai viestiketjuun
 * vastaamista varten.
 *
 */
function CreateCommentAnswerField(){
    $(this).parent().next().slideDown().children().show();
}



/**
*
* Sisältää javascript-koodin messudetaljisivulla näytettäviä
* kommentteja varten
*
*/
$(document).ready(function(){
    if($("body").hasClass("servicedetails")){
        //Kommentit
        LoadComments();
    }
});

/**
 *
 * Jquery ui:n selectmenu-pluginin muokkaus niin, että
 * mahdollista valita myös tekstikenttä.
 *
 */
 $.widget("custom.select_withtext", $.ui.selectmenu, 
     { 
         _renderItem: function( ul, item ) {
            if(item.label=="Uusi luokka"){
                //TODO: abstract this, so that these options can be set appropriately and don't have to be hard coded.
                var $input = $("<input type='text' placeholder='Uusi luokka...'>");
                $input.on("keydown",function(){
                    var $div = $(this).parents(".other-option");
                    if ($div.find("button").length==0){
                        $("<button>Lisää</button>")
                            .click(function(){
                                //Lisää äsken lisätty uusi arvo KAIKKIIN tällä sivulla oleviin select-elementteihin, joissa addedclass-nimi
                                var newval = $(this).parents(".other-option").find("input").val();
                                $("<option value=" + newval + "> " + newval + "</option>")
                                    .insertBefore($("select[name='addedclass']").find("option:last-child"));
                                $("select[name='addedclass']").each(function(){
                                    try{
                                        $(this).select_withtext("refresh");
                                    }
                                    catch(e){
                                        $(this).select_withtext();
                                    }
                                });
                            })
                            .appendTo($div);
                    }
                });
            }
             else if(item.label=="Jokin muu"){
                var $input = $("<input type='text' placeholder='Jokin muu...'>")
                var self = this;
                var thisitem = item;
                $input.autocomplete( {
                    source: function(request, response){ $.getJSON(loaderpath + "/songtitles.php",{songname:request.term,fullname:"no"},response);},
                    minLength: 2,
                    select: function(event,input){
                        $(self.element).find("[value='Jokin muu']").before("<option>" +  input.item.value +"</option>");
                        self.refresh();
                    },
                });
            }

            var wrapper = (["Uusi luokka","Jokin muu"].indexOf(item.label)>-1 ? $("<div class='other-option'>").append($input) : $("<div>").text(item.label));

            return $("<li>").append(wrapper).appendTo(ul);
        },
        open: function( event ) {

            var self = this;
            $.each(this.menuItems,function(idx,el){
                if($(el).hasClass("other-option")){
                    //Siivoa tekstikenttään liittyvät tapahtumat
                    $(el).unbind('mousedown');
                    $(el).unbind('keydown');
                    $(el).unbind('click');
                    $(el).click(function(){return false;});
                    $(el).bind("keydown", function(event){});
                    $(el).bind('mousedown', function() {
                        //Fokus pitää asettaa erikseen
                        $(this).find('input:eq(0)').focus();
                    });
                }
            });
            if ( this.options.disabled ) {
                return;
            }

            // If this is the first time the menu is being opened, render the items
            if ( !this._rendered ) {
                this._refreshMenu();
            } else {

                // Menu clears focus on close, reset focus to selected item
                this._removeClass( this.menu.find( ".ui-state-active" ), null, "ui-state-active" );
                this.menuInstance.focus( null, this._getSelectedItem() );
            }

            // If there are no options, don't open the menu
            if ( !this.menuItems.length ) {
                return;
            }

            this.isOpen = true;
            this._toggleAttr();
            this._resizeMenu();
            this._position();

            this._on( this.document, this._documentClick );

            this._trigger( "open", event );
        },


	_drawMenu: function() {
		var that = this;

		// Create menu
		this.menu = $( "<ul>", {
			"aria-hidden": "true",
			"aria-labelledby": this.ids.button,
			id: this.ids.menu
		} );

		// Wrap menu
		this.menuWrap = $( "<div>" ).append( this.menu );
		this._addClass( this.menuWrap, "ui-selectmenu-menu", "ui-front" );
		this.menuWrap.appendTo( this._appendTo() );

		// Initialize menu widget
		this.menuInstance = this.menu
			.menu( {
				classes: {
					"ui-menu": "ui-corner-bottom"
				},
				role: "listbox",
				select: function( event, ui ) {
                    console.log("sel");
					event.preventDefault();

					// Support: IE8
					// If the item was selected via a click, the text selection
					// will be destroyed in IE
					that._setSelection();

                    if(ui.item.data( "ui-selectmenu-item" ).label!=="Jokin muu"){
                        that._select( ui.item.data( "ui-selectmenu-item" ), event );
                    }
                    else{
                        $(event.target).find
                    }
				},
				focus: function( event, ui ) {
					var item = ui.item.data( "ui-selectmenu-item" );

					// Prevent inital focus from firing and check if its a newly focused item
					if ( that.focusIndex != null && item.index !== that.focusIndex ) {
						that._trigger( "focus", event, { item: item } );
						if ( !that.isOpen ) {
							that._select( item, event );
						}
					}
					that.focusIndex = item.index;

					that.button.attr( "aria-activedescendant",
						that.menuItems.eq( item.index ).attr( "id" ) );
				}
			} )
			.menu( "instance" );


		// Don't close the menu on mouseleave
		this.menuInstance._off( this.menu, "mouseleave" );

		// Cancel the menu's collapseAll on document click
		this.menuInstance._closeOnDocumentClick = function() {
			return false;
		};

		// Selects often contain empty items, but never contain dividers
		this.menuInstance._isDivider = function() {
			return false;
		};

        this.menuInstance._keydown = function(){
            //Poistetaan jquery ui:n menuun liittyvät näppäimistötapahtumat, jotta tekstikentässä voisi kirjoittaa rauhassa
        };


	},

     }
);

/**
 *
 * Funktiot ja oliot, joilla muokataan ja näytetään sanoja.
 *
 */


//Polku ajax-skriptit sisältävään kansioon
var loaderpath = "php/loaders";

//Jquery UI:n autocomplete-pluginin asetukset laulujen nimien täydennystä varten
var autocompsongtitle = {
    source: function(request, response){ $.getJSON(loaderpath + "/songtitles.php",{songname:request.term,fullname:"no"},response);},
            minLength: 0,
            select: function(event,input){CheckIfLyricsExist(event, input.item.value);}};


/**
 * Lisää uuden rivin laulujen listaan tai poistaa viimeisimmän rivin.
 */
function AddMultisongsRow(){
    var $table = $(this).parent().parent(".multisong-container");
    if($(this).hasClass('decreaser')){
        //Poista viimeisin, jos painettu miinuspainiketta ja jos vähintään 1 jäljellä
        if($table.find(".songslot").length>1) $table.find(".songslot").last().remove();
    }
    else{
        //Kopioi taulukon viimeinen rivi
        var $tr = $table.find(".songslot").last().clone(true);
        //Muuta kopioidun rivin numero niin, että se on yhden suurempi kuin alkuperäisessä rivissä
        var number = $tr.find("div:eq(0)").text().replace(/([^\d+]+ ?)(\d+)/,"$2")*1;
        var $newtr = $($tr.html().replace(new RegExp(number,"g"), number +1 ));
        //Tyhjennä itse laulun nimi ja lisää mukaan automaattiseen täydennykseen
        $newtr.find("input").attr({"value":""}).autocomplete(autocompsongtitle);
        //Syötä uusi rivi taulukkoon
        $newtr.insertAfter($table.find(".songslot").last()).wrapAll("<div class='songslot'></div>");
        $table.find(".songslot").last().find(".lyricsindicator").click(ShowLyricsWindow).html("&nbsp;");
        $(".songinput, select").on("change paste keyup",CheckIfLyricsExist);
    }
}



/**
 * Tarkkailee tekstikenttiä ja katsoo, onko tietokannassa laulua, jonka nimi vastaisi tekstikentän arvoa.
 */
function CheckIfLyricsExist(event, val){
    //Jos kutsuttiin näppäinpainalluksen seurauksena, ota tekstikentän arvo tapahtumasta
    if(val==undefined && event.hasOwnProperty("target")) val = event.target.value;
    //Ota talteen tekstikentän sisältävä solu riippuen siitä, kutsuttiinko each-loopista vai ei
    var $td = event.hasOwnProperty("target") ? $(event.target).parent() : event.parent();
    //Jos kyseessä pudostusvalikko eli liturginen laulu, hae id:n perusteella
    var queryparams = $td.find("select").length>0 ? {songname:val,fullname:"yes",byid:"yes"} : {songname:val,fullname:"yes"};
    //Säädä viereisen solun teksti riippuen siitä, onko laulua tietokannassa vai ei
    $.getJSON(loaderpath + "/songtitles.php",queryparams,function(data){
        if(data.length==0) $td.next(".lyricsindicator").text("Lisää sanat");
        else $td.next(".lyricsindicator").text("Katso sanoja"); if ((val=="") || val.match(/^(Valitse |--------)/)) $td.next(".lyricsindicator").html("&nbsp;");
    });
} 


/**
 *
 * Lataa sanat annetun otsikon perusteella
 *
 */
function LoadLyricsByTitle(title, byid){
        $(".sideroller").find("button").remove();
        var queryparams = {songname:title};
        if(byid) queryparams = {songname:title,byid:"yes"};
        $.getJSON(loaderpath + "/songcontent.php", queryparams,
                function(data){
                    $(".sideroller > h2").text(data.title);
                    verses = data.verses.split(new RegExp(/\n{2,}/));
                    $(".versedata").html("");
                    if(byid) $(".sideroller h2").attr("id",title);
                    $.each(verses,function(i,verse){
                        $(".versedata").append($("<p></p>").html(verse.replace(/\n{1}/g,"<br>")));
                    });
                //Poista tallennuspainikkeet
                $(".sideroller input").remove();
                //Näytä muokkauslinkki
                $("#editwordslink").parent().show();
                });
}
    //Poista tallennuspainikkeet
    $(".sideroller input").remove()

/**
 * Näyttää sanojen lisäysikkunan, kun käyttäjä klikkaa oikeanpuolimmaista taulukon
 * solua.
 */
function ShowLyricsWindow(){
    var songtitle = $(this).parent().find("[type='text']").val()
    var byid = false;
    if(!songtitle){
        var songtitle = $(this).parent().find("select").val()
        byid = true;
    }

    //Piilota muut kuin laulun sanat, jos pienempi näyttö
    if(!$("nav .dropdown").is(":visible")) $(".side-main").hide();
    //Näytä sanojen muokkausikkuna
    if($(this).text()!="") $(".sideroller").show();
    if($(this).text()=="Katso sanoja") LoadLyricsByTitle(songtitle, byid);
    else if($(this).text()=="Lisää sanat") AddLyrics(songtitle);
}

/**
 *
 * Muokkaa näytettyjä sanoja ja tallentaa muutokset.
 *
 */
function EditLyrics(){
    if($(".sideroller").find("button").length==0){
        var verses = "";
        $.each($(".versedata").find("p"), function(idx,verse){ verses += "\n\n" + verse.innerHTML.replace(/<br>/g,"\n")});
        $(".versedata").html("");
        $("<textarea name='editedsong'></textarea>").text(verses.trim()).appendTo($(".versedata"));
        if($(".sideroller").find("[type=button]").length==0) {
            $("<input type='button' value='Tallenna muutokset'>").appendTo(".sideroller").click(SaveLyrics)
        };
        $("#editwordslink").parent().hide();
    }
}

/**
 *
 * Lisää sanat uuteen lauluun
 *
 */
function AddLyrics(songtitle){
    $(".versedata").html("");
    $(".sideroller > h2").text(songtitle);
    $("<textarea name='editedsong'></textarea>").appendTo($(".versedata"));
    if($(".sideroller").find("[type=button]").length==0) {
        $("<input type='button' value='Tallenna muutokset'>").appendTo(".sideroller").click(SaveLyrics);
    }
    $("#editwordslink").parent().hide();
}


/**
 *
 * Lähettää ajax-kyselynä sanat palvelimelle
 *
 */
function SaveLyrics(){
        var queryparams = {songname:$(".sideroller > h2").text(),
                           editedverses:$("[name='editedsong']").val() };
        var byid=false;
        if($(".sideroller h2").attr("id")){
            queryparams = {songname:$(".sideroller h2").attr("id"),
                           editedverses:$("[name='editedsong']").val(),
                           byid:"yes"};
            var byid=true;
        }
        $.post(loaderpath + "/savelyrics.php",queryparams).done(function(data){
            LoadLyricsByTitle($(".sideroller > h2").text(), byid);
            $(".songinput, select").each(function(){CheckIfLyricsExist($(this),$(this).val())});
        }
        );
}

/**
 *
 * Sulkee sanojen hallintaikkunan
 *
 */
function CloseWordEdit(){
    $(".sideroller").hide()
    $(".side-main").show().find("h2").show();
    if($(".sideroller").hasClass("songlistview-is-on"))  $(".songlistview").show();
}


/**
 *
 * Erillinen katselunäkymä lauluille ja niiden sanoille
 *
 */

var loaderpath = "php/loaders";

/**
 *
 * Laululistanäkymä
 *
 **/
SongListView = function(){
    this.$container = $(".songlistview");
    this.$lyricswindow = $(".sideroller");
    this.$servicesonglist = $(".side-main");
    var self = this;
    /**
     * Näyttää sanalistanäkymän ja piilota messukohtaisen näkymän.
     */
    this.Toggle = function(){
        $(".sideroller").hide();
        self.$container.toggle()
        $(".sideroller").toggleClass("songlistview-is-on");
        $(".below-header").toggle();
        if(!$("nav .dropdown").is(":visible")) {
            this.$container.find("h2").toggle();
            this.$container.find("p").toggle();
            this.$servicesonglist.find("h2").toggle();
        }
    };


    /**
     *
     * Näyttä valitsimen, jossa käyttäjä voi päättää, haluaako katsoa
     * laulun sanoa vai käyttää laulua esim. alkulauluna
     *
     * @param object launcher linkki, joka ikkunan käynnistää
     *
     */
    this.SelectAction = function(launcher){
        //Lisää himmennin muulle näytölle
        BlurContent();
        //Tallenna laulun nimi käyttöä varten
        self.active_launcher = launcher;
        launcher.parent()
            .addClass("songname-select")
            .append($("<div class='songname-select-option'>Katso sanoja</div>").click(self.ToggleLyricsView))
            .append($("<div class='songname-select-option'>Käytä laulua</div>").click(self.ToggleRoleSelect))
            .find("a,div").wrapAll("<div class='option-container'></div>")
            .slideDown("slow");
    };

    /**
     *
     * Palauttaa mäppinä css:ää varten tapahtuman käynnistäneen elementin
     * sijainnin + elementin pituuden
     *
     */
    this.GetActiveLauncherPosition = function(){
        var par = ($(".songname-select"));
        if(($(".container").width() - (par.position().left + par.width()))<300){
            var pos = {left:-par.position().left + "px", top:"-50px", width:$(".container").width()}
            //Pienellä näytöllä piilota alta pois valintalinkit
            $(".option-container").hide();
        }
        else{
            var pos = {left:par.width()+40+"px", top:"-50px", width:"300px"}
        }
        return pos;
    }

    /**
     *
     * Piilottaa kaikki kelluvat valitsinikkunat
     *
     * @param boolean removeblur poistetaanko taustan himmennys
     *
     */
    this.HideActionSelectors = function(removeblur){
        if(removeblur) $(".blurcover").remove();
        $(".songname-select-option").remove();
        $(".songrole-select").remove();
        $(".songnames-container div").removeClass("songname-select");
    }

    /**
     *
     * Lataa suodatetut laulujen nimet
     *
     * @param jQueryDom  launcher elementti, joka käynnistää latauksen
     *
     */
    this.LoadData = function(launcher){
        if(launcher[0].tagName == "LI" && launcher.find("li").length==0){
            //Etsi jquery UI-menun alin listataso
            if(launcher.find("span").length>0){
                //Jos kirjainjaettu alakohtiin, suodata niiden mukaan (esim. virsi 001-virsi 051)
                $.getJSON(loaderpath + "/songtitles.php",{songname:"",firstspan:launcher.find("span:eq(0)").text(),lastspan:launcher.find("span:eq(1)").text()},this.InsertData);
            }
            else{
                $.getJSON(loaderpath + "/songtitles.php",{songname:launcher.text(),fullname:"first-letter"},this.InsertData);
            }
        }
    };

    /**
     *
     * Syötä filtteröidyt laulut linkeiksi laululistasivulle
     *
     * @param Array data ajax-kyselyllä ladattu taulukko laulujen nimistä
     *
     */
    this.InsertData = function(data){
        $(".songnames-container").html("");
        $.each(data,function(key, item){
            $("<div><a href='javascript:void(0)'>" + item + "</a></div>").appendTo(".songnames-container");
            //$("<div><a href='javascript:void(0)'>" + item + "</a></div>").appendTo(".songnames-container");
        });
        $(".songnames-container a").click(function(){self.SelectAction($(this))});
    };

    /**
     *
     * Näytä ikkuna sanojen katselemista varten (ja mobiilitilassa sulje muut ikkunat)
     *
     *
     */
    this.ToggleLyricsView = function(){
        LoadLyricsByTitle(self.active_launcher.text(),false);
        self.HideActionSelectors(true);
        //Piilota muut kuin laulun sanat, jos pienempi näyttö
        if(!$("nav .dropdown").is(":visible")) {
            self.$container.hide();
            self.$servicesonglist.hide();
        }
        //Lisää sanannäyttödiviin luokka sen tunnistamiseksi, että kutsuttu laulujen nimi-näkymästä
        $(".sideroller").show();
    };

    /**
     * 
     * Avaa ikkuna ja valitse, mikä rooli laululle annetaan messussa.
     *
     */
    this.ToggleRoleSelect = function(){
        var $roleselector = $("<div class='songrole-select'></div>").css(self.GetActiveLauncherPosition()).prependTo($(".songname-select"));
        $(".data-left").each(function(){ $("<div>" + $(this).text() + "</div>").appendTo($roleselector).click(self.SetSongRole)});
    };
    
    /**
     * 
     * Aseta laululle rooli
     *
     */
    this.SetSongRole = function(){
        //Vaihda uusi laulu tekstikenttään
        $('.data-left:contains("' + $(this).text().trim() + '")').next().find("input").val(self.active_launcher.text());
        self.HideActionSelectors(true);
    };

}


/**
 *
 * Interaktio ja layout-muokkaus laululistasivulle.
 *
 */


$(document).ready (function(){
    if($("body").hasClass("songs")){
        $(".songinput").autocomplete(autocompsongtitle);
        $(".songinput, select").on("change paste keyup",CheckIfLyricsExist);
        //Tarkista jo syötetyistä lauluista, onko niitä tietokannassa
        $(".songinput, select").each(function(){CheckIfLyricsExist($(this),$(this).val())});
        $(".lyricsindicator").click(ShowLyricsWindow);
        $(".sideroller").hide();
        $(".menu").menu({position: { my: "bottom", at: "right-5 top+5" }});
        $("#editwordslink").click(EditLyrics);
        $("#closewordeditlink").click(CloseWordEdit);
        $(".multisongs [type='button']").click(AddMultisongsRow);
        //Tavuta laulutyypit soft-hypheneilla.
        $(".data-left").each(function(){ $(this).html($(this).html().replace(/([^ ])(laul)/,"$1&shy;$2").replace(/ (\d+)/,"&nbsp;$1"))});

        //Sanojen katseluikkuna
        var slv = new SongListView();
        $(".songlistview-toggle").click(function(){slv.Toggle()});
        $("#alpha-select li").click(function(){slv.LoadData($(this))});
        //Rajoitetuille lauluvalinnoille modattu jquery ui -selectmenu
        $("select").select_withtext();

        //Laulujen tallennus
        $("[value='Tallenna']").click(function(event){
            event.preventDefault();
            var id = window.location.search.replace(/.*service_id=(\d+)/,"$1")*1;
            //Tyhjennä ensin kaikki tähän messuun liittyvä informaatio ennen kuin 
            $.post("php/loaders/save_service_song.php",{"cleansongs":"yes","service_id":id},function(data){console.log(data)});
            //Tallenna sitten yksittäin jokainen laulu
            $(".slot-parent").each(function(){ 
                $(this).find(".songinput").each(function(idx,el){
                    console.log(idx);
                    $.post("php/loaders/save_service_song.php",{
                        "service_id":id,
                        "songtype":$(el).parents(".songslot").find("div:eq(0)").text().trim(),
                        "multisong_position":idx+1,
                        "song_title":$(el).val()},function(data){ console.log(data); });
                })
            });
        })

    }
});


/**
 *
 * Messun rakenne-elementtien muokkaukseen liittyvät tapahtumat:
 * Elementtien poisto ja muokkaus sekä siirto.
 *
 */

//TODO: siirrä tapahtumien päivitys tänne.

/**
 * Tapahtumat, jotka liittyvät messurakenteen määrittelyyn
 */

var adder = undefined;
var currently_dragged_no = undefined;

/**
 * Lisää kaikkiin messun segmentteihin muokkaus- ja poisto-ominaisuudet.
 * Lisäksi mahdollistaa segmenttien uudelleenjärjestelyn raahaamalla.
 */
function UpdateAdderEvents(){
    $(".slot:last-of-type").after("<div class='drop-target'></div>");
    $(".edit-link").click(function(){
        switch($(this).parents(".slot").find(".slot_type").val()){
            case "infosegment":
                adder = new InfoSlideAdder($(this).parents(".slot"));
                break;
            case "songsegment":
                adder = new SongSlideAdder($(this).parents(".slot"));
                break;
            case "biblesegment":
                adder = new BibleSlideAdder($(this).parents(".slot"));
                break;
        }
        adder.LoadParams($(this).parents(".slot").find(".content_id").val());
        adder.ShowWindow();
    });

    //slottien poisto
    $(".remove-link").click(function(){
        $.post("php/loaders/save_structure_slide.php",
            {"removeslide":"y,","id":$(this).parents(".slot").find(".slot_id").val()}, 
            function(data){ 
                console.log(data);
                $(".structural-slots").load("php/loaders/loadslots.php",UpdateAdderEvents);
            });
    });

    //slottien siirtely
    $(".slot").on("dragstart",function(){ 
        $(".slot").addClass("drop-hide");
        $(this).removeClass("drop-hide");
        currently_dragged_no = $(this).find(".slot-number").text() * 1;
    });
    $(".drop-target")
        .on("dragover",function(event){
            event.preventDefault();  
            event.stopPropagation();
            $(this).addClass("drop-highlight").text("Siirrä tähän");
        })
        .on("dragleave",function(event){
            event.preventDefault();  
            event.stopPropagation();
            $(this).text("").removeClass("drop-highlight");
        })
        .on("drop",function(event){
            event.preventDefault();  
            event.stopPropagation();
            var prevno = $(this).prev().find(".slot-number").text();
            if(prevno=="") prevno = 0;
            var newids = [];
            console.log("PREVNO: " + prevno);
            $(".slot").each(function(){
                //console.log($(this).text());
                var thisno = $(this).find(".slot-number").text()*1;
                var id = $(this).find(".slot_id").val()*1;
                var newno = thisno*1;
                if(thisno == currently_dragged_no){
                    newno = prevno*1 + 1;
                    if(prevno > currently_dragged_no)
                        newno -= 1;
                }
                else if(thisno>currently_dragged_no && thisno > prevno) newno = thisno;
                else if(thisno>currently_dragged_no && thisno <= prevno) newno = thisno -1;
                else if(thisno>prevno && thisno != currently_dragged_no) newno = thisno*1 +1;
                else if(thisno==prevno && thisno >currently_dragged_no) newno = thisno*1 -1;
                else if(thisno==prevno) newno = thisno;
                newids.push({"slot_id":id,"newnumber":newno});
                });
            $.post("php/loaders/save_structure_slide.php",{"slideclass":"update_numbers","newids":newids}, function(data){ $(".structural-slots").load("php/loaders/loadslots.php",UpdateAdderEvents); });
        });

}

/**
 *
 * Valitse, mitä sisältöä ryhdytään lisäämään. 
 * Valintamenun  (jqueryui menu) callback.
 *
 */
function SelectTheContentToAdd(e, u){
    if(u.item.find("span").length==0){
        switch(u.item.text()){
            //case "Yksittäinen dia":
            //    break;
            case "Laulu":
                adder = new SongSlideAdder(u.item.parents(".structural-element-add"));
                break;
            case "Raamatunkohta":
                adder = new BibleSlideAdder(u.item.parents(".structural-element-add"));
                break;
            default:
                adder = new InfoSlideAdder(u.item.parents(".structural-element-add"));
                break;
        }
        if (adder != undefined) adder.ShowWindow();
    }
}


$(document).ready(function(){
    if($("body").hasClass("service_structure")){

        $(".menu").menu({ position: { my: "bottom", at: "right-5 top+5" }, select: SelectTheContentToAdd});
        UpdateAdderEvents();


        //Vain testaamista varten: lisäillään vähän id:itä
        $(".menu").find("li").each(function(){if($(this).text()=="Laulu")$(this).attr({"id":"addsongmenu"});});

    }
    }
);

/**
 *
 * Olio, jolla lisätään uusia esitykseen liittyviä messun rakenneosia.
 *
 * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
 *
 */
var StructuralElementAdder = function($container){
        this.$lightbox = $("<div class='my-lightbox structural-element-adder'></div>");
        this.$preview_window = $("<div class='preview-window'><iframe scrolling='no' frameBorder='0'></iframe><button>Sulje esikatselu</button></div>");
        this.$container = $container;
        this.previewparams = {};
        this.previewhtml = "";
}

StructuralElementAdder.prototype = {

    /**
     *  Näytä ikkuna, jossa käyttäjä voi muokata messun rakenteeseen lisättävää diaa
     */
    ShowWindow: function(){
        var self = this
        var $buttons = $("<div class='button-container'>")
        $("<button>Sulje tallentamatta</button>").click(function(){ self.$lightbox.html("").hide(); $(".blurcover").remove();}).appendTo($buttons);
        $("<button>Tallenna</button>").click(function(){ self.SaveAndClose(); }).appendTo($buttons);
        if(this.slideclass==".infoslide"){
            $("<button>Esikatsele</button>").click(function(){ self.PreviewSlide(); }).appendTo($buttons)
            this.AddImageLoader();
        };
        this.$lightbox.append($buttons);
        this.$container.prepend(this.$lightbox);
        $(".slidetext").on("change paste keyup",function(){self.InjectServiceData()});
        $("[value='multisong']").click(function(){self.$container.find(".multisongheader").toggle(); });
        if(this.slideclass==".songslide") this.AddAutoComplete();
    },

    /**
     * Nollaa lisäysvalikon sisältö ja syötä uusi sisältö.
     *
     * @param object $el jquery-olio, joka syötetään  lightbox-ikkunan sisään
     *
     */
    SetLightBox: function($el){
        BlurContent();
        this.$lightbox.html("").prepend($(this.slideclass).clone(true));
        this.$lightbox.css({"width":$(".innercontent").width(),"top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"}).show();
        this.SetSlideClasses();
    },


    /**
     *
     * Lataa käytössä olevta messuosiot / dialuokat select-valikkoon
     *
     */
    SetSlideClasses: function(){
        var self = this;
        var selectedclass = self.$container.find(".addedclass").val();
        //Poistetaan kokonaan edellisellä avauksella näkyvissä ollut select
        self.$lightbox.find("select[name='addedclass']").remove();
        self.$lightbox.find(".addedclass_span").append("<select name='addedclass'>");
        $.getJSON("php/loaders/fetch_slide_content.php",{"slideclass":"list_all","id":""},function(data){
            $.each(data,function(idx, thisclass){
                if([".Laulu",".Raamatunteksti"].indexOf(thisclass)==-1){
                    if(selectedclass){
                        var selectme = (selectedclass.replace(".","") == thisclass.replace(".","") ? " selected " : "");
                    }
                    self.$lightbox.find("select[name='addedclass']").append("<option value='" + thisclass + "' " + selectme + ">" + thisclass.replace(".","") + "</option>");
                }
            });
            //Lisää vielä mahdollisuus lisätä uusi luokka
            self.$lightbox.find("select[name='addedclass']").append("<option value='Uusi luokka'>Uusi luokka</option>");
            self.$lightbox.find("select[name='addedclass']").select_withtext();
            //self.$lightbox.find("select").on("selectmenuchange",function(){console.log("moro")});
        });
        //lisää muokattu jquery ui -selectmenu mahdollistamaan uusien dialuokkien luomisen
    },

    /**
     * Nollaa esikatseluikkunan sisältö ja syötä uusi sisältö.
     *
     */
    SetPreviewWindow: function($el){
        this.$preview_window.css({"width":$(".innercontent").width(),"top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"}).show();
        this.$preview_window.find("iframe").attr({"width":$(".innercontent").width()-30 + "px", "height":($(".innercontent").width()-30)/4*3+"px","border":"0"}).show();
    },

    /**
     *  Sulkee lisäysvalikkoikkunan ja tallentaa muutokset. Lataa myös tehdyt muutokset sivulle näkyviin.
     */
    SaveAndClose: function(){
        var self = this;
        this.SetPreviewParams();
        if(this.$lightbox.find("select[name='addedclass']").length>0){
            //Tallenna myös dian luokka, jos asetetu
            this.previewparams.addedclass = this.$lightbox.find("select[name='addedclass']").val();
        }
        $.post("php/loaders/save_structure_slide.php",this.previewparams,function(html){
            $(".structural-slots").load("php/loaders/loadslots.php",UpdateAdderEvents);
            $("body").prepend(html);
        });
        this.$lightbox.html("").hide();
        $(".blurcover").remove();
    },

    /**
     *
     * Syötä valitsin, jolla voi liittää diaan tietoja messusta. Esimerkiksi sen, kuka on juontaja, kuka liturgi jne.
     *
     */
    InjectServiceData: function(){
        var atsings = this.$lightbox.find(".infoslidetext").val().match(/@/g);
        var number_of_atsings = atsings ? atsings.length : 0;
        if(this.$lightbox.find(".resp_select").length<number_of_atsings){
            //Laske ät-merkkien määrä ja vertaa select-elementtien määrään
            var $select = $("<select class='resp_select'></select>");
            $.getJSON("php/loaders/load_data_for_injection.php",{fetch:"responsibilities"},
                function(data){$.each(data,function(idx,el){ $select.append("<option>" + el + "</option>")})});
            $select.appendTo(this.$lightbox.find(".injected-data"));
        }
        else if(this.$lightbox.find(".resp_select").length>number_of_atsings){
            while (this.$lightbox.find(".resp_select").length>number_of_atsings){
                this.$lightbox.find(".resp_select:last-of-type").remove();
                atsings = this.$lightbox.find(".slidetext").val().match(/@/g);
                number_of_atsings = atsings ? atsings.length : 0;
            }
        }
    },

    /**
     * Avaa ikkuna, jossa voi esikatsella diaa.
     */
    PreviewSlide: function(){
        var self = this;
        this.SetPreviewParams();
        this.$container.prepend(this.$preview_window);
        this.SetPreviewWindow();
        this.$preview_window.find("button").click(function(){self.$preview_window.hide()});
        $.post("php/loaders/slides_preview.php",this.previewparams,function(html){
            self.previewhtml = html;
            console.log(html);
            $(".preview-window iframe").attr({"src":"slides.html"});
        });
    },

    /**
     * Kun esikatseluikkuna latautunut, päivitä sen sisältö.
     */
    SetPreviewContent: function(){
        $(".preview-window iframe").contents().find("main").html(this.previewhtml);
    },


    /**
     * Aseta autocomplete-mahdollisuus etsiä lauluja rajoitettuun listaan
     * Käytetään hyväksi jquery ui:n skriptiä useista autocomplete-arvoista (https://jqueryui.com/autocomplete/#multiple)
     */
    AddAutoComplete: function(){
        var self = this;
        function split( val ) {
          return val.split( /,\s*/ );
        }
        function extractLast( term ) {
          return split( term ).pop();
        }
        $("[value='restrictedsong']").click(function(){ self.$container.find(".restrictionlist").toggle() });
        self.$container.find(".restrictionlist")
            // don't navigate away from the field on tab when selecting an item
            .on( "keydown", function( event ) {
              if ( event.keyCode === $.ui.keyCode.TAB &&
                  $( this ).autocomplete( "instance" ).menu.active ) {
                event.preventDefault();
              }
            })
            .autocomplete({ source: 
                            function(request, response){ 
                                var data = undefined;
                                $.getJSON(loaderpath + "/songtitles.php",{songname:extractLast(request.term),fullname:"no"},response);
                            },
                            minLength: 0,
                            focus: function() {
                              // prevent value inserted on focus
                              return false;
                            },
                            select: function( event, ui ) {
                              var terms = split( this.value );
                              // remove the current input
                              terms.pop();
                              // add the selected item
                              terms.push( ui.item.value );
                              // add placeholder to get the comma-and-space at the end
                              terms.push( "" );
                              this.value = terms.join( ", " );
                              return false;
                            } });
        },

}


/**
 *
 * Laulusisällön lisäävä olio.
 *
 * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
 *
 */
var SongSlideAdder = function($container){
    StructuralElementAdder.call(this, $container);
    this.slideclass = ".songslide";
    this.SetLightBox();
    return this;
}

SongSlideAdder.prototype = {
    /**
     * Kerää tallennusta varten tarvittavat tiedot
     */
    SetPreviewParams: function(){
        var self = this;
        this.previewparams = {
            multiname: this.$lightbox.find(".multisongheader").val(),
            restricted_to: this.$lightbox.find(".restrictionlist").val(),
            slideclass: "songsegment",
            songdescription: this.$lightbox.find(".songdescription").val(),
            slot_number: self.slot_number==undefined ? $(".slot").length + 1 : self.slot_number*1,
            slot_name:this.$lightbox.find(".segment-name").val()};
    },


    /**
     * Hae dian sisältötiedot tietokannasta
     *
     * @param int id haettavan sisällön id songsegments-taulussa
     */
    LoadParams: function(id){
        this.slot_number = this.$container.find(".slot-number").text();
        this.slot_name = this.$container.find(".slot_name_orig").val();
        this.addedclass = this.$container.find(".addedclass").val();
        var self = this;
        $.getJSON("php/loaders/fetch_slide_content.php",{"slideclass":"songsegment","id":id},function(data){
            if(data.multiname != ""){
                self.$lightbox.find("[value='multisong']").get(0).checked=true;
                self.$lightbox.find(".multisongheader").val(data.multiname).show();
            }
            if(data.restrictedto != ""){
                self.$lightbox.find("[value='restrictedsong']").get(0).checked=true;
                self.$lightbox.find(".restrictionlist").val(data.restrictedto).show();
            }
            self.$lightbox.find(".segment-name").val(self.slot_name);
            self.$lightbox.find(".songdescription").val(data.songdescription);
            }
        );
    }
}

/**
 *
 * Yksittäisen diasisällön lisäävä olio.
 *
 * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
 *
 */
var InfoSlideAdder = function($container){
    StructuralElementAdder.call(this, $container);
    this.slideclass = ".infoslide";
    this.SetLightBox();
    return this;
}


InfoSlideAdder.prototype = {
    /**
     * Muodosta dia esikatselua varten
     */
    SetPreviewParams: function(){
        var self = this;
        var maintext = this.$lightbox.find(".slidetext").val();
        //korvaa ät-merkit halutuilla arvoilla
        this.$lightbox.find(".resp_select").each(function(){maintext = maintext.replace(/@/," [" + $(this).val() + "] ")});
        this.previewparams = {
            slideclass: "infosegment",
            maintext:maintext,
            genheader: self.$lightbox.find("[type='checkbox']").get(0).checked ? "Majakkamessu" : "",
            subgenheader: self.$lightbox.find("[type='checkbox']").get(0).checked ? "Messun aihe" : "",
            slot_number: self.slot_number==undefined ? $(".slot").length + 1 : self.slot_number,
            slot_name:this.$lightbox.find(".segment-name").val() ,
            imgname:this.$lightbox.find(".img-select").val() ,
            imgpos:this.$lightbox.find(".img-pos-select").val() ,
            header:this.$lightbox.find(".slide-header").val()};
    },

    /**
     * Hae dian sisältötiedot tietokannasta
     *
     * @param int id haettavan sisällön id infosegments-taulussa
     */
    LoadParams: function(id){
        //Huolehdi siitä, että kuvanvalintavalikko on näkyvissä ennen tietojen lataamista
        this.AddImageLoader();
        this.slot_number = this.$container.find(".slot-number").text();
        this.slot_name = this.$container.find(".slot_name_orig").val();
        var self = this;
        $.getJSON("php/loaders/fetch_slide_content.php",{"slideclass":"infosegment","id":id},function(data){
            console.log(data);
            self.$lightbox.find(".slide-header").val(data.header);
            self.$lightbox.find(".infoslidetext").val(data.maintext);
            self.$lightbox.find(".segment-name").val(self.slot_name);
            self.$lightbox.find(".img-select").val(data.imgname);
            self.$lightbox.find(".img-pos-select").val(data.imgposition);
            if(data.genheader != ""){
                self.$lightbox.find("[value='show-upper-header']").get(0).checked=true;
            }
            var used_img = self.$lightbox.find(".img-select").val();
            if(used_img!="Ei kuvaa"){
                Preview(self.$lightbox.find(".img-select").parents(".with-preview"),"images/" + used_img);
            }
        });
    },

    /**
     * Lataa näkyviin tietokantaan tallennetut kuvat valittavaksi esitykseen lisäämistä varten.
     *
     */
    AddImageLoader: function(){
        var self = this;
        this.$lightbox.find(".img-select").remove();
        $sel = $("<select class='img-select'><option>Ei kuvaa</option></select>")
            .on("change",function(){ 
                Preview($(this).parents(".with-preview"),"images/" + $(this).val())}
            );
        $.getJSON("php/loaders/load_assets.php",{"asset_type":"backgrounds"},
                //Luo ensin lista tallennetuista kuvista. 
                function(data){
                    $.each(data, function(idx,imgname){
                        $("<option>").text(imgname).appendTo($sel);
                        } 
                    );
                    self.$lightbox.find(".img-select-parent").append($sel);
                });
    }

}

/**
 *
 * Raamattusisällön lisäävä olio.
 *
 * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
 *
 */
var BibleSlideAdder = function($container){
    StructuralElementAdder.call(this, $container);
    this.slideclass = ".bibleslide";
    this.SetLightBox();
    return this;
}

BibleSlideAdder.prototype = {
    /**
     * Kerää tallennusta varten tarvittavat tiedot
     */
    SetPreviewParams: function(){
        var self = this;
        this.previewparams = {
            slideclass: "biblesegment",
            slot_number: self.slot_number==undefined ? $(".slot").length + 1 : self.slot_number*1,
            slot_name:this.$lightbox.find(".segment-name").val()};
    },


    /**
     * Hae dian sisältötiedot tietokannasta
     *
     * @param int id haettavan sisällön id songsegments-taulussa
     */
    LoadParams: function(id){
        this.slot_number = this.$container.find(".slot-number").text();
        this.slot_name = this.$container.find(".slot_name_orig").val();
        this.addedclass = this.$container.find(".addedclass").val();
        var self = this;
        $.getJSON("php/loaders/fetch_slide_content.php",{"slideclass":"biblesegment","id":id},function(data){
            self.$lightbox.find(".segment-name").val(self.slot_name);
            self.$lightbox.find(".songdescription").val(data.songdescription);
            }
        );
    }
}


extend(StructuralElementAdder, InfoSlideAdder);
extend(StructuralElementAdder, SongSlideAdder);
extend(StructuralElementAdder, BibleSlideAdder);



