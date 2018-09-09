/**
 *
 * Jquery ui:n selectmenu-pluginin muokkaus niin, että
 * mahdollista valita myös tekstikenttä.
 *
 */
 $.widget("custom.select_withtext", $.ui.selectmenu, 
     { 
         _renderItem: function( ul, item ) {
                //TODO: abstract this, so that these options can be set appropriately and don't have to be hard coded.
                var $input = $("<input type='text' placeholder='" + item.label + "...'>");
                $input.on("keydown",function(){
                    var $div = $(this).parents(".other-option");
                    if ($div.find("button").length==0){
                        $("<button>Lisää</button>")
                            .click(function(){
                                //Lisää äsken lisätty uusi arvo KAIKKIIN tällä sivulla oleviin select-elementteihin, joissa addedclass-nimi
                                //Etsi id nappia lähimmästä ul-elementistä
                                //Tämä on sama kuin select-emementillä (ilman menu-liitettä)
                                var $select = $("#" + $(this).parents("ul").attr("id").replace("-menu",""));
                                //var newval = $select.parents(".other-option").find("input").val();
                                var newval = $(this).parents(".other-option").find("input").val();
                                $("<option value='" + newval + "'> " + newval + "</option>")
                                    .insertBefore($select.find("option:last-child"));
                                try{
                                    $select.select_withtext("refresh");
                                }
                                catch(e){
                                    $(this).select_withtext();
                                }
                            })
                            .appendTo($div);
                    }
                });
             if(item.label=="Jokin muu"){
                    self = this,
                    thisitem = item;

                $input.autocomplete( {
                    source: Portal.SongSlots.LoadSongTitles,
                    minLength: 2,
                    select: function(event,input){
                        var $select = $("#" + $(this).parents("ul").attr("id").replace("-menu",""));
                        $("<option>" + input.item.value + "</option>")
                            .insertBefore($select.find("option:last-child"));
                        $select.val(input.item.value);
                        try{
                            $select.select_withtext("refresh");
                        }
                        catch(e){
                            $(this).select_withtext();
                        }
                        Portal.SongSlots.GetCurrentSlot().CheckLyrics();
                        Portal.Service.GetCurrentTab("Songs").MonitorChanges();
                    },
                });
                }
             

            var wrapper = (["Uusi luokka","Jokin muu","Uusi tunniste"].indexOf(item.label)>-1 ? $("<div class='other-option'>").append($input) : $("<div>").text(item.label));

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

//Yleisluontoisia apufunktioita
//
var Utilities = function(){

    var ajax_path = "php/ajax",
        img_path = "assets/images";

    /**
     *
     * Apufunktio jquery ui:n pilkutettua autocomplete-kenttää varten
     *
     * @param split 
     *
     */
    function split(val) {
      return val.split( /,\s*/ );
    }

    /**
     *
     * Apufunktio jquery ui:n pilkutettua autocomplete-kenttää varten
     *
     * @param term syötetty avainsana
     *
     */
    function extractLast(term) {
      return split(term).pop();
    }


    /**
     *
     * Piilottaa portaalin ylämenun. Hyödyllinen esim. käytettäessä iframesta käsin.
     *
     */
    function HideUpperMenu(){
        $("nav").hide();
    }

    /**
     *
     * Asettaa oikean polun ajax-skriptien kansioon
     *
     * @param path uusi polku, huom, ei saa loppua /-merkkiin
     *
     */
    function SetAjaxPath(path){
        if (path.substr(-1) == "/"){
            path = path.substr(0, path.length-1);
        }

        ajax_path = path;
    
    }



    /**
     *
     * Asettaa oikean polun kuvakansioon
     *
     * @param path uusi polku, huom, ei saa loppua /-merkkiin
     *
     */
    function SetImgPath(path){
        if (path.substr(-1) == "/"){
            path = path.substr(0, path.length-1);
        }

        img_path = path;
    
    }

    /**
     *
     * Hakee oikean polun ajax-skriptien kansioon
     *
     * @param fname mikä tiedosto kansiosta haetaan
     *
     */
    function GetAjaxPath(fname){
        //fname = (fname ? "/" + fname : "");
        fname = fname || "";
        return ajax_path + "/" + fname;
    }

    /**
     *
     * Hakee oikean polun kuvakansioon
     *
     * @param fname mikä tiedosto kansiosta haetaan
     *
     */
    function GetImgPath(fname){
        //fname = (fname ? "/" + fname : "");
        fname = fname || "";
        return img_path + "/" + fname;
    }



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
        console.log("PGview");
        if( filename.indexOf("Ei kuvaa") > -1 ){ 
            $div.find(".preview img").remove();
        }
        else{
            $("<img>").attr({"src":img_path + "/" + filename,
                "height":"100%",
                "width":"100%",
                "object-fit":"contain",
            }).appendTo($div.find(".preview").html(""));
        }
    }


    /**
     *
     * Olio lyhyiden viestien näyttämiseen hallintanäytöllä.
     *
     * @param msg näytettävä viesti
     * @param $parent_el jquery-elementti, jonka sisään viesti syötetään
     *
     */
    var Message = function(msg, $parent_el){
        console.log("new message created");
        this.$box = $("<div></div>").text(msg).attr({"class":"msgbox"});
        this.$parent_el = $parent_el || $("body");
    }

    Message.prototype = {
        background: "",
        color: "",

        /**
         * Näyttää viestilaatikon viesti käyttäjälle
         *
         * @param offtime millisekunteina se, kuinka kauan viesti näkyy (oletus 2 s)
         *
         */
        Show: function(offtime){
            var self = this;
            this.$parent_el.css({"position":"relative"});
            this.$box.appendTo(this.$parent_el).fadeIn("slow");
            if(offtime){
                setTimeout(function(){ self.Destroy(); },offtime);
            }
            this.$box.draggable();

            return this;
            //BlurContent(self.box);
        },

        /**
         *  Adds a title to the message 
         *
         *  @param text the text of the title.
         *
         */
        SetTitle: function(text){
            this.$box.find("h3").remove();
            this.$box.prepend($(`<h3>${text}</h3>`));
            return this;
        },


        /**
         *  Adds a footer to the message 
         *
         *  @param text the text of the footer.
         *
         */
        SetFooter: function(text){
            this.$box.find("footer").remove();
            this.$box.append($(`<footer>${text}</footer>`));
            return this;
        },

        
        /**
         *  Adds an "OK" button to the box
         *
         */
        AddOkButton: function(){
            $("<button class='okbutton'>OK</button>")
                .click(this.Destroy.bind(this))
                .appendTo(this.$box);
            return this;
        },

        /**
         *  Adds new text to the box
         *
         */
        Add: function(newtext){
            if(!this.$box.find("ul").length){
                var oldtext = this.$box.text();
                $("<ul></ul>").appendTo(this.$box.html(""));
                if(oldtext){
                    this.$box.find("ul").append(`<li>${oldtext}</li>`);
                }
            }
            this.$box.find("ul").append(`<li>${newtext}</li>`);
            return this;
        },

        /**
         *  Adds a close button 
         */
        AddCloseButton: function(){
            var $a = $("<a class='boxclose'></a>").click(this.Destroy.bind(this));
            this.$box.prepend($a);
            return this;
        },

        /**
         *  Adds an id , e.g. to prevent duplicates
         *  @param id  the id to be added
         */
        AddId: function(id){
            this.$box.attr({"id": id});
            return this;
        },

        /**
         *  Clears the text in the message box
         *
         */
        Clear: function(){
            this.$box.html("");
            return this;
        },

        /**
         *
         *  Changes the text of the last item of the message
         *
         *  @param text what to display
         *
         */
        Update: function(text){
            if(this.$box.find("ul").length){
                this.$box.find("li:last-of-type").text(text);
            }
            else{
                this.$box.text(text);
            }
            return this;
        },

        Destroy: function(){
            this.$box.html("").remove();
        }
    }

    /**
     *
     * https://stackoverflow.com/questions/41194368/how-to-get-all-sundays-mondays-tuesdays-between-two-dates#41194523
     * Given a start date, end date and day name, return
     * an array of dates between the two dates for the
     * given day inclusive
     * @param {Date} start - date to start from
     * @param {Date} end - date to end on
     * @param {int} day - number of the day
     * @returns {Array} array of Dates 
     *
     */
    function getDaysBetweenDates(start, end, day) {
      // Copy start date
      var current = new Date(start),
          //result = [$.datepicker.formatDate('yy-mm-dd', start)];
          result = [];
      day = day + 1;
      // Shift to next of required days
      current.setDate(current.getDate() + (day - current.getDay() + 7) % 7);
      // While less than end date, add dates to result array
      while (current < end) {
        result.push(
            $.datepicker.formatDate('yy-mm-dd', new Date(+current))
            );
        current.setDate(current.getDate() + 7);
      }
      result.push($.datepicker.formatDate('yy-mm-dd', end));
      return result;  
    }


    return {

        Message,
        BlurContent,
        ScrollToCenter,
        SetAjaxPath,
        GetAjaxPath,
        SetImgPath,
        GetImgPath,
        HideUpperMenu,
        Preview,
        getDaysBetweenDates,
        split,
        extractLast
    
    }

}();



var Portal = Portal || {};

/**
 *
 * Moduuli erilaisille menuille
 *
 **/
Portal.Menus = function(){

    var menus = {}
        sidemenu = undefined,
        initialized = false;

    /**
     *
     * Yksinkertainen sivumenu mobiiliin
     *
     * @param $launcher menun avaaja
     *
     */
    var SideMenu = function($launcher){
    
        this.$launcher = $launcher;

        /**
         *
         * Alustaa toiminnallisuuden
         *
         */
        this.Initialize = function(){
            this.$launcher.click(this.Toggle.bind(this));
        }

        /**
         *
         * Avaa tai sulkee menun riippuen siitä, oliko se äsken auki
         *
         */
        this.Toggle = function(){
                this.$launcher.find("i")
                    .toggleClass("fa-bars")
                    .toggleClass("fa-times");
                $(".dropdown").slideToggle()
        }

        /**
         *
         * Avaa menun (vaikka väkisin)
         *
         */
        this.Open = function(){
            if(this.$launcher.is(":visible")){
                this.$launcher.find("i")
                    .removeClass("fa-bars")
                    .addClass("fa-times");
                $(".dropdown").slideDown()
            }
        }

        /**
         *
         * sulkee menun
         *
         */
        this.Close = function(){
            if(this.$launcher.is(":visible")){
                this.$launcher.find("i")
                    .removeClass("fa-times")
                    .addClass("fa-bars");
                $(".dropdown").slideUp()
            }
        }
    
    }


    /**
     *
     * Yksinkertainen, koko ruudun peittävä menu
     *
     * @param name menun nimi. Tämän on oltava html:ssä elementin id sekä
     * lisäksi menun avaavan elementin css-luokkana muodossa covermenu-target_nimi
     *
     */
    var Covermenu = function(name){


        this.name = name;
        this.$menu = $("#" + name);
        this.$launcher = $(".covermenu-target_" + this.name);


        /**
         *
         * Alustaa menun toiminnallisuuden
         *
         */
        this.Initialize = function(){
            var $close = $(`<div class='closer_div' id='close_covermenu'>
                   <a href='javascript:void(0);'><i class='fa fa-arrow-left'></i> Takaisin</a>
                </div>`)
                .click(this.CloseMenu.bind(this))
                .prependTo(this.$menu);
            if(this.$launcher.length){
                this.$launcher.click(this.OpenMenu.bind(this));
            }
        }

    
        /**
         *
         * Avaa oikean menun, kun klikattu oikeaa linkkiä
         *
         * @param $launcher menu-klikkauksen laukaissut linkki
         *
         **/
        this.OpenMenu = function($launcher){
            //Varmista ensin, että kaikki muut covermenut ovat peitettyinä,
            //koska näitä voi olla kerrallaan näkyvissä vain yksi.
            $(".covermenu").hide();
            this.$menu.show();
            //Utilities.BlurContent();
            if(sidemenu)
                sidemenu.Close();
        }

        /**
         *
         * Sulkee oikean menun, kun klikattu oikeaa linkkiä
         *
         *
         **/
        this.CloseMenu = function(){
            this.$menu.hide();
            //$(".blurcover").remove();
        }
        
    }

    /**
     *
     * Avaa pudotusmenun
     *
     *
     **/
    function OpenDropDown(){
        var $child = $(this).find(".menu-child, .menu-child-upper");
        $child.css({"top": $(this).height() + "px"});
        if($(this).hasClass("active-menu")){
            $child.slideUp(() => $(this).removeClass("active-menu"));
        }
        else{
            $(this).addClass("active-menu");
            $child.slideDown();
        }
    }

    /**
     *
     * Luo uuden taittomenun
     *
     *
     */
    function InitializeFoldMenu(){
        //Avaa tai sulje tarkemmat fonttien muokkaussäätimet ym
        $(this).next().slideToggle(); 
        $(this).toggleClass("opened");
    }


    function InitializeMenus(){
    
        console.log("initializing menus");
        //Aseta taittovalikot toimintakuntoon
        $(".controller-subwindow").hide()
        $(".subwindow-opener").click(InitializeFoldMenu);
        $(".covermenu").each(function(){
            var name = $(this).attr("id");
            menus[name] = new Covermenu(name);
            menus[name].Initialize();
        });

        $(".menu-child").hide();
        $(".menu-parent").click(OpenDropDown);
            //.each((idx, el) => $(el).css({"width":$(el).find(".menu-child").width() + "px"}));
        $("#season-select").selectmenu();

        initialized = true;

        $(".covermenu").appendTo("main");


        //Sivumenu: näitä voi olla vain yksi
        sidemenu = new SideMenu($(".sidemenu-launcher"));
        sidemenu.Initialize();
    }

    function GetInitialized(){
        return initialized;
    }

    function GetSideMenu(){
        return sidemenu;
    }


    /**
     *
     * Lisää valintaikkunan tms. sulkevan painikkeen
     *
     */
    function AddCloseButton($parent_el){
        var $a = $("<a class='boxclose'></a>").click(() => $parent_el.hide());
        $parent_el.prepend($a);
    }

    return {
        InitializeMenus,
        InitializeFoldMenu,
        GetInitialized,
        menus,
        GetSideMenu,
        AddCloseButton,
    }



}();

/**
*
* Kommentit - lataaminen ja prosessointi
*
*/
var Comments = function(){

    var loaderpath = "php/ajax";


    /**
     *
     * Laajenna näkyviin uuden kommentin kirjoituskenttä
     *
     */
    function ExpandCommentField(){
        $(this).animate({"height":"6em"}); 
        var $details = $(this).parent().parent().find(".commentdetails:eq(0)");
        $details.show();
        Utilities.ScrollToCenter($details);
    }



    /**
     *
     * Lataa kaikki kommentit tietokannasta dokumenttiin
     * Lataa myös uuden kommentin syöttämiseen tarvittavat tiedot.
     *
     */
    function LoadComments(){
        $.get("php/ajax/Loader.php", {
            action: "load_comments",
            service_id: Portal.Service.GetServiceId()
            },
            function(data){
                $(".loadedcomments").html(data);
                $(".newcomment, .commentator").val("");
                $(".newcomment:eq(0)").height("3em");
                $(".comment comment-insert-controls, .commentdetails").hide()
                $(".comment-answer-link")
                    .click(CreateCommentAnswerField)
                    .each(function(){
                    //Muuta vastauslinkin tekstiä ketjujen osalta
                    if($(this).parent().parent().find(".comment").length>0) $(this).text("Jatka viestiketjua");
                });
                //Huom! Varmistetan, ettei tallennustapahtuma tule sidotuksi kahdesti
                $(".savecomment")
                    .unbind("click",SaveComment)
                    .bind("click",SaveComment);
                $(".newcomment:eq(0)").click(ExpandCommentField);
        }
        );

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
        var queryparams = {action: "save_comment",
                           service_id:Portal.Service.GetServiceId(),
                           theme: theme,
                           content:$container.find(".newcomment").val(),
                           commentator:$container.find(".commentator").val(),
                           replyto:replyto
                          };
        $.get("php/ajax/Loader.php",queryparams, function(data){
            LoadComments();
        });
    }

    /**
     *
     * Syötä tekstikenttä kommenttiin tai viestiketjuun
     * vastaamista varten.
     *
     */
    function CreateCommentAnswerField(){
        var $commentbox = $(this).parents(".comment");
        if( !$commentbox.find(".comment_controls").length ){
            var $controls = $(".comment_controls:eq(0)").clone(true);
            $controls.find("select").remove();
            $controls
                .appendTo($commentbox)
                .css({"margin-top":"1em"})
                .hide().slideDown()
                .children().show();
        }
    }

    /**
     *
     * Luo select-elementin, jossa kommentin aiheen voi valita
     *
     **/
    function CreateThemeSelect(){
        $.getJSON("php/ajax/Loader.php", {
            action: "get_list_of_responsibilities",
            },
            function(data){
                var $sel = $(".commentdetails select");
                $sel.html("").append("<option>Ei aihetta</option>");
                $.each(data, function(idx, el){
                    $sel.append(`<option>${el}</option>`)
                });
            }
        );
    
    }

    return {
        LoadComments,
        CreateThemeSelect,
    }

}();




Portal = Portal || {};

/**
 *
 * Moduuli yhden messun laulusloteista
 *
 */
Portal.SongSlots = function(){

    var current_slot;

    /**
     *
     * Palauttaa aktiivisen, esim. sanojen muokkausta odottavan slotin
     *
     */
    function GetCurrentSlot(){
        return current_slot;
    }

    /**
     *
     * Asettaa aktiivisen slotin
     *
     */
    function SetCurrentSlot(slot){
        current_slot = slot;
    }

    //TODO: tallenna muutokset automaattisesti, jos n minuuttia tallentamatta

    /**
     *
     * Hakee tietokannassa olevien laulujen nimet
     *
     **/
    function LoadSongTitles(request, response){
        var path = Utilities.GetAjaxPath("Loader.php");
        $.getJSON(path,{
            action: "get_song_titles",
            service_id: Portal.Service.GetServiceId(),
            title:request.term
        }, 
            function(data){
                response(data)
            }
        );
    }

    /**
     *
     * Hakee tietokannasta laulujen tägit
     *
     **/
    function LoadSongTags(request, response){
        var path = Utilities.GetAjaxPath("Loader.php");
        $.getJSON(path,{
            action: "get_song_tags",
            song_id: this.picked_id,
        }, 
            function(data){
                console.log(data);
                response($.ui.autocomplete.filter(
                        data, Utilities.extractLast( request.term ) ) );
            }
        );
    }


    /**
     *
     * Hakee nyt käsiteltävässä messussa käytössä olevat laulut
     *
     */
    function LoadSongsToSlots(){
        var path = Utilities.GetAjaxPath("Loader.php");
        $.get(path, {
            action: "get_song_slots",
            service_id: Portal.Service.GetServiceId()
            }, 
            InitializeContainers);
    }


    /**
     *
     * Tallentaa muutokset lauluslottien järjestykseen yhden "kontin" sisällä 
     *
     **/
    function SaveSlotOrder($parent_el){
        var $slots = $parent_el.find(".songslot");
        Portal.Service.GetCurrentTab("Songs").MonitorChanges();
    }

    /**
     *
     * Luo jokaisesta lauluslotista oma olionsa, joka kuuntelee siihen
     * liittyviä tapahtumia, kuten laulujen raahaamista.
     *
     * @param slot_data ajax-response, joka sisältää tiedot tähän messuun tallennetuista lauluista
     *
     **/
    function InitializeContainers(slot_data){
        $("#songslots").html(slot_data);
        $(".slotcontainer").each(function(){
            var Cont = new SlotContainer($(this));
            Cont.SetName( $(this).find(".cont_name").text());
            if(Cont.$div.find(".is_multi_val").val()*1){
                //Lisää useamman laulun lisäyspainikkeet vain, jos 
                //laulu määritelty usean laulun lauluksi
                Cont.is_multi = true;
            }
            Cont.restrictedto = Cont.$div.find(".restriction_val").val();
            Cont.SetMultisongButtons().FetchSlots();
            Cont.SetToolTip();
        });
    }

    /**
     *
     * Yhden tai useamman laulun sisältävä slotti
     * tai pikemminkin niiden  "kontti"
     *
     * @param $div kontti representaatio DOMissa
     *
     **/
    var SlotContainer = function($div){

        this.$ul = $("<ul></ul>").appendTo($div.find(".songslots"));
        this.$div = $div;
        this.sortable_slot_list = undefined;

        /**
         *
         * Asettaa nimen
         *
         * @param name asetettava nimi
         *
         */
        this.SetName = function(name){
            this.name = name;
            return this;
        };

        /**
         *
         * Hakee käikki tämän kontin sisältämät laulut
         *
         **/
        this.FetchSlots = function(){
            $.getJSON("php/ajax/Loader.php",{
                action: "load_slots_to_container",
                service_id: Portal.Service.GetServiceId(),
                cont_name: this.name
            }, this.SetSlots.bind(this));
        }

        /**
         *
         * Syöttää kontin sisältämien lauluslottien mukaisen datan paikalleen
         *
         * @param slots taulukko niistä sloteista, joita ajax-response palauttaa
         *
         **/
        this.SetSlots = function(slots){
            var self = this;
            if(!slots.length){
                //Jos ei vielä yhtään laulua määritelty
                slots = [{song_title:"",multisong_position:""}];
            }
            $.each(slots, function(idx, slot_data){
                var slot = new SongSlot(slot_data.song_title,
                    slot_data.multisong_position, 
                    self,
                    slot_data.song_id);
                slot.Create().AttachEvents();
                if(!self.restrictedto){
                    slot.CheckLyrics();
                }
            });
            //Finally, attach drag and drop events
            if(this.is_multi){
                this.AddSortability();
            }
            else{
                this.$div.find(".cont_name").css({"margin-bottom":"0.7em"});
            }
        }



        /**
         *
         * Lisää järjestelymahdollisuuden konttiin, jossa monta lauluslottia
         *
         **/
        this.AddSortability = function(){
            this.sortable_slot_list =  this.sortable_slot_list || 
                new GeneralStructure.DragAndDrop.SortableList(this.$ul,
                {
                    draggables: ".songslot",
                    drop_callback: SaveSlotOrder,
                    number: ".slot-number",
                    id_class: ".slot_id",
                    idkey: "slot_id",
                    handle: ".slot_handle",
                    drop_accept: ".songslot"
                }
                );
            this.sortable_slot_list.Initialize();
        };

        /**
         *
         * Lisää opasteen näyttävän tapahtuman
         *
         */
        this.SetToolTip = function(){
            this.$div.find(".fa-question-circle").click(
                () => {
                    var msg = new Utilities.Message(this.$div.find(".songdescription_val").val(), this.$div);
                    msg.AddCloseButton().Show(8000);
                }
            );
        }

        /**
         *
         * Lisää painikkeet, joilla voidaan lisätä tai vähentää lauluja tästä
         * "kontista"
         *
         *
         */
        this.SetMultisongButtons = function(){
            //TODO: painikkeet yksittäisen laulun poistamiseen mistä kohtaa 
            //tahansa EIKÄ niinkään, että koko kontin lopussa miinuspainike
            //Plussapainike kylläkin
            //USE fontawesome icons?
            if (this.is_multi){
                var $add = $(`<i class="fa fa-plus" aria-hidden="false"></i>`)
                                .click(this.AddNewSlot.bind(this));
                this.$ul.parents(".slotcontainer").append(
                    $("<div class='buttons_cont'></div>").append($add)
                );
            }

            return this;
        };


        /**
         *
         * Lisää tämän kontin alle uuden slotin
         *
         **/
        this.AddNewSlot = function(){
            var slot_no = this.$ul.find(".songinput").length;
            var slot = new SongSlot("", slot_no, this);
            slot.Create().AttachEvents();
            this.AddSortability();
            //Varmista, että uuden slotin lisääminen lasketaan muutokseksi
            Portal.Service.GetCurrentTab("Songs").MonitorChanges();
        };


        /**
         *
         * Poistaa tämän kontin alta slotin
         *
         * @param ...?
         *
         **/
        this.RemoveSlot = function(){
            


        };

    };


    /**
     *
     * Yksi lauluslotti, joka kuvaa esim. alkulaulua tai yhtä
     * ylistyslauluista
     *
     * @param title valitun laulun nimi (jos joku laulu jo valittu)
     * @param position valitun laulun järjestysnumero tässä "kontissa"
     * @param cont slotin sisältävä "kontti" SlotContainer-oliona
     * @param picked_id valitun laulun id (jos joku laulu jo valittu)
     *
     **/
    var SongSlot = function(title, position, cont, picked_id){

        var self = this;
        this.title = title;
        this.tags = "";
        this.position = position;
        this.picked_id = picked_id || '';
        this.cont = cont;
        this.song_ids = [];
        this.$lyrics = undefined;
        this.newsongtext = "";
        this.is_service_specific = true;

        /**
         *
         * Tekee slotista ei-messukohtaisen (jos hallitaan lauluja muualta)
         *
         */
        this.SetNotServiceSpecific = function(){
            this.is_service_specific = false;
        }

        /**
         *
         * Lisää DOMiin divin, jossa varsinainen slotti on kuvattuna
         *
         */
        this.Create = function(){
            var promise = undefined,
                path = Utilities.GetAjaxPath("Loader.php"),
                self = this;
            this.$div = $(`
                <li class="songslot no_indicator">
                <div>
                    <span  class='slot_number hidden'>${this.position}</span>
                    <input type="text" class="songinput" value="${this.title}"> 
                    <input type="hidden" class="song_id" value="${this.picked_id}"> 
                </div>
                </li>`);

            //Varmista, että slotti on merkitty valituksi, kun siihen kosketaan
            this.$div.click(()=>{ SetCurrentSlot(self); });

            //Laulujen lisävalinnat: monta laulua samassa / rajattu tägillä
            if (this.cont.is_multi){
                $("<div class='slot_handle'><i class='fa fa-arrows'></i></div>")
                    .appendTo(this.$div);
            }



            $("<div class='slot_edit'><i class='fa fa-pencil'></i></div>")
                .click(this.CheckDetails.bind(this))
                .appendTo(this.$div);

            if (this.cont.is_multi){
                //Lisää lisävalintoja: poistaminen
                $("<div class='slot_remove'><i class='fa fa-trash'></i></div>")
                    .click(this.Remove.bind(this))
                    .appendTo(this.$div);
            }


            this.$div.find("[type='text'].songinput").droppable({
                accept: "#prepared_for_insertion",
                drop: this.AcceptDroppedSong.bind(this),
                classes: {
                    "ui-droppable-active": "slot_waiting",
                    "ui-droppable-hover": "slot_recieve",
                }
            });

            this.cont.$ul.append(this.$div);

            if(this.cont.restrictedto){
                // Jos käytössä (johonkin tägiin) rajattu lista lauluja
                this.$div.find(".songinput").remove();
                //this.$div.find("div").css({"padding-top":"1em"});
                //this.$div.find("div").append();
                promise = $.getJSON(path, {
                    "action" : "get_songs_with_tag",
                    "tag": this.cont.restrictedto
                }, (songs) => {
                    var $sel = $("<select class='songinput'></select>");
                    $sel
                        .append("<option value=''>Valitse</option>")
                        .append(songs.map((s) => `<option>${s}</option>`))
                        .append("<option>Jokin muu</option>")
                        .appendTo(this.$div.find("div:eq(0)"));
                    $sel.select_withtext({
                        select: () => {
                            this.picked_id = null;
                            this.CheckLyrics.bind(this)();
                            Portal.Service.GetCurrentTab("Songs")
                                .MonitorChanges.bind(
                                    Portal.Service.GetCurrentTab("Songs")
                                )();
                        }
                    });
                    $sel.val(this.title);
                    $sel.select_withtext("refresh");
                    this.CheckLyrics();
                });
            }

            $.when(promise).done(() => {
                //Lisää välilehtiolioon muutosten tarkkailutoiminto.
                //Tämä suoritetaan joko heti tai kun tägillä rajatut laulut on ajettu sisään:
                this.$div.find("input[type='text'], select").on("change paste keyup selectmenuchange",
                    Portal.Service.GetCurrentTab("Songs")
                        .MonitorChanges.bind(Portal.Service.GetCurrentTab("Songs")));
            });


            return this;
        };


        /**
         *
         * Ottaa laulun arvon raahatusta elementistä
         *
         */
        this.AcceptDroppedSong = function(e, ui){
            this.$div.find(".songinput").val(
                    $(ui.draggable).find(".song_title").text()
                );
            this.$div.find(".song_id").val(
                    $(ui.draggable).find(".song_id").val()
                );
            $("#prepared_for_insertion").hide();
            this.picked_id = $(ui.draggable).find(".song_id").val();
            this.CheckLyrics();
            songs_tab.MonitorChanges();
        };


        /**
         *
         * Poistaa tämän laulun kontista
         *
         */
        this.Remove = function(){
            //..vain jos ei viimeinen
            var has = {
                    next: this.$div.next().next().hasClass("songslot"),
                    prev: this.$div.prev().prev().hasClass("songslot")
            };

            if(this.$div.parents("ul").find(".songslot").length > 1){
                if(has.next && has.prev || has.next){
                    this.$div.next().remove();
                }
                else if (has.prev){
                    this.$div.prev().remove();
                }
                this.$div.remove();
                songs_tab.MonitorChanges();
            }
            else{
                window.alert("Et voi poistaa viimeistä laulua. Jos tätä laulua ei lauleta, jätä kenttä vain tyhjäksi.");
            }
        };


        /**
         *
         * Muokkaa olemassaolevia sanoja
         *
         */
        this.EditWords = function(){
            $("#songdetails .lyrics_id").val(this.picked_id);
            $.getJSON("php/ajax/Loader.php",{
                action: "fetch_lyrics",
                song_id: this.picked_id,
            }, function(verses){
                var text = "";
                $.each(verses, function(idx, verse){
                    text += "\n\n" + verse.verse;
                });
                $("#songdetails .below_lyrics").show();
                $("#songdetails .lyrics")
                    .html("")
                    .append(`<textarea class='edited_lyrics'>${text.trim()}</textarea>`);
            });
        };


        /**
         *
         * Lisää uuden version tästä laulusta
         *
         */
        this.AddNewVersion = function(){
            $("#songdetails .below_lyrics").show();
            $("#songdetails .lyrics_id").val(this.title);
            $("#songdetails .lyrics")
                .html("")
                .append(`<textarea class='edited_lyrics'></textarea>`);
        };


        /**
         *
         * Avaa ikkunan, jossa voi tarkkailla laulun yksityiskohtia ja esim. muokata sanoja
         *
         */
        this.CheckDetails = function(){
            //Käytä oletuksena ensimmäistä versiota ko. laulusta
            var self = this;
            this.picked_id = this.picked_id || this.song_ids[0];
            //If no $div set, use the original title
            // -- this means we're using a pseudo-songslot
            // launched by e.g.  a songlist
            this.title = (this.$div ? this.$div.find(".songinput").val() : this.title);
            if(!this.title){
                //Jos tyhjä, älä tee mitään
                return 0;
            }

            SetCurrentSlot(this);

            $("#songdetails").find(".version_cont, .lyrics").html("");
            console.log(this.picked_id);
            SongLists.SetLyrics(this.picked_id, $("#songdetails .lyrics"));
            SongLists.SetSongMeta();

            this.PrintEditActions();
            $("#songdetails").find("h3").text(this.title);
            $("#songdetails").find(".song_id").val(this.picked_id);
            $("#songdetails").slideDown();
            //Varmista, että uusien sanojen tallennuksen jälkeen pystytään viittaamaan

            //Varmista, että versiot päivitetään 
            //asettamalla callback
            SongLists.SetEditedLyricsCallback(function(){
                var input_id_val = $("#songdetails .lyrics_id").val();
                self.picked_id = input_id_val || self.picked_id;
                if(self.is_service_specific){
                    $.when(self.RefreshVersions(
                        self.LoadVersionPicker.bind(self)
                    )).done(self.PrintEditActions.bind(self));
                }
            });
        };

        /**
         *
         * Lisää toiminnallisuuden laulun tarkasteluikkunaan
         *
         *
         */
        this.PrintEditActions = function(){
            var lyrics_status = (this.song_ids.length ? "has_lyrics" : "no_lyrics"),
                edit_actions = {
                    no_lyrics : [
                        $(`<li class='new_version_li'>
                        Lisää lauluun sanat</li>`)
                            .click(self.AddNewVersion.bind(self))
                    ],
                    has_lyrics: [
                        $(`<li class='edit_words_li'>Muokkaa sanoja</li>`)
                            .click(self.EditWords.bind(self)),
                        $(`<li class='new_version_li'>
                        Lisää uusi laulu tai versio samalla nimellä </li>`)
                            .click(self.AddNewVersion.bind(self))
                    ]
                };
            if(!this.is_service_specific){
                lyrics_status = "has_lyrics";
            }
            $("#songdetails_actions").html("");
            $.each(edit_actions[lyrics_status],function(idx, $el){
                $("#songdetails_actions").append($el);
            });

            $("#songdetails .edit_icon").unbind("click").click(this.EditMeta.bind(this));

            if(lyrics_status == "no_lyrics"){
                $("#songdetails .song_authors").hide();
            }
        }

        /**
         *
         * Muokkaa laulun säveltäjää / sanoittajaa / tägejä
         *
         * TODO: abstraktimman tason muokkausfunktio tai -metodi
         *
         * @paramev klikkaustapahtuma
         *
         */
        this.EditMeta = function(ev){
            var $li = $(ev.target).parents("li"),
                path = Utilities.GetAjaxPath("Saver.php"),
                loadpath = Utilities.GetAjaxPath("Loader.php"),
                meta_type = $li.attr("class");
                new_val = $li.find(".data_as_input input").val();

            if(meta_type == "songtags"){
                //Pilkuilla erotettu multiautocomplete tägeille
                $(".taginput").autocomplete({
                        source: LoadSongTags,
                        minLength: 2,
                        focus: () => false,
                        select: function(event, ui) {
                          var terms = Utilities.split( this.value );
                          terms.pop();
                          terms.push( ui.item.value );
                          terms.push("");
                          this.value = terms.join( ", " );
                          return false;
                        }
                        });

                //Jaa tägitekstikentän sisältö taulukoksi
                new_val = new_val.split(/, ?/).filter((v)=>v != "");
            }
            else{
                //Yksinkertainen autocomplete säveltäjällä ja sanoittajalle
                $li.find(".data_as_input input").autocomplete({
                    source: (request, response) => {
                        $.getJSON(loadpath, {
                            "action" : "get_authors",
                            "authorstring" : request.term
                        }, (data) => response(data))
                    }
                });
            }


            if($li.find(".edit_icon").hasClass("fa-pencil")){
                //Jos  aloitetaan muokkaus
                $li.find(".data_as_text").hide()
                $li.find(".data_as_input").show()
                $li.find(".edit_icon").removeClass("fa-pencil").addClass("fa-check");
            }
            else{
                //Jos lopetetaan muokkaus
                $.post(path, {
                    "action": "save_edited_meta",
                    "new_val": new_val,
                    "meta_type": meta_type,
                    "song_id": this.picked_id
                
                }, () => {
                    $li.find(".data_as_input").hide();
                    $li.find(".data_as_text")
                        .text($li.find(".data_as_input input").val())
                        .show();
                    $li.find(".edit_icon").removeClass("fa-check").addClass("fa-pencil");
                }
                );
            }
        }


        /**
         *
         * Päivittää laulusta saatavilla olevat versiot
         *
         */
        this.RefreshVersions = function(callback){
            var self = this;
            return $.getJSON("php/ajax/Loader.php",{
                    action:  "check_song_title",
                    service_id: Portal.Service.GetServiceId(),
                    title: this.title
                    },
                function(ids){
                   self.song_ids = ids;
                    if(callback) 
                        callback();
                });
                    //callback.bind(this));
        }

        /**
         *
         * Luo valintamenun, jos monta eri laulua
         *
         */
        this.LoadVersionPicker = function(){
            if(this.song_ids.length > 1){
                var i,
                    $sel = $('<select class="version_picker_select"></select>');
                $("#songdetails .version_picker_select").remove();
                $.each(this.song_ids,function(idx,val){
                    $sel.append(`<option value='${val}'>Versio ${idx+1}</option>`);
                });
                $sel.prependTo("#songdetails .version_cont").selectmenu();
                $sel.on("selectmenuchange", self.SetVersion.bind(this));
                $sel.val(this.picked_id).selectmenu("refresh");
            }
        };

        /**
         *
         * Vaihtaa käytössä olevan version
         *
         * @param e tapahtuma
         * @param itm jquery-ui:n selectmenusta valittu elementti
         *
         */
        this.SetVersion = function(e, itm){
            this.picked_id = itm.item.value;
            $("#songdetails .lyrics_id").val(this.picked_id);
            this.$div.find(".song_id").val(this.picked_id);
            SongLists.SetLyrics(this.picked_id, $("#songdetails .lyrics"));
            songs_tab.MonitorChanges();
        }


        /**
         *
         * Tarkistaa, onko tämän laulun sanoja tietokannassa
         *
         **/
        this.CheckLyrics = function(ev, item){
            if(this.is_service_specific){
                var self = this,
                    //Jos käynnistetty klikkaamalla autocomplete-listaa (tai selectmenua), käytä sen arvoa
                    title = (item ? item.item.value :  this.$div.find(".songinput:eq(0)").val());
                console.log("CHECKING lyrics");
                $.getJSON("php/ajax/Loader.php",{
                        action:  "check_song_title",
                        service_id: Portal.Service.GetServiceId(),
                        title: title
                        },
                        self.IndicateLyrics.bind(self)
                        );
            }
        };



        /**
         *
         *
         * Näyttää informaation siitä, onko laulun sanoja tietokannassa. Lisää
         * myös tiedon niistä laulujen id:istä, jotka valitulla laulun nimellä
         * löytyvät.
         *
         * TODO: mahdollisuus klikata yksityiskohtaikkunasta vahvistus sille,
         * että tähän ei tule sanoja.
         *
         * @param song_ids id:t niistä lauluista, joita löydettiin
         *
         **/
        this.IndicateLyrics = function(song_ids){
            this.song_ids = song_ids;
            this.$div.removeClass("no_indicator");
            if(!this.picked_id){
                //Valitse oletuksena versioista ensimmäinen
                this.$div.find(".song_id").val(song_ids[0]);
                this.picked_id = song_ids[0];
            }
            else{
                //Muutoin käytä määriteltyä
                this.$div.find(".song_id").val(this.picked_id);
            }

            if(!song_ids.length){
                this.$div.removeClass("has_lyrics").addClass("no_lyrics");
                this.song_ids = [];
                this.picked_id = null;
            }
            else{
                this.$div.removeClass("no_lyrics").addClass("has_lyrics");
            }

            if(!this.$div.find(".songinput").val()){
                //Älä ota huomioon tyhjiä slotteja
                this.$div
                    .removeClass("no_lyrics")
                    .removeClass("has_lyrics")
                    .addClass("no_indicator");
            }
        };

        /** 
         * Liittää lauluslottiin kuuluvat tapahtumat
         *
         **/
        this.AttachEvents = function(){
            this.$div.find(".songinput").autocomplete( {
                source: LoadSongTitles,
                minLength: 2,
                select: this.CheckLyrics.bind(this)
                }
            ).on("change paste keyup",self.CheckLyrics.bind(this));

            return this;

        }

    
    }



    return {
    
        LoadSongsToSlots,
        SongSlot,
        LoadSongTitles,
        GetCurrentSlot
    
    };

}();

/**
 *
 * Moduuli erilaisille laulujen selauslistoille
 *
 *
 */
var SongLists = function(){

    var waiting_for_attachment,
        edited_lyrics_callback,
        current_song,
        not_service_specific=false,
        alphalist;

    /**
     * Lista, josta käyttäjä näkee kaikki selattavissa olevat laulut
     *
     **/
    var Songlist = function(){

        this.$anchor = $("#songlist_" + this.list_type);

        /**
         *
         * Hakee alaluokat tietokannasta
         *
         **/
        this.GetAndSetSubCategories  = function(){
            var self = this;
            $.getJSON("php/ajax/Loader.php",
                {
                    action: "get_songlist_" + this.list_type,
                    service_id: Portal.Service.GetServiceId(),
                },
                function(data){
                    self.SetSubCategories(data,self);
                }
            );
        };

        /**
         *
         * Lisää alaluokat listaan
         *
         **/
        this.SetSubCategories = function(categories, self){
            self.$anchor.html("");
            $.each(categories, function(idx, el){
                var $li = $(`
                        <li class='songlist_subcat'>${el}</li>
                    `);
                $li.click(function(){
                        self.ListSongs($(this));}
                    );
                self.$anchor.append($li);
            });
        }

        /**
         *
         * Listaa kaikki tämän kategorian / kirjaimen laulut, jotka
         * on jo haettu tietokannasta
         *
         * @param songs laulujen nimet taulukkona
         * @param $launcher tapahtuman laukaissut listaelementti
         * @param self viittaus olioon itseensä
         *
         **/
        this.SetSongs = function(songs, $launcher, self){
            var self = this;
            $ul = $("<ul></ul>").appendTo($launcher);
            $.each(songs, function(idx, el){
                $ul.append(self.GetVersionLink(el));
            });
        };


        /**
         *
         * Luo yksittäisen laulun / version listaelementin liitettäväksi listaan
         *
         * @param title laulun nimi
         *
         */
        this.GetVersionLink = function(title){
            var self = this,
                $li= $(`
                        <li class='songlist_song_container'>
                            <span class='song_title'>${title}</span>
                            <input class='song_id' type='hidden'></input>
                            <ul class='lyrics'></ul>
                        </li>
                    `);
            $li.find(".song_title").click(self.ShowVersionInfo.bind(self));
            return $li;
        }


        /**
         *
         * Näyttää tarkemmat tiedot ja toiminnot yksittäisestä laulun versiosta
         * 
         * @param e klikkaustapahtuma
         *
         */
        this.ShowVersionInfo = function(e){
            var self = this,
                li_elements = [
                $("<li><a href='javascript:void(0);'>Käytä tässä messussa</a></li>")
                    .click(self.PrepareSongForInsertion.bind(this)),
                $("<li><a href='javascript:void(0);'>Tutki / muokkaa</a></li>")
                    .click(self.ExamineSong.bind(this))],
                $ul = $("<ul class=lyrics_actions></ul>");
            if (not_service_specific){
                //Poistetaan "Käytä messussa" -kohta, jos ei messuspesifi
                li_elements = li_elements.slice(1);
            }
            //Estetään subheading-elementin sulkeutuminen takaisin
            e.stopPropagation();
            $(e.target).parent().find(".lyrics_actions").remove();
            $.each(li_elements, function(){
                $ul.append($(this));
            });
            $(e.target).parent().find(".song_title")
                .after($ul);
            this.ShowSongVersions($(e.target).parent());
                    
        };
        

        /**
         *
         * Näyttää samannimisen laulun kaikki versiot
         *
         * @param $li laulun sisältävä listaelementti
         *
         */
        this.ShowSongVersions = function($li){
            var self = this,
                title = $li.find(".song_title").text();
            $.getJSON("php/ajax/Loader.php",{
                    action:  "check_song_title",
                    service_id: Portal.Service.GetServiceId(),
                    title: title
                    },
                function(ids){
                    if(ids.length == 1){
                        SetLyrics(ids[0], $li.find(".lyrics"), true);
                        $li.find(".song_title").addClass("songlist_entry");
                        $li.find(".song_id").val(ids[0]);
                    }
                    else{
                        //Monta versiota
                        $actionli = $li.find(".lyrics_actions").clone(true);
                        $li.find(".lyrics_actions").remove();
                        $ul = $("<ul></ul>").appendTo($li);
                        $.each(ids, function(idx, this_id){
                            var $this_li = self.GetVersionLink("Versio "  + (idx +1));
                            $this_li.find(".song_title").addClass("songlist_entry");
                            $this_li.find(".song_id").val(this_id);
                            $ul.append($this_li);
                            $.when(SetLyrics(this_id, $this_li.find(".lyrics"), true)).done(
                                function(){
                                    $actionli.clone(true).insertAfter($this_li.find(".song_title"));
                                }
                            );
                        });
                    }
                });
        };


        /**
         *
         * Erottaa listasta valitun laulun, niin että se voidaan
         * liittää osaksi messua.
         *
         * @param ev tapahtuma
         *
         **/
        this.PrepareSongForInsertion = function(ev){
            ev.stopPropagation();
            this.GetCurrentSong(ev);
            waiting_for_attachment =  this.current_song.title;
            $("#songlist").hide();
            $(".blurcover").remove();
            $("#prepared_for_insertion").find("h4").text(this.current_song.title);
            $("#prepared_for_insertion").find(".song_id").val(this.current_song.id);
            $("#prepared_for_insertion").show();
        };

        /**
         *
         * Avaa erillisen tilan listasta valitun yksittäisen laulun tutkimista
         * ja esimerkiksi sanojen muokkaamista varten
         *
         * @param ev tapahtuma
         *
         **/
        this.ExamineSong = function(ev){
            ev.stopPropagation();
            this.GetCurrentSong(ev);
            var slot = new Portal.SongSlots.SongSlot(this.current_song.title,
                    0,
                    undefined,
                    this.current_song.id);
            slot.SetNotServiceSpecific();
            slot.CheckDetails();
        };

        /**
         *
         * Hakee tiedon siitä, mitä laulua nyt tutkitaan
         *
         * @param ev tapahtuma
         *
         */
        this.GetCurrentSong = function(ev){
            var $launcher = $(ev.target),
                parent_lis = $launcher.parents(".songlist_song_container"),
                song_id = $(parent_lis[0]).find(".song_id").val(),
                song_title = $(parent_lis[parent_lis.length-1]).find(".song_title:eq(0)").text();

            this.current_song =  {
                id : song_id,
                title: song_title
            };

            return this;
        
        }

    }

    /**
     *
     * Aakkosittain järjestetty lista
     *
     **/
    var AlphabeticalSonglist = function(){
        this.list_type = "alpha";
        Songlist.call(this);

        /**
         *
         * Hakee kaikki käyttäjän klikkaamaan kategoriaan
         * kuuluvat laulut ja listaa ne
         *
         * @param $launcher klikkauksen laukaissut linkki
         *
         **/
        this.ListSongs = function($launcher){
            if(!$launcher.find("ul").length){
                //Vain, jos kyseessä kategorialinkki, eikä laulun nimi
                var self = this;
                $.getJSON("php/ajax/Loader.php",
                    {
                        action: "get_songs_in_list_alpha",
                        service_id: Portal.Service.GetServiceId(),
                        letter: $launcher.text().charAt(0),
                    },
                    function(data){
                        self.SetSongs(data, $launcher, self);
                    }
                );
            }
            else if($launcher.hasClass("songlist_subcat")){
                $launcher.find("ul").slideToggle();
            }
        };
    }

    /**
     *
     * Lataa kaikki selattavat kategoriat (eri listat)
     *
     */
    function LoadSongLists(){
        alphalist = alphalist || new AlphabeticalSonglist();
        alphalist.GetAndSetSubCategories();
    }

    /**
     *
     * Valmistaa laululistoihin ja sanoihin liittyvät toiminnot
     *
     * @pararm make_not_service_specific Jos kyseessä ei ole messukohtainen laululista, aseta tämä todeksi
     *
     */
    function Initialize(make_not_service_specific){
        if (make_not_service_specific){
            not_service_specific = true;
        }
        LoadSongLists();
        $("#save_lyrics").click(function(){
            var id = $("#songdetails .lyrics_id").val(),
                newtext = $("#songdetails .edited_lyrics").val();
            $("#songdetails .below_lyrics").hide();
            SaveEditedLyrics(id, newtext, $("#songdetails .lyrics"), "#songdetails .lyrics_id");
        });
        $("#prepared_for_insertion .cancel_link").click(function(){
            $("#prepared_for_insertion").hide();
            $(".covermenu-target_songlist").click();
        })
    }

    /**
     *
     * Hae liittämistä odottavan laulun nimi
     *
     **/
    function GetWaitingForAttachment(){
        return waiting_for_attachment;
    }

    /**
     *
     * Hakee laulun sanat tietokannasta
     *
     * @param id laulun id tietokannassa
     * @param $target_el jquery-elementti, johon sanat lisätään
     * @param $checkbox jätetäänkö  säkeistöjen viereiset valintalaatikot tulostamatta
     *
     */
        function SetLyrics(id, $target_el, no_checkbox){
        var split_pattern = /\n{2,}/,
            checkbox = (no_checkbox ? 
                "" : "<div><input type='checkbox' checked='yes'></input></div>");
        $target_el.html("");
        return $.getJSON("php/ajax/Loader.php",{
            action: "fetch_lyrics",
            song_id: id,
        }, function(verses){
            $.each(verses, function(idx, verse){
                var text = verse.verse.replace(/\n/g,"<br>\n");
                if (text){
                    $target_el.append(
                        `<li>
                            ${checkbox}
                            <div>${text}</div>
                        </li>`
                    );
                }
            });
            if(edited_lyrics_callback)
                edited_lyrics_callback();
        });
    
    };

    /**
     *
     * Hakee tiedot laulun tägeistä, säveltäjästä ja sanoittajasta
     *
     *
     */
    function SetSongMeta(){

        var current_slot = Portal.SongSlots.GetCurrentSlot(),
            params = {
                "action": "get_song_meta",
                "song_id": current_slot.picked_id,
            },
            tags = "";

        //Tyhjennä ensin metadata
        $("#songdetails input").val();
        $("#songdetails .data_as_text").text("");

        return $.getJSON("php/ajax/Loader.php",params,(meta) => {
            console.log(meta.tags);
            tags = meta.tags.join(", ");
            current_slot.tags = tags;
            $("#songdetails").find(".lyricsby .data_as_text").text(meta.lyrics);
            $("#songdetails").find(".composer .data_as_text").text(meta.composer);
            $("#songdetails").find(".songtags .data_as_text").text(tags);
            $("#songdetails").find(".lyricsby .data_as_input input").val(meta.lyrics);
            $("#songdetails").find(".composer .data_as_input input").val(meta.composer);
            $("#songdetails").find(".songtags .data_as_input input").val(tags);
        });

    }


    /**
     *
     * Talentaa muokatut sanat tai uuden version.
     *
     * @param id muokattavan laulun id tai nimi, jos uusi
     * @param newtext uudet sanat
     * @param $target_el jquery-elementti, johon sanat lisätään
     * @param idselector css-selektori, jolla määritetään, mihin tallennetaan tieto id:stä
     *
     */
    function SaveEditedLyrics(id, newtext, $target_el, idselector){
        var split_pattern = /\n{2,}/,
            verses = newtext.trim().split(split_pattern);
        $.get("php/ajax/Saver.php",{
            action: "save_edited_lyrics",
            song_id: id,
            newtext: verses
        }, function(saved_id){
            if (idselector){
                //Jos halutaan muuttaa jonkin elementin arvoa
                //uuden id:n mukaiseksi
                $(idselector).val(saved_id*1);
            }
            SetLyrics(saved_id*1, $target_el)
            Portal.SongSlots.GetCurrentSlot().CheckLyrics();
            LoadSongLists();
            $("#songdetails .song_authors").show();
        });
    
    }

    /**
     *
     * Asettaa funktion, joka ajetaan sen jälkeen, kun sanat ladattu
     *
     */
    function SetEditedLyricsCallback(callback){
        edited_lyrics_callback = callback;
    }


    AlphabeticalSonglist.prototype = Object.create(Songlist.prototype);


    return {

        Initialize,
        GetWaitingForAttachment,
        SetLyrics,
        SetSongMeta,
        SetEditedLyricsCallback,

    };

}();

/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/

Portal = Portal || {};

Portal.Service = function(){

    //Kukin välilehti tallennetaan tähän
    TabObjects = {};

    //Ota messun id simppelisti url:sta
    service_id = window.location.href.replace(/.*service_id=(\d+).*/,"$1")*1;

    /**
     *
     * Factory-pattern eri välilehtiä edustavien olioiden luomiseksi
     *
     **/
    function TabFactory(){
        this.tabdata = [];
    }

    /**
     *
     * Lisää tallenna-painikkeet kunkin täbin alareunaan
     *
     **/
    TabFactory.prototype.AddSaveButton = function(){
        var self = this;
        var $but = $("<button class='save_tab_data'>Tallenna</button>")
            .click(this.SaveTabData.bind(this))
            .hide();
            this.$div.append($but);
    };

    /**
     *
     * Tallentaa välilehdessä tehdyt muutokset 
     *
     **/
    TabFactory.prototype.SaveTabData = function(){
        var self = this,
            protoself = (this.AfterSavedChanges ? this : this.__proto__);
        this.tabdata = this.GetTabData();
        $.post("php/ajax/Saver.php",{
            action: self.action,
            service_id: Portal.Service.GetServiceId(),
            data: self.tabdata
            }, protoself.AfterSavedChanges.bind(protoself));
    };

    /**
     *
     * Tarkastelee muutoksia ja ilmoittaa käyttäjälle, jos tallentamattomia
     * muutoksia havaitaan
     *
     **/
    TabFactory.prototype.MonitorChanges = function(){
        var $tabheader = $(`.${this.tab_type}_tabheader`);
        console.log(this.tabdata);
        if(JSON.stringify(this.tabdata) !== JSON.stringify(this.GetTabData())){
            //Jos muutoksia, näytä tallenna-painike ja muutosindikaattorit
            this.$div.find(".save_tab_data").show();
            $tabheader.text($tabheader.text().replace(" *","") + " *");
        }
        else{
            //Ei muutoksia, piilota tallenna-painike ja muutosindikaattorit
            $tabheader.text($tabheader.text().replace(" *",""));
            this.$div.find(".save_tab_data").hide();
        }
    };

    /**
     *
     * Lisää tallenna-painikkeet kunkin täbin alareunaan
     *
     * @param response ajax-vastaus
     *
     **/
    TabFactory.prototype.AfterSavedChanges = function(response){
        console.log("вот здесь: ");
        console.log(response);
        this.MonitorChanges();
        var msg = new Utilities.Message("Muutokset tallennettu", this.$div);
        msg.Show(2000);
    };


    /**
     *
     * Tuottaa yhden välilehtiolion haluttua tyyppiä
     *
     * @param $tab jquery-esitys yhdestä välilehti-divistä
     *
     **/
    TabFactory.make = function($div){
        var constr = $div.attr("id");
        var tab;
        TabFactory[constr].prototype = new TabFactory();
        tab = new TabFactory[constr]();
        tab.tab_type = constr;
        tab.$div = $div;
        TabObjects[constr] = tab;
        return tab;
    };



    /**
     *
     * Palauttaa tämänhetkisen messun id:n
     *
     */
    function GetServiceId(){
        return service_id;
    }


    /**
     *
     * Palauttaa aktiivisen välilehden määritellystä tyypistä
     *
     * @param tabtype välilehden tyyppi
     *
     */
    function GetCurrentTab(tabtype){
        return TabObjects[tabtype];
    }

    /**
     *
     * asettaa tämänhetkisen messun id:n
     *
     * @param id uusi id
     *
     **/
    function SetServiceId(id){
        service_id = id;
    }

    /**
     *
     * Alusta messunäkymän sisältö, tapahtumat ym.
     *
     **/
    function Initialize(){
        console.log("Initializing the service view...");
        $("#tabs > div").each(function(){
            TabFactory.make($(this));
        })
        TabObjects.Details.GetTheme(TabObjects.Details.SetTheme);
        TabObjects.Details.GetOfferingTargets(TabObjects.Details.SetOfferingTarget);
        TabObjects.Details.GetBibleSegments(TabObjects.Details.SetBibleSegments);
        TabObjects.People.GetResponsibles(TabObjects.People.SetResponsibles);
        TabObjects.Structure.GetStructure(TabObjects.Structure.SetStructure);
        for(this_tab in TabObjects){
            TabObjects[this_tab].AddSaveButton();
        }

        Comments.LoadComments();
        Comments.CreateThemeSelect();
        Portal.SongSlots.LoadSongsToSlots(TabObjects.Songs);
        SongLists.Initialize();
        $("#prepared_for_insertion").hide()
            .draggable({
                revert: true,
                refreshPositions: true,
                cursor: "move",
                opacity:0.89,
                zIndex:100,
                start: function(e){
                     $(e.target).find(".attach_instructions").hide();
                     $(e.target).find("h4").addClass("attaching_title");
                },
                stop: function(e){
                     $(e.target).find(".attach_instructions").show();
                     $(e.target).find("h4").removeClass("attaching_title");
                },
                classes: {
                    "ui-draggable-dragging": "insert_box_dragging"
                },
                handle: ".fa-arrows",
                //snap:".songinput",
            });
        //Luodaana kustakin välilehdestä oma olionsa
    }


    return {
        Initialize,
        GetServiceId,
        TabFactory,
        SetServiceId,
        GetCurrentTab
    };

}();

/**
 *
 * Messun vastuunkantajat. (Vastuunkantajat-välilehti)
 *
 **/
Portal.Service.TabFactory.People = function(){

    this.action = "save_responsibles";

    /**
     *
     * Tulostaa kaikkien messussa mukana olevien vastuunkantajien nimet
     *
     * @param list_of_people ajax-responssina saatu taulukko muodossa [{responsible:x,responsibility:x},{:},...]
     *
     **/
    this.SetResponsibles = function(list_of_people){
        $("#People ul").remove();
        var $ul = $("<ul class='editable_data_list'></ul>");
        $.each(list_of_people, function(idx, person){
            var $li = 
            $ul.append(`<li>
                        <div>${person.responsibility}</div>
                        <div>
                            <input type="text" value="${person.responsible || ''}" </input>
                        </div>
                </li>`);
        });
        //Tarkkaile muutoksia:
        $ul.find("input[type='text']").on("change paste keyup",this.MonitorChanges.bind(this));
        $ul.appendTo("#People .embed-data");
        //Tallennetaan data, jotta voidaan tarkastella sen muutoksia
        this.tabdata = this.GetTabData();
    };


    /**
     *
     * Hakee messun vastuunkantajat
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     *
     **/
    this.GetResponsibles = function(callback){
        $.getJSON("php/ajax/Loader.php",{
            action: "get_responsibles",
            service_id: service_id
            }, callback.bind(this));
    };

    /**
     *
     * Kerää kaiken välilehden sisältämän datan joko tallentamista
     * varten tai jotta voitaisiin nähdä, onko tehty muutoksia.
     *
     **/
    this.GetTabData = function(){
        var data = [];
        this.$div.find(".editable_data_list li").each(function(){
            data.push({
                responsibility: $(this).find("div:eq(0)").text(),
                responsible: $(this).find("input[type='text']").val()
            });
        });
        return data;
    }




};

/**
 * Messun tiedot -välilehti. Yksittäisen messun aihe, raamatunkohdat
 * ja muu yleisen tason (ei ihmisiä koskeva )info, tämän muokkaus ym.
 *
 **/
Portal.Service.TabFactory.Details = function(){

    this.action = "save_details";
    this.bible_segments = [];


    /**
     *
     * Hakee messun teeman
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     *
     **/
    this.GetTheme = function(callback){
        $("#service_theme").on("change paste keyup",this.MonitorChanges.bind(this));
        $.get("php/ajax/Loader.php",{
            action: "get_service_theme",
            service_id: service_id
            }, callback.bind(this));
    };

    /**
     *
     * Vaihtaa messun teeman 
     *
     * @param theme uusi teema, joka messulle asetetaan
     *
     **/
    this.SetTheme = function(theme){
        $("#service_theme").val(theme);
        this.tabdata = this.GetTabData();
        $("#service_theme").on("change paste keyup",this.MonitorChanges.bind(this));
        //Tarkkaile muutoksia:
        
    };


    /**
     *
     * Hakee messuun liittyvät raamatunkohdat
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     *
     **/
    this.GetBibleSegments = function(callback){
        console.log("getting bible segments...");
        $.getJSON("php/ajax/Loader.php",{
            action: "get_service_verses",
            service_id: service_id
            }, callback.bind(this));
    };


    /**
     *
     * Hakee käikki tämän kontin sisältämät laulut
     *
     **/
    this.FetchSlots = function(){
        console.log("fetching.." + this.name);
        $.getJSON("php/ajax/Loader.php",{
            action: "load_slots_to_container",
            service_id: Portal.Service.GetServiceId(),
            cont_name: this.name
        }, this.SetSlots.bind(this));
    }

    /**
     *
     * Tallentaa messuun liittyvien raamatunkohtien sisällön
     *
     * @param segments messuun liittyvät raamatunkohdat
     *
     **/
    this.SetBibleSegments = function(segments){
        var $segment_list = $("#biblesegments_in_service").html(""),
            self = this;
        $.each(segments,function(idx, segment){
            var $li = $("<li class=''></li>").appendTo($segment_list);
            var picker = BibleModule.AttachAddressPicker($li, segment.slot_name);
            picker.SetCallBack(self.MonitorChanges.bind(self));
            picker.Initialize();
            self.bible_segments.push(picker);
        });
        this.SetBibleSegmentContent();
    };


    /**
     *
     * Hakee saatavilla olevat kolehtikohteet  ja luo select-elementin niistä
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     **/
    this.GetOfferingTargets = function(callback){
        var path = Utilities.GetAjaxPath("Loader.php"),
            $sel = $("<select><option>Ei valittu</option></select>");
        $("#offering_amount").on("change paste keyup",this.MonitorChanges.bind(this));
        $.getJSON(path,
            {action: "mlist_Offerings" },
            (offering_targets) => {
                $.each(offering_targets, (idx,target)=>{
                    $(`<optgroup label='${target.target.name}'></optgroup>`)
                        .append(target.goals.map(
                            //(g) => `<option value='${g.id}'>${target.target.name}: ${g.name}</option>`)
                            (g) => `<option value='${g.id}'>${g.name}</option>`)
                        )
                        .appendTo($sel);
                }); 

                $sel
                    .appendTo("#offering_target_select")
                    .selectmenu()
                    .on("selectmenuchange",this.MonitorChanges.bind(this));
                callback();
            });
    };


    /**
     *
     * Asettaa nykyisen kolehtikohteen
     *
     *
     **/
    this.SetOfferingTarget = function(){
        //Oletus?
        var path = Utilities.GetAjaxPath("Loader.php");
        $.getJSON(path,
        {
            "action": "get_current_offering_goal",
            "service_id": Portal.Service.GetServiceId()
        },
            (goal) => {
                console.log(goal);
                $("#offering_target_select select").val(goal.target_id);
                $("#offering_target_select select").selectmenu("refresh");
                $("#offering_amount").val(goal.amount);
            }
        );
    };


    /**
     *
     * Hakee tietokannasta sen, mitä sisältöä raamatunkohtaslotteihin on määritelty
     *
     */
    this.SetBibleSegmentContent = function(){
        var self = this;
        $.getJSON("php/ajax/Loader.php",{
            action: "get_bible_segments_content",
            service_id: Portal.Service.GetServiceId(),
        }, function(data){
                $.each(self.bible_segments, function(idx, seg){
                    if(! data[seg.title]){
                        //Jos ei tallennettua dataa
                        return 0;
                    }
                    for(i=1;i<data[seg.title].length;i++){
                        seg.AddPickerPair();
                    }
                    $.each(seg.picker_pairs, function(pair_idx, picker_pair){
                        $.when(picker_pair.startpicker.SetAddress(
                            {
                            book: data[seg.title][pair_idx].startbook,
                            chapter: data[seg.title][pair_idx].startchapter,
                            verse: data[seg.title][pair_idx].startverse
                            },
                            data[seg.title][pair_idx].testament),
                            ).done(
                                function(){
                                    $.when(
                                    picker_pair.endpicker.SetAddress(
                                        {
                                        book: data[seg.title][pair_idx].endbook,
                                        chapter: data[seg.title][pair_idx].endchapter,
                                        verse: data[seg.title][pair_idx].endverse
                                        },
                                        data[seg.title][pair_idx].testament
                                        )).done(function(){
                                            picker_pair.Confirm();
                                            self.tabdata = self.GetTabData();
                                        });
                                }
                            )
                        });
                    });
            });
        

    };


    /**
     *
     * Kerää kaiken välilehden sisältämän datan joko tallentamista
     * varten tai jotta voitaisiin nähdä, onko tehty muutoksia.
     *
     **/
    this.GetTabData = function(){
        var data = [
                {
                    type: "theme",
                    value: $("#service_theme").val()
                },
                {
                    type: "offerings",
                    goal_id: $("#offering_target_select select").val(),
                    amount: $("#offering_amount").val(),
                    service_id: Portal.Service.GetServiceId(),
                },
            ];
        $.each(this.bible_segments, function(idx, seg){
            $.each(seg.picker_pairs, function(pair_idx, picker_pair){
                var start = picker_pair.startpicker.GetAddress(),
                    end = picker_pair.endpicker.GetAddress();
                data.push({
                    type: "bible",
                    segment_name: seg.title,
                    service_id: Portal.Service.GetServiceId(),
                    testament: picker_pair.startpicker.testament,
                    startbook: start.book,
                    startchapter: start.chapter,
                    startverse: start.verse,
                    endbook: end.book,
                    endchapter: end.chapter,
                    endverse: end.verse,
                });
            });
        });
        return data;
    };



};



/**
 *
 * Messun rakenteen säätely
 *
 **/
Portal.Service.TabFactory.Structure = function(){

    /**
     *
     * Syöttää tietokannasta haetun rakennedatan html:ään
     *
     **/
    this.SetStructure = function(html){
        $("#service_specific_structure").html(html);
        GeneralStructure.SetServiceid(Portal.Service.GetServiceId());
        GeneralStructure.Initialize(".structural-element-add");
    };


    /**
     *
     * Hakee messu-spesifin rakenteen (laulut, osiot, yms) tietokannasta
     *
     * @param callaback ajax-vastauksen käsittelevä funktio
     *
     **/
    this.GetStructure = function(callback){
        $.get("php/ajax/Loader.php",{
            action : "load_slots",
            service_id: Portal.Service.GetServiceId()
        }, callback.bind(this));
    };

    /**
     *
     *
     **/
    this.SaveTabData = function(){
        console.log("structure");
    };

    /**
     *
     * Kerää kaiken välilehden sisältämän datan joko tallentamista
     * varten tai jotta voitaisiin nähdä, onko tehty muutoksia.
     *
     **/
    this.GetTabData = function(){
        //var data = [];
        //this.$div.find(".editable_data_list li").each(function(){
        //    data.push({
        //        responsibility: $(this).find("div:eq(0)").text(),
        //        responsible: $(this).find("input[type='text']").val()
        //    });
        //});
        //return data;
    }


};

/**
 *
 * Messun infodiat
 *
 **/
Portal.Service.TabFactory.Infoslides = function(){
    /**
     *
     *
     **/
    this.SaveTabData = function(){
    };
};

/**
 *
 * Lauluvälilehti ja sen toiminnallisuus (huom, lauluslotit ja laululistat omia luokkiaan)
 *
 **/
Portal.Service.TabFactory.Songs = function(){

    this.action = "save_songs";


    /**
     *
     *
     **/
    this.SaveTabData = function(){
        var TODO_MAKE_POSSIBLE = undefined;
        if (this.CheckLyricsOk() || TODO_MAKE_POSSIBLE){
            console.log("SAVING");
            console.log(this.action);
            this.__proto__.SaveTabData.bind(this)();
        }
        else{
            console.log("Not saving.");
        }
    };

    /**
     *
     * Tarkistaa, ovatko kaikkien messuun määriteltyjen laulujen sanat
     * tietokannassa. TODO: mahdollisuus siirtyä sanoihin klikkaamalla linkkiä.
     *
     *
     */
    this.CheckLyricsOk = function(){
        var msg = new Utilities.Message("",$("#songslots")),
            nolyr = [];
        $(".songslot").each(function(){
            var title = $(this).find(".songinput").val();
            if($(this).hasClass("no_lyrics") && nolyr.indexOf(title) == -1){
                msg.Add(title);
                nolyr.push(title);
            }
        });
        if(nolyr.length){
            //Jos joistakin lauluista puuttuu sanoja, varoita tästä
            //MUTTA anna mahdollisuus jättää sanat merkitsemättä
            msg.SetTitle("Portaalista puuttuvat seuraavien laulujen sanat:")
               .SetFooter(`Lisää sanat klikkaamalla laulun nimen vieressä
                   olevaa kynäkuvaketta. Jos lauluun ei kuulu sanoja,
                   klikkaa kynäkuvaketta ja ruksaa avautuvan ruudun "ei sanoja" -laatikko. 
                   `);
            msg.AddCloseButton().AddOkButton().Show(999999);

            return false;
        }
    
        return true;
    
    };

    /**
     *
     * Kerää kaiken välilehden sisältämän datan joko tallentamista
     * varten tai jotta voitaisiin nähdä, onko tehty muutoksia.
     *
     **/
    this.GetTabData = function(){
        var data = [];
        this.$div.find(".slotcontainer").each(function(idx, cont){
            $.each($(cont).find(".songslot"), function(slot_no,slot){
                data.push({
                    song_title: $(slot).find(".songinput").val() || '',
                    song_id: $(slot).find(".song_id").val() || null,
                    songtype: $(cont).find(".cont_name").text(),
                    tag: $(cont).find(".restriction_val").val(),
                });
            });
        });
        return data;
    };

};

Portal = Portal || {};

/**
 *
 * 
 * Hallittavien kokonaisuuksien (messujen / vastuiden jne) lisäämisestä,
 * poistamisesta ym. vastaavat listaelementit
 *
 *
 */
Portal.ManageableLists = function(){

    var current_list = undefined;


    /**
     *
     * Palauttaa aktiivisen listan
     *
     **/
    function GetCurrentList(){
        return current_list;
    }


    /**
     *
     * Factory-pattern eri muokattavia listoja edustavien olioiden luomiseksi
     *
     **/
    function ListFactory(){

    }



    /**
     *
     * Lataa listan datan tietokannasta
     *
     */
    ListFactory.prototype.LoadList = function(d){
        console.log(d);
        current_list = this;
        $("#list_editor").hide();
        var path = Utilities.GetAjaxPath("Loader.php");
        var promise = $.getJSON(path, {
            "action" : "mlist_" + this.list_type,
            "startdate" : Portal.Servicelist.GetCurrentSeason().startdate,
            "enddate" : Portal.Servicelist.GetCurrentSeason().enddate,
        }, this.PrintList.bind(this));
    }


    /**
     *
     * Tulostaa muokattavan listan
     *
     * @param data tulostettava data
     *
     */
    ListFactory.prototype.PrintList = function(data){
       $("#managelist .manageable_list").html("");
       $("#managelist .list_header").text(this.list_header);
       $("#managelist .description").hide();
       $("#managelist ." + this.list_type + "_description").show();
       var $ul = $("<ul></ul>").appendTo("#managelist .manageable_list"),
           self = this,
           $li = $(`<li>
                   <span></span><i class='fa fa-pencil'></i><i class='fa fa-trash'></i>
                   </li>`),
           $plus = $("<li class='adder_li'> <i class='fa fa-plus'></i></li>")
            .click(this.AddEntry.bind(this));
       $li.find(".fa-pencil").click(this.StartEdit.bind(this));
       $li.find(".fa-trash").click(this.RemoveEntry.bind(this));
       $.each(data, function(idx, row){
           $ul.append(self.AddListRow(row, $li.clone(true)));
       });
       $ul.append($plus);
    };



    /**
     *
     * Tallentaa yhden lista-alkion muutokset.
     *
     */
    ListFactory.prototype.SaveEdit = function(){
        var path = Utilities.GetAjaxPath("Saver.php");
        $.when($.post(path,{
            "action": "save_edited_" + this.list_type,
            "params": this.GetEditParams()
        }, this.LoadList.bind(this))).done(() => Portal.Servicelist.Initialize(true));
    };

    /**
     *
     * Tallentaa uudet lista-alkiot
     *
     */
    ListFactory.prototype.SaveAdded = function(){
        var path = Utilities.GetAjaxPath("Saver.php");
        $.when($.post(path,{
            "action": "save_added_" + this.list_type,
            "params": this.GetAddedParams()
        }, this.LoadList.bind(this))).done(() => Portal.Servicelist.Initialize(true));
    };


    /**
     *
     * Lisää muokkausikkunan tallennuspainikkeen
     *
     * @param callback mikä tallennusfunktio suoritetaan
     *
     */
    ListFactory.prototype.AddSaveButton = function(callback){
        $("<div class='below_box'><button>Tallenna</button></div>")
            .click(callback.bind(this))
            .appendTo($("#list_editor"));
    }

    /**
     *
     * Päivittää muokkausikkunan muokkaamista tai uuden lisäämistä varten
     *
     * @param e tapahtuma, joka käynnisti
     *
     */
    ListFactory.prototype.OpenBox = function(){
        $("#list_editor .edit_container").html("");
        $("#list_editor button").remove();
        $("#list_editor").fadeIn();
        Portal.Menus.AddCloseButton($("#list_editor"));
    };

    /**
     *
     * Käynnistää yhden alkion muokkauksen
     *
     * @param e tapahtuma, joka käynnisti
     *
     */
    ListFactory.prototype.StartEdit = function(e){
        this.$current_li = $(e.target).parent();
        this.OpenBox();
        $("<button>Tallenna</button>")
            .click(this.SaveEdit.bind(this))
            .appendTo("#list_editor");
        this.EditEntry();
    };

    /**
     *
     * Poistaa yhden listan alkion
     *
     * @param e tapahtuma
     *
     */
    ListFactory.prototype.RemoveEntry = function(e){
        var path = Utilities.GetAjaxPath("Saver.php");
            $li = $(e.target).parent();
        $.when($.post(path,
            this.GetRemoveParams($li),
            this.LoadList.bind(this))).done(() => Portal.Servicelist.Initialize(true));
    };


    /**
     *
     * Tuottaa yhden listaolion haluttua tyyppiä
     *
     * @param $li listaelementti, jonka pohjalta luodaan
     *
     */
    ListFactory.make = function($li){
        var list,
            list_type = $li.find(".list_type").val(),
            list_header = $li.find(".list_header").val();
        ListFactory[list_type].prototype = new ListFactory();
        list = new ListFactory[list_type]();
        list.list_type = list_type;
        list.list_header = list_header;
        GeneralStructure.Images.Attach(this);
        GeneralStructure.Headers.Attach(this);
        return list;
    };






    return {

        ListFactory,
        GetCurrentList

    }


}();

/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/

var Portal = Portal || {};


Portal.Servicelist = function(){

    var current_season = {},
        all_seasons = {},
        list_of_services = undefined,
        manageable_lists = {},
        current_data_list;


    /**
     *
     * Lataa listan vastuista ja muista suodatettavista yksityiskohdista
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     **/
    function LoadListOfRoles(){
        var path = Utilities.GetAjaxPath("Loader.php"),
            $list = $(".menu-parent:visible .show-options").html(""),
            $header_li = $("<li>yleisnäkymä</li>")
                .click(list_of_services.LoadServicesClean.bind(list_of_services))
                .appendTo($list),
            cl = 'class="launch-action"',
            promise = $.getJSON(path, 
                {
                    action: "get_list_of_responsibilities"
                }, 
                (resps) =>  $list.append(resps.map((resp) => `<li ${cl}>${resp}</li>`))
            );

        $.when(promise).done(() => {
            $list.find(".launch-action").click(function(){
                list_of_services.SetFilteredBy($(this).text());
                list_of_services.FilterServices.bind(list_of_services)();
                }
            );
            // Korvaa mobiilissa listan otsikko
            $list.find("li").click(function(){
                if($(".fa-bars").is(":visible")){
                    $(this).parents(".menu-parent")
                        .find(".menu-header")
                        .text($(this).text());
                }
            });
        });
    };


    /**
     *
     * Lista kaikista yhden tietyn kauden messuista
     *
     */
    var List = function(){
    
        this.is_editable = false;
        this.filterby = "";


        /**
         *
         * Merkitsee, että lista on suodatettu jonkin vastuun tms. mukaan
         *
         * @param filterby minkä mukaan on suodatettu
         *
         */
        this.SetFilteredBy = function(filterby){
            this.filteredby = filterby;
            return this;
        }

        /**
         *
         * Lataa messulistan ja varmistaa, että ladataan alkuperäinen, vain messut sisältävä lista
         *
         **/
        this.LoadServicesClean = function(){
            this.is_editable = false;
            $(".covermenu").hide();
            this.LoadServices();
        };

        /**
         *
         * Lataa messulistan
         *
         * @param callback Mahdollisesti suoritettava callback-funktio
         *
         **/
        this.LoadServices = function(callback){
            var path = Utilities.GetAjaxPath("Loader.php");
                callback = callback || this.Output.bind(this),
                self = this;
            return $.getJSON(path,{
                action: "get_list_of_services",
                startdate: current_season.startdate,
                enddate: current_season.enddate,
                }, (data) => {
                    current_data_list = data;
                    callback(data);
                });
        };

        /**
         *
         * Lataa messulistan vain jonkin vastuun osalta
         *
         **/
        this.FilterServices = function(){
            this.is_editable = true;
            var path = Utilities.GetAjaxPath("Loader.php");
            $(".covermenu").hide();
            $.when($.getJSON(path,{
                action: "get_filtered_list_of_services",
                "startdate" : current_season.startdate,
                "enddate" : current_season.enddate,
                filteredby: this.filteredby
                }, this.Output.bind(this))).done(()=>{
                    $(".byline h2").text(this.filteredby);
                } );
        };


        /**
         *
         * Tulostaa listan ja liittää sen osaksi html-DOMia
         *
         * @param data listaan syötettävät tiedot
         *
         **/
        this.Output = function(data){
            var prevmonth = 0,
                self = this;
            $("#servicelist").html("");
            $(".covermenu:not(#managelist)").hide();
            if(!data.length){
                $("#servicelist").append(`
                    <p class='info-p'>
                    Ei messuja tällä messukaudella. Lisää messuja tai valitse
                    toinen kausi Hallitse-valikosta.
                    </p>
                    `
                    );
            }
            $.each(data,function(idx, service){
                thismonth = service.servicedate.replace(/\d+\.(\d+)\.\d+/g,"$1") * 1 ;
                if (thismonth != prevmonth){
                    prevmonth = thismonth;
                    $("#servicelist").append(`<li>${MonthName(thismonth)}</li>`);
                }
                var $li = $(`<li class='service_link_li' id="service_id_${service.id}">
                    <span>${service.servicedate}</span>
                    </li>`);
                if(!self.is_editable && service.theme){
                    //Ei muokattava, vaan messulinkit sisältävä lista
                    $li.append(`<span>${service.theme}</span>`)
                }
                else{
                    //Muokattava vastuukohtainen lista
                    $li.append(`<span>
                        <input type='text' class='responsible' value='${service.responsible || ''}'></input>
                        <input type='hidden' class='service_id' value='${service.service_id}'></input>
                        </span>`);
                }
                ;
                $("#servicelist").append($li);
            });

            if(!self.is_editable){
                //Lisää siirtyminen messukohtaiseen näkymään:
                $(".service_link_li").click(function(){
                    var id = $(this).attr("id").replace(/.*id_(\d+)/,"$1");
                    window.location = window.location.href = "service.php?service_id=" + id;
                });
                $("#savebutton").hide();
                $(".byline h2").text("Messut / " + current_season.name);
            }
            else{
                $("#savebutton").show();
            }
        };

        /**
         *
         * Tallentaa vastuisiin tehdyt muutokset
         *
         */
        this.Save = function(){
            var self = this,
                data = [],
                path = Utilities.GetAjaxPath("Saver.php");

            $("#servicelist").find(".service_link_li").each(
                function(){
                    data.push({
                        "service_id": $(this).find(".service_id").val(),
                        "responsibility": self.filteredby,
                        "responsible": $(this).find(".responsible").val()
                    });
                }
                );
            $.post(path,{
                "action":"bulksave_responsibilities",
                "params": data
            }, (debugdata) => {
                var msg = new Utilities.Message("Tiedot tallennettu", $("#savebutton_container"));
                msg.Show(2800);
                console.log(debugdata);
            });
        };
    }


    /**
     *
     * Hakee nykyhetkeä lähimmän messukauden
     *
     * @param no_current_date jätetäänkö nykyinen kausi määrittämättä päivämäärän mukaan
     *
     */
    function SetSeasonByCurrentDate(no_current_date){
        if (no_current_date){
            return 0;
        }
        var path = Utilities.GetAjaxPath("Loader.php");
        return $.getJSON(path, {
            "action": "get_current_season",
            "date": $.datepicker.formatDate('yy-mm-dd', new Date())
        }, (season) => current_season = season);
    }


    /**
     *
     * Lataa valikkopalkin select-elementtiin kaudet ja valitsee nykyistä
     * päivää lähinnä olevan.
     *
     *
     */
    function LoadSeasonSelect(){
        var path = Utilities.GetAjaxPath("Loader.php");
        all_seasons = {};
        return $.getJSON(path, {action: "list_seasons_unformatted" }, function(data){
            //Indeksöidään kaikki kaudet all_seasons-muuttujaan, jottei
            //tarvitse tehdä erillistä ajax-kutsua kautta vaihdettaessa
            $.each(data, function(idx, row){
                all_seasons[row.id] = row;
            });
            //Varmistetaan päivittyminen muutosten jälkeen:
            current_season = all_seasons[current_season.id];
            $("#season-select")
                .html("")
                .append(data.map((season) => 
                    `<option value=${season.id}>${season.name}</option>`).join("\n"))
                .val(current_season.id)
                .selectmenu("refresh")
                .on("selectmenuchange", function() {
                    current_season = all_seasons[$(this).val()];
                    list_of_services.LoadServices();
                    if($("#managelist").is(":visible")){
                        //Päivitä myös mahdollisesti auki oleva hallintavalikko
                        //co
                        Portal.ManageableLists.GetCurrentList().LoadList();
                    }
                    Portal.Menus.GetSideMenu().Close();
                });
        });
    }


    /**
     *
     * Alusta messunäkymän sisältö, tapahtumat ym.
     *
     * @param no_current_date jätetäänkö nykyinen kausi määrittämättä päivämäärän mukaan
     *
     **/
    function Initialize(no_current_date){
        var list_type = '';
        console.log("Initializing the list of services...");
        $.when(SetSeasonByCurrentDate(no_current_date)).done(() => {
            $.when(LoadSeasonSelect().done( () => {
                    $.when(list_of_services.LoadServices()).done(() =>  {
                        LoadListOfRoles()
                    });
                }));
        });
        //Alusta myös laululista käyttöä varten
        SongLists.Initialize(true);
        $("#savebutton").click(list_of_services.Save.bind(list_of_services));
        $("#structure_launcher").click(() => window.location="service_structure.php");
        //Vastuukohtainen suodattaminen
        $(".covermenu-target_managelist").each(function(){
            var list = Portal.ManageableLists.ListFactory.make($(this));
            $(this).click(list.LoadList.bind(list));
        });
    }

    /**
     *
     * Muuttaa kuukauden numeron nimeksi
     *
     * @param month_no kuukauden numero
     *
     **/
    function MonthName(month_no){
        var months = ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", 
                      "Toukokuu","Kesäkuu","Heinäkuu","Elokuu","Syyskuu",
                      "Lokakuu","Marraskuu","Joulukuu"];
        return months[month_no - 1];
    }

    /**
     *
     * Palauttaa nykyisen messukauden
     *
     **/
    function GetCurrentSeason(){
        return current_season;
    }


    /**
     *
     * Palauttaa nyt aktiivisena olevan listan taulukkona
     *
     **/
    function GetActiveListAsData(){
        return current_data_list;
    }

    //Alustetaan eri osiot
    list_of_services = new List();

    return {
        Initialize,
        List,
        GetCurrentSeason,
        GetActiveListAsData,
        SetSeasonByCurrentDate
    };

}()

Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista vastuiden hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Responsibilities = function(){

    this.edithtml = `
                    <div class='label_parent'>
                        <div>Vastuun nimi</div>
                        <div>
                            <input class='new_responsibility' type='text' value=''></input>
                        </div>
                    </div>
                    <div class='label_parent'>
                        <div>Vastuun kuvaus</div>
                        <div>
                        <textarea placeholder='Lyhyt selitys siitä, mitä tähän vastuuseen kuuluu'
                            class='description'></textarea>
                        </div>
                    </div>`;

    /**
     *
     * Lisää yhden datarivin tietokannasta
     *
     * @param raw_data tarvittavat tiedot tietokannasta
     * @param $li muokattava ja palautettava listaelementti
     *
     */
    this.AddListRow = function(raw_data, $li){
        $li.find("span").text(raw_data);
        return $li;
    }

    /**
     *
     * Hakee tarvittavat tallennettavat parametrit
     *
     */
    this.GetEditParams = function(){
        var data = {
            old_responsibility: this.old_responsibility,
            new_responsibility: $("#list_editor .new_responsibility").val(),
            description: $("#list_editor .description").val()
        };
        this.new_responsibility = data.new_responsibility;

        return data;
    }

    /**
     *
     * Hakee tarvittavat lisättävän vastuun parametrit
     *
     */
    this.GetAddedParams = function(){
        return  {
            responsibility: $("#list_editor .new_responsibility").val(),
            description: $("#list_editor .description").val()
        };
    }


    /**
     *
     * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
     * TODO kaikille tyypeille yhteinen lähtötilanne?
     *
     */
    this.EditEntry = function(){
        var path = Utilities.GetAjaxPath("Loader.php"),
            responsibility = this.$current_li.find("span").text();
        //Tallenna vastuun entinen nimi ennen muokkausta
        this.old_responsibility = responsibility;

        $.getJSON(path, {
            "action": "get_responsibility_meta",
            "responsibility": responsibility
            },
            (data) => {
                var $html = $(this.edithtml);
                $html.find(".new_responsibility").val(responsibility);
                $html.find(".description").val(data.description);
                $html.appendTo("#list_editor .edit_container");
            }
        );
    };


    /**
     *
     * Hakee alkion poistoa varten tarvittavat listatyyppikohtaiset parametrit
     *
     * @param $li se listan alkio, jota ollaan poistamassa.
     *
     */
    this.GetRemoveParams = function($li){
        return {
            "responsibility" : $li.find("span").text(),
            "action" : "remove_responsibility"
        };
    }

    /**
     *
     * Lisää uuden alkion listaan.
     *
     */
    this.AddEntry = function(){
        this.OpenBox();
        $(this.edithtml).appendTo("#list_editor .edit_container");
        this.AddSaveButton(this.SaveAdded);
    };

};



Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messukausien hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Seasons = function(){

        var comment_placeholder =  `Tähän voi kirjoittaa ajatuksia siitä,
        mitä messukauden teemalla tarkoitetaan tai esimerkiksi  lyhyen toimintakertomuksen
        messukaudesta`.replace(/\s+/g,' ');

        this.edithtml = (`
                    <section>
                        <div class='label_parent'>
                            <div>Alkupäivämäärä</div>
                            <input name='start_date' class='datepicker_input'></input>
                        </div>
                        <div class='label_parent'>
                            <div>Loppupäivämäärä</div>
                            <input name='end_date' class='datepicker_input'></input>
                        </div>
                        <div class='label_parent'>
                            <div>Messukauden nimi</div>
                            <div>
                                <input name='season_name' type='text' value=''></input>
                            </div>
                        </div>
                        <div class='label_parent'>
                            <div>Messukauden teema</div>
                            <div>
                                <input name='season_theme' type='text' value=''></input>
                            </div>
                        </div>
                        <div class='label_parent'>
                            <div>Kommentteja kaudesta / kauden teemasta</div>
                            <div>
                            <textarea placeholder='${comment_placeholder}' name='season_comments'></textarea>
                            </div>
                        </div>
                    </section>
                `);

        /**
         *
         * @param raw_data tarvittavat tiedot tietokannasta
         * @param $li muokattava ja palautettava listaelementti
         *
         */
        this.AddListRow = function(raw_data, $li){
            $li.find("span").html(`
                <strong>${raw_data.name}</strong>
                ${raw_data.startdate.replace(/20(\d{2})/,"-$1")} - 
                ${raw_data.enddate.replace(/20(\d{2})/,"-$1")}
                <input type='hidden' class='season_name' value='${raw_data.name}'></input>
                <input type='hidden' class='start_date' value='${raw_data.startdate}'></input>
                <input type='hidden' class='end_date' value='${raw_data.enddate}'></input>
                <input type='hidden' class='season_theme' value='${raw_data.theme}'></input>
                <input type='hidden' class='season_id' value='${raw_data.id}'></input>
                <input type='hidden' class='season_comments' value='${raw_data.comments}'></input>
                `);
            return $li;
        }


        /**
         *
         * Tulostaa muokkauslaatikon tai uuden lisäämislaatikon
         *
         * @param htmlstring mikä sisältö laatikolle annetaan
         *
         */
        this.PrintEditOrAdderBox = function($html){
            $("#list_editor .edit_container").html("");
            $html.appendTo("#list_editor .edit_container");
            $(".datepicker_input").datepicker();
        }

        /**
         *
         * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.EditEntry = function(){
            var $html = $(this.edithtml),
                start_date = $.datepicker.parseDate("dd.mm.yy",
                        this.$current_li.find(".start_date").val()),
                end_date = $.datepicker.parseDate("dd.mm.yy",
                        this.$current_li.find(".end_date").val()),
                vals = {
                    comments: this.$current_li.find(".season_comments").val(),
                    theme: this.$current_li.find(".season_theme").val(),
                    name: this.$current_li.find(".season_name").val()
                }
            this.PrintEditOrAdderBox($html);
            $.each(vals, function(name, val){
                val = (!val || val == 'null' ? '' : val);
                $html.find("[name='season_" + name + "']").val(val);
            });
            $html.find("[name='start_date']").datepicker("setDate", start_date);
            $html.find("[name='end_date']").datepicker("setDate", end_date);
        };

        /**
         *
         * Hakee alkion muokkauksessa muuttuneet  parametrit
         *
         * @param noid tosi, jos ei määritetä id:tä --> uusien syöttö
         *
         */
        this.GetEditParams = function(noid){

            var dates = {
                startdate: $("[name='start_date']").datepicker("getDate"),
                enddate : $("[name='end_date']").datepicker("getDate")
                },
                params = {
                    newvals : {
                        "theme" : $("#list_editor").find("[name='season_theme']").val(),
                        "comments" : $("#list_editor").find("[name='season_comments']").val(),
                        "name" : $("#list_editor").find("[name='season_name']").val()
                    },
                    "season_id":  (!noid ? this.$current_li.find(".season_id").val() : null)
                };
            $.each(dates, function(name, val){
                params.newvals[name] = $.datepicker.formatDate('yy-mm-dd', val);
            });

            return params;
        }

        /**
         *
         * Tallentaa listätyn messun
         *
         */
        this.GetAddedParams = function(){
            return this.GetEditParams(true);
        };


        /**
         *
         * Lisää uuden alkion listaan.
         *
         *
         */
        this.AddEntry = function(){
            var $html = $(this.edithtml);
            this.OpenBox();
            this.PrintEditOrAdderBox($html);
            $("<div class='below_box'><button>Tallenna</button></div>")
                .click(this.SaveAdded.bind(this))
                .appendTo($("#list_editor"));
        };

        /**
         *
         * Hakee alkion poistoa varten tarvittavat listatyyppikohtaiset parametrit
         *
         * @param $li se listan alkio, jota ollaan poistamassa.
         *
         */
        this.GetRemoveParams = function($li){
            return {
                "season_id" : $li.find(".season_id").val(),
                "action" : "remove_season"
            };
        }
    
};


Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messukausien hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Events = function(){


        /**
         *
         * @param raw_data tarvittavat tiedot tietokannasta
         * @param $li muokattava ja palautettava listaelementti
         *
         */
        this.AddListRow = function(raw_data, $li){
            var text = `${raw_data.name} ${raw_data.startdate} - ${raw_data.enddate}`;
            $li.find("span").text(text);
            return $li;
        }


        /**
         *
         * Lisää uuden alkion listaan.
         *
         *
         */
        this.AddEntry = function(){
        
        
        };

        /**
         *
         * Poistaa yhden listan alkion
         *
         */
        this.RemoveEntry = function(){
            console.log("REmoving");
        };
    
};


Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messujen hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Services = function(){

        this.addhtml = (`
                    <section>
                        <h4 class='closed'>Lisää yksittäinen messu</h4>
                        <div class='hidden '>
                            <div class='label-parent'>
                                <div>Messun pvm</div>
                                <input name='single_date' class='datepicker_input'></input>
                            </div>
                        </div>
                        <h4 class='closed'>Lisää useita messuja</h4>
                        <div class='hidden basic-flex'>
                            <div class='label-parent'>
                                <div>Ensimmäinen messu</div>
                                <input name='start_date' class='datepicker_input'></input>
                            </div>
                            <div class='label-parent'>
                                <div>Viimeinen messu</div>
                                <input name='end_date' class='datepicker_input'></input>
                            </div>
                        </div>
                    </section>
                `);

        this.edithtml = (`
                    <section>
                            <div class='label-parent'>
                                <div>Messun päivämäärä</div>
                                <input name='service_date' class='datepicker_input'></input>
                            </div>
                            <div class='label-parent'>
                                <div>Messun aihe</div>
                                <input name='service_theme' class=''></input>
                            </div>
                    </section>
                `);

        /**
         *
         * @param raw_data tarvittavat tiedot tietokannasta
         * @param $li muokattava ja palautettava listaelementti
         *
         */
        this.AddListRow = function(raw_data, $li){
            $li.find("span").html(`<strong>${raw_data.servicedate}</strong>:  ${raw_data.theme}`);
            $li.append(
                (`<input type='hidden' class='id_container' value='${raw_data.id}'></input>
                   <input type='hidden' class='theme_container' value='${raw_data.theme}'></input>
                    `)
            );
            return $li;
        }

        /**
         *
         * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.EditEntry = function(){
            var $html = $(this.edithtml),
                sdate = $.datepicker.parseDate("dd.mm.yy",
                        this.$current_li.find("strong").text());
            this.PrintEditOrAdderBox($html);
            $html.find("[name='service_date']").datepicker("setDate", sdate);
            $html.find("[name='service_theme']").val(this.$current_li.find(".theme_container").val());
        };


        /**
         *
         * Tulostaa muokkauslaatikon tai uuden lisäämislaatikon
         *
         * @param htmlstring mikä sisältö laatikolle annetaan
         *
         */
        this.PrintEditOrAdderBox = function($html){
            $("#list_editor .edit_container").html("");
            $html.appendTo("#list_editor .edit_container");
            $html.find("h4").click(Portal.Menus.InitializeFoldMenu);
            $html.find(".hidden").hide();
            $(".datepicker_input").datepicker();
        }


        /**
         *
         * Tallentaa lisätyn messun
         *
         */
        this.GetAddedParams = function(){
            var start_date = $("[name='start_date']").datepicker("getDate"),
                end_date = $("[name='end_date']").datepicker("getDate"),
                single_date = $("[name='single_date']").datepicker("getDate"),
                newdates = [];
            if(start_date && end_date){
                newdates = Utilities.getDaysBetweenDates(start_date, end_date, start_date.getUTCDay());
            }
            else if (single_date){
                newdates = [$.datepicker.formatDate('yy-mm-dd', single_date)];
            }
            return {
                dates: newdates,
            };
        };


        /**
         *
         * Lisää uuden alkion listaan.
         *
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.AddEntry = function(){
            this.OpenBox();
            this.PrintEditOrAdderBox($(this.addhtml));
            this.AddSaveButton(this.SaveAdded);
        };


        /**
         *
         * Hakee alkion poistoa varten tarvittavat listatyyppikohtaiset parametrit
         *
         * @param $li se listan alkio, jota ollaan poistamassa.
         *
         */
        this.GetRemoveParams = function($li){
            var params =  {
                "action" : "remove_service",
                "service_id" : $li.find(".id_container").val()
            };
            return params;
        }


        /**
         *
         * Hakee alkion muokkauksessa muuttuneet  parametrit
         *
         *
         */
        this.GetEditParams = function(){
            var newdate = $("[name='service_date']").datepicker("getDate");
            newdate = $.datepicker.formatDate('yy-mm-dd', newdate);
            var params =  {
                "newvals" : {
                    "theme" : $("#list_editor").find("[name='service_theme']").val(),
                    "servicedate" : newdate
                },
                "service_id" : this.$current_li.find(".id_container").val(),
            };
            console.log(params)

            return params;
        }


};


Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messukausien hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Offerings = function(){

    this.current_target_id = undefined;
    this.goal_param_names = [
                "goal_name",
                "goal_description",
                "goal_amount",
                "goal_id"
            ];

    this.edithtml = `
                    <article>
                        <section>
                            <div class='label_parent'>
                                <div>Kolehtikohteen nimi</div>
                                <div>
                                    <input class='target_name' type='text' value=''></input>
                                </div>
                            </div>
                            <div class='label_parent'>
                                <div>kohteen kuvaus</div>
                                <div>
                                <textarea placeholder='esim. "Lastenkoti X maassa Y on perustettu vuonna... Se on..."' class='target_description'></textarea>
                                </div>
                            </div>
                        </section>
                        <h4 class='closed'>Lisää ensimmäinen tavoite kohteeseen</h4>
                    </article>
                    `;

    this.newgoal_html = `
                    <section class='hidden newgoal_settings'>
                        <div class='label_parent'>
                                <div>Tavoitteen nimi</div>
                                <div>
                                    <input class='goal_name' type='text' value=''></input>
                                </div>
                        </div>
                        <div class='label_parent'>
                                <div>Määrä (<span class='amount_num'>0</span> €)</div>
                                <div class='goal_amount'></div>
                        </div>
                        <div class='label_parent'>
                                <div>Tavoitteen kuvaus</div>
                                <div>
                                    <textarea class='goal_description' placeholder='esimerkiksi "vuoden ruoka ja vaatteet kymmenelle lastenkodin lapselle"'></textarea>
                                </div>
                        </div> 
                    </section>`;


    /**
     *
     * Avaa kolehtitavoitteen muokkaimen joko muokkausta tai uuden lisäämistä varten
     *
     * @param ev tapahtuma
     *
     */
    this.OpenGoalEditor = function(ev){
        if(ev){
            var $li = $(ev.target).parent();
            this.current_li = {};
            $.each(this.goal_param_names, (idx, el) => {
                this.current_li[el] = $li.find("." + el).val()
            });
            this.current_li.target_id = $li.parents("li").find(".target_id").val();
        };
        this.OpenBox();
        $(this.newgoal_html)
            .removeClass("hidden")
            .appendTo("#list_editor .edit_container");
        this.AddAmountSlider();
    };

    /**
     *
     * Lisää uuden kolehtitavoitteen nykyisen kohteen alle
     *
     * @param ev tapahtuma
     *
     */
    this.AddGoal = function(ev){
        this.OpenGoalEditor(ev);
        this.AddSaveButton(this.SaveAddedGoal.bind(this));
    }

    /**
     *
     * Tallentaa muokatun kolehtitavoitteen
     *
     */
    this.SaveEditedGoal = function(ev){
        var path = Utilities.GetAjaxPath("Saver.php"),
            params ={
                "action" : "edit_offering_goal",
                "goal_id" : this.current_li.goal_id,
                "goal_params": this.GetGoalParams()
            };
        console.log(params);
        $.post(path, params, this.LoadList.bind(this));
    };


    /**
     *
     * Tallentaa lisätyn kolehtitavoitteen
     *
     */
    this.SaveAddedGoal = function(ev){
        var path = Utilities.GetAjaxPath("Saver.php"),
            params ={
                "action" : "add_offering_goal",
                "target_id" : this.current_li.target_id,
                "goals": [this.GetGoalParams()]
            };
        console.log(params);
        $.post(path, params, this.LoadList.bind(this));
    };


    /**
     *
     * Muokkaa kolehtitavoitetta
     *
     * @param ev tapahtuma
     *
     */
    this.EditGoal = function(ev){
        this.OpenGoalEditor(ev);
        $.each(this.goal_param_names, (idx, el) => {
            if(el == "goal_amount"){
                $("#list_editor").find("." + el).slider("value", this.current_li[el]);
                $("#list_editor").find(".amount_num").text(this.current_li[el]);
            }
            else{
                $("#list_editor").find("." + el).val(this.current_li[el]);
            }
        });
        this.AddSaveButton(this.SaveEditedGoal.bind(this));
    };

    /**
     *
     * Poistaa kolehtitavoitteen
     *
     * @param ev tapahtuma
     *
     */
    this.RemoveGoal = function(ev){
        var path = Utilities.GetAjaxPath("Saver.php"),
            goal_id = $(ev.target).parent().find(".goal_id").val();
        $.post(path,{
            "action" : "remove_offering_goal",
            "goal_id" : goal_id
        }, this.LoadList.bind(this));
    };


    /**
     *
     * @param raw_data tarvittavat tiedot tietokannasta
     * @param $li muokattava ja palautettava listaelementti
     *
     */
    this.AddListRow = function(raw_data, $li){
        var $ul = $("<ul class='mlist_subclass'></ul>"),
            $plus = $("<li class='adder_li'>Uusi tavoite</li>")
                .click(this.AddGoal.bind(this));
        $li.addClass("offerings_list");
        $li.find("span").html(`<strong>${raw_data.target.name}</strong>`);
        $li.append(`<input class='target_id' type='hidden' value=${raw_data.target.id}></input>`);
        $.each(raw_data.goals, (idx, goal) => {
            var $subli = $(`<li> ${goal.name}
                        <input type='hidden' class='goal_description' value='${goal.description}'></input>
                        <input type='hidden' class='goal_amount' value='${goal.amount}'></input>
                        <input type='hidden' class='goal_name' value='${goal.name}'></input>
                        <input type='hidden' class='goal_id' value='${goal.id}'></input>
                        </li>`);
            $("<i class='fa fa-pencil'></i>")
                .click(this.EditGoal.bind(this))
                .appendTo($subli);
            $("<i class='fa fa-trash'></i>")
                .click(this.RemoveGoal.bind(this))
                .appendTo($subli);
            $subli.appendTo($ul);
        });
        $ul.append($plus).appendTo($li);
        //$li.append(
        //    (`<input type='hidden' class='id_container' value='${raw_data.id}'></input>
        //       <input type='hidden' class='description_container' value='${raw_data.description}'></input>
        //        `)
        //);
        return $li;
    };


    /**
     *
     * Tulostaa muokkauslaatikon tai uuden lisäämislaatikon
     *
     */
    this.PrintEditOrAdderBox = function(){
        this.OpenBox();
        $(this.edithtml)
            .append(this.newgoal_html)
            .appendTo("#list_editor .edit_container");
    };

    /**
     *
     * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
     * TODO kaikille tyypeille yhteinen lähtötilanne?
     *
     */
    this.EditEntry = function(){
        var path = Utilities.GetAjaxPath("Loader.php");
        this.PrintEditOrAdderBox();
        //$.getJSON(path, {
        //    "action" : "get_"
        //});
    };

    /**
     *
     * Hakee alkion muokkauksessa muuttuneet  parametrit
     *
     */
    this.GetEditParams = function(){
    };


    /**
     *
     * Palauttaa lisättävän tai muokattavan tavoitteen parametrit
     *
     */
    this.GetGoalParams = function(){
    
        return {
            name: $("#list_editor .goal_name").val(),
            description: $("#list_editor .goal_description").val(),
            amount: $("#list_editor .amount_num").text()*1,
        };
    }

    /**
     *
     * Tallentaa lisätyn kolehtikohteen sekä mahdollisen tavoitteen
     *
     */
    this.GetAddedParams = function(){
        var goals = [];

        if($("#list_editor .goal_name").val()){
            goals = [ this.GetGoalParams() ];
        }

        return {
            target_name: $("#list_editor .target_name").val(),
            target_description: $("#list_editor .target_description").val(),
            goals: goals,
        }
    };


    /**
     *
     * Lisää jquery-ui:n liukusäätimen kolehtimäärään
     *
     */
    this.AddAmountSlider = function(){
        $(".goal_amount").slider(
            {
                min: 0,
                max: 20000,
                step: 100,
                slide: (ev, ui) => $("#list_editor .amount_num").text(ui.value)
            }
        );
    };

    /**
     *
     * Lisää uuden alkion listaan.
     *
     *
     */
    this.AddEntry = function(){
        this.PrintEditOrAdderBox();
        this.AddAmountSlider();
        $("#list_editor .edit_container h4").click(Portal.Menus.InitializeFoldMenu);
        this.AddSaveButton(this.SaveAdded);
    };

    /**
     *
     * Hakee alkion poistoa varten tarvittavat listatyyppikohtaiset parametrit
     *
     * @param $li se listan alkio, jota ollaan poistamassa.
     *
     */
    this.GetRemoveParams = function($li){
        var params =  {
            "action" : "remove_offering_target",
            "target_id" : $li.find(".target_id").val()
        };
        return params;
    }
    
};


Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messujen hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Infos = function(){

        this.addhtml = (`
                    <section>
                            <div class='label-parent some-margin'>
                                <div>Dian otsikko</div>
                                <input class='header'></input>
                            </div>
                            <div class='label-parent some-margin'>
                                <div>Dian teksti</div>
                                <textarea class='maintext' placeholder='esim. lauleskellaan yhdessä'></textarea>
                            </div>
                            <h4 class='closed'>Kuva?</h4>
                            <div class='label-parent some-margin hidden slide-img'>
                                <div>Kuvatiedosto</div>
                                <div class='with-preview'>
                                    <div class='img-select-parent'></div>
                                    <div class="preview"></div>
                                </div>
                                <div class="basic-flex">
                                    <div>Kuvan sijainti</div>
                                    <div>
                                        <select class="img-pos-select imgposition">
                                            <option value="left">Tekstin vasemmalla puolella</option>
                                            <option value="right">Tekstin oikealla puolella</option>
                                            <option value="top">Tekstin yläpuolella</option>
                                            <option value="bottom">Tekstin alapuolella</option>
                                            <option value="wholescreen">Koko ruutu</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <h4 class='closed'>Messut, joissa infoa näytetään</h4>
                            <div class='label-parent some-margin hidden selected_services'>
                            </div>
                            <h4 class='closed'>Lisäasetukset</h4>
                            <div class='hidden header_settings'>
                            </div>
                    </section>
                `);


        /**
         *
         * @param raw_data tarvittavat tiedot tietokannasta
         * @param $li muokattava ja palautettava listaelementti
         *
         */
        this.AddListRow = function(raw_data, $li){
            var keys = ["id", "header_id", "header", "imgname", "imgposition", "maintext"];
            $li.find("span").html(`${raw_data.header}`);
            console.log(raw_data);
            $.each(keys, (idx, key) => {
                $li.append(`<input type='hidden' class='${key}-container' 
                    value='${raw_data[key]}'></input>`)
            }
            );
            $li.append(`<input type='hidden' class='services-container' 
                value='${raw_data.services.join(";")}'></input>`);
            return $li;
        }

        /**
         *
         * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.EditEntry = function(){
            var selector = "#list_editor .edit_container",
                keys = ["header", "imgposition", "maintext"],
                oldval = undefined,
                service_ids = this.$current_li.find(".services-container").val().split(";");
            //Header_id-attribuutin asettaminen valitsee automaattisesti oikean ylätunnisteen listasta
            this.header_id = this.$current_li.find(".header_id-container").val();
            this.PrintEditOrAdderBox(this.addhtml);
            //Kuvan lataus vasta kun tietokannasta haku valmis
            $.when(this.imageloader_added).done(() => {
                oldval = this.$current_li.find(".imgname-container").val();
                $(".slide-img .img-select").val(oldval);
            });
            //Messujen valinta kun tietokannasta haku valmis
            $.when(this.servicelist_added).done(() => {
                $.each(service_ids, (idx, service_id) => {
                    $(`.service_for_info[value='${service_id}']`).get(0).checked = true;
                });
            });
            //Muut arvot: otsikko, kuvan paikka, teksti
            $.each(keys, (idx, key) => {
                oldval = this.$current_li.find("." + key + "-container").val();
                $(selector + " ."  + key).val(oldval);
            });
        };


        /**
         *
         * Tulostaa muokkauslaatikon tai uuden lisäämislaatikon
         *
         * @param htmlstring mikä sisältö laatikolle annetaan
         *
         */
        this.PrintEditOrAdderBox = function(htmlstring){
            var list = new Portal.Servicelist.List();
            $("#list_editor .edit_container").html("");
            $(htmlstring).appendTo("#list_editor .edit_container");
            this.$lightbox = $("#list_editor");
            this.imageloader_added =  this.AddImageLoader();
            $("#list_editor .edit_container h4").click(Portal.Menus.InitializeFoldMenu);
            //$(".datepicker_input").datepicker();
            $("#list_editor .header_settings")
                .append($("#headertemplate_container > *").clone(true));
            $("#list_editor .header_settings *").show();
            this.servicelist_added = list.LoadServices(this.PrintSelectableServiceList.bind(this));
        }


        /**
         *
         * Lisää lisäysikkunaan listan messuista ja mahdollisuuden valita, missä 
         *
         * @param services lista messuista
         *
         */
        this.PrintSelectableServiceList = function(services){
            var $ul = $("<ul></ul>");
            $ul.append(
                services.map((s)=> {
                    return `<li>
                        <input type='checkbox' class='service_for_info' value='${s.id}'></input>
                        ${s.servicedate}
                    </li>`;
                })
            );
            $("#list_editor .selected_services").html("").append($ul);
        }


        /**
         *
         * Hakee diaa koskevat tiedot muokkaus- / lisäysikkunasta
         *
         */
        this.GetSlideParams = function(){
            var selector = "#list_editor .edit_container ",
                $checked = $(selector  + ".service_for_info:checked"),
                service_ids = [];
            this.cancel_save = false;
            $.each($checked, (idx, el) => service_ids.push($(el).val()));
            return {
                segment: {
                    header: $(selector + ".header").val(),
                    //id: this.slide_id,
                    maintext: $(selector + ".maintext").val(),
                    imgname: $(selector + ".img-select").val() || "" ,
                    imgposition: $(selector + ".img-pos-select").val(),
                },
                header_id: $(selector + "[name='header_select']").val(),
                service_ids:  service_ids
            };
        };

        /**
         *
         * Tallentaa lisätyn messun
         *
         */
        this.GetAddedParams = function(){
            return this.GetSlideParams();
        };


        /**
         *
         * Lisää uuden alkion listaan.
         *
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.AddEntry = function(){
            this.OpenBox();
            this.PrintEditOrAdderBox(this.addhtml);
            this.AddSaveButton(this.CheckAndSave);
        };


        /**
         *
         * Tarkistaa, että kaikki tarpeellinen on valittu ja käynnistää tallennusprosessin
         *
         *
         */
        this.CheckAndSave = function(){
            var params = this.GetSlideParams();
            if(!params.service_ids.length){
                alert("Valitsi ainakin yksi messu, jossa infoa näytetään!");
            }
            else{
                this.SaveAdded();
            }
        };


        /**
         *
         * Hakee alkion poistoa varten tarvittavat listatyyppikohtaiset parametrit
         *
         * @param $li se listan alkio, jota ollaan poistamassa.
         *
         */
        this.GetRemoveParams = function($li){
            var params =  {
                "action" : "remove_info",
                "content_id" : $li.find(".id-container").val()
            };
            return params;
        }


        /**
         *
         * Hakee alkion muokkauksessa muuttuneet  parametrit
         *
         *
         */
        this.GetEditParams = function(){
            var params =  this.GetSlideParams();
            params.content_id = this.$current_li.find(".id-container").val();
            return params;
        }


};


/**
 *
 * Moduuli, jolla hallitaan messujen rakennetta: lauluja, raamatunkohtia, 
 * messukohtaisia tai yleisempiä infodioja jne.
 *
 **/
var GeneralStructure = function(){

    var adder;
    var slot_types = [ "infoslide", "songslide", "bibleslide"];
    var sortable_slot_list = undefined;
    var service_id = 0;


    /**
     *
     * Tekee rakenteesta messukohtaisen asettamalla messun id:n parametriksi
     *
     * @param id messun id
     *
     **/
    function SetServiceid(id){
        service_id = id;
    }


    /**
     *
     * Lataa informaation messun rakenneosista
     *
     * @param data ajax-responssina tullut informaatio sloteista
     *
     **/
    function ReloadSlots(data){
        console.log(data);
        $(".structural-slots").load("php/ajax/Loader.php",
            {
                "action":"load_slots",
                "service_id": service_id
            }, InitializeSlotFunctionality);
    }

    /**
     *
     * Poista jokin messun rakenneosa kokonaan
     *
     **/
    function RemoveSlot(){
        var path = Utilities.GetAjaxPath("Saver.php");
        $.post(path, {
            "action":"remove_slot",
            "id":$(this).parents(".slot").find(".slot_id").val(),
            "service_id": service_id
            }, 
            ReloadSlots
        );
    }

    /**
     *
     * Tallentaa muutokset slottien järjestykseen
     *
     * @param $ul listan jquery-representaatio
     *
     **/
    function SaveSlotOrder($ul){
        var newids = [];
        $.each($ul.find("li:not(.between-slots)"),function(idx,el){
            var slot_id = $(this).find(".slot_id").val();
            console.log({"slot_id":slot_id,"newnumber":idx+1});
            newids.push({"slot_id":slot_id,"newnumber":idx+1});
        });
        console.log(service_id);
        $.post("php/ajax/Saver.php",{
            "action":"update_slot_order",
            "newids":newids,
            "service_id": service_id
            },
            ReloadSlots);
    }


    /**
     *
     * Alustaa uusia slotteja lisäävän jquery-ui-menun toiminnallisuuden
     *
     * @param selector minne menu liitetään
     *
     */
    function InitializeNewslotMenu(selector){
        $(selector).html("");
         var $header = $("<h4 class='closed'>Syötä uusi messuelementti</h4>")
            .click(Portal.Menus.InitializeFoldMenu);
         var $menu = $(`
          <div class="hidden">
              <ul>
                  <li id="songslide_launcher">Laulu</li>
                  <li id="bibleslide_launcher">Raamatunkohta</li>
                  <li id="infoslide_launcher">Muu</li>
              </ul>
          </div>`);
        $header.appendTo(selector);
        $menu.appendTo(selector);
        $menu.find("li").click(function(){
                var slot_type = $(this).attr("id").replace(/([^_]+)_launcher/,"$1");
                if(slot_types.indexOf(slot_type)>-1){
                    GeneralStructure.SlotFactory.SlotFactory.make(slot_type, service_id)
                        .LoadParams(true)
                        .ShowWindow();
                }
        });

    }

    /**
     *
     * Lisää toiminnallisuuden messuslotteihin
     *
     **/
    function InitializeSlotFunctionality(){
        $(".remove-link").click(RemoveSlot);
        $(".edit-link").click(function(){
            //Jos käyttäjä haluaa muokata slottia, pyydä olio slottitehtaalta:
            var $container = $(this).parents(".slot");
            var slot_type = $container.find(".slot_type").val();
            //hack:
            if(slot_type.match("segment")){
                slot_type = slot_type.replace("segment","slide");
            }
            GeneralStructure.SlotFactory.SlotFactory
                .make(slot_type, service_id, $container)
                .LoadParams()
                .ShowWindow();
        });

        sortable_slot_list =  sortable_slot_list || 
            new GeneralStructure.DragAndDrop.SortableList(
            $(".structural-slots:eq(0)"),
            {
                draggables: ".slot",
                drop_callback: SaveSlotOrder,
                number: ".slot-number",
                id_class: ".slot_id",
                idkey: "slot_id",
                handle: ".drag_handle",
                numberclass: ".slot-number"
            }
            );
        sortable_slot_list.Initialize();
    }

    /**
     *
     * Alusta kaikki messun rakenneosiin liittyvät tapahtumat
     *
     * @param menuselector minne slottien lisäysmenu liitetään
     *
     **/
    function Initialize(menuselector){
        InitializeNewslotMenu(menuselector);
        InitializeSlotFunctionality();
    }


    return {
         Initialize,
         ReloadSlots,
         SaveSlotOrder,
         SetServiceid,
    }
    



}();




GeneralStructure.SlotFactory = GeneralStructure.SlotFactory || {};

/**
 *
 * Laulusisällön lisäävä olio.
 *
 */
GeneralStructure.SlotFactory.songslide = function(){
    this.slideclass = ".songslide";
    this.segment_type = "songsegment";


    /**
     *
     * Lisää ajax-ladatun datan slottiin
     *
     * @param data dian tiedot ajax-responssina 
     *
     **/
    this.FillInData = function(data){
        var self = this;
        this.$lightbox.find("[value='multisong']").get(0).checked=false;
        if(data.is_multi*1){
            this.$lightbox.find("[value='multisong']").get(0).checked=true;
        }
        this.$lightbox.find(".songdescription").val(data.songdescription);
        this.$lightbox.find("#restrict_to_tags select")
            .val(data.restrictedto)
            .selectmenu("refresh");

        //Lisää toiminnallisuus valintalaatikkoihin
        this.$lightbox.find("[type='checkbox']").click(function(){ 
            $(this).parents(".checkbox-parent").next().toggle();
        });

    };


    /**
     *
     * Kerää diaan liittyvän informaation tallentamista tai esikatselua
     * varten
     *
     **/
    this.SetSlideParams = function(){
        this.slide_params = {
            songdescription: this.$lightbox.find(".songdescription").val(),
            singlename: this.$lightbox.find(".segment-name").val(),
            is_multi: (this.$lightbox.find("[value='multisong']").get(0).checked ? 1 : 0),
            restrictedto: this.$lightbox.find("#restrict_to_tags select").val()
        }
        return this;
    }

    /**
     * Lisätään select-elementti, jonka avulla laulut voidaan rajata vain
     * tiettyyn tägiin. Käytetään with_text-lisäystä, niin että voidaan lisätä
     * uusia.
     *
     */
    this.AddTagSelect = function(){
        var $sel = $("<select><option value=''>Ei rajoitusta</option></select>"),
            path = Utilities.GetAjaxPath("Loader.php");
        $.getJSON(path, {"action": "get_song_tags"}, 
            (tags) => {
                $sel
                    .append(tags.map((tag)=>`<option>${tag}</option>`))
                    .appendTo("#restrict_to_tags")
                    .selectmenu()
            });
    };


    /**
     *
     * Alustaa toiminnallisuuden
     *
     */
    this.Initialize = function(){
        this.AddTagSelect();
    }

}

GeneralStructure.SlotFactory = GeneralStructure.SlotFactory || {};


/**
 *
 * Yksittäisen diasisällön lisäävä olio.
 *
 */
GeneralStructure.SlotFactory.bibleslide = function(){

    this.slideclass = ".bibleslide";
    this.segment_type = "biblesegment";

    /**
     *
     * Lisää ajax-ladatun datan slottiin
     *
     * @param data dian tiedot ajax-responssina 
     *
     **/
    this.FillInData = function(data){
        var self = this;
    };


    /**
     *
     * Kerää diaan liittyvän informaation tallentamista tai esikatselua
     * varten
     *
     **/
    this.SetSlideParams = function(){
        this.slide_params = {
            segment_name: this.$lightbox.find(".segment-name").val(),
        }
        return this;
    }


}


GeneralStructure.SlotFactory = GeneralStructure.SlotFactory || {};


/**
 *
 * Yksittäisen diasisällön lisäävä olio.
 *
 */
GeneralStructure.SlotFactory.infoslide = function(){
    this.slideclass = ".infoslide";
    this.segment_type = "infosegment";

    /**
     *
     * Lisää ajax-ladatun datan slottiin
     *
     * @param data dian tiedot ajax-responssina 
     *
     **/
    this.FillInData = function(data){
        var self = this;
        self.$lightbox.find(".slide-header").val(data.header);
        self.$lightbox.find(".infoslidetext").val(data.maintext);
        if(data.imgname){ 
            self.$lightbox.find(".slide_img .img-select").val(data.imgname);
            self.$lightbox.find(".slide_img .img-pos-select").val(data.imgposition);
        }
        if(data.genheader){
            //Lisää ruksi, jos määritetty, että on yläotsikko
            self.$lightbox.find("[value='show-upper-header']").get(0).checked=true;
        }
        var used_img = self.$lightbox.find(".slide_img .img-select").val();
        if(used_img!="Ei kuvaa"){
            //Lataa valmiiksi kuvan esikatselu, jos kuva määritelty
            Utilities.Preview(self.$lightbox.find(".slide_img .img-select").parents(".with-preview"), used_img);
        }
    };

    /**
     *
     * Kerää diaan liittyvän informaation tallentamista tai esikatselua
     * varten
     *
     **/
    this.SetSlideParams = function(){
        var maintext = this.$lightbox.find(".slidetext").val();
        this.slide_params = {
                maintext:maintext,
                id: this.slide_id,
                header:this.$lightbox.find(".slide-header").val(),
                genheader: this.$lightbox.find("[type='checkbox']").get(0).checked ? "Majakkamessu" : "",
                subgenheader: this.$lightbox.find("[type='checkbox']").get(0).checked ? "Messun aihe" : "",
                imgname:this.$lightbox.find(".slide_img .img-select").val() || "" ,
                imgposition:this.$lightbox.find(".slide_img .img-pos-select").val()
        }
        return this;
    };
}



var GeneralStructure = GeneralStructure || {};

/**
 *
 * Factory-pattern eri rakennetyyppejä edustavien olioiden luomiseksi
 *
 */
GeneralStructure.SlotFactory = function(){


    /**
     *
     * Factory-pattern eri rakennetyyppejä edustavien olioiden luomiseksi
     *
     */
    function SlotFactory(){
        this.tabdata = [];
    }

    /**
     *
     * Tuottaa yhden rakenneolion haluttua tyyppiä
     *
     * @param slot_type luotavan slotin tyyppi 
     * @param service_id mahdollinen messun id, jos messukohtainen rakenne
     * @param $container mihin liitetään
     *
     **/
    SlotFactory.make = function(slot_type, service_id, $container){
        var constr = slot_type;
        var slot;
        console.log("making : " + service_id);
        SlotFactory[constr].prototype = new SlotFactory();
        slot = new SlotFactory[constr]();
        slot.slot_type = constr;
        slot.$lightbox = $("<div class='my-lightbox structural-element-adder'></div>");
        slot.$preview_window = $(`<div class='preview-window'>
                                  <iframe scrolling='no' frameBorder='0'></iframe>
                                  <button>Sulje esikatselu</button></div>`);
        slot.$container = $container || $(".structural-element-add");
        var $content_id = slot.$container.find(".content_id");
        var $slot_id = slot.$container.find(".slot_id");
        var $header_id = slot.$container.find(".header_id");
        slot.slide_id = ($content_id ? $content_id.val() : 0);
        slot.service_id = service_id;
        slot.id = ($slot_id ? $slot_id.val() : 0);
        slot.header_id = ($header_id ? $header_id.val() : 0);
        slot.previewparams = {segment_type: slot.segment_type};
        slot.previewhtml = "";
        slot.injectables = {"responsibilities":"vastuu tms.", "service_meta": "Yleistietoja messusta"};
        GeneralStructure.DataLoading.Attach(this);
        GeneralStructure.InjectableData.Attach(this);
        GeneralStructure.Headers.Attach(this);
        GeneralStructure.Images.Attach(this);
        GeneralStructure.LightBox.Attach(this);
        GeneralStructure.Preview.Attach(this);
        slot.SetLightBox();
        slot.Initialize();
        return slot;
    };

    SlotFactory.prototype = {

    }

    /**
     *
     * Oletuksena initialize-funktio, vaikkei keikissa tyypeissä käytettäisikään
     *
     */
    SlotFactory.prototype.Initialize = function(){
    };


    SlotFactory.infoslide = GeneralStructure.SlotFactory.infoslide;
    SlotFactory.songslide = GeneralStructure.SlotFactory.songslide;
    SlotFactory.bibleslide = GeneralStructure.SlotFactory.bibleslide;


    return {
    
        SlotFactory,
    
    }


}();


GeneralStructure = GeneralStructure || {};

GeneralStructure.LightBox = function(){

    /**
     *
     * Liittää messurakenteen lightbox-ikkunaan liittyvän toiminnallisuuden
     * lähdeolioon
     *
     * @param source olio, johon liitetään
     *
     **/
    function Attach(source){

        /**
         *  Näytä ikkuna, jossa käyttäjä voi muokata messun rakenteeseen lisättävää diaa
         */
        source.prototype.ShowWindow = function(){
            var self = this
            var $buttons = $("<div class='button-container'>")
            $("<button>Sulje tallentamatta</button>")
                .click(function(){ 
                        self.$lightbox.html("").hide();
                        $(".blurcover").remove();
                })
                .appendTo($buttons);
            $("<button>Tallenna</button>")
                .click(function(){
                    self.SetSlideParams()
                        .SaveParams(function(){
                            self.CloseLightBox();
                            GeneralStructure.ReloadSlots();
                        });
                })
                .appendTo($buttons);
            if(this.slideclass==".infoslide"){
                $("<button>Esikatsele</button>")
                    .click(self.PreviewSlide.bind(self))
                    .appendTo($buttons)
            };
            this.$lightbox.append($buttons);
            this.$container.append(this.$lightbox);
            this.InitializeInjectableData();
        };



        /**
         * Nollaa lisäysvalikon sisältö ja syöttää uuden sisällön
         *
         * @param object $el jquery-olio, joka syötetään  lightbox-ikkunan sisään
         *
         */
        source.prototype.SetLightBox = function($el){
            Utilities.BlurContent();
            //Tuo templatesta varsinainen diansyöttövalikko ja ylätunnisteen syöttövalikko
            this.$lightbox.html("")
                .prepend(
                    $(this.slideclass)
                    .clone(true)
                    .append(
                        $("#headertemplate_container > *").clone(true)
                    ));
            //Lisää syötettävän datan valitsimet
            this.$lightbox.find(".injection_placeholder")
                    .each(function(){
                            $(this).html("")
                            .append($("#injected-data-container")
                            .clone(true));
                    });
            this.$lightbox.css(
                {
                 "width":$(".innercontent").width() - 40 + "px",
                 "top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"
                }
            ).show();
            this.GetSlideClasses();
        };



        /**
         *  Sulkee lisäysvalikkoikkunan 
         */
        source.prototype.CloseLightBox = function(){
            this.$lightbox.html("").hide();
            $(".blurcover").remove();
        };


    }


    return {
        Attach,
    };

}();

GeneralStructure = GeneralStructure || {};
GeneralStructure.SlotFactory = GeneralStructure.SlotFactory || {};

GeneralStructure.Headers = function(){


    /**
     *
     * Liittää ylätunnisteisiin liittyvän toiminnallisuuden lähdeolioon
     *
     * @param source olio, johon liitetään
     *
     **/
    function Attach(source){
    
        /**
         *
         * Päivitä tietokantaan ylätunnisteeseen tehdyt muutokset, kuten
         * kuvan vaihtaminen tai kuvan sijainnin muuttaminen
         *
         */
        source.prototype.UpdatePickedHeader = function(){
            var self = this,
                $header = this.$lightbox.find(".headertemplates"),
                is_aside = this.$lightbox.find("input[name='header_type']").get(0).checked ? 1 : 0,
                header_id = $header.find("select[name='header_select']").val(),
                params = {
                    is_aside: is_aside,
                    imgposition: $header.find(".img-pos-select").val(),
                    imgname: $header.find(".img-select").val(),
                    maintext: $header.find("textarea").val(),
                },
                temp_params = {
                    is_aside: is_aside,
                    imgpos: $header.find(".img-pos-select").val(),
                    imgname: $header.find(".img-select").val(),
                    maintext: $header.find("textarea").val(),
                    header_id: header_id
                },
                path = Utilities.GetAjaxPath("Saver.php");
            //temp_params.header_id = header_id;
            //Päivitetään muuttuneet arvot myös nykyiseen headers-attribuuttiin
            self.headerdata[header_id] = temp_params;
            $.post(path,
                {
                    params: params,
                    header_id: header_id,
                    action: "update_headertemplate"
                },
                function(data){
                    $("body").prepend(data);
                });
        };


        /**
         * Tulostaa käyttäjän määrittämät ylätunnisteet.
         * Tallentaa myös muistiin ylätunnisteiden sisällön.
         * Huomaa, että tämä metodi kutsutaan AddImageLoader-metodista,
         * jotta ylätunnisteen kuvat ehtivät latautua.
         *
         * @param set_select_val boolean Tehdäänkö enemmän kuin vain ladataan ylätunnisteet: merkitäänkäö jokin tunniste valituksi
         *
         */
        source.prototype.SetHeaderTemplates = function(set_select_val){
            var path = Utilities.GetAjaxPath("Loader.php");
            if(set_select_val === undefined){ 
                var set_select_val = true;
            }
            var self = this;
            self.$lightbox.find(".headertemplates select").on("change",function(){self.UpdatePickedHeader()});
            self.$lightbox.find(".headertemplates textarea").on("change paste keyup",function(){self.UpdatePickedHeader()});
            self.$lightbox.find(".headertemplates [name='header_type']").on("click",function(){self.UpdatePickedHeader()});
            self.headerdata = {};
            $.getJSON(path, {"action":"get_slide_headers"},
                function(headers){
                //Jos alustetaan käyttöä varten ensimmäistä kertaa
                var $sel = self.$lightbox.find("select[name='header_select']");
                try{
                    $sel.select_withtext("destroy").html("");
                }
                catch(e){
                    $sel.select_withtext().html("");
                }
                $("<option value='0'></option>").text("Ei ylätunnistetta").appendTo($sel);
                $.each(headers,function(idx,header){
                    var is_selected = ""
                    if( !set_select_val & idx === headers.length - 1 ){ 
                        //Jos syötetty kokonaan uusi tunniste, valitaan se
                        var is_selected = " selected";
                        self.header_id = header.id;
                    }
                    else if( set_select_val & header.id == self.header_id ){ 
                        var is_selected = " selected";
                    }
                    $("<option value='" + header.id + "' "+ is_selected +"></option>").text(header.template_name).appendTo($sel);
                    //Tallenna ylätunniste id:n perusteella
                    self.headerdata[header.id] = header;
                });
                $("<option>").text("Uusi tunniste").appendTo($sel);
                self.$lightbox.find("select[name='header_select']")
                    .select_withtext({select:function(event, ui){self.PickHeader(ui.item)}})
                    .select_withtext("refresh");
                self.PickHeader();
            });
        };

        /**
         *
         * Lataa näytettäväksi käyttäjän valitseman ylätunnisteen.
         * Jos käyttäjä syöttänyt kokonaan uuden, lisätään se ylätunnisteiden listaan.
         *
         * @param selected_item valittu elementti (jquery ui-oliona)
         *
         */
        source.prototype.PickHeader = function(selected_item){
            var self = this,
                $sel = this.$lightbox.find("select[name='header_select']"),
                header = undefined,
                path = Utilities.GetAjaxPath("Saver.php");
            if (selected_item){
                //Jos funktio ajettu todellisen valinnan seurauksena
                //eikä vain muokkausikkunan avaamisen yhteydessä

                if (isNaN(selected_item.value)*1){
                    //Jos syötetty kokonaan uusi ylätunniste
                    //(arvo ei-numeerinen)
                    console.log(path);
                    $.post(path, 
                        { 
                            "action": "insert_headertemplate",
                            "template_name" : selected_item.value
                        },function(data){
                            self.SetHeaderTemplates(false);
                            self.$lightbox.find(".headertemplates .img-select").val("Ei kuvaa");
                            self.$lightbox.find(".headertemplates .img-pos-select").val("left");
                            self.$lightbox.find(".headertemplates textarea").val("");
                            Utilities.Preview(self.$lightbox.find(".headertemplates .img-select").parents(".with-preview"),
                                "Ei kuvaa");
                        });
                    return 0;
                }
                else if ( selected_item.value *1 === 0 ){
                    // Valittu "Ei ylätunnistetta"
                    self.header_id = 0;
                }
                else{
                    var header = this.headerdata[selected_item.value];
                    self.header_id = selected_item.value;
                }
            }
            else{
                //Ladataan valittu tunniste ennen kuin niitä on vaihdettu tai muokattu
                header = this.headerdata[this.header_id];
            }

            if($sel.val() === "0"){
                this.$lightbox.find(".headertemplates_hiddencontent").hide();
            }
            else{
                this.$lightbox.find(".headertemplates_hiddencontent").show();
            }
            
            if(header){
                this.$lightbox.find(".headertemplates textarea").val(header.maintext);
                this.$lightbox.find(".headertemplates .img-select").val(header.imgname);
                this.$lightbox.find(".headertemplates .img-pos-select").val(header.imgposition);
                if(header.is_aside == 1){
                    this.$lightbox.find(".headertemplates input[name='header_type']")[0].checked = true;
                }
                else{
                    this.$lightbox.find(".headertemplates input[name='header_type']")[0].checked = false;
                }
                if(header.imgname !== "Ei kuvaa"){ 
                    Utilities.Preview(this.$lightbox.find(".headertemplates .img-select").parents(".with-preview"), 
                        header.imgname);
                }
            }

        };




            
            
            };


    return {
    
        Attach,
    
    }

}();


GeneralStructure = GeneralStructure || {};

GeneralStructure.Images = function(){


    /**
     *
     * Liittää kuvien lataamiseen  liittyvän toiminnallisuuden lähdeolioon
     *
     * @param source olio, johon liitetään
     *
     **/
    function Attach(source){

        /**
         *
         * Listaa tietokantaan tallennettujen kuvien nimet
         *
         */
        source.prototype.AddImageLoader = function(){
            var self = this;
            this.$lightbox.find(".img-select").remove();
            return $.getJSON("php/ajax/Loader.php",
                    {"action":"get_slide_image_names"},
                    this.CreateListOfImages.bind(this));
        };

        /**
         *
         * Prosessoi ladattujen kuvannimien listan ja luo siitä
         * select-elementin
         *
         * @param data dian tiedot ajax-responssina 
         *
         **/
        source.prototype.CreateListOfImages = function(data){
            var self = this;
            $sel = $(`<select class='img-select'>
                        <option>Ei kuvaa</option>
                      </select>`);
            $sel.on("change",function(){ 
                Utilities.Preview($(this).parents(".with-preview"), $(this).val())}
            );
            $.each(data, function(idx,imgname){
                imgname = imgname.filename;
                $("<option>").text(imgname).appendTo($sel);
                } 
            );
            self.$lightbox.find(".img-select-parent").append($sel);
            //Kuvien lautauksen jälkeen lataa ylätunnisteet
            self.SetHeaderTemplates();
        };



    }


    return {
        Attach,
    };

}();

GeneralStructure = GeneralStructure || {};

GeneralStructure.Preview = function(){

    /**
     *
     * Liittää messurakenteen lightbox-ikkunaan liittyvän toiminnallisuuden
     * lähdeolioon
     *
     * @param source olio, johon liitetään
     *
     **/
    function Attach(source){

        /**
         * Nollaa esikatseluikkunan sisällön ja syöttää uuden.
         *
         */
        source.prototype.SetPreviewWindow = function($el){
            this.$preview_window.css(
                {
                    "width":$(".innercontent").width(),
                    "top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"
                })
                .show();
            this.$preview_window.find("iframe")
                .attr(
                    {
                        "width":$(".innercontent").width()-30 + "px",
                        "height":($(".innercontent").width()-30)/4*3+"px",
                        "border":"0"
                    })
                .show();
        };

        /**
         * Avaa ikkuna, jossa voi esikatsella diaa.
         */
        source.prototype.PreviewSlide = function(){
            var self = this;
            this.SetSlideParams();
            this.SetPreviewWindow();
            this.$container.prepend(this.$preview_window);
            this.$preview_window.find("button").click(function(){self.$preview_window.hide()});
            //this.SetPreviewParams();
            //$.post("php/loaders/slides_preview.php",this.previewparams,function(html){
            //    self.previewhtml = html;
            //    console.log(html);
            //    $(".preview-window iframe").attr({"src":"slides.html"});
            //});
        };

        /**
         * Kun esikatseluikkuna latautunut, päivitä sen sisältö.
         */
        source.prototype.SetPreviewContent = function(){
            $(".preview-window iframe").contents().find("main").html(this.previewhtml);
        };

    }


    return {
        Attach,
    };

}();

GeneralStructure = GeneralStructure || {};

GeneralStructure.InjectableData = function(){


    /**
     *
     * Liittää datan upottamiseen  liittyvän toiminnallisuuden lähdeolioon
     *
     * @param source olio, johon liitetään
     *
     **/
    function Attach(source){
    
        /**
         *
         * Hakee tiedot datasta, jota messun dioihin voi syöttää, kuten juontajan nimen tms.
         * Data tallennetaan valmiina jquery-elementteinä (select).
         *
         */
        source.prototype.InitializeInjectableData = function(){ 
            var self = this,
                path = Utilities.GetAjaxPath("Loader.php");
            $.each(this.injectables,function(identifier, name){ 
                var $select = $(`<select class='${identifier}_select'><option>Upota ${name}</option></select>`);
                $select.on("change",function(){
                    if($(this)[0].selectedIndex > 0) { 
                        //Lisää viereiseen tekstikenttään pudotusvalikon valinta
                        var $textarea = $(this).parents(".injection_placeholder").prev().find("textarea");
                        $textarea.val([$textarea.val(), "{{" + $(this).val() + "}}"].join(" "));
                        if( $(this).parents(".controller-subwindow").hasClass("headertemplates") ){ 
                            //Jos kyseessä oli ylätunnisteeseen lisättävä data, päivitä ylätunniste tietokantaan
                            self.UpdatePickedHeader();
                        }
                    }
                });
                $.getJSON(path, { "action": "get_list_of_" + identifier },
                    function(data){
                        $.each(data,function(idx,el){ 
                            $select.append("<option>" + el + "</option>")
                        });
                        self.InsertInjectableData($select);
                    });
            });
        };

        /**
         *
         * Lisää listan syötettävistä dataelementeistä niihin diaelementteihin, joissa sitä voidaan hyödyntää.
         *
         * @param $select syötettävä jquery-muotoinen select-elementtiä kuvaava olio
         *
         */
        source.prototype.InsertInjectableData = function($select){ 
            this.$lightbox.find(".injected-data").each(function(){ 
                if( !$(this).find($select.attr("class")).length ){ 
                    $(this).append($select.clone(true));
                }
            });
        };


    };


    return {
    
        Attach,
    
    }

}();


GeneralStructure = GeneralStructure || {};

GeneralStructure.DataLoading = function(){


    /**
     *
     * Liittää datan lataamiseen  liittyvän toiminnallisuuden lähdeolioon
     *
     * @param source olio, johon liitetään
     *
     **/
    function Attach(source){

        /**
         * Hae dian sisältötiedot tietokannasta: tyypistä riippuen vähintään nimi ja luokka,
         * mahdollisesti myös teksti, laulun nimi, kuvat, ylätunniste jne.
         *
         * @param new_slot jos määritetty, kyseessä on uusi slotti eikä vanhan datan lataus
         *
         */
        source.prototype.LoadParams = function(new_slot){
            var new_slot = new_slot || false;
            //Huolehdi siitä, että kuvanvalintavalikot ovat näkyvissä ennen tietojen lataamista
            this.AddImageLoader();
            this.slot_number = this.$container.find(".slot-number").text() || $(".slot").length + 1 ;
            this.slot_name = this.$container.find(".slot_name_orig").val();
            this.$lightbox.find(".segment-name").val(this.slot_name);
            if(!new_slot){
                $.getJSON("php/ajax/Loader.php",
                    {
                        "action": "get_" + this.segment_type.replace("segment","slide"),
                        "id" : this.slide_id,
                        "service_id": this.service_id
                    },
                    this.FillInData.bind(this));
            }

            return this;
        };

        /**
         *
         * Tallentaa diaaan tehdyt muutokset
         *
         * @param callback, funktio,joka laukaistaan, kun tallennus valmis
         *
         */
        source.prototype.SaveParams = function(callback){
            callback = callback || function(){};
            var self = this;
            params = {
                action: "save_slide",
                table: this.segment_type + "s",
                id: this.slide_id,
                params: this.slide_params
            };
            console.log(this.slide_params);
            $.post("php/ajax/Saver.php", params,function(){
                self.SetSlotParams();
                if(!self.id){
                    self.AddNewSlot(callback);
                }
                else{
                    self.UpdateSlot(callback);
                }
            });
            return this;
        };


        /**
         *
         * Hakee yleiset, tätä slottia koskevat tiedot ja tallentaa ne
         * slot_params-attribuuttiin
         *
         */
        source.prototype.SetSlotParams = function(){
            var addedclass = this.$lightbox.find("select[name='addedclass']").val();
            addedclass = (addedclass.substr(0,1) == "." ? addedclass : "." + addedclass);
            this.slot_params = {
                "slot_name" : this.$lightbox.find(".segment-name").val(),
                "slot_number" : this.slot_number,
                "slot_type" : this.segment_type,
                "id_in_type_table" : null,
                "addedclass" : addedclass,
                "header_id" : this.header_id,
                "content_id" : this.slide_params.id,
            };


            return this;
        };

        /**
         *
         * Päivittää tietokantaan käyttäjän muuttamat slottikohtaiset tiedot
         *
         * @param callback funktio, joka suoritetaan, kun valmis
         *
         */
        source.prototype.UpdateSlot = function(callback){
            params = {
                params: this.slot_params,
                id: this.id,
                action: "save_slot"
            };
            if(this.service_id){
                //Tarkistetaan, onko kyseessä messukohtainen dia
                params.params.service_id = this.service_id;
                params.service_id = this.service_id;
            }
            $.post("php/ajax/Saver.php", params, callback.bind(this));
        };

        /**
         *
         * Lisää kokonaan uuden slotin tietokantaan: jos esimerkiksi käyttäjä
         * lisää slotin "alkuinfo", tämä lisätään presentation_structure-tauluun samalla
         * kun dian konkreettinen lisätään infosegments-tauluun
         *
         * @param callback funktio, joka suoritetaan, kun valmis
         *
         */
        source.prototype.AddNewSlot = function(callback){
            params = {
                action: "add_new_slot",
                params: this.slot_params
            };
            if(this.service_id){
                //Tarkistetaan, onko kyseessä messukohtainen dia
                params.params.service_id = this.service_id;
                params.service_id = this.service_id;
            }
            //Haetaan tietokannasta viimeisimmän tämän tyypin diasisällön id ja
            //vasta sitten jatketaan
            $.getJSON("php/ajax/Loader.php",
                {
                    action : "check_last_index_of_segment_type",
                    segment_type: this.segment_type
                }, 
                function(max_id){
                    params.params.content_id = max_id * 1;
                    $.post("php/ajax/Saver.php", params, callback.bind(this));
                });
        };

        /**
         *
         * Hakee luokan, jos asetetu
         *
         */
        source.prototype.GetSlideClass = function(){
            if(this.$lightbox.find("select[name='addedclass']").length>0){
                this.slide_params.addedclass = this.$lightbox.find("select[name='addedclass']").val();
            }
        };

        /**
         * Tallenna dian tiedot tietokantaan (myös mahdollista esikatselua varten)
         */
        source.prototype.SetPreviewParams =  function(){
            var self = this;
            switch(this.slideclass){
                case ".infoslide":
                    var maintext = this.$lightbox.find(".slidetext").val();
                    //korvaa ät-merkit halutuilla arvoilla
                    this.$lightbox.find(".resp_select").each(function(){maintext = maintext.replace(/@/," [" + $(this).val() + "] ")});
                    var params = {
                        maintext:maintext,
                        genheader: self.$lightbox.find("[type='checkbox']").get(0).checked ? "Majakkamessu" : "",
                        subgenheader: self.$lightbox.find("[type='checkbox']").get(0).checked ? "Messun aihe" : "",
                        imgname:this.$lightbox.find(".slide_img .img-select").val() || "" ,
                        imgpos:this.$lightbox.find(".slide_img .img-pos-select").val() ,
                        header:this.$lightbox.find(".slide-header").val()
                    };
                    break;
                case ".songslide":
                    var params = {
                        multiname: this.$lightbox.find(".multisongheader").val(),
                        restricted_to: this.$lightbox.find(".restrictionlist").val(),
                        songdescription: this.$lightbox.find(".songdescription").val(),
                        };
                    break;
            }

            // Lisää tallennettaviin parametreihin tässä määritellyt
            $.extend(this.previewparams,
                params,
                {
                slot_number : self.slot_number==undefined ? $(".slot").length + 1 : self.slot_number,
                slot_name : this.$lightbox.find(".segment-name").val(),
                header_id : this.header_id
                }
            );
        };


        /**
         *
         * Lataa käytössä olevta messuosiot / dialuokat tietokannasta
         *
         */
        source.prototype.GetSlideClasses = function(){
            var self = this;
            self.selectedclass = self.$container.find(".addedclass").val();
            //Poistetaan kokonaan edellisellä avauksella näkyvissä ollut select
            self.$lightbox.find("select[name='addedclass']").remove();
            self.$lightbox.find(".addedclass_span").append("<select name='addedclass'>");
            $.getJSON("php/ajax/Loader.php", {"action":"get_slideclass_names"},
                this.SetSlideClasses.bind(this));
        };

        /**
         *
         * Syötä käytössä olevta messuosiot / dialuokat select-valikkoon
         *
         * @param data ajax-responssina saatu data eli lista käytössä olevista luokista
         *
         */
        source.prototype.SetSlideClasses = function(data){
            var self = this;
            $.each(data,function(idx, thisclass){
                if([".Laulu",".Raamatunteksti"].indexOf(thisclass)==-1){
                    if(self.selectedclass){
                        var selectme = (self.selectedclass.replace(".","") == thisclass.replace(".","") 
                            ?  " selected " : "");
                    }
                    self.$lightbox.find("select[name='addedclass']")
                        .append(`<option value='${thisclass}' ${selectme}>
                                ${thisclass.replace(".","")}
                                </option>`);
                }
            });
            //Lisää vielä mahdollisuus lisätä uusi luokka
            self.$lightbox.find("select[name='addedclass']").append("<option value='Uusi luokka'>Uusi luokka</option>");
            self.$lightbox.find("select[name='addedclass']").select_withtext();
        };

    }


    return {
        Attach,
    };

}();

var GeneralStructure = GeneralStructure || {};

GeneralStructure.DragAndDrop = function(){

    /**
     *
     * Kokonaisuus, johon slottien (tms.)  järjestelyominaisuus voidaan
     * liittää. Jquery uI:n sortable olisi ollut kiva, muttei toimi mobiilissa
     * edes touch and punch -hackillä.
     *
     * @param $ul järjesteltäväksi tarkoitetun listan jquery-representaatio
     * @param dd_params jqueri ui draggable + droppable -asetukset
     *
     **/
    var SortableList = function($ul, dd_params){

        this.$ul = $ul;
        this.$currently_dragged = undefined;
        this.dd_params = dd_params;
        
        

        /**
         *
         * Liittää messuslotteihin raahaamiseen liittyvät toiminnot
         *
         * @param parameters mudossa 
         *
         * {
         *    draggables: ".css_class",
         *    droppables: ".css_class",
         *    drop_callback: function_reference,
         * }
         *
         **/
        this.Initialize = function(axis){
            this.$currently_dragged = undefined;

            var self = this;
            var options = {
                    revert: true,
                    start: self.DragStart.bind(this),
                    stop: self.CleanUp.bind(this),
                    handle: this.dd_params.handle,
                    axis: axis || "y",
                    refreshPositions: true,
                    cursor: "move",
                    opacity:0.99,
                    zIndex:100,
                    //snapMode: "inner",
                    //snap: true,
            };
            this.numberclass = this.dd_params.numberclass || undefined;
            this.draggables = this.dd_params.draggables;
            this.$ul.find(this.dd_params.draggables).draggable(options);
            this.RefreshPseudoSlots().AddDroppables();
            return this;
        };


        /**
         *
         *  Päivitä (tai luo) varsinaisten slottien välissä olevat
         *  "pseudo-slotit", joita käytetään osoittamaan paikat, jonne
         *  raahattavan elementin voi tiputtaa/
         *
         **/
        this.RefreshPseudoSlots = function(){
            var self = this;
            this.$ul.find(".between-slots").remove();
            this.$ul.find("li").before("<li class='between-slots'></li>");
            this.$ul.find("li:last-of-type").after("<li class='between-slots'></li>");
            this.$ul.find(this.draggables).each(function(idx,el){
                //Jos listassa on näkyvillä numeroita, päivitä ne
                $(this).find(self.numberclass).text(idx+1);
            });
            return this;
        }

        /**
         *
         * Initializes or refreshes the droppables
         *
         **/
        this.AddDroppables = function(){
            var self = this;
            this.$ul.find(".between-slots").droppable({
                    drop: self.Drop.bind(this),
                    over: self.DragOver.bind(this),
                    classes: {
                      //"ui-droppable-active": "songslot_waiting",
                      "ui-droppable-hover": "structural_slot_taking",
                    },
                    out: self.DragLeave.bind(this),
                    accept: self.dd_params.drop_accept || "*"
                });
            return this;
        }


        /**
         *
         * Määrittelee, mitä tapahtuu, kun käyttäjä alkaa raahata jotakin
         * slottia
         *
         **/
        this.DragStart = function(event){
            var $el = $(event.target);
            this.$currently_dragged = $el;
            $el.prev(".between-slots").hide();
            //$el.next(".between-slots").hide();
            $el.addClass("dragging");
            //this.$ul.find(".between-slots").addClass("drop-highlight");
        };

        /**
         *
         * Poista raahauksen aikana lisätyt luokat, tekstit ym.
         *
         **/
        this.CleanUp = function(event){
            this.$ul.find(".between-slots").removeClass("drop-highlight").text("");
            $(event.target).removeClass("dragging");
            this.RefreshPseudoSlots().AddDroppables();
            return this;
        };


        /**
         *
         * Määrittelee, mitä tapahtuu, kun raahattu
         * elementti poistuu slottien välisen alueen
         * päältä
         *
         * @param event funktion käynnistänyt tapahtuma
         *
         **/
        this.DragLeave = function(event){
            $(event.target).text("");
        }


        /**
         * 
         * Määrittelee, mitä tapahtuu, kun elementti
         * raahataan slottien välisen tilan ylle
         *
         * @param event funktion käynnistänyt tapahtuma
         *
         **/
        this.DragOver = function(event){
            //$(event.target).prev().css({"margin-bottom":"35px"});
            //this.original_height = $(event.target).height();
            //$(event.target).css({"margin-top":"1em"});
            //$(event.target).text("Siirrä tähän");
            //$(event.target).addClass("drop-highlight");
        };


        /**
         *
         *
         * Määrittelee, mitä tapahtuu, kun käyttäjä on tiputtanut raahaamansa elementin kohteeseen.
         *
         * @param event funktion käynnistänyt tapahtuma
         *
         **/
        this.Drop = function(event){
            var $el = $(event.target),
                q = ".slot_id[value='" + this.$currently_dragged.find(".slot_id").val() + "']",
                old_number = this.$currently_dragged.find(".slot-number").text()*1;
            this.$currently_dragged.insertAfter($el);
            var number_of_elements_with_dragged_slot_id = this.$ul.find(q).length;
            this.dd_params.drop_callback(this.$ul);
        };
        
    


    }



    return {
        SortableList,
    }

}();


/**
 *
 * Moduuli, jonka avaulla valitaan raamatunkohtia tietokannasta
 *
 **/
var BibleModule = function(){


    /**
     *
     * Liittää raamatunosoitteiden poimijan käyytäjän määrittelemään elementtiin
     *
     * @param $parent_el jquery-representaatio elementistä, jonka sisälle syötetään
     * @param title Raamatunkohdan otsikko / rooli
     *
     */
    function AttachAddressPicker($parent_el, title){
        var title = title || "";
        var cont = new PickerContainer(title);
        cont.AttachTo($parent_el);
        return cont;
    }

    /**
     *
     * (Mahdollisesti) usean jaeparin muodostama kokonaisuus
     *
     * @param title Raamatunkohdan otsikko / rooli
     *
     */
    var PickerContainer = function(title){ 

        this.title = title;
        this.callback = undefined;
        this.picker_pairs = [];
        this.$supercont = $(`<div class='bible_address_container'>`);
        this.$header = $(`<div class='bible_address_header closed'>
                            <div class='address_name'>
                                ${title}
                            </div>
                            <div class='address_information'>
                                <span class='visible_address'></span>
                                <input type='hidden' class='saved_address'></input>
                            </div>
                        </div>`);
        this.$cont = $(`<div class='address_pickers'>
                        </div>`);


        /**
         *
         * Asettaa funktion tarkkailemaan valitsimissa tapahtuvia muutoksia
         *
         * @param callback asetettava funktio
         *
         */
        this.SetCallBack = function(callback){
            this.callback = callback;
        }

        /**
         *
         * Liittää mukaan tapahtumat
         *
         */
        this.Initialize = function(){
            this.$header.click(this.ShowPickers.bind(this));
            this.AddPickerPair();
        };

        /**
         *
         * Liittää osaksi DOMia
         *
         * @param $parent_el elementti, johon valitsin liitetään
         *
         */
        this.AttachTo = function($parent_el){
            this.$supercont.appendTo($parent_el);
            this.$header.appendTo(this.$supercont);
            this.$cont.insertAfter(this.$header);
            this.$addmore_link = $("<i class='fa fa-plus add_picker_pair'></i>")
                .click(this.AddPickerPair.bind(this));
            this.$addmore_link_cont = $("<div class='add_picker_pair'></div>")
                .append(this.$addmore_link)
                .appendTo(this.$cont)
                .hide();
            if(this.$cont.find(".fa-pencil").is(":visible")){
                this.$addmore_link_cont.show();
            }
        };

        /**
         *
         * Näyttää raamatunkohtien valitsimet.
         *
         */
        this.ShowPickers = function(){
            var self = this;
            this.$cont.slideToggle(function(){
               self.$header.toggleClass("opened").toggleClass("closed");
            });
        };


        /**
         *
         * Lisää uuden alku- + loppujaeparin
         *
         */
        this.AddPickerPair = function(){
            var picker = new PickerPair();
            picker.Initialize(this.$cont);
            if(this.callback){
                picker.SetCallBack(this.callback);
            }
            if(this.$addmore_link_cont){
                this.$addmore_link_cont.insertAfter(picker.$cont).hide();
            }
            this.picker_pairs.push(picker);
            //this.$addmore_link_cont.after(picker.$controls);
        };
    }

    /**
     *
     * Alku- ja loppujakeen valitsimen muodostama kokonaisuus
     *
     *
     */
    var PickerPair = function(){ 

        this.callback = undefined;
        this.$status = $("<div class='bible_address_status'><span class='status_text'></span></div>");
        this.startpicker = new StartAddressPicker();
        this.endpicker = new EndAddressPicker();

        this.Initialize = function($parent_el){
            this.$cont = $("<div class='pickerpair'></div>").appendTo($parent_el);
            this.$confirm_link = $("<a href='javascript:void(0);'>Valmis</a>").click(this.Confirm.bind(this));;
            this.$edit_link = $("<i class='fa fa-pencil addr_edit_link'></i>")
                .click(this.Edit.bind(this))
                .appendTo(this.$status);
            this.startpicker.AttachTo(this.$cont).AddPickerEvents();
            this.endpicker.AddPickerEvents();
            this.endpicker.$picker
                .insertAfter(this.startpicker.$picker)
                .hide();
            this.startpicker.$picker
                .find(".verse").change(this.AttachEndPicker.bind(this));
            this.$controls = $("<div class='pickerpair_controls'></div>")
                .append(this.$confirm_link)
                .insertAfter(this.endpicker.$picker);
            this.$status.insertBefore(this.startpicker.$picker);
        }


        /**
         *
         * Muokkaa kerran jo vahvistettua
         *
         */
        this.Edit = function(){
            this.startpicker.$picker
                .find("[value='" + this.startpicker.testament + "']")
                .prop({"checked":true});
            this.$status.hide();
            this.startpicker.$picker.show();
            this.endpicker.$picker.show();
            this.$confirm_link.show();
            this.$cont.addClass("pickerpair");
            this.startpicker.$picker.find(".between-verse-selectors").show();
        };

        /**
         *
         * Asettaa funktion tarkkailemaan valitsimissa tapahtuvia muutoksia
         *
         * @param callback asetettava funktio
         *
         */
        this.SetCallBack = function(callback){
            this.callback = callback;
        }


        /**
         *
         * Tekee jaeparista yksittäisen, jolloin ei yritetä luoda
         * mahdollisuutta useilla jaepareille
         *
         * @param callback asetettava funktio
         *
         */
        this.SetAsSingle = function(){
            this.is_single = true;
            return this;
        }

        /**
         *
         * Vahvistaa valitun raamatunkohdan
         *
         */
        this.Confirm = function(){

            if(!this.is_single){

                var addr = this.GetHumanReadableAddress(),
                    $par_el = this.startpicker.$picker.parents(".address_pickers");
            
                this.startpicker.$picker.hide();
                this.endpicker.$picker.hide();
                this.$status.find(".status_text").text(addr);
                this.$cont.removeClass("pickerpair");

                var $all_addresses = $par_el.find(".status_text"),
                    address_string = "";

                $all_addresses.each(function(){
                    if(address_string){
                        address_string += "; ";
                    }
                    address_string += $(this).text();
                });

                $par_el.prev().find(".address_information").text(address_string);
                this.startpicker.$picker.parents(".bible_address_container:eq(0)")
                    .find(".add_picker_pair").show();

                this.$confirm_link.hide()
                this.$status.show();
            
            }

            if(this.callback){
                this.callback();
            }
        }

        /**
         *
         * Muodostaa helposti luettavissa olevan merkkijonon osoitteesta.
         *
         */
        this.GetHumanReadableAddress = function(){
            var start = this.startpicker.GetAddress(),
                end = this.endpicker.GetAddress(),
                addr = start.book + ' ' + start.chapter;
            if(start.book !== end.book){
                addr += ":" + start.verse + " - " + end.book + " " + end.chapter + ": " + end.verse;
            }
            else if(start.chapter == end.chapter && start.verse == end.verse) {
                addr += ":" + start.verse;
            }
            else if(start.chapter == end.chapter) {
                addr += ":" + start.verse + " - " +  end.verse;
            }
            else if(start.chapter !== end.chapter) {
                addr += ":" + start.verse + " - " +  end.chapter + ": " + end.verse;
            }
            return  addr;
        }

        /**
         *
         * Liittää loppujakeen valitsimen.
         *
         */
        this.AttachEndPicker = function(){
            var self = this;
            $.each([".book",".chapter",".verse"],function(idx, type){
                self.endpicker.$picker.find(type).html(
                    self.startpicker.$picker.find(type).html()
                );
            });
            this.endpicker.SetAddress(this.startpicker.GetAddress(), 
                this.startpicker.testament);
            this.startpicker.$picker.find(".between-verse-selectors").slideDown("slow");
            this.endpicker.$picker.show();
            this.$controls.show();
        //};
        };

    };


    /**
     *
     * Raamatunkohtien valitsin
     *
     */
    var BibleAddressPicker = function(){ 

        this.testament = "";
        this.book = "";
        this.chapter = "";
        this.verse = "";

        this.$picker = $(`<div class='bible_address_picker'> 
                    <div class="verseselector startverse">
                        <div class="selector-wrapper">
                            <div>
                                <select class="book">
                                    <option>Kirja</option>
                                </select>
                            </div>
                            <div>
                                <select class="chapter">
                                    <option>Luku</option>
                                </select>
                            </div>
                            <div>
                                <select class="verse">
                                    <option>Jae</option>
                                </select>
                                <div class="versepreview"></div>
                            </div>
                        </div>
                </div>
            </div>`);


        /**
         *
         * Liittää valitsimen DOMiin
         *
         * @param $parent_el jquery-representaatio elementistä, jonka sisälle syötetään
         *
         */
        this.AttachTo = function($parent_el){
            this.$picker.find("[value='ot'],[value='nt']").prop({"checked":false});
            $parent_el.append(this.$picker);
            return this;
        };

        /**
         *
         * Palauttaa tämänhetkisen osoitteen muodossa {book:..,chapter:...,verse:...}
         *
         */
        this.GetAddress = function(){
            var address = {}
                self = this;
            $.each(["book","chapter","verse"],function(idx, type){
                address[type] = self[type];
            });

            return address;
        };


        /**
         *
         * Asettaa osoitteen valmiiksi määritellyn olion perusteella
         *
         * @param address osoite muodossa {book:..,chapter:...,verse:...}
         * @param testament nt tai ot
         *
         */
        this.SetAddress = function(address, testament){
            var self = this
                booknames = undefined,
                chapters = undefined,
                verses = undefined;
            self.testament = testament;
            self.book = address.book;
            self.chapter = address.chapter;
            self.verse = address.verse;
            if(this.$picker.find(".book").length < 2){
                //Jos ei valmiiksi ladattuja kirjojen, kappaleiden ym. nimiä
                return $.when($.when(self.GetBookNames())
                    .done(function(){
                        $.when(self.GetChapters())
                            .done(function(){
                                $.when(self.GetVerses())
                                    .done(function(){
                                        $.each(Object.keys(address), function(idx, type){
                                            self.$picker.find("." + type).val(address[type]);
                                        });
                                });
                            });
                        }));
            }
            else{
                $.each(Object.keys(address), function(idx, type){
                    self.$picker.find("." + type).val(address[type]);
                    self[type] = address[type];
                });
            }
            return this;
        };

        /**
         *
         * Lisää tapahtumat valitsimeen
         *
         */
        this.AddPickerEvents = function(){
            this.$picker.find("[name='testament']").click(this.GetBookNames.bind(this));
            this.$picker.find(".book").change(this.GetChapters.bind(this));
            this.$picker.find(".chapter").change(this.GetVerses.bind(this));
            this.$picker.find(".verse").change(this.PreviewVerse.bind(this));
            return this;
        }

        /**
         *
         * Lataa Raamatun kirjojen nimet tietokannasta (joko ut tai vt)
         *
         * @param event tapahtuma
         *
         */
        this.GetBookNames = function(event){
            var path = Utilities.GetAjaxPath("Loader.php");
            if(event){
                //Jos ajettu valintatapahtuman seurauksena eikä automaattisesti
                this.testament = this.$picker.find("[name='testament']:checked").val();
                this.book = '';
                this.verse = '';
                if(this.type=="start"){
                    this.$picker.parents(".pickerpair")
                        .find(".between-verse-selectors, .bible_address_picker:eq(1)").hide();
                }
            }
            return $.getJSON(path,
                {
                    "action": "load_booknames",
                    "testament": this.testament
                },this.SetBookNames.bind(this));
        };


        /**
         *
         * Lataa yhden raamatun kirjan luvut
         *
         * @param event tapahtuma
         *
         */
        this.GetChapters = function(event){
            var path = Utilities.GetAjaxPath("Loader.php");
            if(event){
                this.book = this.$picker.find(".book").val();
                this.verse = '';
            }

            return $.getJSON(path,
                {
                    "action": "load_chapters",
                    "testament": this.testament,
                    "book": this.book
                }, this.SetChapters.bind(this));
        }


        /**
         *
         * Lataa yhden raamatun kirjan luvun jakeet
         *
         * @param event tapahtuma
         *
         */
        this.GetVerses = function(event){
            var path = Utilities.GetAjaxPath("Loader.php");
            if(event){
                this.chapter = this.$picker.find(".chapter").val();
            }
            return $.getJSON(path,
                {
                    "action": "load_verses",
                    "testament": this.testament,
                    "book": this.book,
                    "chapter": this.chapter
                }, this.SetVerses.bind(this));
        }


        /**
         *
         * Liittää Raamatun kirjojen nimet valitsimiin
         *
         * @param data taulukko kirjojen nimistä
         * 
         */
        this.SetBookNames = function(data){
            var self = this;
            this.$picker.find(".book, .chapter, .verse").find("option:gt(0)").remove();
            //ES2015 testi: TODO muista yhteensopiva versio
            $(data.map(bookname => `<option>${bookname}</option>`).join("\n"))
                .appendTo(self.$picker.find(".book"));
        };

        /**
         *
         * Liittää kirjan lukujen numerot valitsimeen
         *
         * @param data taulukko lukujen numeroista
         * 
         */
        this.SetChapters = function(data){
            var self = this;
            this.$picker.find(".chapter, .verse").find("option:gt(0)").remove();
            //ES2015 testi: TODO muista yhteensopiva versio
            $(data.map(ch => `<option>${ch*1}</option>`).join("\n"))
                .appendTo(self.$picker.find(".chapter"));
        };

        /**
         *
         * Liittää luvun jakeiden numerot valitsimeen
         *
         * @param data taulukko jakeiden numeroista
         * 
         */
        this.SetVerses = function(data){
            var self = this;
            this.$picker.find(".verse").find("option:gt(0)").remove();
            //ES2015 testi: TODO muista yhteensopiva versio
            $(data.map(verseno => `<option>${verseno*1}</option>`).join("\n"))
                .appendTo(self.$picker.find(".verse"));
        };


        /**
         *
         * Näyttää esikatselunäkymän jakeesta
         * 
         */
        this.PreviewVerse = function(){
            var self = this,
                path = Utilities.GetAjaxPath("Loader.php");
            this.verse = this.$picker.find(".verse").val();
            $.getJSON(path,
                {
                    "action": "load_verse_content",
                    "testament": this.testament,
                    "startverse": [this.book, this.chapter, this.verse],
                    "endverse": null,
                }, function(verse){
                    self.$picker.find(".versepreview")
                        .text(verse[0])
                        .fadeIn()
                        .click(function(){$(this).fadeOut()});
                    setTimeout(x => (self.$picker.find(".versepreview").fadeOut()), 4000);
                });
        };
    

    };

    /**
     *
     * Valitsin sille jakeelle, josta asti valitaan. Perii BibleAddressPicker:stä.
     *
     */
    var StartAddressPicker = function(){
        this.type = "start";
        BibleAddressPicker.call(this);

        $(`<div class='testament_select'>
            <div><input type="radio" name="testament" value="ot">Vanha testamentti</input></div>
            <div><input type="radio" name="testament" value="nt">Uusi testamentti</input></div>
        </div>`).prependTo(this.$picker);

        $(`<div>
        <div class="arrow_box between-verse-selectors">Mihin asti?</div>
        </div>`).appendTo(this.$picker);
    };

    StartAddressPicker.prototype = Object.create(BibleAddressPicker.prototype);

    /**
     *
     * Valitsin sille jakeelle, johon asti valitaan. Perii BibleAddressPicker:stä.
     *
     */
    var EndAddressPicker = function(){
        this.type = "end";
        BibleAddressPicker.call(this);
        $("<div class='after-verse-selectors'></div>")
            .appendTo(this.$picker);


    };


    EndAddressPicker.prototype = Object.create(BibleAddressPicker.prototype);


    return {
    
        AttachAddressPicker,
        PickerPair
    
    };

}();


Portal = Portal || {};

/**
 *
 * Simppeli moduuli prosenttipalkkien näyttämiseen
 *
 */
Portal.PercentBar = function(){

    var all_bars = [];

    /**
     *
     * Luokka, joka edustaa prosenttipalkkeja
     *
     * @param $parent_el div, joka sisältää palkin arvot
     *
     */
    var PercentBar = function($parent_el){
        this.numerator = $parent_el.find(".numerator").val();
        this.denominator = $parent_el.find(".denominator").val();
        this.$parent_el = $parent_el;


        /**
         *
         * Tulostaa prosenttipalkin
         *
         */
        this.PrintBar = function(){
            var width = this.numerator / this.denominator * 100,
                $numerator = $("<div class='numerator'></div>").css({"width":width + "%"}),
                $denominator = $("<div class='denominator'></div>"),
                $bar_parent = $("<div class='pcbar_parent'><div class='amounts'></div></div>");
            this.$parent_el.find("div.demonimator").remove();
            $denominator
                .append($numerator)
                .prependTo($bar_parent);
            $bar_parent
                .appendTo(this.$parent_el);
        };

        /**
         *
         * Lisää palkin sisälle numerot
         *
         */
        this.AddNumbersAsText = function(){
            this.$parent_el.find(".amounts")
                .append(`
                    <div>${this.numerator} €</div>
                    <div>${this.denominator} €</div>
                    `);
        };

        /**
         *
         * Valitsee palkin värin
         *
         * @param col uusi väri
         *
         */
        this.SetBarColor = function(col){
            this.$parent_el.find(".pcbar_parent").css({"color":col});
            this.$parent_el.find(".pcbar_parent div.denominator")
                .css({"border": "1px solid " + col});
            this.$parent_el.find(".pcbar_parent div.numerator")
                .css({"background": col});
        };

    };


    /**
     *
     * @param d DOM, josta etsitään 
     * @param d barcolor minkä värisiä palkkeja
     *
     */
    function InitializePercentBars(d, barcolor){
        d.find(".percent_bar").each(function(){
            var bar = new PercentBar($(this));
            bar.PrintBar();
            bar.SetBarColor(barcolor);
            bar.AddNumbersAsText();
            all_bars.push(bar);
        });
        console.log("Initialized the percent bars");
    }

    /**
     *
     * Hae kaikki käytöss olevat prosenttipalkit
     *
     */
    function GetBars(){
        return all_bars;
    }

    /**
     *
     * Päivittää prosenttipalkkien tyylit oikean värisiksi yms.
     *
     * TODO: jos useita prosenttipalkkeja samassa esityksessä
     *
     */
    function UpdateStyles(){
        var pres = Slides.Presentation.GetCurrentPresentation(),
            $pbsection = pres.d.find(".percent_bar:eq(0)").parents("section"),
            cl = $pbsection.attr("class").split(" ")[1],
            rule = pres.styles.GetRule("." + cl + " p"),
            col = rule.cssText.replace(/.*color: ([^;]+).*/, "$1");

        $.each(all_bars, function(idx, bar){
            bar.SetBarColor(col);
        });
    
    }


    return {
    
        InitializePercentBars,
        GetBars,
        UpdateStyles,
    
    };

}();


// Lisää toiminnallisuuden sivulle: lataa sisällön,
// liittää eventit... Eri tavalla riippuen siitä, mikä osasivu ladattuna.


$(function(){
    //Navigation etc:
    if (!Portal.Menus.GetInitialized()){
        Portal.Menus.InitializeMenus();
    }
    //Other actions:
    if ($("body").hasClass("servicedetails")){
        //Messukohtainen näkymä
        $("#tabs").tabs();
        Portal.Service.Initialize();
    }
    else if ($("body").hasClass("servicelist")){
        //Kaikkien messujen lista
        Portal.Servicelist.Initialize();
        //Ehkä filtteröitynä?
    }
    else if ($("body").hasClass("service_structure")){
        //Kaikkien messujen lista
        GeneralStructure.Initialize(".structural-element-add");
        //Ehkä filtteröitynä?
    }

});

;(function ($, window) {

var intervals = {};
var removeListener = function(selector) {

	if (intervals[selector]) {
		
		window.clearInterval(intervals[selector]);
		intervals[selector] = null;
	}
};
var found = 'waitUntilExists.found';

/**
 * @function
 * @property {object} jQuery plugin which runs handler function once specified
 *           element is inserted into the DOM
 * @param {function|string} handler 
 *            A function to execute at the time when the element is inserted or 
 *            string "remove" to remove the listener from the given selector
 * @param {bool} shouldRunHandlerOnce 
 *            Optional: if true, handler is unbound after its first invocation
 * @example jQuery(selector).waitUntilExists(function);
 */
 
$.fn.waitUntilExists = function(handler, shouldRunHandlerOnce, isChild) {

	var selector = this.selector;
	var $this = $(selector);
	var $elements = $this.not(function() { return $(this).data(found); });
	
	if (handler === 'remove') {
		
		// Hijack and remove interval immediately if the code requests
		removeListener(selector);
	}
	else {

		// Run the handler on all found elements and mark as found
		$elements.each(handler).data(found, true);
		
		if (shouldRunHandlerOnce && $this.length) {
			
			// Element was found, implying the handler already ran for all 
			// matched elements
			removeListener(selector);
		}
		else if (!isChild) {
			
			// If this is a recurring search or if the target has not yet been 
			// found, create an interval to continue searching for the target
			intervals[selector] = window.setInterval(function () {
				
				$this.waitUntilExists(handler, shouldRunHandlerOnce, true);
			}, 500);
		}
	}
	
	return $this;
};
 
}(jQuery, window));
// Spectrum Colorpicker v1.8.0
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT

(function (factory) {
    "use strict";

    if (typeof define === 'function' && define.amd) { // AMD
        define(['jquery'], factory);
    }
    else if (typeof exports == "object" && typeof module == "object") { // CommonJS
        module.exports = factory(require('jquery'));
    }
    else { // Browser
        factory(jQuery);
    }
})(function($, undefined) {
    "use strict";

    var defaultOpts = {

        // Callbacks
        beforeShow: noop,
        move: noop,
        change: noop,
        show: noop,
        hide: noop,

        // Options
        color: false,
        flat: false,
        showInput: false,
        allowEmpty: false,
        showButtons: true,
        clickoutFiresChange: true,
        showInitial: false,
        showPalette: false,
        showPaletteOnly: false,
        hideAfterPaletteSelect: false,
        togglePaletteOnly: false,
        showSelectionPalette: true,
        localStorageKey: false,
        appendTo: "body",
        maxSelectionSize: 7,
        cancelText: "cancel",
        chooseText: "choose",
        togglePaletteMoreText: "more",
        togglePaletteLessText: "less",
        clearText: "Clear Color Selection",
        noColorSelectedText: "No Color Selected",
        preferredFormat: false,
        className: "", // Deprecated - use containerClassName and replacerClassName instead.
        containerClassName: "",
        replacerClassName: "",
        showAlpha: false,
        theme: "sp-light",
        palette: [["#ffffff", "#000000", "#ff0000", "#ff8000", "#ffff00", "#008000", "#0000ff", "#4b0082", "#9400d3"]],
        selectionPalette: [],
        disabled: false,
        offset: null
    },
    spectrums = [],
    IE = !!/msie/i.exec( window.navigator.userAgent ),
    rgbaSupport = (function() {
        function contains( str, substr ) {
            return !!~('' + str).indexOf(substr);
        }

        var elem = document.createElement('div');
        var style = elem.style;
        style.cssText = 'background-color:rgba(0,0,0,.5)';
        return contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
    })(),
    replaceInput = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join(''),
    markup = (function () {

        // IE does not support gradients with multiple stops, so we need to simulate
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "";
        if (IE) {
            for (var i = 1; i <= 6; i++) {
                gradientFix += "<div class='sp-" + i + "'></div>";
            }
        }

        return [
            "<div class='sp-container sp-hidden'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                    "<div class='sp-palette-button-container sp-cf'>",
                        "<button type='button' class='sp-palette-toggle'></button>",
                    "</div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-clear sp-clear-display'>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                                gradientFix,
                            "</div>",
                        "</div>",
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel' href='#'></a>",
                        "<button type='button' class='sp-choose'></button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();

    function paletteTemplate (p, color, className, opts) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var current = p[i];
            if(current) {
                var tiny = tinycolor(current);
                var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
                c += (tinycolor.equals(color, current)) ? " sp-thumb-active" : "";
                var formattedString = tiny.toString(opts.preferredFormat || "rgb");
                var swatchStyle = rgbaSupport ? ("background-color:" + tiny.toRgbString()) : "filter:" + tiny.toFilter();
                html.push('<span title="' + formattedString + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
            } else {
                var cls = 'sp-clear-display';
                html.push($('<div />')
                    .append($('<span data-color="" style="background-color:transparent;" class="' + cls + '"></span>')
                        .attr('title', opts.noColorSelectedText)
                    )
                    .html()
                );
            }
        }
        return "<div class='sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    function hideAll() {
        for (var i = 0; i < spectrums.length; i++) {
            if (spectrums[i]) {
                spectrums[i].hide();
            }
        }
    }

    function instanceOptions(o, callbackContext) {
        var opts = $.extend({}, defaultOpts, o);
        opts.callbacks = {
            'move': bind(opts.move, callbackContext),
            'change': bind(opts.change, callbackContext),
            'show': bind(opts.show, callbackContext),
            'hide': bind(opts.hide, callbackContext),
            'beforeShow': bind(opts.beforeShow, callbackContext)
        };

        return opts;
    }

    function spectrum(element, o) {

        var opts = instanceOptions(o, element),
            flat = opts.flat,
            showSelectionPalette = opts.showSelectionPalette,
            localStorageKey = opts.localStorageKey,
            theme = opts.theme,
            callbacks = opts.callbacks,
            resize = throttle(reflow, 10),
            visible = false,
            isDragging = false,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,
            alphaWidth = 0,
            alphaSlideHelperWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,
            currentAlpha = 1,
            palette = [],
            paletteArray = [],
            paletteLookup = {},
            selectionPalette = opts.selectionPalette.slice(0),
            maxSelectionSize = opts.maxSelectionSize,
            draggingClass = "sp-dragging",
            shiftMovementDirection = null;

        var doc = element.ownerDocument,
            body = doc.body,
            boundElement = $(element),
            disabled = false,
            container = $(markup, doc).addClass(theme),
            pickerContainer = container.find(".sp-picker-container"),
            dragger = container.find(".sp-color"),
            dragHelper = container.find(".sp-dragger"),
            slider = container.find(".sp-hue"),
            slideHelper = container.find(".sp-slider"),
            alphaSliderInner = container.find(".sp-alpha-inner"),
            alphaSlider = container.find(".sp-alpha"),
            alphaSlideHelper = container.find(".sp-alpha-handle"),
            textInput = container.find(".sp-input"),
            paletteContainer = container.find(".sp-palette"),
            initialColorContainer = container.find(".sp-initial"),
            cancelButton = container.find(".sp-cancel"),
            clearButton = container.find(".sp-clear"),
            chooseButton = container.find(".sp-choose"),
            toggleButton = container.find(".sp-palette-toggle"),
            isInput = boundElement.is("input"),
            isInputTypeColor = isInput && boundElement.attr("type") === "color" && inputTypeColorSupport(),
            shouldReplace = isInput && !flat,
            replacer = (shouldReplace) ? $(replaceInput).addClass(theme).addClass(opts.className).addClass(opts.replacerClassName) : $([]),
            offsetElement = (shouldReplace) ? replacer : boundElement,
            previewElement = replacer.find(".sp-preview-inner"),
            initialColor = opts.color || (isInput && boundElement.val()),
            colorOnShow = false,
            currentPreferredFormat = opts.preferredFormat,
            clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange,
            isEmpty = !initialColor,
            allowEmpty = opts.allowEmpty && !isInputTypeColor;

        function applyOptions() {

            if (opts.showPaletteOnly) {
                opts.showPalette = true;
            }

            toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);

            if (opts.palette) {
                palette = opts.palette.slice(0);
                paletteArray = $.isArray(palette[0]) ? palette : [palette];
                paletteLookup = {};
                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        var rgb = tinycolor(paletteArray[i][j]).toRgbString();
                        paletteLookup[rgb] = true;
                    }
                }
            }

            container.toggleClass("sp-flat", flat);
            container.toggleClass("sp-input-disabled", !opts.showInput);
            container.toggleClass("sp-alpha-enabled", opts.showAlpha);
            container.toggleClass("sp-clear-enabled", allowEmpty);
            container.toggleClass("sp-buttons-disabled", !opts.showButtons);
            container.toggleClass("sp-palette-buttons-disabled", !opts.togglePaletteOnly);
            container.toggleClass("sp-palette-disabled", !opts.showPalette);
            container.toggleClass("sp-palette-only", opts.showPaletteOnly);
            container.toggleClass("sp-initial-disabled", !opts.showInitial);
            container.addClass(opts.className).addClass(opts.containerClassName);

            reflow();
        }

        function initialize() {

            if (IE) {
                container.find("*:not(input)").attr("unselectable", "on");
            }

            applyOptions();

            if (shouldReplace) {
                boundElement.after(replacer).hide();
            }

            if (!allowEmpty) {
                clearButton.hide();
            }

            if (flat) {
                boundElement.after(container).hide();
            }
            else {

                var appendTo = opts.appendTo === "parent" ? boundElement.parent() : $(opts.appendTo);
                if (appendTo.length !== 1) {
                    appendTo = $("body");
                }

                appendTo.append(container);
            }

            updateSelectionPaletteFromStorage();

            offsetElement.on("click.spectrum touchstart.spectrum", function (e) {
                if (!disabled) {
                    toggle();
                }

                e.stopPropagation();

                if (!$(e.target).is("input")) {
                    e.preventDefault();
                }
            });

            if(boundElement.is(":disabled") || (opts.disabled === true)) {
                disable();
            }

            // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
            container.click(stopPropagation);

            // Handle user typed input
            textInput.change(setFromTextInput);
            textInput.on("paste", function () {
                setTimeout(setFromTextInput, 1);
            });
            textInput.keydown(function (e) { if (e.keyCode == 13) { setFromTextInput(); } });

            cancelButton.text(opts.cancelText);
            cancelButton.on("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                revert();
                hide();
            });

            clearButton.attr("title", opts.clearText);
            clearButton.on("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                isEmpty = true;
                move();

                if(flat) {
                    //for the flat style, this is a change event
                    updateOriginalInput(true);
                }
            });

            chooseButton.text(opts.chooseText);
            chooseButton.on("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (IE && textInput.is(":focus")) {
                    textInput.trigger('change');
                }

                if (isValid()) {
                    updateOriginalInput(true);
                    hide();
                }
            });

            toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);
            toggleButton.on("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                opts.showPaletteOnly = !opts.showPaletteOnly;

                // To make sure the Picker area is drawn on the right, next to the
                // Palette area (and not below the palette), first move the Palette
                // to the left to make space for the picker, plus 5px extra.
                // The 'applyOptions' function puts the whole container back into place
                // and takes care of the button-text and the sp-palette-only CSS class.
                if (!opts.showPaletteOnly && !flat) {
                    container.css('left', '-=' + (pickerContainer.outerWidth(true) + 5));
                }
                applyOptions();
            });

            draggable(alphaSlider, function (dragX, dragY, e) {
                currentAlpha = (dragX / alphaWidth);
                isEmpty = false;
                if (e.shiftKey) {
                    currentAlpha = Math.round(currentAlpha * 10) / 10;
                }

                move();
            }, dragStart, dragStop);

            draggable(slider, function (dragX, dragY) {
                currentHue = parseFloat(dragY / slideHeight);
                isEmpty = false;
                if (!opts.showAlpha) {
                    currentAlpha = 1;
                }
                move();
            }, dragStart, dragStop);

            draggable(dragger, function (dragX, dragY, e) {

                // shift+drag should snap the movement to either the x or y axis.
                if (!e.shiftKey) {
                    shiftMovementDirection = null;
                }
                else if (!shiftMovementDirection) {
                    var oldDragX = currentSaturation * dragWidth;
                    var oldDragY = dragHeight - (currentValue * dragHeight);
                    var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);

                    shiftMovementDirection = furtherFromX ? "x" : "y";
                }

                var setSaturation = !shiftMovementDirection || shiftMovementDirection === "x";
                var setValue = !shiftMovementDirection || shiftMovementDirection === "y";

                if (setSaturation) {
                    currentSaturation = parseFloat(dragX / dragWidth);
                }
                if (setValue) {
                    currentValue = parseFloat((dragHeight - dragY) / dragHeight);
                }

                isEmpty = false;
                if (!opts.showAlpha) {
                    currentAlpha = 1;
                }

                move();

            }, dragStart, dragStop);

            if (!!initialColor) {
                set(initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                updateUI();
                currentPreferredFormat = opts.preferredFormat || tinycolor(initialColor).format;

                addColorToSelectionPalette(initialColor);
            }
            else {
                updateUI();
            }

            if (flat) {
                show();
            }

            function paletteElementClick(e) {
                if (e.data && e.data.ignore) {
                    set($(e.target).closest(".sp-thumb-el").data("color"));
                    move();
                }
                else {
                    set($(e.target).closest(".sp-thumb-el").data("color"));
                    move();

                    // If the picker is going to close immediately, a palette selection
                    // is a change.  Otherwise, it's a move only.
                    if (opts.hideAfterPaletteSelect) {
                        updateOriginalInput(true);
                        hide();
                    } else {
                        updateOriginalInput();
                    }
                }

                return false;
            }

            var paletteEvent = IE ? "mousedown.spectrum" : "click.spectrum touchstart.spectrum";
            paletteContainer.on(paletteEvent, ".sp-thumb-el", paletteElementClick);
            initialColorContainer.on(paletteEvent, ".sp-thumb-el:nth-child(1)", { ignore: true }, paletteElementClick);
        }

        function updateSelectionPaletteFromStorage() {

            if (localStorageKey && window.localStorage) {

                // Migrate old palettes over to new format.  May want to remove this eventually.
                try {
                    var oldPalette = window.localStorage[localStorageKey].split(",#");
                    if (oldPalette.length > 1) {
                        delete window.localStorage[localStorageKey];
                        $.each(oldPalette, function(i, c) {
                             addColorToSelectionPalette(c);
                        });
                    }
                }
                catch(e) { }

                try {
                    selectionPalette = window.localStorage[localStorageKey].split(";");
                }
                catch (e) { }
            }
        }

        function addColorToSelectionPalette(color) {
            if (showSelectionPalette) {
                var rgb = tinycolor(color).toRgbString();
                if (!paletteLookup[rgb] && $.inArray(rgb, selectionPalette) === -1) {
                    selectionPalette.push(rgb);
                    while(selectionPalette.length > maxSelectionSize) {
                        selectionPalette.shift();
                    }
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    }
                    catch(e) { }
                }
            }
        }

        function getUniqueSelectionPalette() {
            var unique = [];
            if (opts.showPalette) {
                for (var i = 0; i < selectionPalette.length; i++) {
                    var rgb = tinycolor(selectionPalette[i]).toRgbString();

                    if (!paletteLookup[rgb]) {
                        unique.push(selectionPalette[i]);
                    }
                }
            }

            return unique.reverse().slice(0, opts.maxSelectionSize);
        }

        function drawPalette() {

            var currentColor = get();

            var html = $.map(paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, "sp-palette-row sp-palette-row-" + i, opts);
            });

            updateSelectionPaletteFromStorage();

            if (selectionPalette) {
                html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, "sp-palette-row sp-palette-row-selection", opts));
            }

            paletteContainer.html(html.join(""));
        }

        function drawInitial() {
            if (opts.showInitial) {
                var initial = colorOnShow;
                var current = get();
                initialColorContainer.html(paletteTemplate([initial, current], current, "sp-palette-row-initial", opts));
            }
        }

        function dragStart() {
            if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) {
                reflow();
            }
            isDragging = true;
            container.addClass(draggingClass);
            shiftMovementDirection = null;
            boundElement.trigger('dragstart.spectrum', [ get() ]);
        }

        function dragStop() {
            isDragging = false;
            container.removeClass(draggingClass);
            boundElement.trigger('dragstop.spectrum', [ get() ]);
        }

        function setFromTextInput() {

            var value = textInput.val();

            if ((value === null || value === "") && allowEmpty) {
                set(null);
                move();
                updateOriginalInput();
            }
            else {
                var tiny = tinycolor(value);
                if (tiny.isValid()) {
                    set(tiny);
                    move();
                    updateOriginalInput();
                }
                else {
                    textInput.addClass("sp-validation-error");
                }
            }
        }

        function toggle() {
            if (visible) {
                hide();
            }
            else {
                show();
            }
        }

        function show() {
            var event = $.Event('beforeShow.spectrum');

            if (visible) {
                reflow();
                return;
            }

            boundElement.trigger(event, [ get() ]);

            if (callbacks.beforeShow(get()) === false || event.isDefaultPrevented()) {
                return;
            }

            hideAll();
            visible = true;

            $(doc).on("keydown.spectrum", onkeydown);
            $(doc).on("click.spectrum", clickout);
            $(window).on("resize.spectrum", resize);
            replacer.addClass("sp-active");
            container.removeClass("sp-hidden");

            reflow();
            updateUI();

            colorOnShow = get();

            drawInitial();
            callbacks.show(colorOnShow);
            boundElement.trigger('show.spectrum', [ colorOnShow ]);
        }

        function onkeydown(e) {
            // Close on ESC
            if (e.keyCode === 27) {
                hide();
            }
        }

        function clickout(e) {
            // Return on right click.
            if (e.button == 2) { return; }

            // If a drag event was happening during the mouseup, don't hide
            // on click.
            if (isDragging) { return; }

            if (clickoutFiresChange) {
                updateOriginalInput(true);
            }
            else {
                revert();
            }
            hide();
        }

        function hide() {
            // Return if hiding is unnecessary
            if (!visible || flat) { return; }
            visible = false;

            $(doc).off("keydown.spectrum", onkeydown);
            $(doc).off("click.spectrum", clickout);
            $(window).off("resize.spectrum", resize);

            replacer.removeClass("sp-active");
            container.addClass("sp-hidden");

            callbacks.hide(get());
            boundElement.trigger('hide.spectrum', [ get() ]);
        }

        function revert() {
            set(colorOnShow, true);
            updateOriginalInput(true);
        }

        function set(color, ignoreFormatChange) {
            if (tinycolor.equals(color, get())) {
                // Update UI just in case a validation error needs
                // to be cleared.
                updateUI();
                return;
            }

            var newColor, newHsv;
            if (!color && allowEmpty) {
                isEmpty = true;
            } else {
                isEmpty = false;
                newColor = tinycolor(color);
                newHsv = newColor.toHsv();

                currentHue = (newHsv.h % 360) / 360;
                currentSaturation = newHsv.s;
                currentValue = newHsv.v;
                currentAlpha = newHsv.a;
            }
            updateUI();

            if (newColor && newColor.isValid() && !ignoreFormatChange) {
                currentPreferredFormat = opts.preferredFormat || newColor.getFormat();
            }
        }

        function get(opts) {
            opts = opts || { };

            if (allowEmpty && isEmpty) {
                return null;
            }

            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 1000) / 1000
            }, { format: opts.format || currentPreferredFormat });
        }

        function isValid() {
            return !textInput.hasClass("sp-validation-error");
        }

        function move() {
            updateUI();

            callbacks.move(get());
            boundElement.trigger('move.spectrum', [ get() ]);
        }

        function updateUI() {

            textInput.removeClass("sp-validation-error");

            updateHelperLocations();

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor.fromRatio({ h: currentHue, s: 1, v: 1 });
            dragger.css("background-color", flatColor.toHexString());

            // Get a format that alpha will be included in (hex and names ignore alpha)
            var format = currentPreferredFormat;
            if (currentAlpha < 1 && !(currentAlpha === 0 && format === "name")) {
                if (format === "hex" || format === "hex3" || format === "hex6" || format === "name") {
                    format = "rgb";
                }
            }

            var realColor = get({ format: format }),
                displayColor = '';

             //reset background info for preview element
            previewElement.removeClass("sp-clear-display");
            previewElement.css('background-color', 'transparent');

            if (!realColor && allowEmpty) {
                // Update the replaced elements background with icon indicating no color selection
                previewElement.addClass("sp-clear-display");
            }
            else {
                var realHex = realColor.toHexString(),
                    realRgb = realColor.toRgbString();

                // Update the replaced elements background color (with actual selected color)
                if (rgbaSupport || realColor.alpha === 1) {
                    previewElement.css("background-color", realRgb);
                }
                else {
                    previewElement.css("background-color", "transparent");
                    previewElement.css("filter", realColor.toFilter());
                }

                if (opts.showAlpha) {
                    var rgb = realColor.toRgb();
                    rgb.a = 0;
                    var realAlpha = tinycolor(rgb).toRgbString();
                    var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                    if (IE) {
                        alphaSliderInner.css("filter", tinycolor(realAlpha).toFilter({ gradientType: 1 }, realHex));
                    }
                    else {
                        alphaSliderInner.css("background", "-webkit-" + gradient);
                        alphaSliderInner.css("background", "-moz-" + gradient);
                        alphaSliderInner.css("background", "-ms-" + gradient);
                        // Use current syntax gradient on unprefixed property.
                        alphaSliderInner.css("background",
                            "linear-gradient(to right, " + realAlpha + ", " + realHex + ")");
                    }
                }

                displayColor = realColor.toString(format);
            }

            // Update the text entry input as it changes happen
            if (opts.showInput) {
                textInput.val(displayColor);
            }

            if (opts.showPalette) {
                drawPalette();
            }

            drawInitial();
        }

        function updateHelperLocations() {
            var s = currentSaturation;
            var v = currentValue;

            if(allowEmpty && isEmpty) {
                //if selected color is empty, hide the helpers
                alphaSlideHelper.hide();
                slideHelper.hide();
                dragHelper.hide();
            }
            else {
                //make sure helpers are visible
                alphaSlideHelper.show();
                slideHelper.show();
                dragHelper.show();

                // Where to show the little circle in that displays your current selected color
                var dragX = s * dragWidth;
                var dragY = dragHeight - (v * dragHeight);
                dragX = Math.max(
                    -dragHelperHeight,
                    Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
                );
                dragY = Math.max(
                    -dragHelperHeight,
                    Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
                );
                dragHelper.css({
                    "top": dragY + "px",
                    "left": dragX + "px"
                });

                var alphaX = currentAlpha * alphaWidth;
                alphaSlideHelper.css({
                    "left": (alphaX - (alphaSlideHelperWidth / 2)) + "px"
                });

                // Where to show the bar that displays your current selected hue
                var slideY = (currentHue) * slideHeight;
                slideHelper.css({
                    "top": (slideY - slideHelperHeight) + "px"
                });
            }
        }

        function updateOriginalInput(fireCallback) {
            var color = get(),
                displayColor = '',
                hasChanged = !tinycolor.equals(color, colorOnShow);

            if (color) {
                displayColor = color.toString(currentPreferredFormat);
                // Update the selection palette with the current color
                addColorToSelectionPalette(color);
            }

            if (isInput) {
                boundElement.val(displayColor);
            }

            if (fireCallback && hasChanged) {
                callbacks.change(color);
                boundElement.trigger('change', [ color ]);
            }
        }

        function reflow() {
            if (!visible) {
                return; // Calculations would be useless and wouldn't be reliable anyways
            }
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHeight = slideHelper.height();
            alphaWidth = alphaSlider.width();
            alphaSlideHelperWidth = alphaSlideHelper.width();

            if (!flat) {
                container.css("position", "absolute");
                if (opts.offset) {
                    container.offset(opts.offset);
                } else {
                    container.offset(getOffset(container, offsetElement));
                }
            }

            updateHelperLocations();

            if (opts.showPalette) {
                drawPalette();
            }

            boundElement.trigger('reflow.spectrum');
        }

        function destroy() {
            boundElement.show();
            offsetElement.off("click.spectrum touchstart.spectrum");
            container.remove();
            replacer.remove();
            spectrums[spect.id] = null;
        }

        function option(optionName, optionValue) {
            if (optionName === undefined) {
                return $.extend({}, opts);
            }
            if (optionValue === undefined) {
                return opts[optionName];
            }

            opts[optionName] = optionValue;

            if (optionName === "preferredFormat") {
                currentPreferredFormat = opts.preferredFormat;
            }
            applyOptions();
        }

        function enable() {
            disabled = false;
            boundElement.attr("disabled", false);
            offsetElement.removeClass("sp-disabled");
        }

        function disable() {
            hide();
            disabled = true;
            boundElement.attr("disabled", true);
            offsetElement.addClass("sp-disabled");
        }

        function setOffset(coord) {
            opts.offset = coord;
            reflow();
        }

        initialize();

        var spect = {
            show: show,
            hide: hide,
            toggle: toggle,
            reflow: reflow,
            option: option,
            enable: enable,
            disable: disable,
            offset: setOffset,
            set: function (c) {
                set(c);
                updateOriginalInput();
            },
            get: get,
            destroy: destroy,
            container: container
        };

        spect.id = spectrums.push(spect) - 1;

        return spect;
    }

    /**
    * checkOffset - get the offset below/above and left/right element depending on screen position
    * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
    */
    function getOffset(picker, input) {
        var extraY = 0;
        var dpWidth = picker.outerWidth();
        var dpHeight = picker.outerHeight();
        var inputHeight = input.outerHeight();
        var doc = picker[0].ownerDocument;
        var docElem = doc.documentElement;
        var viewWidth = docElem.clientWidth + $(doc).scrollLeft();
        var viewHeight = docElem.clientHeight + $(doc).scrollTop();
        var offset = input.offset();
        var offsetLeft = offset.left;
        var offsetTop = offset.top;

        offsetTop += inputHeight;

        offsetLeft -=
            Math.min(offsetLeft, (offsetLeft + dpWidth > viewWidth && viewWidth > dpWidth) ?
            Math.abs(offsetLeft + dpWidth - viewWidth) : 0);

        offsetTop -=
            Math.min(offsetTop, ((offsetTop + dpHeight > viewHeight && viewHeight > dpHeight) ?
            Math.abs(dpHeight + inputHeight - extraY) : extraY));

        return {
            top: offsetTop,
            bottom: offset.bottom,
            left: offsetLeft,
            right: offset.right,
            width: offset.width,
            height: offset.height
        };
    }

    /**
    * noop - do nothing
    */
    function noop() {

    }

    /**
    * stopPropagation - makes the code only doing this a little easier to read in line
    */
    function stopPropagation(e) {
        e.stopPropagation();
    }

    /**
    * Create a function bound to a given object
    * Thanks to underscore.js
    */
    function bind(func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    }

    /**
    * Lightweight drag helper.  Handles containment within the element, so that
    * when dragging, the x is within [0,element.width] and y is within [0,element.height]
    */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = ('ontouchstart' in window);

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["touchmove mousemove"] = move;
        duringDragEvents["touchend mouseup"] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (IE && doc.documentMode < 9 && !e.button) {
                    return stop();
                }

                var t0 = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0];
                var pageX = t0 && t0.pageX || e.pageX;
                var pageY = t0 && t0.pageY || e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
            }
        }

        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).on(duringDragEvents);
                    $(doc.body).addClass("sp-dragging");

                    move(e);

                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).off(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");

                // Wait a tick before notifying observers to allow the click event
                // to fire in Chrome.
                setTimeout(function() {
                    onstop.apply(element, arguments);
                }, 0);
            }
            dragging = false;
        }

        $(element).on("touchstart mousedown", start);
    }

    function throttle(func, wait, debounce) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var throttler = function () {
                timeout = null;
                func.apply(context, args);
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    }

    function inputTypeColorSupport() {
        return $.fn.spectrum.inputTypeColorSupport();
    }

    /**
    * Define a jQuery plugin
    */
    var dataID = "spectrum.id";
    $.fn.spectrum = function (opts, extra) {

        if (typeof opts == "string") {

            var returnValue = this;
            var args = Array.prototype.slice.call( arguments, 1 );

            this.each(function () {
                var spect = spectrums[$(this).data(dataID)];
                if (spect) {
                    var method = spect[opts];
                    if (!method) {
                        throw new Error( "Spectrum: no such method: '" + opts + "'" );
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    }
                    else if (opts == "container") {
                        returnValue = spect.container;
                    }
                    else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    }
                    else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    }
                    else {
                        method.apply(spect, args);
                    }
                }
            });

            return returnValue;
        }

        // Initializing a new instance of spectrum
        return this.spectrum("destroy").each(function () {
            var options = $.extend({}, $(this).data(), opts);
            var spect = spectrum(this, options);
            $(this).data(dataID, spect.id);
        });
    };

    $.fn.spectrum.load = true;
    $.fn.spectrum.loadOpts = {};
    $.fn.spectrum.draggable = draggable;
    $.fn.spectrum.defaults = defaultOpts;
    $.fn.spectrum.inputTypeColorSupport = function inputTypeColorSupport() {
        if (typeof inputTypeColorSupport._cachedResult === "undefined") {
            var colorInput = $("<input type='color'/>")[0]; // if color element is supported, value will default to not null
            inputTypeColorSupport._cachedResult = colorInput.type === "color" && colorInput.value !== "";
        }
        return inputTypeColorSupport._cachedResult;
    };

    $.spectrum = { };
    $.spectrum.localization = { };
    $.spectrum.palettes = { };

    $.fn.spectrum.processNativeColorInputs = function () {
        var colorInputs = $("input[type=color]");
        if (colorInputs.length && !inputTypeColorSupport()) {
            colorInputs.spectrum({
                preferredFormat: "hex6"
            });
        }
    };

    // TinyColor v1.1.2
    // https://github.com/bgrins/TinyColor
    // Brian Grinstead, MIT License

    (function() {

    var trimLeft = /^[\s,#]+/,
        trimRight = /\s+$/,
        tinyCounter = 0,
        math = Math,
        mathRound = math.round,
        mathMin = math.min,
        mathMax = math.max,
        mathRandom = math.random;

    var tinycolor = function(color, opts) {

        color = (color) ? color : '';
        opts = opts || { };

        // If input is already a tinycolor, return itself
        if (color instanceof tinycolor) {
           return color;
        }
        // If we are called as a function, call using new instead
        if (!(this instanceof tinycolor)) {
            return new tinycolor(color, opts);
        }

        var rgb = inputToRGB(color);
        this._originalInput = color,
        this._r = rgb.r,
        this._g = rgb.g,
        this._b = rgb.b,
        this._a = rgb.a,
        this._roundA = mathRound(1000 * this._a) / 1000,
        this._format = opts.format || rgb.format;
        this._gradientType = opts.gradientType;

        // Don't let the range of [0,255] come back in [0,1].
        // Potentially lose a little bit of precision here, but will fix issues where
        // .5 gets interpreted as half of the total, instead of half of 1
        // If it was supposed to be 128, this was already taken care of by `inputToRgb`
        if (this._r < 1) { this._r = mathRound(this._r); }
        if (this._g < 1) { this._g = mathRound(this._g); }
        if (this._b < 1) { this._b = mathRound(this._b); }

        this._ok = rgb.ok;
        this._tc_id = tinyCounter++;
    };

    tinycolor.prototype = {
        isDark: function() {
            return this.getBrightness() < 128;
        },
        isLight: function() {
            return !this.isDark();
        },
        isValid: function() {
            return this._ok;
        },
        getOriginalInput: function() {
          return this._originalInput;
        },
        getFormat: function() {
            return this._format;
        },
        getAlpha: function() {
            return this._a;
        },
        getBrightness: function() {
            var rgb = this.toRgb();
            return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        },
        setAlpha: function(value) {
            this._a = boundAlpha(value);
            this._roundA = mathRound(1000 * this._a) / 1000;
            return this;
        },
        toHsv: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
        },
        toHsvString: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
            return (this._a == 1) ?
              "hsv("  + h + ", " + s + "%, " + v + "%)" :
              "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
        },
        toHsl: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
        },
        toHslString: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
            return (this._a == 1) ?
              "hsl("  + h + ", " + s + "%, " + l + "%)" :
              "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
        },
        toHex: function(allow3Char) {
            return rgbToHex(this._r, this._g, this._b, allow3Char);
        },
        toHexString: function(allow3Char) {
            return '#' + this.toHex(allow3Char);
        },
        toHex8: function() {
            return rgbaToHex(this._r, this._g, this._b, this._a);
        },
        toHex8String: function() {
            return '#' + this.toHex8();
        },
        toRgb: function() {
            return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
        },
        toRgbString: function() {
            return (this._a == 1) ?
              "rgb("  + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
              "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
        },
        toPercentageRgb: function() {
            return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
        },
        toPercentageRgbString: function() {
            return (this._a == 1) ?
              "rgb("  + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
              "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
        },
        toName: function() {
            if (this._a === 0) {
                return "transparent";
            }

            if (this._a < 1) {
                return false;
            }

            return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
        },
        toFilter: function(secondColor) {
            var hex8String = '#' + rgbaToHex(this._r, this._g, this._b, this._a);
            var secondHex8String = hex8String;
            var gradientType = this._gradientType ? "GradientType = 1, " : "";

            if (secondColor) {
                var s = tinycolor(secondColor);
                secondHex8String = s.toHex8String();
            }

            return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
        },
        toString: function(format) {
            var formatSet = !!format;
            format = format || this._format;

            var formattedString = false;
            var hasAlpha = this._a < 1 && this._a >= 0;
            var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "name");

            if (needsAlphaFormat) {
                // Special case for "transparent", all other non-alpha formats
                // will return rgba when there is transparency.
                if (format === "name" && this._a === 0) {
                    return this.toName();
                }
                return this.toRgbString();
            }
            if (format === "rgb") {
                formattedString = this.toRgbString();
            }
            if (format === "prgb") {
                formattedString = this.toPercentageRgbString();
            }
            if (format === "hex" || format === "hex6") {
                formattedString = this.toHexString();
            }
            if (format === "hex3") {
                formattedString = this.toHexString(true);
            }
            if (format === "hex8") {
                formattedString = this.toHex8String();
            }
            if (format === "name") {
                formattedString = this.toName();
            }
            if (format === "hsl") {
                formattedString = this.toHslString();
            }
            if (format === "hsv") {
                formattedString = this.toHsvString();
            }

            return formattedString || this.toHexString();
        },

        _applyModification: function(fn, args) {
            var color = fn.apply(null, [this].concat([].slice.call(args)));
            this._r = color._r;
            this._g = color._g;
            this._b = color._b;
            this.setAlpha(color._a);
            return this;
        },
        lighten: function() {
            return this._applyModification(lighten, arguments);
        },
        brighten: function() {
            return this._applyModification(brighten, arguments);
        },
        darken: function() {
            return this._applyModification(darken, arguments);
        },
        desaturate: function() {
            return this._applyModification(desaturate, arguments);
        },
        saturate: function() {
            return this._applyModification(saturate, arguments);
        },
        greyscale: function() {
            return this._applyModification(greyscale, arguments);
        },
        spin: function() {
            return this._applyModification(spin, arguments);
        },

        _applyCombination: function(fn, args) {
            return fn.apply(null, [this].concat([].slice.call(args)));
        },
        analogous: function() {
            return this._applyCombination(analogous, arguments);
        },
        complement: function() {
            return this._applyCombination(complement, arguments);
        },
        monochromatic: function() {
            return this._applyCombination(monochromatic, arguments);
        },
        splitcomplement: function() {
            return this._applyCombination(splitcomplement, arguments);
        },
        triad: function() {
            return this._applyCombination(triad, arguments);
        },
        tetrad: function() {
            return this._applyCombination(tetrad, arguments);
        }
    };

    // If input is an object, force 1 into "1.0" to handle ratios properly
    // String input requires "1.0" as input, so 1 will be treated as 1
    tinycolor.fromRatio = function(color, opts) {
        if (typeof color == "object") {
            var newColor = {};
            for (var i in color) {
                if (color.hasOwnProperty(i)) {
                    if (i === "a") {
                        newColor[i] = color[i];
                    }
                    else {
                        newColor[i] = convertToPercentage(color[i]);
                    }
                }
            }
            color = newColor;
        }

        return tinycolor(color, opts);
    };

    // Given a string or object, convert that input to RGB
    // Possible string inputs:
    //
    //     "red"
    //     "#f00" or "f00"
    //     "#ff0000" or "ff0000"
    //     "#ff000000" or "ff000000"
    //     "rgb 255 0 0" or "rgb (255, 0, 0)"
    //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
    //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
    //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
    //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
    //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
    //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
    //
    function inputToRGB(color) {

        var rgb = { r: 0, g: 0, b: 0 };
        var a = 1;
        var ok = false;
        var format = false;

        if (typeof color == "string") {
            color = stringInputToObject(color);
        }

        if (typeof color == "object") {
            if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
            }
            else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                color.s = convertToPercentage(color.s);
                color.v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, color.s, color.v);
                ok = true;
                format = "hsv";
            }
            else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                color.s = convertToPercentage(color.s);
                color.l = convertToPercentage(color.l);
                rgb = hslToRgb(color.h, color.s, color.l);
                ok = true;
                format = "hsl";
            }

            if (color.hasOwnProperty("a")) {
                a = color.a;
            }
        }

        a = boundAlpha(a);

        return {
            ok: ok,
            format: color.format || format,
            r: mathMin(255, mathMax(rgb.r, 0)),
            g: mathMin(255, mathMax(rgb.g, 0)),
            b: mathMin(255, mathMax(rgb.b, 0)),
            a: a
        };
    }


    // Conversion Functions
    // --------------------

    // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
    // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

    // `rgbToRgb`
    // Handle bounds / percentage checking to conform to CSS color spec
    // <http://www.w3.org/TR/css3-color/>
    // *Assumes:* r, g, b in [0, 255] or [0, 1]
    // *Returns:* { r, g, b } in [0, 255]
    function rgbToRgb(r, g, b){
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255
        };
    }

    // `rgbToHsl`
    // Converts an RGB color value to HSL.
    // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
    // *Returns:* { h, s, l } in [0,1]
    function rgbToHsl(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min) {
            h = s = 0; // achromatic
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return { h: h, s: s, l: l };
    }

    // `hslToRgb`
    // Converts an HSL color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
    function hslToRgb(h, s, l) {
        var r, g, b;

        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);

        function hue2rgb(p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        if(s === 0) {
            r = g = b = l; // achromatic
        }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHsv`
    // Converts an RGB color value to HSV
    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
    // *Returns:* { h, s, v } in [0,1]
    function rgbToHsv(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if(max == min) {
            h = 0; // achromatic
        }
        else {
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h, s: s, v: v };
    }

    // `hsvToRgb`
    // Converts an HSV color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
     function hsvToRgb(h, s, v) {

        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHex`
    // Converts an RGB color to hex
    // Assumes r, g, and b are contained in the set [0, 255]
    // Returns a 3 or 6 character hex
    function rgbToHex(r, g, b, allow3Char) {

        var hex = [
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        // Return a 3 character hex if possible
        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }

        return hex.join("");
    }
        // `rgbaToHex`
        // Converts an RGBA color plus alpha transparency to hex
        // Assumes r, g, b and a are contained in the set [0, 255]
        // Returns an 8 character hex
        function rgbaToHex(r, g, b, a) {

            var hex = [
                pad2(convertDecimalToHex(a)),
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16))
            ];

            return hex.join("");
        }

    // `equals`
    // Can be called with any tinycolor input
    tinycolor.equals = function (color1, color2) {
        if (!color1 || !color2) { return false; }
        return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
    };
    tinycolor.random = function() {
        return tinycolor.fromRatio({
            r: mathRandom(),
            g: mathRandom(),
            b: mathRandom()
        });
    };


    // Modification Functions
    // ----------------------
    // Thanks to less.js for some of the basics here
    // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

    function desaturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s -= amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function saturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s += amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function greyscale(color) {
        return tinycolor(color).desaturate(100);
    }

    function lighten (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l += amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

    function brighten(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var rgb = tinycolor(color).toRgb();
        rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
        rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
        rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
        return tinycolor(rgb);
    }

    function darken (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l -= amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

    // Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
    // Values outside of this range will be wrapped into this range.
    function spin(color, amount) {
        var hsl = tinycolor(color).toHsl();
        var hue = (mathRound(hsl.h) + amount) % 360;
        hsl.h = hue < 0 ? 360 + hue : hue;
        return tinycolor(hsl);
    }

    // Combination Functions
    // ---------------------
    // Thanks to jQuery xColor for some of the ideas behind these
    // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

    function complement(color) {
        var hsl = tinycolor(color).toHsl();
        hsl.h = (hsl.h + 180) % 360;
        return tinycolor(hsl);
    }

    function triad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function tetrad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function splitcomplement(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
            tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
        ];
    }

    function analogous(color, results, slices) {
        results = results || 6;
        slices = slices || 30;

        var hsl = tinycolor(color).toHsl();
        var part = 360 / slices;
        var ret = [tinycolor(color)];

        for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
            hsl.h = (hsl.h + part) % 360;
            ret.push(tinycolor(hsl));
        }
        return ret;
    }

    function monochromatic(color, results) {
        results = results || 6;
        var hsv = tinycolor(color).toHsv();
        var h = hsv.h, s = hsv.s, v = hsv.v;
        var ret = [];
        var modification = 1 / results;

        while (results--) {
            ret.push(tinycolor({ h: h, s: s, v: v}));
            v = (v + modification) % 1;
        }

        return ret;
    }

    // Utility Functions
    // ---------------------

    tinycolor.mix = function(color1, color2, amount) {
        amount = (amount === 0) ? 0 : (amount || 50);

        var rgb1 = tinycolor(color1).toRgb();
        var rgb2 = tinycolor(color2).toRgb();

        var p = amount / 100;
        var w = p * 2 - 1;
        var a = rgb2.a - rgb1.a;

        var w1;

        if (w * a == -1) {
            w1 = w;
        } else {
            w1 = (w + a) / (1 + w * a);
        }

        w1 = (w1 + 1) / 2;

        var w2 = 1 - w1;

        var rgba = {
            r: rgb2.r * w1 + rgb1.r * w2,
            g: rgb2.g * w1 + rgb1.g * w2,
            b: rgb2.b * w1 + rgb1.b * w2,
            a: rgb2.a * p  + rgb1.a * (1 - p)
        };

        return tinycolor(rgba);
    };


    // Readability Functions
    // ---------------------
    // <http://www.w3.org/TR/AERT#color-contrast>

    // `readability`
    // Analyze the 2 colors and returns an object with the following properties:
    //    `brightness`: difference in brightness between the two colors
    //    `color`: difference in color/hue between the two colors
    tinycolor.readability = function(color1, color2) {
        var c1 = tinycolor(color1);
        var c2 = tinycolor(color2);
        var rgb1 = c1.toRgb();
        var rgb2 = c2.toRgb();
        var brightnessA = c1.getBrightness();
        var brightnessB = c2.getBrightness();
        var colorDiff = (
            Math.max(rgb1.r, rgb2.r) - Math.min(rgb1.r, rgb2.r) +
            Math.max(rgb1.g, rgb2.g) - Math.min(rgb1.g, rgb2.g) +
            Math.max(rgb1.b, rgb2.b) - Math.min(rgb1.b, rgb2.b)
        );

        return {
            brightness: Math.abs(brightnessA - brightnessB),
            color: colorDiff
        };
    };

    // `readable`
    // http://www.w3.org/TR/AERT#color-contrast
    // Ensure that foreground and background color combinations provide sufficient contrast.
    // *Example*
    //    tinycolor.isReadable("#000", "#111") => false
    tinycolor.isReadable = function(color1, color2) {
        var readability = tinycolor.readability(color1, color2);
        return readability.brightness > 125 && readability.color > 500;
    };

    // `mostReadable`
    // Given a base color and a list of possible foreground or background
    // colors for that base, returns the most readable color.
    // *Example*
    //    tinycolor.mostReadable("#123", ["#fff", "#000"]) => "#000"
    tinycolor.mostReadable = function(baseColor, colorList) {
        var bestColor = null;
        var bestScore = 0;
        var bestIsReadable = false;
        for (var i=0; i < colorList.length; i++) {

            // We normalize both around the "acceptable" breaking point,
            // but rank brightness constrast higher than hue.

            var readability = tinycolor.readability(baseColor, colorList[i]);
            var readable = readability.brightness > 125 && readability.color > 500;
            var score = 3 * (readability.brightness / 125) + (readability.color / 500);

            if ((readable && ! bestIsReadable) ||
                (readable && bestIsReadable && score > bestScore) ||
                ((! readable) && (! bestIsReadable) && score > bestScore)) {
                bestIsReadable = readable;
                bestScore = score;
                bestColor = tinycolor(colorList[i]);
            }
        }
        return bestColor;
    };


    // Big List of Colors
    // ------------------
    // <http://www.w3.org/TR/css3-color/#svg-color>
    var names = tinycolor.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
    };

    // Make it easy to access colors via `hexNames[hex]`
    var hexNames = tinycolor.hexNames = flip(names);


    // Utilities
    // ---------

    // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
    function flip(o) {
        var flipped = { };
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                flipped[o[i]] = i;
            }
        }
        return flipped;
    }

    // Return a valid alpha value [0,1] with all invalid values being set to 1
    function boundAlpha(a) {
        a = parseFloat(a);

        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }

        return a;
    }

    // Take input from [0, n] and return it as [0, 1]
    function bound01(n, max) {
        if (isOnePointZero(n)) { n = "100%"; }

        var processPercent = isPercentage(n);
        n = mathMin(max, mathMax(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (processPercent) {
            n = parseInt(n * max, 10) / 100;
        }

        // Handle floating point rounding errors
        if ((math.abs(n - max) < 0.000001)) {
            return 1;
        }

        // Convert into [0, 1] range if it isn't already
        return (n % max) / parseFloat(max);
    }

    // Force a number between 0 and 1
    function clamp01(val) {
        return mathMin(1, mathMax(0, val));
    }

    // Parse a base-16 hex value into a base-10 integer
    function parseIntFromHex(val) {
        return parseInt(val, 16);
    }

    // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
    // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
    function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

    // Check to see if string passed in is a percentage
    function isPercentage(n) {
        return typeof n === "string" && n.indexOf('%') != -1;
    }

    // Force a hex value to have 2 characters
    function pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }

    // Replace a decimal with it's percentage value
    function convertToPercentage(n) {
        if (n <= 1) {
            n = (n * 100) + "%";
        }

        return n;
    }

    // Converts a decimal to a hex value
    function convertDecimalToHex(d) {
        return Math.round(parseFloat(d) * 255).toString(16);
    }
    // Converts a hex value to a decimal
    function convertHexToDecimal(h) {
        return (parseIntFromHex(h) / 255);
    }

    var matchers = (function() {

        // <http://www.w3.org/TR/css3-values/#integers>
        var CSS_INTEGER = "[-\\+]?\\d+%?";

        // <http://www.w3.org/TR/css3-values/#number-value>
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

        // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

        // Actual matching.
        // Parentheses and commas are optional, but not required.
        // Whitespace can take the place of commas or opening paren
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

        return {
            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
            hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
            hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            hex8: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    })();

    // `stringInputToObject`
    // Permissive string parsing.  Take in a number of formats, and output an object
    // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
    function stringInputToObject(color) {

        color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        }
        else if (color == 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: "name" };
        }

        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match;
        if ((match = matchers.rgb.exec(color))) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        if ((match = matchers.rgba.exec(color))) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        if ((match = matchers.hsl.exec(color))) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        if ((match = matchers.hsla.exec(color))) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        if ((match = matchers.hsv.exec(color))) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        if ((match = matchers.hsva.exec(color))) {
            return { h: match[1], s: match[2], v: match[3], a: match[4] };
        }
        if ((match = matchers.hex8.exec(color))) {
            return {
                a: convertHexToDecimal(match[1]),
                r: parseIntFromHex(match[2]),
                g: parseIntFromHex(match[3]),
                b: parseIntFromHex(match[4]),
                format: named ? "name" : "hex8"
            };
        }
        if ((match = matchers.hex6.exec(color))) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                format: named ? "name" : "hex"
            };
        }
        if ((match = matchers.hex3.exec(color))) {
            return {
                r: parseIntFromHex(match[1] + '' + match[1]),
                g: parseIntFromHex(match[2] + '' + match[2]),
                b: parseIntFromHex(match[3] + '' + match[3]),
                format: named ? "name" : "hex"
            };
        }

        return false;
    }

    window.tinycolor = tinycolor;
    })();

    $(function () {
        if ($.fn.spectrum.load) {
            $.fn.spectrum.processNativeColorInputs();
        }
    });

});

var Slides = Slides || {};

/**
 *
 *
 * Moduuli, joka vastaa sisällön lataamisesta.
 *
 *
 */
Slides.ContentLoader = function(){


    /**
     *
     * Lisää kaikki kauden messut select-elementtiin, josta käyttäjä voi 
     * valita haluamansa päivän messun.
     *
     * @param services ajax-vastauksena saatu messujen lista muodossa [{"servicedate":xxx,"teme":...}]
     *
     */
    function AddServicesToSelect(services){
        var $sel = $("#service-select");
        $sel.find("option:gt(0)").remove();
        $sel.append(
            services.map((service) =>  
            `<option value='${service.id}'>${service.servicedate} </option>`)
            );
    }

    /**
     * Lataa näkyville listan messun lauluista
     *
     * @param int id sen messun id, jonka tietoja noudetaan.
     *
     */
    function LoadSongs(id){
        $.getJSON("php/loadservices.php",{"fetch":"songs","id":id}, function(data){
            var $songs = $("<div></div>");
            $.each(data,function(idx, songtitle){
                $("<div class='flexrow'><div>" + songtitle +  "</div></div>").appendTo($songs);
            });
            $("#songdata").html("<h3>Laulut</h3>").append($songs);
        });
    }



    return {

        AddServicesToSelect,
    
    
    }


}();

var Slides = Slides || {};


/**
 *
 * Varsinaisen hallittavan diaesityksen käsittävä moduuli
 *
 */
Slides.Presentation = function(){

    var current_presentation = undefined;

    /**
     * Kontrolloi esitystä ja esitysikkunaa.
     *
     * @param object d Esitysikkunan DOM jquery-oliona
     * @param object dom Esitysikkunan DOM natiivi-js:nä
     * @param object $slide Tällä hetkellä aktiivisena oleva esityselementti (laulu, otsikko, raamatunteksti)
     * @param object $section Tällä hetkellä aktiivisena oleva dia
     * @param int service_id tunniste ulkopuolisena diojen lähteenä olevaan messuun
     * @param Array text_levels Mitä eri tekstitasoja esitykessä on käytössä (otsikot, leipäteksti yms.)
     * @param int looptime kuinka pitkään (ms) oletuksena näytetään luupattavaa diaa
     * @param integer loop_id luupattavan intervallin id, jota tarvitaan pysäyttämistä varten
     * @param boolean loop_is_on onko diojen luuppaus päällä
     * @param Array loopedslides taulukko luuppauksen kohteena olevista dioista
     *
     */
    Presentation = function(){
        this.d = undefined;
        this.dom = undefined;

        this.looptime = 1000;
        this.loop_is_on = false;
        this.loop_id = undefined;
        this.loopedslides = [];

        this.service_id = NaN;
        this.$section = $("");
        this.$slide = $("");
        this.text_levels = {"body":"kaikki",
            "h1":"1-otsikko","h2":"2-otsikko",
            "h3":"3-otsikko",
            "p":"leipäteksti",
            "img":"kuvat",
            "header":"ylätunniste",
            "aside":"sivutunniste",
        };
        self = this;


        /**
         * Avaa esityksen erilliseen ikkunaan (=esitysikkuna). Jos esitys jo auki, sulkee ikkunan.
         */
        this.ToggleOpen = function(){
            var abort = false;
            var wasclosed = false;
            $(".nav_below").toggle();
            if($("#launchlink").text()=="Sulje esitys"){
                this.view.close();
                $("#original-content").html("");
                $("#verselist").html("");
                $("#launchlink").text("Avaa esitys");
                wasclosed = true;
            }
            else {
                this.service_id = $("#service-select").val()*1;
                //JUST FOR TESTING purposes:
                this.service_id = 2;
                if(!isNaN(this.service_id)){
                    this.view = window.open('content.html','_blank', 'toolbar=0,location=0,menubar=0');
                    $("#launchlink").text("Sulje esitys");
                }
                else{
                    alert("Valitse ensin näytettävä messu");
                    abort = true;
                }
            }
            if(!abort){
                //Vaihda sitä, näytetäänkö messunvalintadialogi vai esityksen ohjailu
                $(".preloader, .contentlist").toggle();
                //Piilota tai näytä tarpeen mukaan esityksen ohjaukseen liittyvät linkit
                $("#controllink, #addcontentlink, #layoutlink, #slide_type_link").parent().toggle();
                if(wasclosed){
                    //Piilota mahdollisesti aukijääneet sivumenut
                    $(".side-menu-left, .side-menu-right").hide();
                    $(".preloader").show();
                }
            }
        };


        /**
         *
         * Hakee esityksen sisällön, tyylit ja muun tarvittavan.  
         *
         */
        this.SetContent = function(){
            this.d = $(this.view.document).contents();
            this.dom = this.view.document;
            //Lataa sisältö ulkoisesta lähteestä
            $.when(this.LoadSlides()).done( () => {
                    this.d = $(this.view.document).contents();
                    this.Activate(this.d.find(".current"));
                    ////Käy diat läpi ja poimi kaikki siellä esiintyvät luokat
                    this.LoadSlideClasses();
                    $.when(this.SetStyles()).done(() => this.LoadControlsAndContent());
                });
        };


        /**
         *
         * Hakee  esityksen sisällön tietokannasta
         *
         */
        this.LoadSlides = function(){
            var path = Utilities.GetAjaxPath("Loader.php");
            return $.get(path, {
                "service_id":self.service_id,
                "action": "load_slides_to_presentation"
                }, (html) => this.d.find("main").html(html));
        };
                    
        /**
         *
         * Päivittää esityksen tyylit tietokannasta
         *
         * TODO: default --> ?
         *
         */
        this.SetStyles = function(){
            var path = Utilities.GetAjaxPath("Loader.php");
            return $.get(path, 
                {
                    "action": "load_styles",
                    //"classes":this.classes,
                    "stylesheet":"default"
                }, (stylestring) => this.d.find("#updated_styles").html(stylestring));
        };


        /**
         *
         * Käy kaikki diat läpi ja talleta muistiin, mitä eri dialuokkia
         * on käytössä.
         *
         */
        this.LoadSlideClasses = function(){
            var self = this;
            this.classes = [];
            this.d.find("section").each(function(){
                var section_classes = $(this).attr("class").split(" ");
                //Lisää jälkimmäinen kahdesta section-elementin luokasta niiden
                //css-luokkien joukkoon, joita määrittävät tyylit ladataan.
                if(self.classes.indexOf(section_classes[1]) == -1){
                    //...vain, jos samaa luokkaa ei ole jo lisätty
                    self.classes.push(section_classes[1]);
                };
            });
            //Jätetty vain yhteensopivuuden vuoksi (TODO)
            self.segment_types = self.classes;
        
        };


        /**
         * Lataa hallintapainikkeet ja esityksen sisällön
         *
         */
        this.LoadControlsAndContent = function(){
            //Tähän styles-attribuuttiin on tallennettu esityksen alkuperäiset ja muokatut tyylit
            this.styles = new Slides.Styles.Controller.StyleController(this);
            this.styles.GetOriginalStyles();

            //Tähän controls-attribuuttiin on listattu kaikki 
            //sisältöä / ulkoasua tuottavat tai muokkaavat widgetit
            this.controls = {
                contentlist: new Slides.ContentList(this),
                textcontentadder: new Slides.Widgets.ContentAdders.TextContentAdder(this),
                biblecontentadder: new Slides.Widgets.ContentAdders.BibleContentAdder(this),
                songcontentadder: new Slides.Widgets.ContentAdders.SongContentAdder(this),
                imageadder: new Slides.Widgets.ContentAdders.ImageAdder(this),
                youtubeadder: new Slides.Widgets.ContentAdders.YoutubeAdder(this),
            }
            this.controls.biblecontentadder.Initialize();
            this.controls.imageadder.Initialize();

            //Lataa sisältö ja päivitä tieto tällä hetkellä aktiivisena olevasta segmentistä
            this.controls.contentlist.GetContents().PrintContentList().HighlightCurrentContents();
            var self = this;
            $("#songsearch").autocomplete(this.controls.songcontentadder.autocomp);
            $("#songsearch").on("change paste keyup",function(){self.controls.songcontentadder.CreateContent()});
            this.UpdateSegmentListForLayoutEditing();

            //Lisää vielä tyylienmuokkauswidgetit (nämä on lisättävä vasta segmenttilistan päivityksen jälkeen)

            this.controls.backgroundchanger = new Slides.Widgets.StyleWidgets.BackgroundChanger(this);
            this.controls.backgroundchanger.LoadLocalBackgrounds();
            this.controls.backgroundchanger.InitializeEvents();
    
            this.controls.fontchanger = new Slides.Widgets.StyleWidgets.FontChanger(this);
            this.controls.fontchanger.CreateFontControllers();
            Slides.Styles.Controller.UpdateControllers(this);

            this.controls.positionchanger = new Slides.Widgets.StyleWidgets.PositionChanger(this);
            this.controls.positionchanger.CreateControllers();

            this.controls.layoutloader = new Slides.Widgets.StyleWidgets.LayoutLoader(this);
            this.controls.layoutloader.UpdateStyleSheets();
            this.controls.layoutloader.InitializeEvents();

            // Lopuksi muita ladattavia plugineja
            Portal.PercentBar.InitializePercentBars(this.d);
            Portal.PercentBar.UpdateStyles();

            this.SetControlActions();

        };

        /**
         *
         * Alustaa diojen hallintaan liittyvän toiminnallisuuden, kun sisältölista ladattu
         *
         */
        this.SetControlActions = function(){
            $("#infolooplink").click(this.ToggleInfoLoop.bind(this));
            $("#loop_settings_block")
                .slider({
                            min: 0,
                            max: 15000,
                            step: 500,
                            slide: (ev, ui) => {
                                this.looptime = ui.value;
                                $(".nav_slider .indicator").text(" (" + ui.value/1000 + " s) ");
                                clearInterval(this.loop_id);
                                this.LoopSlides(".event_info_at_beginning");
                            }
                        });
            $(".nav_slider").hide();
        }

        /**
         *
         * Käynnistää infodiojen luuppauksen
         *
         * @param ev klikkaustapahtuma
         *
         */
        this.ToggleInfoLoop = function(ev){
            var current_text = $(ev.target).text(),
                new_text = (current_text == "Luuppaa infodioja" ?
                    "Lopeta luuppaus" : "Luuppaa infodioja");
            $(ev.target).text(new_text);
            $(".nav_slider").toggle();
            this.loop_is_on = (this.loop_is_on ? false : true);
            if (this.loop_is_on){
                this.LoopSlides(".event_info_at_beginning");
            }
            else{
                clearInterval(this.loop_id);
            }
        }

        /**
         *
         * Päivittää sisältölistauksen ulkoasupaneeliin, jotta ulkoasua voidaan säätää tarkemmin
         *
         */
        this.UpdateSegmentListForLayoutEditing = function(){
            var self = this;
            self.segment_types = [];
            //Tyhjennä ensin mahdollisesti jo olemassaoleva sisältö
            $("#layout-target_select").html("<option>Koko esitys</option>");
            var $types_group  = $("<optgroup>").attr({"label":"Aseta dialuokan mukaan"});
            $.each(this.classes,function(idx,thisclass){
                //Käy sitten läpi kaikki esityksestä löytyvät segmenttityypit ja lisää ne listaan
                $("<option>").text(thisclass).appendTo($types_group);
            });
            //Lisää lopuksi jokainen segmentti valittavaksi erikseen
            //var $segments_group  = $("<optgroup>").attr({"label":"Aseta segmenttikohtaisesti"})
            //$.each(this.controls.contentlist.headings,function(idx, heading){
            //    $("<option>").text(heading).appendTo($segments_group);
            //})
            //Lisää vielä valintatapahtuma ja muuta jquery-ui-menuksi
            $("#layout-target_select")
                .append($types_group)
                .on("change",function(){self.styles.SetEditTarget($(this))});
            $("#layout-target_select").selectmenu();
            $("#layout-target_select").selectmenu("refresh");
        };

        /**
         * Määrittele tällä hetkellä aktiivisena oleva sisältö.
         * Diojen näkyminen tai piilossa oleminen on toteutettu simppelisti ja
         * on lopulta css-tason kysymys.
         * Kaikki article-elementit (jokainen <article> on aina yksi "näytöllinen")
         * ovat lähtökohtaisesti piilotettuja *paitsi* jos niissä on css-luokka current.
         *
         * @param object $target se esityksen dia, joka on (tai josta tulee) aktiivinen
         *
         */
        this.Activate = function($target){
            //Piilota lähtökohtaisesti kaikki segmentit (ja poista piilotus erikseen nyt aktiivisesta)
            this.d.find("section, article").hide();
            this.$slide.removeClass("current");
            this.$slide = $target.addClass("current");
            this.$section = this.$slide.parent();
            this.$section.show();
            this.AdjustLayout();
            //Hieman häkkäilyn makua, mutta display-attribuutti jäi jostain syystä block-arvoon, vaikka
            //jqueryn hide-metodin pitäisi säilyttää alkuperäiset arvot. Tämän vuoksi määritellään erikseen
            //display: flex;
            this.$slide.show().css({"display":"flex"});
        };


        /**
         *
         * Viimeistele näytettävän dian ulkoasu esimerkiksi säätämällä
         * ylätunnisteen marginaali ja piilottamalla tyhjät elementit.
         *
         */
        this.AdjustLayout = function(){
            //Varmista, että tyhjät elementit eivät vie tilaa esityksen kankaalta:
            this.d.find("div,h1,h2,h3,h4,p").each(function(){
                if(
                    $(this).text().trim()=="" && 
                    !$(this).find("img").length && 
                    !$(this).hasClass("percent_bar") &&
                    !$(this).hasClass("denominator") &&
                    !$(this).hasClass("numerator")
                ){
                    $(this).hide();
                } 
            })
            var $header = this.$section.find("header");
            if($header.length){ 
                //Muokkaa sisällön marginaalia ylhäältä kattamaan ylätunniste ja lisä vielä 5px väliä
                this.$section.find("article").css({"margin-top":
                    $header.css("height").replace("px","")*1 + 5 + "px"});
            }
            var $aside = this.$section.find("aside");
            if($aside.length){ 
                //Muokkaa sisällön marginaalia ylhäältä kattamaan sivutunniste ja lisä' vielä 5px väliä
                this.$section.find("article").css({"margin-left":
                    $aside.css("width").replace("px","")*1 + 5 + "px"});
            }
        };

        /**
         *
         * Siirtyy seuraavaan diaan
         *
         */
        this.Next = function(){ 
            this.Move("next"); 
        };


        /**
         *
         * Siirtyy edelliseen diaan
         *
         */
        this.Prev = function(){ 
            this.Move("prev"); 
        };


        /**
         *
         * Suorittaa Next- tai Prev-metodeilla määritellyn siirtymisen
         * @param where string Suunta, johon liikutaan (prev/next)
         *
         */
        this.Move = function(where){
            this.Activate(this.d.find(".current"));
            //1. Liiku sisarelementtiin eli esimerkiksi saman laulun seuraavaan säkeistöön
            var $target = this.$slide[where]("article");
            //Jos viimeinen sisarelementti, siirry uuden laulun (tai otsikon tms.)
            //ensimmäiseen lapsielementtiin, jos taas ensimmäinen, siirry edellisen viimeiseen
            var first_or_last = where=="prev" ? "last-of-type" : "first-of-type";
            if($target.length==0) $target = this.$section[where]().find("article:" + first_or_last); 
            if($target.length>0){
                this.Activate($target);
                this.controls.contentlist.HighlightCurrentContents();
            } 
        };

        /**
         *
         * Toistaa tiettyjä dioja  vaihtamalla automaattisesti seuraavaan
         *
         * TODO: ota huomioon useasta diasta koostuvat, esim laulut
         *
         * @param byclass jos luuppaus tehdään css-luokan perusteella
         * @param byno jos luuppaus tehdään css-luokan perusteella
         *
         */
        this.LoopSlides = function(byclass, byno){
            var active_idx = undefined,
                $target = undefined;

            this.loop_id = setInterval(() => {
                if(byclass){
                    sections = this.d.find("section" + byclass);
                    $.each(sections,(idx, t) => {
                        if($(t).html() == this.$section.html()){
                            active_idx = idx;
                        }
                    });
                    if(active_idx !== undefined && (active_idx +1) < sections.length){
                        //Jos jäljellä luupattavien listassa dioja, siirry seuraavaan
                        $target = $($(sections[active_idx+1]).find("article:eq(0)"));
                    }
                    else{
                        // Muussa tapauksessa aloita alusta
                        $target = $($(sections[0]).find("article:eq(0)"));
                    }
                    this.Activate($target);
                    this.controls.contentlist.HighlightCurrentContents();
                }
            }, this.looptime);
        };

    };


    /**
     *
     * Hallitsee näppäinpainalluksia ohjainikkunassa ja esitysikkunassa
     * esityksen liikuttamiseksi
     *
     */
    function KeyHandler(e) {

        e = e || window.event;

        switch(e.keyCode){
            case 37:
                //nuoli ylös
            case 38:
                //nuoli vasemmalle
                Slides.Presentation.GetCurrentPresentation().Prev();
                break;
            case 39:
                //nuoli alas
            case 40:
                //nuoli oikealle
                Slides.Presentation.GetCurrentPresentation().Next();
                break;
        } 

    };

    /**
     *
     * Palauttaa esitysolion
     *
     */
    function GetCurrentPresentation(){
        return current_presentation;
    }

    /**
     *
     * Käynnistää esityksen
     *
     */
    function Initialize(){
        current_presentation = current_presentation || new Presentation();
        current_presentation.ToggleOpen();
    }


    return {
    
        Initialize,
        GetCurrentPresentation,
        KeyHandler
    
    }

}();

    

var Slides = Slides || {};

/**
 *
 * Diaesityksen hallinta, ohjaus ja elementit
 *
 */
Slides.Controls = function(){



    /**
     *
     * Lisää toiminnot oikean puolen (tyylien) hallintaelementteihin
     *
     */
    function AddRightControlsFunctionality(){
        //Sellaiset tyylisäätimet, joissa on vaihtoehtona joko säädeltävä arvo tai automaattinen arvo
        $(".control-toggler").parent().next("div").hide();
        $(".control-toggler").click(function(){
            $(this).parent().next("div").slideToggle();
            $(this).parent().next("div").find("section").toggleClass("controller-not-in-use");
            if(!$(this).parent().next("div").find("section").hasClass("controller-not-in-usel")){
                Slides.Styles.Controller.UpdateControllers(Slides.Presentation.GetCurrentPresentation());
            }
        });

        //Muuta fonttimuokkausten kohdetta, kun tätä säätelevää pudotusvalikkoa käytetään
        $("#layout-target_select").on("selectmenuchange", () => 
            Slides.Styles.Controller.UpdateControllers(Slides.Presentation.GetCurrentPresentation())
        );

        //TODO: anna spectrum-funktion argumenttina palette-niminen taulukoiden taulukko, jossa on käytössä olevat värit
        //align-items:center;
    }


    /**
     *
     * Lisää toiminnot vasemman puolen hallintaelementteihin
     *
     */
    function AddLeftControlsFunctionality(){
            $(".contentadder-heading").click(function(){ 
                //Avaa haluttu sisällönlisäysikkuna 
                Slides.Presentation.GetCurrentPresentation().controls[
                    $(this).parent().attr("class").split(" ")[1]
                ].OpenWidget($(this)); 
            });

            //Lisää widgettien lisäyslinkit kaikkiin vasemman valikon widgetteihin kerralla
            $(".side-menu-left .contentadder-open")
                .append(`<div class='addtoprescontrols'>
                    <a class='addtopreslink' href='javascript:void(0)'>Lisää esitykseen</a> 
                    <!--<a class='shownowlink' href='javascript:void(0)'> Näytä nyt</a> --></div>`);
            //Huolehdi siitä, että navigointipalkin linkkien klikkaus aktivoi oikeanpuolimmaisen menun
            $(".addtopreslink").click(function(){
                //avaa haluttu sisällönlisäysikkuna 
                Slides.Presentation.GetCurrentPresentation().controls[
                    $(this).parents(".contentadder").attr("class").split(" ")[1]
                ].AddToPres(); 
            });
            $(".contentadder-open").hide();
            //Piilota menut ja linkit joita ei vielä käytetä
            $("#controllink, #addcontentlink, #layoutlink").parent().hide();
            //Jos esitys käynnissä, luo mahdollisuus vaihtaa esityksen hallinnan ja sisällön lisäyksen välillä
            $("#controllink").click(function(){ 
                $(".preloader, .contentlist").toggle(); 
                if($(this).text()=="Valitse sisältö")
                    $(this).text("Hallitse esitystä");
                else
                    $(this).text("Valitse sisältö");
            });

    }


    /**
     *
     *
     * Näyttää suoraan valitun messun portaalinäkymässä
     *
     */
    function ShowServiceInPortal(){
        //var iframe = document.getElementById("service-data-iframe");
        var id = $(this).val();
        $("#service-data-iframe").on("load", function() {
            this.contentWindow.Portal.Service.SetServiceId(id);
            this.contentWindow.Portal.Service.Initialize();
            this.contentWindow.Utilities.HideUpperMenu();
        });
        $("#service-data-iframe").attr("src","../service.php");
    }


    /**
     *
     * Alustaa yleiset esitykseen liittyvät toiminnot
     *
     */
    function AddGeneralFunctionality(){
    
        $("#service-select").selectmenu();
        $("#service-select").on("selectmenuchange", ShowServiceInPortal);
        $(".side-menu-left, .side-menu-right, .nav_below").hide();
        $(".addlink").click(OpenMenu);
        $("#launchlink").click(Slides.Presentation.Initialize);


    }

    /**
     *
     * Avaa vasemman taai oikean päämenun
     *
     */
    function OpenMenu(){
        $(".nav_below").toggle();
        if($(this).parents("ul").hasClass("leftmenu")){
            $(".side-menu-left").toggle();
        }
        else {
            $(".side-menu-right").toggle();
        }
        $(this).parent().toggleClass("active-menutab");
    }

    /**
     *
     * Alustaa hallintaelementit käyttöön
     *
     *
     */
    function Initialize(){

        AddLeftControlsFunctionality();
        AddRightControlsFunctionality();
        AddGeneralFunctionality();

    }




    return {
    

        Initialize,
    
    }



}()

Slides = Slides || {};

/**
 *
 * Esityksen sisällysluettelo, jota klikkaamalla pääsee
 * liikkumaan eri sisältökohteiden välillä.
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 *
 */
Slides.ContentList = function(parent_presentation){

    this.pres = parent_presentation;

    /**
     * Hakee listan sisällöstä (esitysikkunan sisällön 
     * perusteella.)
     */
    this.GetContents = function(){
        this.headings = [];
        var self = this;
        this.pres.d.find("section").each(function(){
            var $firstslide = $(this).find("article:eq(0)");
            if($(this).hasClass("addedcontent")){
                //Jos kyseessä spontaanisti lisätty sisältö, luo kuvaava selitysteksti
                var prefix = "";
                switch($firstslide.attr("class").split(" ")[0]){
                    case "added-text":
                        prefix = "Lisätty teksti: ";
                        break;
                }
                var identifier = prefix + $firstslide.text().substr(0,10) + "...";
            }
            else{
                if($(this).hasClass("infocontent")){
                    //Jos kyseessä infodia, etsi kuvausta ja jos ei löydy, ota
                    //alimman tason otsikko. Jos ei sitäkään löydy, ota pala tekstiä.
                    if($(this).find("input[type='hidden']").length)
                        var identifier = $(this).find("input[type='hidden']").val();
                    else if ($(this).find("h3").text()!="")
                        var identifier = $(this).find("h3").text();
                    else
                        var identifier = $(this).find("div").text().substr(0, 10) + "...";
                }
                else{
                //Muuten ota ensimmäinen otsikkoelementti
                var identifier = $firstslide.find("h1, h2, h3, h4, h5").text();
                }
            }
            self.headings.push(identifier);
        })
        return this;
    };
    
    /**
     * Tulostaa (tai päivittää) listan sisällöistä navigointia varten
     */
    this.PrintContentList = function(){
        $("#original-content").html("");
        var $toc = $("<ul></ul>").prependTo("#original-content"),
            self = this
            info_classname = "event_info_at_beginning",
            number_of_infos = this.pres.d.find("section." + info_classname).length,
            $li = undefined;
        //Hae kaikki esityksessä olevat osiot ja tee niistä sisällysluettelo
        $.each(this.headings,function(idx, heading){
            $li = $("<li draggable='true'></li>")
            .text(heading)
            .appendTo($toc)
            .attr({"id":"content_" + idx})
            .click(function(){self.MovePresentationToSection($(this));});
            if(idx < number_of_infos){
                $li.addClass("info");
                //Lisätään merkki viimeisestä infodiasta
            }
        });
        //Lisää raahaamisjärjestelyä varten sisällysluettelon li-elementtien väliin tyhjät li-elementit
        $("<li class='drop-target'>").insertBefore("#original-content li");
        $("<li class='drop-target'>").appendTo($toc);
        this.DragAndDropContent();
        return this;
    };

    /**
     * Liikuta esitystä käyttäjän haluamaan osioon
     *
     * @param object launcher li-elementti (jqueryolio), jota klikkaamalla liikkuminen käynnistettiin
     *
     */
    this.MovePresentationToSection = function(launcher){
        //Tyhjennä vanhat esikatselusäkeistöt
        $("#verselist").html("");
        //Etsi esityksestä sisällysluettelon id-attribuutin numeron mukainen section-elementti ja siirry sen ensinmmäiseen osioon
        this.pres.Activate(this.pres.d.find("section:eq(" + launcher.attr("id").replace("content_","") + ") article:eq(0)"));
        var self = this;
        if(this.pres.$section.hasClass("song") || this.pres.$section.hasClass("bibletext")) this.PrintVerses();
        this.HighlightCurrentContents();
    };

    /**
     * Liikuta esitystä käyttäjän haluamaan säkeistöön
     *
     * @param object launcher li-elementti (jqueryolio), jota klikkaamalla liikkuminen käynnistettiin
     *
     */
    this.MovePresentationToVerse = function(launcher){
        if(!launcher.find("textarea").length){
            //Etsi esityksestä sisällysluettelon id-attribuutin numeron mukainen section-elementti ja siirry sen ensinmmäiseen osioon
            var offset = this.pres.$section.hasClass("bibletext") ? 0 : 1;
            this.pres.Activate(this.pres.d.find(".current")
                .removeClass("current")
                .parent().find("article:eq("+ (launcher.index() + offset) +")")
                .addClass("current"));
            this.HighlightCurrentContents();
        }
    };

    /**
     *
     * Korosta sisältölistasta esitysikkunassa aktiivisena oleva sisältö.
     *
     */
    this.HighlightCurrentContents = function(){
        //Etsitään ennen siirtymistä aktiivisena ollut segmentti
        var hlindex= NaN;
        var $hlsection = undefined;
        $("#original-content li:not(drop-target)").each(function(idx,li){ 
            if($(this).hasClass("highlight")){
                hlindex == idx; 
                $hlsection = $(li);
            }
        });
        if(hlindex!=this.pres.$section.index() || isNaN(hlindex)){
            //Jos siirrytty seuraavaan esityselementtiin  ta
            if($hlsection) $hlsection.removeClass("highlight");
            $("#original-content li:not(.drop-target):eq("+this.pres.$section.index()+")").addClass("highlight");
            if(hlindex!=this.pres.$section.index()){
                if(this.pres.$section.hasClass("song") || this.pres.$section.hasClass("bibletext")) this.PrintVerses();
                else $("#verselist").html("");
            }
        }
        //Säkeistöjen ym. korostaminen
        var $hlverse = $("#verselist .highlight:eq(0)");
        $hlverse.removeClass("highlight");
        console.log(this.pres.$slide);
        if(this.pres.$slide.attr("class").match("verse")){
            //Raamatunteksteillä: huomioi, että otsikko ekassa diassa
            var offset = this.pres.$slide.hasClass("bibleverse") ? 0 : 1;
            $("#verselist div:eq("+ (this.pres.$slide.index() - offset) +")").addClass("highlight");
        }
    };

    /**
     *
     * Tulosta säkeistöjen (tai esim. raamatunkohdan osien) lista, jos siirrytty seuraavaan / edeliseen lauluun  (/raamatunkohtaan)
     *
     */
    this.PrintVerses = function(){
        var self = this;
        $("#verselist").html("");
        //Raamatuntekstit: aloita jo ekasta diasta
        var verseslides = this.pres.$section.hasClass("bibletext") ? "" : ":gt(0)";
        this.pres.$section.find("article" + verseslides  + "").each(function(){
            var $editlink = $("<i class='fa fa-pencil'></i>").click(self.EditVerse.bind(self)),
                $removelink = $("<i class='fa fa-trash'></i>").click(self.RemoveVerse.bind(self));
            $("<div></div>")
            .text($(this).text())
            .appendTo("#verselist")
            .click(function(){self.MovePresentationToVerse($(this));})
            .append($editlink) 
            .append($removelink);
        });
    };

    /**
     *
     * Muokkaa (väliaikaisesti) säkeistöä ja sitä, miltä se näyttää esitysnäytöllä
     * TODO tallenna muutokset tietokantaan, jos niin halutaan
     *
     * @param ev tapahtuma
     *
     */
    this.EditVerse = function(ev){
        var $target = $(ev.target).parents("div:eq(0)"),
            text = $target.text().trim(),
            $button = $("<button>Tallenna</button>").click(this.SaveVerseEdit.bind(this));
        ev.stopPropagation();
        $target.html("")
            .append(`<textarea>${text}</textarea>`)
            .append($button);
    }

    /**
     *
     * Poista (väliaikaisesti) säkeistö esitysruudulta ja hallintaruudulta
     * TODO tallenna muutokset tietokantaan, jos niin halutaan
     *
     * @param ev tapahtuma
     *
     */
    this.RemoveVerse = function(ev){
        var $target = $(ev.target).parents("div:eq(0)"),
            verseindex = $target.index();

        ev.stopPropagation();

        if("laulu" == "laulu"){
            //TODO GetVerseIndex-funktio tms.
            verseindex += 1;
        }

        Slides.Presentation.GetCurrentPresentation()
            .$section.find("article:eq(" + verseindex + ")").remove();
        $target.remove();
    }

    /**
     *
     * Tallentaa säkeistöön tms. tehdyt muutokset näytettäväksi esityksessä
     *
     * @param ev tapahtuma
     *
     */
    this.SaveVerseEdit = function(ev){
        var $target = $(ev.target).parents("div:eq(0)"),
            text = $target.find("textarea").val(),
            html = "<p>" + text.replace(/\n/g,"<br>") + "</p>",
            $editlink = $("<i class='fa fa-pencil'></i>").click(this.EditVerse.bind(this)),
            verseindex = $target.index();

        ev.stopPropagation();

        if("laulu" == "laulu"){
            //TODO
            verseindex += 1;
        }

        Slides.Presentation.GetCurrentPresentation()
            .$section.find("article:eq(" + verseindex + ")").html(html)
        $target.html(text).append($editlink);

    };

    /**
     *
     * Mahdollistaa sen, että esityksen sisältöä voidaan järjestellä
     * uudelleen drag and drop -tyylillä.
     *
     */
    this.DragAndDropContent = function (){
        var self = this;
        //Luodaan mahdollisuus muuttaa järjestystä raahaamalla
        $(".contentlist li:not(.drop-target)").on("dragstart",function(){ 
            $(".contentlist li").addClass("drop-hide");
            //currently_dragged_no = $(this).find(".slot-number").text() * 1;
            $(this).removeClass("drop-hide");
            $(this).addClass("drag-highlight");
            currently_dragged_no = $(this).attr("id").replace("content_","")*1;
        });
        $(".drop-target")
            .on("dragover",function(event){
                event.preventDefault();  
                event.stopPropagation();
                $(this).addClass("drop-highlight").text("<-- Siirrä tähän");
            })
            .on("dragleave",function(event){
                event.preventDefault();  
                event.stopPropagation();
                $(this).text("").removeClass("drop-highlight");
            })
            .on("drop",function(event){
                event.preventDefault();  
                event.stopPropagation();
                //Tallennetaan muistiin pudotusvälin yläpuolisen segmentin numero
                try{
                    var prevno = $(this).prev().attr("id").replace("content_","")*1;
                }
                catch(e){
                    prevno = -1;
                }
                var segments_by_new_order = {};
                console.log("PREVNO: " + prevno);
                $("#original-content li:not(.drop-target)").each(function(){
                    //Lasketaan jokaisesta sisällysluettelon osasta, mikä on sen siirron jälkeinen numero
                    var thisno = $(this).attr("id").replace("content_","")*1;
                    var newno = thisno;
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
                    //Kopioi sisällöt esityksestä uuden järjestyksen mukaisesti olioon
                    segments_by_new_order[newno] = self.pres.d.find("section:eq(" + thisno +")").clone(true);
                    });
                //Tyhjennä vanha sisältö
                self.pres.d.find("main").html("");
                //Lataa vanha sisältö uudelleen uudessa järjestyksessä
                for(i=0;i<Object.keys(segments_by_new_order).length;i++){
                    self.pres.d.find("main").append(segments_by_new_order[i]);
                }
                self.pres.Activate(self.pres.d.find(".current"));
                self.GetContents().PrintContentList().HighlightCurrentContents();
            });
    }


};



Slides = Slides || {};

/**
 *
 * Diaesityksen ja sisällön hallinnan lähtökohtaiset luokat
 *
 */
Slides.Widgets = function(){

    /**
     * Olio, josta kaikki esityksen hallintawidgetit periytyvät.
     *
     * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
     * @param object loaded_content valmis ajax-ladattu sisältö
     *
     */
    Widget = function(parent_presentation){
        this.pres = parent_presentation;
        this.$loaded_content = undefined;
    };


    /**
     * Olio, josta kaikki sisältöä lisäävät hallintawidgetit periytyvät.
     *
     * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
     *
     */
    ContentAdder = function(parent_presentation){

        Widget.call(this, parent_presentation);

        /**
         * Avaa näkyville tyyppikohtaisen sisällön lisäysvalikon
         * @param object launcher otsikko, jota klikkaamalla laukaistiin
         */
        this.OpenWidget = function($launcher){
            $(this.adderclass + " .contentadder-open:eq(0)").slideToggle();
            //$launcher.
        };

        /**
         * Palauttaa section-elementin, jonka sisään sisältö luodaan
         *
         * @return object jquery-elementti, johon sisältö luodaan
         *
         */
        this.GiveContainer = function(){
            return $("<section class='" + this.addedclass + "'></section>");
        };

        /**
         * Tulosta paikat, joihin widgetillä luodun sisällön voi esityksessä syöttää 
         */
        this.AddToPres = function(){
            var self = this;
            //Poista väliaikaisesti segmenttien raahaamisen mahdollistavat li-elementtien välissä sijaitsevat li-elementit
            $(".drop-target").remove();
            $("#original-content li").addClass("set-new-content-list");
            //Lisää pseudo-li, jotta insertBefore toimisi myös viimeiselle sisältöelementille
            $("#original-content ul").append("<li></li>");
            //Lisää pseudolistaelementtiin myös klikkaustoiminto, joka sijoittaa uuden sisällön esitykseen
            $("<li class='add-here-option'>Lisää tähän</li>")
                .click(self.CreateSlideDOM.bind(self))
                .insertBefore("#original-content li");
            //Poista pseudo-li
            $("#original-content li:last-child").remove();
            //Utilities.BlurContent($("#original-content"));
        };

        /**
         *
         * Luo uusi dia / uudet diat ja sijoita ne esitykseen.
         *
         * @param ev klikkaustapahtuma
         *
         */
        this.CreateSlideDOM = function(ev){
            var $launcher = $(ev.target);
            //Luo sisältö
            this.CreateContent();
            //Määritä, mihin kohtaan sijoitetaan - sen perusteella, mones sisältölistan elementti on ennen klikattua linkkiä (tai jälkeen, jos klikattu ekaa)
            var inserthere = $launcher.prev().length > 0 ? {"where":"insertAfter","idx":1*$launcher.prev().attr("id").replace("content_","")} : {"where":"insertBefore","idx":1*$launcher.next().attr("id").replace("content_","")};
            //Sijoita aiemmin ladattu sisältö määrittelyn mukaiseen kohtaan itse esityksessä
            this.$loaded_content[inserthere.where](this.pres.d.find("section:eq("+ inserthere.idx +")"));
            //Siisti pois valikot:
            $("#original-content li").removeClass("set-new-content-list");
            $(".add-here-option, .blurcover").remove();
            //Päivitä sisältölista
            this.pres.controls.contentlist.GetContents().PrintContentList().HighlightCurrentContents();
            //Päivitä myös ulkoasunsäätölista
            this.pres.UpdateSegmentListForLayoutEditing();
        };

    };

    ContentAdder.prototype = Object.create(Widget.prototype);


    /**
     * Olio, josta kaikki esityksen tyylinhallintawidgetit periytyvät.
     * Perii Itse ContentAdder-widgetistä
     *
     * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
     *
     */
    LayoutWidget = function(parent_presentation){
        ContentAdder.call(this, parent_presentation);
        this.pres = parent_presentation;
        this.defaults = {};
        //jos luokalla on oma InitializeEvents-metodinsa, käynnistä se.
        if(this.hasOwnProperty("InitializeEvents"))
            this.InitializeEvents();
    };

    LayoutWidget.prototype = Object.create(ContentAdder.prototype);

    return {
    
        Widget,
        LayoutWidget,
        ContentAdder
    }

}();

Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.ContentAdders = Slides.Widgets.ContentAdders || {};

/**
 *
 * Tekstidian lisäävä widget
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param string adderclass sisällön lisävän widgetin css-luokka
 * @param string addedclass itse sisällön css-luokka
 *
 */
Slides.Widgets.ContentAdders.TextContentAdder = function(parent_presentation){

    Slides.Widgets.ContentAdder.call(this, parent_presentation);

    this.adderclass = ".textcontentadder";
    this.addedclass = "addedcontent";

    /**
     * Luo tekstidia käyttäjän antaman inputin pohjalta
     */
    this.CreateContent = function(){
        var $content = $("<article class='added-text'></article>").text($(".textcontentadder textarea").val());
        this.$loaded_content =  this.GiveContainer().append($content);
    };

}

Slides.Widgets.ContentAdders.TextContentAdder.prototype = Object.create(Slides.Widgets.ContentAdder.prototype);

Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.ContentAdders = Slides.Widgets.ContentAdders || {};

/**
 *
 * Raamattusisällöt lisäävä widget
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param adderclass string css-luokka, josta widgetin sijainnin sivulla tunnistaa
 *
 */
Slides.Widgets.ContentAdders.BibleContentAdder = function(parent_presentation){

    Slides.Widgets.ContentAdder.call(this, parent_presentation);

    this.adderclass = ".biblecontentadder";
    this.addedclass = "bibletext";
    this.address =  {"start":{},"end":{}};

    /**
     *
     * Alustaa toiminnallisuuden 
     *
     */
    this.Initialize = function(){
        this.pickerpair = new BibleModule.PickerPair();
        this.pickerpair.Initialize($("#biblepicker"));
        this.pickerpair.SetAsSingle().SetCallBack(this.LoadContent.bind(this));
        $(".biblecontentadder .addtoprescontrols").hide().insertAfter("#biblepicker");
        $(".biblecontentadder .pickerpair_controls").show();
    };

    /**
     * Luo tekstidia käyttäjän antaman inputin pohjalta
     *
     *
     */
    this.CreateContent = function(){
        var address = this.pickerpair.GetHumanReadableAddress(),
            $section = $(`<section class="bibletext Teksti">
                            <article class="bibleverse">
                                <h2>${address}</h2>
                                <p>${this.verses[0]}</p>
                            </article>
                        </section>`);

        if(this.verses.length > 1){
            $section.append(
                this.verses.slice(1,).map(
                    (verse) => `<article class='bibleverse'><p>${verse}</p></article>`
                )
            );
        }

        this.$loaded_content = $section;
    };



    /**
     *
     * Luo jquery-elementin, joka syötetään Raamatunkohdan otsikoksi
     *
     */
    this.CreateTitle = function(){
        var self = this;
        var addresstext = "";
        this.UpdateAddress();
        $.each(this.address.start, function(key,val){
            var sep = key == "chapter" ? ":" : " ";
            addresstext += val + sep; });
        addresstext = addresstext.trim();

        if (!(self.address.start.book == self.address.end.book && 
            self.address.start.chapter == self.address.end.chapter && 
            self.address.start.verse == self.address.end.verse)){
                //Jos ei sama alku- ja loppujae
                if (self.address.start.chapter == self.address.end.chapter){
                    //Jos sama luku
                    addresstext += "-" + self.address.end.verse;
                }
                else{
                    //Jos eri luku
                    addresstext += "-" + self.address.end.chapter  + ":"  + self.address.end.verse;
                }
            }
        this.$title = $("<h2></h2>").text(addresstext);
        };

    /**
     * Lataa varsinainen raamattusisältö
     */
    this.LoadContent = function(){
        var path = Utilities.GetAjaxPath("Loader.php"),
            start = this.pickerpair.startpicker.GetAddress(),
            end = this.pickerpair.endpicker.GetAddress();

        $.getJSON(path,{
            action: "load_grouped_verses",
            testament: this.pickerpair.startpicker.testament,
            start: [start.book, start.chapter, start.verse],
            end: [end.book, end.chapter, end.verse]
        }, (verses) => {
            this.verses = verses;
            this.AddToPres();
        }
        );
    };

} 

Slides.Widgets.ContentAdders.BibleContentAdder.prototype = Object.create(Slides.Widgets.ContentAdder.prototype);


Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.ContentAdders = Slides.Widgets.ContentAdders || {};

/**
 *
 * Raamattusisällöt lisäävä widget
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param adderclass string css-luokka, josta widgetin sijainnin sivulla tunnistaa
 *
 */
Slides.Widgets.ContentAdders.SongContentAdder = function(parent_presentation) {

    var path = Utilities.GetAjaxPath("Loader.php");
    Slides.Widgets.ContentAdder.call(this, parent_presentation);

    this.adderclass = ".songcontentadder";
    this.addedclass = "song";

    //Parametrit laulujen automaattista täydennystä varten:
    this.autocomp = {
        source : Portal.SongSlots.LoadSongTitles,
        minLength : 2,
        select: (event, input) => this.CreateContent(input.item.value)
        };

    
    /**
     * Luo lauludia käyttäjän valinnan pohjalta
     *
     * @param string songname etsittävän laulun nimi (ainoastaan jos kutsuttu autocompletin select-parametrilla)
     *
     */
    this.CreateContent = function(songname){
        //TODO: lataa laulut id:itten perusteella
        var $container = this.GiveContainer(),
            self=this,
            path = Utilities.GetAjaxPath("Loader.php");
        $(".songcontentadder .addtoprescontrols").hide();
        if(songname == undefined) songname = $("#songsearch").val();
        $.getJSON(path,
            {
                action: "load_song_content_by_title",
                title: songname,
            },
            function(data){
                if(data.length){
                    $container.append(self.CreateTitleSlide(songname));
                    //Säkeistöt
                    $.each(data,function(idx,verse){
                        $container.append("<article class='verse'><p> " + verse.replace(/\n/g,"\n<br>")  + "</p></article>")
                    });
                    //Tallenna valmis data olion $loaded_content-parametriin
                    self.$loaded_content = $container;
                    $(".songcontentadder .addtoprescontrols").show();
                }
            });
    };

    /**
     * Luo laulun otsikkodia (sisältää mahdolliset tekijätiedot)
     */
    this.CreateTitleSlide = function(title, song, lyrics, translator){
        //Luo otsikko ja div mahdollisille metatiedoille
        var $slide = $("<article></article>").append("<h2>" + title + "</h2>").append("<div class='byline'></div>");
        if(song !== undefined) $slide.find(".byline").append("<div> Säv. " + song  + "</div>");
        if(lyrics !== undefined) $slide.find(".byline").append("<div> San. " + lyrics  + "</div>");
        if(translator !== undefined) $slide.find(".byline").append("<div> Suom. " + translator  + "</div>");
        return $slide;
    };

};

Slides.Widgets.ContentAdders.SongContentAdder.prototype = Object.create(Slides.Widgets.ContentAdder.prototype);

Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.ContentAdders = Slides.Widgets.ContentAdders || {};

/**
 *
 * Tekstidian lisäävä widget
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param string adderclass sisällön lisävän widgetin css-luokka
 * @param string addedclass itse sisällön css-luokka
 *
 */
Slides.Widgets.ContentAdders.ImageAdder = function(parent_presentation){

    Slides.Widgets.ContentAdder.call(this, parent_presentation);

    this.adderclass = ".imageadder";
    this.addedclass = "addedcontent";

    /**
     * Luo kuvadian
     */
    this.CreateContent = function(){
        //var $content = $("<article class='added-text'></article>").text($(".textcontentadder textarea").val());
        //this.$loaded_content =  this.GiveContainer().append($content);
    };

    /**
     *
     * Alustaa toiminnallisuuden 
     *
     */
    this.Initialize = function(){
        var reader = new FileReader()
            self = this;
        $("#imgadder_pick_local").on("change", () => {
            reader.onload = function (e) {
                var filename = $("#imgadder_pick_local").val().replace(/.*(\/|\\)([^.]+.\w+)/,"$2");
                self.$loaded_content = $(`<section class="infocontent Teksti" style="display: flex;">
                    <article class="">
                        <input type="hidden" value="${filename}">
                        <div class="img-wholescreen">
                            <img src=${e.target.result}>
                        </div>
                    </article>
                </section>`);
            }
            reader.readAsDataURL($("#imgadder_pick_local").get(0).files[0]);
        });
    };

}

Slides.Widgets.ContentAdders.ImageAdder.prototype = Object.create(Slides.Widgets.ContentAdder.prototype);

Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.ContentAdders = Slides.Widgets.ContentAdders || {};

/**
 *
 * Tekstidian lisäävä widget
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param string adderclass sisällön lisävän widgetin css-luokka
 * @param string addedclass itse sisällön css-luokka
 *
 */
Slides.Widgets.ContentAdders.YoutubeAdder = function(parent_presentation){

    Slides.Widgets.ContentAdder.call(this, parent_presentation);

    this.adderclass = ".youtubeadder";
    this.addedclass = "addedcontent";

    /**
     *
     * Luo youtubedian.
     *
     */
    this.CreateContent = function(){
        var url = $('#youtubeadder_url').val().replace("watch?v=","embed/");
        this.$loaded_content = $(`
            <section class='infocontent Teksti'>
                <article class=''>
                    <input type='hidden' value='Youtube-video'>
                        <iframe width="560" height="315" src="${url}" 
                        frameborder="0" allow="autoplay; encrypted-media" 
                        allowfullscreen></iframe>
                </article>
            </section>
            `)
    };

}

Slides.Widgets.ContentAdders.YoutubeAdder.prototype = Object.create(Slides.Widgets.ContentAdder.prototype);

Slides = Slides || {};
Slides.Styles = Slides.Styles || {};

Slides.Styles.Controller = function(){

    /**
     *
     * Tallentaa esitysikkunaan ladatut tyylit sekä mahdollistaa niiden muokkauksen ja
     * muokkausten tallentamisen
     *
     * @param object pres Esitys, jonka tyylejä hallitaan
     * @param object rule_indexes hash, joka tallentaa sen, minkänumeroinen sääntö (säännöt) mistäkin tägistä tai luokasta vastaa
     *
     */
    var StyleController = function(pres){
        this.pres = pres;
        this.rule_indexes = {};

        /**
         *
         * Hae alkuperäiset, esityksessä oletuksena käytetyt tyylit
         *
         */
        this.GetOriginalStyles = function(){
            //TODO: explorerissa pelkkä rules
            this.rules = {};
            var self = this;
            //Yhdistä alkuperäiset tyylit ja tietokanasta ladatut muokatut tyylit
            for(var key in this.pres.dom.styleSheets[0].cssRules){
                this.rules[key] = this.pres.dom.styleSheets[0].cssRules[key];
            }
            for(var key in this.pres.dom.styleSheets[1].cssRules){
                this.rules[(key*1)+(this.rules.length)] = this.pres.dom.styleSheets[1].cssRules[key];
            }
            this.rule_indexes = {};
            // Etsi tämän jälkeen näitä vastaavat cssRules-taulukon indeksit 
            for(rule_idx in this.rules){
                if(!isNaN(rule_idx*1)){
                    rule = this.rules[rule_idx];
                    if(rule.selectorText){
                        this.rule_indexes[rule.selectorText] = rule_idx;
                    }
                }
            }
            //$.each(self.rules,function(idx,rule){
            //    console.log(idx + ": " + rule);
            //    if(rule.selectorText){
            //        self.rule_indexes[rule.selectorText] = idx;
            //        console.log(rule.selectorText);
            //    }
            //});
        
        };

        /**
         * Palauttaa level-attribuutin mukaisen css-säännön
         *
         * @param string selector css-selectori, jonka perusteella sääntö etsitään
         *
         * @returns object selector-attribuutin mukaista selektoria vastaava css-tyyli
         *
         */
        this.GetRule = function(selector){
               if(this.rules[this.rule_indexes[selector]]==undefined){
                   console.log("Warning: no such css rule as >>" + selector + "<<");
               }
               return this.rules[this.rule_indexes[selector]];
        };

        /**
         * Asettaa sen, miten laajasti käyttäjä on muokkaamassa ulkoasua.
         * Oletuksena koko esityksen laajuisesti, mutta valinnan mukaan myös joko
         * segmenttityyppi- tai segmenttikohtaisesti.  Käytännössä etsii kaikki ne
         * kohteet, joita muutos koskee ja palauttaa yksittäisille
         * muuttajafunktioille listan näistä kohteista.
         *
         * @param string level sen tekstitason (h1,h2,h3,p,body) nimi, jota muokkaus koskee
         * @param boolean force_all_levels jos pakotetaan muokkaamaan jokaista tekstitasoa erikseen (tämä on välttämätöntä, jos haluaa esim. muokata kerralla kaikkien tekstielementtien väriä)
         * @param string contentparent Määritelläänkö tyylimuutos erikseen sisällön taustalla olevalle elementille eikä koko ruudulle. Jos määritellään, arvoksi annetaan <välilyonti> + article
         *
         * @return Array lista säännöistä, joita muutos koskee
         *
         */
        this.SetEditTarget = function(level, force_all_levels, contentparent){
            if(force_all_levels==undefined) force_all_levels = false;
            if(contentparent==undefined) contentparent = "";
            var target = $("#layout-target_select").val();
            var self = this;
            var rules_to_edit = [];
            //Tarkista, onko kohteena luokka, ja jos on niin mikä
            var class_as_target = self.pres.classes.indexOf(target);

            if(level=="nolevel"){
                //A. Jos kyseessä ominaisuus, jota ei muokata tekstitasokohtaisesti
                if(target=="Koko esitys"){
                    $.each(self.pres.classes, function(idx,segment_type){
                        //Lisää kaikki eri segmenttityypit muokattavien sääntöjen listalle
                        rules_to_edit.push(self.GetRule("." + segment_type + contentparent)); 
                    });
                }
                else if(class_as_target>-1){
                    rules_to_edit.push(self.GetRule("." + self.pres.classes[class_as_target] + contentparent));
                }
            }
            else if(level=="body"){
                //B. Jos muokataan KAIKKIA tekstitasoja
                rules_to_edit.push(self.GetRule("body"));

                if(force_all_levels){
                    if(target=="Koko esitys"){
                        //Jos pakko muokata kaikkia tekstitasoja ja lisäksi kaikkia segmenttityyppejä
                        var classes = self.pres.classes;
                    }
                    else{
                        //Jos pakko muokata kaikkia tekstitasoja mutta vain tiettyä segmenttityyppiä
                        var classes = [self.pres.classes[class_as_target]];
                    }
                    $.each(classes.concat(["body"]), function(idx,segment_type){
                        //Lisää kaikki eri segmenttityypit muokattavien sääntöjen listalle
                        //Huomaa tyhjä 'tekstitaso' joka tarkoittaa tapauksia kuten ".song fontFamily" (tämä sen takia, että kaikki säätimet päivittyisivät niin kuin pitää)
                        $.each(["", "h1","h2","h3","p","img"],function(l_idx, lev){
                            //Lisää kaikki tekstitasot muokattavien sääntöjen listalle
                            var selector = (segment_type!="body" ? "."  : "") + segment_type + " " + lev;
                            rules_to_edit.push(self.GetRule(selector.trim())); 
                        });
                    });
                }
            }
            else{
                //C. Jos muokataan  VAIN TIETTYJÄ tekstitasoja tai esim. section-elementtejä

                //Koska segmenttityypit ovat section-tason elementtejä, poista näistä määrittelyistä erikseen sana "section"
                if(level=="section"){
                    level = "";
                    //Lisää erikseen body-tason sääntö, jos kyse section-elementeistä
                    if (target=="Koko esitys") rules_to_edit.push(self.GetRule("body section")); 
                }

                if(target=="Koko esitys"){
                    //1. Jos laajuus on koko esitys
                    $.each(self.pres.classes.concat(["body"]),function(idx,segment_type){
                        //Lisää kaikki eri segmenttityypit muokattavien sääntöjen listalle
                        var selector = (segment_type!="body" ? "."  : "") + segment_type + " " + level;
                        rules_to_edit.push(self.GetRule(selector.trim())); 
                    });
                }
                else if(class_as_target>-1){
                    //2. Jos laajuutena segmenttityypit
                        var selector = "." + self.pres.classes[class_as_target] + " " + level;
                        rules_to_edit.push(self.GetRule(selector.trim()));
                }
                else{
                    //3. Jos segmenttikohtaisesti
                    //TODO: tähän tarvitaan monimutkaisempaa logiikkaa...
                }
            }
            //Poista lopuksi säännöt, joita ei oikeasti ole, mutta joita silti yritetty hakea
            real_rules = [];
            $.each(rules_to_edit,function(idx,rule){   
                if(rule!==undefined) real_rules.push(rule)
            })

            return real_rules;
        };

    }


    /*
     * Päivittää tyylisäädinten arvot sen pohjalta, mitä tallennetuissa
     * tyylipohjissa tai lennosta tehdyissä muokkauksissa on asetettu.
     *
     * @param object pres esitysolio
     *
     */
    function UpdateControllers(pres){
        var segment_type = $("#layout-target_select").val();
        if(segment_type=="Koko esitys") segment_type = "body";

        //Päivitä kaikki säätimet tallennettujen tai muokattujen css-sääntöjen mukaisiin arvoihin
        $(".fontcontroller, .positioncontroller").find(".adjuster").each(function(){
            //Etsi ensin kustakin säätimestä, mitä ominaisuutta sillä säädellään
            var target =$(this).parents(".fontcontroller,.positioncontroller").attr("class").match(/(\w+)-changer-parent/i)[1];
            //Etsi myös, mitä tekstitasoa tämä säädin säätää
            var level =$(this).parents(".changer-parent").attr("class").match(/level-(\w+)/i)[1];
            var this_segment_type = (segment_type=="body" ? segment_type : "." + segment_type);
            var thislevel = (level=="body" ? this_segment_type : this_segment_type +  " " + level);

            //Määrittele ensin, onko tämä säädin käytössä
            if(!$(this).parents(".positioncontroller, .fontcontroller").hasClass("controller-not-in-use")){

                if(pres.classes.indexOf(segment_type)>-1 && level == "section"){
                    //Huomioi, että section-tason säännöillä section-sana jätetään segmenttityyppikohtaisissa luokissa toistamatta
                    thislevel = thislevel.replace(/section/,"").trim();
                }
                if($(this).hasClass("slider")){
                    //Numeeriset säätimet---------------------------------------------
                    if($(this).parents("section").hasClass("eltype-section")){
                        //Huom: section-tason elementeissä valitse aina sama *body selection* -css-sääntö
                        var newval = pres.styles.GetRule("body section").style[target].replace(/(em|vh|vw).*/,"")*1;
                    }
                    else{
                        var newval = pres.styles.GetRule(thislevel).style[target].replace(/(em|vh|vw).*/,"")*1;
                    }
                    // Jos ei saatu järkevää arvoa, käytetään oletusta
                    if(isNaN(newval)){
                        newval = $(this).parents("div").find(".defaultvalue").val()*1;
                    }
                    $(this).slider("value",newval);
                }
                else if($(this).hasClass("spectrum")){
                    //Värisäätimet---------------------------------------------
                    if(["border"].indexOf(target)>-1){
                        $(this).spectrum("set",pres.styles.GetRule(thislevel).style[target].replace(/.*solid /,""));
                    }
                    else{
                        $(this).spectrum("set",pres.styles.GetRule(thislevel).style[target]);
                    }
                }
                else if($(this).hasClass("select")){
                    //Pudotusvalikot---------------------------------------------
                    var selectval = pres.styles.GetRule(thislevel).style[target];
                    //Poista ylimääräiset lainausmerkit
                    var selectval = selectval.replace(/\"/g,"");
                    if(selectval){
                        //Fontteja aseteltaessa poista pilkulla erotellut fallbackit kuten Roboto, serif
                        if(target=="fontFamily") selectval = selectval.replace(/,.*/,"");
                        $(this).val((selectval)).selectmenu("refresh");
                    }
                }
            }
            else{
                //Jos halutaan palauttaa asetus auto-asentoon ja esitys on jo käynnissä
                var controllername = ($(this).parents(".fontcontroller, .positioncontroller").hasClass("fontcontroller") ? "fontchanger" : "positionchanger");
                if(pres.controls.hasOwnProperty(controllername))
                    pres.controls[controllername].Change($(this),"auto");
            }
        });

        Portal.PercentBar.UpdateStyles();
    }


    return {
    
        StyleController,
        UpdateControllers
    }

}();



Slides = Slides || {};
Slides.Styles = Slides.Styles || {};

/**
 *
 * Oliot, jotka mahdollistavat fontteja koskevat tyylimuutokset.
 */
Slides.Styles.FontControllers = function(){

    /**
     * Olio, joka mahdollistaa fontteja koskevat tyylimuutokset.
     *
     * Kukin widget on määritelty controls.html-tiedostossa seuraavassa muodossa:
     * 
     * <section class="subcontroller changertype-[TYYPPI] [CSS-ominaisuus]-changer-parent">
     *     <input type="hidden" value="0.1" class="slider-step"></input>
     *     <h3 class="subwindow-opener">Koko</h3>
     * </section>
     *
     * Näiden tietojen perusteella määritellään, onko kyseessä numeerinen arvo kuten fonttikoko,
     * väri vai jokin muu tyyppi
     *
     * @param object $parent_el jquery-esitys section-elementistä, joka on merkattu .fontcontroller-css-luokalla 
     * @param object parent_controller Fonttien muokkausta hallinnoiva olio
     * @param boolean add_separate_div lisätäänkö tästä widgetistä oma erillinen dom-elementtinä
     * @param string css_property se css-ominaisuus, jota muokataan  (esim.
     * fontSize). Tämä on javascriptin style-attribuutin mukainen ja napataan
     * [TYYPPI]-changer-parent-css-luokasta
     *
     */
    var FontController = function($parent_el, parent_controller, add_separate_div){
        this.$parent_el = $parent_el;
        this.parent_controller = parent_controller;
        this.css_property= $parent_el.attr("class").match(/(\w+-changer)-parent/i)[1]
        //Ympyröi säätimet vielä yhdellä divillä, jotta ne voidaan helposti näyttää ja piilottaa
        if(add_separate_div)
            this.$container = $("<div>").appendTo(this.$parent_el);


        /**
         * Lisää yhtä tiettyä tekstitasoa kontrolloivan säätimen otsikoineen.
         *
         * @param string level tekstitaso, jota muokataan (h1, h2, p...)
         * @param string label miten taso käyttäjälle esitetään (1-otsikko, leipäteksti,...)
         */
        this.AddTextLevel = function(level, label){
            var self = this;
            //Lisää myös otsikko ja liitä mukaan varsinaiseen html-tiedostoon
            $("<div class='adjuster-parent changer-parent level-" + level + "'>")
                .append($("<div>" + label + "</div>"))
                .append(self.GetAdjuster())
                .appendTo(self.$container);
        };
    };


    /**
     * Numeerisia arvoja kuten fonttikokoa muuttava olio
     *
     * @param object $parent_el jquery-esitys section-elementistä, joka on merkattu .fontcontroller-css-luokalla 
     * @param object parent_controller Fonttien muokkausta hallinnoiva olio
     * @param boolean add_separate_div lisätäänkö tästä widgetistä oma erillinen dom-elementtinä
     *
     */
    var NumericFontController = function($parent_el, parent_controller, add_separate_div){
        FontController.call(this, $parent_el, parent_controller, add_separate_div);
        var self = this;
        //Hae se määrä, minkä verran yksi liukusäätimen askel css-arvoa muuttaa
        this.step = $parent_el.find(".slider-step").val()*1;
        this.min = ($parent_el.find(".slider-min").length>0 ? $parent_el.find(".slider-min").val()*1 : 0);
        this.max = ($parent_el.find(".slider-max").length>0 ? $parent_el.find(".slider-max").val()*1 : 10*self.step*5);
        //Hae mahdollisesti poikkeava muutoksen yksikkö
        this.unit = ($parent_el.find(".slider-unit").length>0 ? $parent_el.find(".slider-unit").val(): "em");

        this.slider_options = {
                  slide: function( event, ui ) {
                      self.parent_controller.Change($(this),ui.value + self.unit);
                  },
                  min:self.min,
                  max: self.max,
                  step: self.step,
                  value:[0] // Tämä 0 on vain väliaikainen ja muuttuu UpdateControllers-metodin myötä
        };

        /**
         * Luo varsinaisen säätimen, jolla css-arvoja ja -ominaisuuksia  muutetaan. Numeerisissa
         * tapauksissa tämä on jquery-ui:n slider-plugin.
         */
        this.GetAdjuster = function(){
            var self = this;
            $adjuster = $("<div class='slider adjuster " + self.css_property + "'></div>");
            $adjuster.slider(self.slider_options);
            return $adjuster;
        
        };

    };

    NumericFontController.prototype = Object.create(FontController.prototype);


    /**
     * Väriä koskevia arvoja kuten fontin etu-/taustaväriä muuttava olio
     *
     * @param object $parent_el jquery-esitys section-elementistä, joka on merkattu .fontcontroller-css-luokalla 
     * @param object parent_controller Fonttien muokkausta hallinnoiva olio
     * @param boolean add_separate_div lisätäänkö tästä widgetistä oma erillinen dom-elementtinä
     *
     */
    var ColorFontController = function($parent_el, parent_controller, add_separate_div){
        FontController.call(this, $parent_el, parent_controller, add_separate_div);

        /**
         * Luo varsinaisen säätimen, jolla css-arvoja ja -ominaisuuksia  muutetaan. Numeerisissa
         * tapauksissa tämä on jquery-ui:n slider-plugin.
         *
         * @return object jquery-esitys <div>-elementistä, jonka sisällä varsinainen säädin on
         */
        this.GetAdjuster = function(){
            var self = this;
            $adjuster = $("<div class='"  + self.css_property +  "'></div>");
            var $colorinput = $("<input type='text' class='"  + self.css_property + "-changer  adjuster spectrum'>");
            $colorinput.appendTo($adjuster);
            $adjuster.find(".spectrum")
            .spectrum({ showAlpha:true })
            .on("change",function(){
                self.parent_controller.Change($(this), $(this).spectrum("get").toRgbString())
            });
            return $adjuster;
        };

    }

    ColorFontController.prototype = Object.create(FontController.prototype);

    /**
     * Select-menulla säädeltäviä kategorisia arvoja muuttava olio
     *
     * @param object $parent_el jquery-esitys section-elementistä, joka on merkattu .fontcontroller-css-luokalla 
     * @param object parent_controller Fonttien muokkausta hallinnoiva olio
     * @param boolean add_separate_div lisätäänkö tästä widgetistä oma erillinen dom-elementtinä
     *
     */
    var SelectFontController = function($parent_el, parent_controller, add_separate_div){

        FontController.call(this, $parent_el, parent_controller, add_separate_div);

        /**
         * Luo varsinaisen säätimen, jolla css-arvoja ja -ominaisuuksia  muutetaan.
         * Select-tapapuksessa tämä on select-elementti, jonka arvot saadaan options-luokalla merkitystä
         * input-elementistä. (TODO: vaihtoehtoisesti voidaan asettaa erilliset value-arvot)
         * Näissä input-elementeissä select-elementin tulevat arvot on erotettu toisistaan pilkulla.
         *
         * @return object jquery-esitys <div>-elementistä, jonka sisällä varsinainen säädin on
         */
        this.GetAdjuster = function(){
            var self = this;
            $adjuster = $("<div class='"  + self.css_property +  "'></div>");
            var values = (this.$parent_el.find(".values").length ? this.$parent_el.find(".values").val().split(",") : false);
            var $select = $("<select class='adjuster select " + self.css_property + "'>").appendTo($adjuster);
            $.each(this.$parent_el.find(".options").val().split(","),function(idx,option){
                var $option = $("<option>" + option + "</option>");
                //Jos asetettu erikseen option-elementin arvot
                if(values) $option.attr({"value":values[idx].trim()});
                $select.append($option);
            });

            $select
                .selectmenu()
                .on("selectmenuchange",function(){self.parent_controller.Change($(this),$(this).val())});

            return $adjuster;
        };

    }

    SelectFontController.prototype = Object.create(FontController.prototype);


    /**
     * Tapaukset, joissa säädetään sekä jotakin numeerista arvoa kuten reunuksen paksuutta
     * että väriä. Tämä on oma olionsa, joka ei peri FontController-luokasta, vaan
     * sisältää ainostaan samannimisen AddTextLevel-metodin kun FontController-luokan
     * oliot. Värin ja koon muokkaus sen sijaan ovat molemmat omio FontController-olioita,
     * jotka liitetään tähänh luokkaan numeric_controller- ja
     * color_controller-ominaisuuksien kautta.
     *
     * @param object $el jquery-esitys section-elementistä, joka on merkattu .fontcontroller-css-luokalla 
     * @param object parent_controller Fonttien muokkausta hallinnoiva olio
     *
     */
    var NumericAndColorFontController = function($el, parent_controller){
        this.numeric_controller = new NumericFontController($el, parent_controller, false);
        this.color_controller = new ColorFontController($el, parent_controller, false);
        this.$container = $("<div>").appendTo($el);

        /**
         * Lisää yhtä tiettyä tekstitasoa kontrolloivan säätimen otsikoineen.
         *
         * @param string level tekstitaso, jota muokataan (h1, h2, p...)
         * @param string label miten taso käyttäjälle esitetään (1-otsikko, leipäteksti,...)
         */
        this.AddTextLevel = function(level, label){
            var self = this;
            //Lisää myös otsikko ja liitä mukaan varsinaiseen html-tiedostoon
            $("<div class='adjuster-parent changer-parent level-" + level + "'>")
                .append($("<div>" + label + "</div>"))
                .append(self.numeric_controller.GetAdjuster())
                .append(self.color_controller.GetAdjuster())
                .appendTo(self.$container);
        };
    };



    /**
     *
     * Apufunktio sen määrittelyyn, mikä FontController-oliosta periytyvistä
     * olioista luodaan. Tyyppi on määriteltynä changertype-xxxx-css-luokkaan.
     * Huomaa, että tämänhetkinen regex vaatii, että tyypin nimi (xxxx) koostuu
     * pelkistä kirjaimista eikä esim. alaviivoista.
     *
     * @param object $el jquery-esitys section-elementistä, joka on merkattu .fontcontroller-css-luokalla 
     * @param object parent_controller Fonttien muokkausta hallinnoiva olio
     *
     */
    function Create($el, parent_controller){
        var subc_type = $el.attr("class").match(/changertype-(\w+)/i)[1];
        switch(subc_type){
            case "numeric":
                var controller = new NumericFontController($el, parent_controller, true);
                break;
            case "color":
                var controller = new ColorFontController($el, parent_controller, true);
                break;
            case "numericcolor":
                var controller = new NumericAndColorFontController($el, parent_controller);
                break;
            case "select":
                var controller = new SelectFontController($el, parent_controller, true);
                break;
        }
        return controller;
    }


    return {
        Create
    };

}();



Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.StyleWidgets = Slides.Widgets.StyleWidgets || {};

/**
 * Layoutwidget, jolla muutetaan esityksen taustakuvaa tai taustaväriä. Mahdollistaa
 * myös segmenttikohtaisten taustakuvien määrittämisen
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param string adderclass sisällön lisävän widgetin css-luokka
 *
 */
Slides.Widgets.StyleWidgets.BackgroundChanger = function(parent_presentation){
    Slides.Widgets.LayoutWidget.call(this, parent_presentation);
    this.adderclass = ".backgroundchanger";

    /**
     *
     * Lataa kaikki tähän widgettiin liittyvät tapahtumat
     *
     */
    this.InitializeEvents = function(){
        var self = this;
        $(".imgselect, .colselect").hide();
        $("[name='img_or_color']").click(function(){
            //Näytä käyttäjän valinnasta riippuen joko taustakuvan tai -värin valntalaatikko
            $(this).get()[0].checked = true;
            if($("[name='img_or_color']:checked").val() == "img") {
                $(".backgroundchanger .imgselect").show();
                $(".backgroundchanger .colselect").hide();
            }
            else{
                $(".backgroundchanger .imgselect").hide();
                $(".backgroundchanger .colselect").show();
            }
        })
        $(".bg-switcher .layout-save-changes").click(function(){self.ChangeBackground()});
        $(".content-bg-switcher .layout-save-changes").click(function(){self.ChangeContentBackground()});
        $(".backgroundchanger").find(".spectrum").spectrum({ showAlpha:true });

    };




    /**
     *
     * Lataa saatavilla olevat taustakuvat tietokannasta
     *
     */
    this.LoadLocalBackgrounds = function(){
        var path = Utilities.GetAjaxPath("Loader.php");
        //Tyhjennä vanha select-elementin sisältö kaiken varalta
        $("#general-bg-select").html("").on("change",function(){
            //Lisää esikatselumahdollisuus 
            Utilities.Preview($(this).parents(".with-preview"), $(this).val())
            //Lataa kuvaus ko. kuvasta
            $.getJSON(path,{
                //"asset_type":"backgrounds",
                "action": "get_slide_image_description",
                "filename":$(this).val()
                },
                    function(data){ 
                        $("#general-bg-select").parent().find("p").text(data[0]);
                    });
        });
        //Lataa data select-elementtiin
        $.getJSON(path, {
                "action":"get_slide_image_names"
                },
                function(data){
                    var options = data.map((bgname) => `<option>${bgname.filename}</option>`);
                    $("#general-bg-select").append(options);
                });

        };

            
    /**
     *
     * Toteuttaa käyttäjän tekemät koko ruudun taustoja koskevat muutokset, ja asettaa taustaksi
     * joko kuvan tai värin.
     *
     */
    this.ChangeBackground = function(){
        var rules_to_edit = this.pres.styles.SetEditTarget("nolevel");
        if($("[name='img_or_color']:checked").val() == "img") {
            var bg = "url(../../assets/images/" + $("#general-bg-select").val() +")";
        }
        else{
            var bg = $("#bgcolselect").spectrum("get").toRgbString();
        }
        $.each(rules_to_edit,function(idx,rule){
            rule.style.background = bg;
            //This might be kind of a hack:
            rule.style.backgroundSize = "100%";
        });
    };

    /**
     *
     * Toteuttaa käyttäjän tekemät siaältöalueiden taustoja koskevat muutokset,
     * ja asettaa taustaksi joko kuvan tai värin.
     *
     */
    this.ChangeContentBackground = function(){
        var rules_to_edit = this.pres.styles.SetEditTarget("nolevel",false," article");
        var bg = $("#content_bgcolselect").spectrum("get").toRgbString();
        $.each(rules_to_edit,function(idx,rule){
            rule.style.background = bg;
        });
    };


};

Slides.Widgets.StyleWidgets.BackgroundChanger.prototype = Object.create(Slides.Widgets.LayoutWidget.prototype);


Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.StyleWidgets = Slides.Widgets.StyleWidgets || {};

/**
 *
 * Fonttien kokoa ja tyyppiä muuttava layoutwidget
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param string adderclass sisällön lisävän widgetin css-luokka
 * @param string addedclass itse sisällön css-luokka
 * @param string address mistä raamatun kohdasta alkaen ja mihin asti sisältö on otettu
 * @param Array numericProperties mitkä css-ominaisuudet ovat sellaisia, ettäniiden muuttaminen on kasvattamista tai pienentämistä
 *
 *
 */
Slides.Widgets.StyleWidgets.FontChanger = function(parent_presentation){
    Slides.Widgets.LayoutWidget.call(this, parent_presentation);

    this.adderclass = ".fontchanger";
    this.numericProperties = ["fontSize","padding","marginLeft","marginTop","border"];

    /**
     *
     * Luo widgetit, joilla muokataan yksittäisiä fonttien ominaisuuksia kuten
     * kokoa, väriä yms. Kohteena kaikki html-elementit, jotka on merkattu
     * .fontcontroller-css-luokalla.
     * 
     */
    this.CreateFontControllers = function(){
        var self = this;
        $(".fontcontroller").each(function(){
            //Määritä widgetin tyyppi  ja luo sitä vastaava FontController-olion lapsiolio
            var controller = Slides.Styles.FontControllers.Create($(this), self);
            var include_img = false || $(this).attr("class").match("(border)");
            //Käy läpi kaikki  esityksen eri tekstitasot
            $.each(self.pres.text_levels,function(level,label){
                if(level != "img" || include_img){
                    //Huom: kuville ei luoda kuin tietyt säätimet
                    controller.AddTextLevel(level, label)
                }
            });
        });
    };


    /**
     * Tekee muutoksia fonttien väriin tai kokoon. Määrittelee ensin, mitä muutokset koskevat ja 
     * muutoksen kohteesta riippuen säätää css-sääntöjä joko koko esityksen laajuisesti
     * tai segmenttityypittäin (tai, TODO, segmenttikohtaisesti)
     *
     * @param object $launcher painike, jota klikkaamalla muokkaus käynnistetty
     * @param object newval uusi arvo muokatulle tyylille 
     *
     */
    this.Change = function($launcher, newval){
        //Määrittele tyylimuokkausten kohde
        var level = $launcher.parents(".changer-parent").attr("class").match(/level-(\w+)/i)[1];
        var target = $launcher.attr("class").match(/(\w+)-changer/i)[1];
        //Käsittele erikseen tapaukset, joissa muokataan sekä kokoa että väriä
        if(["border"].indexOf(target)>-1){
            var size = $launcher.parents(".changer-parent").find(".slider").slider("value");
            var color = $launcher.parents(".changer-parent").find(".spectrum").spectrum("get").toRgbString();
            newval = size + "em solid " + color;
        }
        //Käsittele erikseen myös esim. tekstin varjostus
        if(["textShadow"].indexOf(target)>-1){
            newval = "2px 1px 1px " + newval;
        }
        //Määrittele, mitä kaikkia css-sääntöjä on pakko muokata (jos esim. väriä muokataan, on lähetettävä force_all_levels-argumentti totena)
        var rules_to_edit = this.pres.styles.SetEditTarget(level, (["color","background","fontFamily","textShadow"].indexOf(target)>-1 ? true : false));
        //Muokkaa kaikkia äsken määriteltyjä css-sääntöjä
        $.each(rules_to_edit,function(idx,rule){
                rule.style[target] = newval;
        });

        //Jos ei kyse numeerisista arvoista, päivitä kaikki säätimet
        if(!$launcher.hasClass("slider")){
            Slides.Styles.Controller.UpdateControllers(this.pres);
        } 
    
    };

};

Slides.Widgets.StyleWidgets.FontChanger.prototype = Object.create(Slides.Widgets.LayoutWidget.prototype);


Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.StyleWidgets = Slides.Widgets.StyleWidgets || {};

/**
 * Widget, jonka avulla tietokannasta voi ladata valmiita tyylipohjia
 * tai näitä tyylipohjia voi päivittää tai lisätä kokonaan uusia.
 *
 */
Slides.Widgets.StyleWidgets.LayoutLoader = function(parent_presentation){

    Slides.Widgets.LayoutWidget.call(this, parent_presentation);

    this.adderclass = ".layoutloader";
    this.$select = $(".layoutloader select");

    /**
     *
     * Lisää select-elementtiin kaikki tietokannassa olevat tyyliluokat.
     * Tämän jälkeen tekee elementistä jquery ui:n muokatun selectmenu-widgetin.
     *
     */
    this.UpdateStyleSheets = function(){
        var self = this;
            path = Utilities.GetAjaxPath("Loader.php");
        //Tallenna ennestäään olemassa olleiden tyylien nimet
        self.oldsheets = [];
        //Tyhjennä olemassaoleva sisältö
        this.$select.find("*").remove();
        $.getJSON(path,{ "action": "load_stylesheets"},
            function(data){
                $.each(data,function(idx, sheet){
                    self.$select.append("<option>" + sheet + "</option>");
                    self.oldsheets.push(sheet);
                })
                //Lisää tekstikentäksi muutettava option-elementti uudelle luokalle
                self.$select.append("<option>Uusi luokka</option>");
                //Luo widget
                self.$select.select_withtext();
            }
        );
    };

    /**
     *
     * Liitä tyylintallennuspainikkeisiin niitä koskevat tapahtumat
     *
     */
    this.InitializeEvents = function(){
        var self = this;
        $("#save_stylesheet").click(function(){self.Save()});
        $("#load_stylesheet").click(function(){self.Load()});
        $("#remove_stylesheet").click(function(){self.Remove()});
    };

    /**
     *
     * Tallenna muokattu tyylipohja
     *
     */
    this.Save = function(){
        var self = this,
            current_sheet = this.$select.val(),
            path = Utilities.GetAjaxPath("Loader.php");
            real_classes = this.pres.classes.map((cl) => (cl.substr(0,1) == "." ? cl : "." + cl));

        $.getJSON(path,
            {
                "action": "styles_as_array",
                "current_sheet":current_sheet,
            },
            function(old_styles){
            //Hae ensin tietokannasta tiedot siitä, mitä arvoja tyyleillä on ollut ennen edellistä muokkausta

            //Hae sitten kaikki esityksessä käytössä olevat tyylit.
            //Käy tyylit läpi yksitellen ja poimi ne, jotka
            //vastaavat valittua tyylitiedostoa
            var all_rows = [];
            for(rule_idx in self.pres.styles.rules){
                    rule = self.pres.styles.rules[rule_idx];
                    if(rule.selectorText){
                        if(rule.selectorText.indexOf(".")==0){
                            //Tutki niitä css-sääntöjä, joista on erikseen määritelty luokka
                            attributes = rule.cssText.replace(rule.selectorText,"").replace(/\s*[{}]\s*/g,"").split(";");
                            //Ota talteen luokan nimi ja mahdollinen tägin nimi
                            var selector_units = rule.selectorText.match("(\.[a-öA-Ö]+) +([a-öA-Ö0-9]+)");
                            if(!selector_units){
                                var tagname = "";
                                var classname = rule.selectorText.trim();
                            }
                            else{
                                var tagname = selector_units[2];
                                var classname = selector_units[1];
                            }
                            if (real_classes.indexOf(classname) > -1){
                                // Tyylitaulun yksi rivi:
                                $.each(attributes,function(idx, attr){
                                    if(attr.indexOf(":")>-1){
                                        //Jaa attribuuttiksi ja arvoksi
                                        var av_pair = attr.split(":");
                                        // Lisää kok tyylitietokantaan syötettävä rivi...
                                        if(old_styles.indexOf([classname,tagname,av_pair[0].trim(),av_pair[1].trim()].join(";"))==-1){
                                            //..jos rivi on sellainen, ettei sellaista ole vanhastaan ollu tietokannassa, 
                                            // eli toisin sanoen jotain tietokannan rivin arvoa on muutettu
                                            all_rows.push({"classname":classname,"tagname":tagname,"attr":av_pair[0].trim(),"value":av_pair[1].trim(),"stylesheet":current_sheet});
                                        }
                                    }
                                })
                            }
                        }
                    }
            }
            //Ongelma: post-arvot liian suuria, jos kokonaan uusi tyyli
            if(self.oldsheets.indexOf(current_sheet)<0){
                //Jos käytetty kokonaan uutta tyylinimeä, pilkotaan 
                //TODO: korjaa asynkronisuus
                for(var i = 0; i<all_rows.length;i += 50){
                    var updatables = all_rows.slice(i, i+50);
                    $.post(path,
                        {
                            "action": "update_style_rows",
                            "rows_to_update":updatables,
                            "current_sheet":current_sheet, 
                            "isnew": "yes"
                        },
                        function(data){
                            //$("body").prepend(data);
                            console.log("NEW styles updated.")
                            if(i+50>= all_rows.legth){
                                msg = new Utilities.Message(`${current_sheet}-tyylipohja tallennettu.`, $(".layoutloader"));
                                msg.Show(3000);
                            }
                        });
                    }
            }
            else{
                //Jos ei kokonaan uusi, post-ongelma ratkaistaan sillä, että päivitetään vain muuttuneet tyylit
                $.post(path,
                    {
                        "action": "update_style_rows",
                        "rows_to_update":all_rows,
                        "current_sheet":current_sheet,
                        "isnew": "no"
                    },
                    function(data){
                            //$("body").prepend(data);
                            console.log("Old styles updated.")
                            msg = new Utilities.Message(`${current_sheet}-tyylipohja päivitetty.`, $(".layoutloader"));
                            msg.Show(3000);
                    });
            }

            });
    };

    /**
     *
     * Lataa select-elementillä valittu tyylipohja 
     *
     */
    this.Load = function(){
        var self = this,
            sheetname = self.$select.val(),
            path = Utilities.GetAjaxPath("Loader.php");
        console.log("loading " + sheetname);
        self.pres.d.find("#updated_styles").html("").load(
            path,
            {
                "action": "load_styles",
                //"classes":self.pres.classes,
                "stylesheet":sheetname
            },
            function(){
                self.pres.styles.GetOriginalStyles();
                Slides.Styles.Controller.UpdateControllers(self.pres);
                msg = new Utilities.Message(`${sheetname}-tyylipohja ladattu.`, $(".layoutloader"));
                msg.Show(3000);
            });
    };

    /**
     *
     * Poista select-elementillä valittu tyylipohja 
     *
     */
    this.Remove = function(){
        var self = this;
        console.log("remove");
    };

};


Slides.Widgets.StyleWidgets.LayoutLoader.prototype = Object.create(Slides.Widgets.LayoutWidget.prototype);


Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.StyleWidgets = Slides.Widgets.StyleWidgets || {};


/**
 * Layoutwidget, jolla muutetaan ruudulla näkyvien elementtien
 * sijaintia ja niihin liittyviä marginaaleja.
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 *
 */
Slides.Widgets.StyleWidgets.PositionChanger = function(parent_presentation){

    Slides.Widgets.LayoutWidget.call(this, parent_presentation);
    this.adderclass = ".positionchanger";
    Slides.Styles.Controller.UpdateControllers(this.pres);

    /**
     *
     * Luo widgetit, joilla muokataan mm. koko sisällön etäisyyttä yläreunasta
     * Kohteena kaikki html-elementit, jotka on merkattu
     * .positioncontroller-css-luokalla.
     * 
     */
    this.CreateControllers = function(){
        var self = this;
        $(".positioncontroller").each(function(){
            //Määritä widgetin tyyppi  ja luo sitä vastaava FontController-olion lapsiolio
            var controller = Slides.Styles.FontControllers.Create($(this), self);
            //MÄärittele, onko kyse article- vai section-tason elementistä
            //(jälkimmäinen lähinnä koko esitysnäytön kokoa muutettaessa)
            //SEKÄ lisäksi mahdollista, että muutetaan *ylätunnisteen* korkeutta
            var el_type = $(this).attr("class").match(/eltype-(\w+)/i)[1];
            //Käy läpi kaikki esityksen eri tekstitasot
            controller.AddTextLevel(el_type, "");
        });
    };


    /**
     * Toteuttaa muutokset, jotka liittyvät sijaintiin ja marginaaleihin. Määrittelee ensin, mitä muutokset koskevat ja 
     * muutoksen kohteesta riippuen säätää css-sääntöjä joko koko esityksen laajuisesti
     * tai segmenttityypittäin (tai, TODO, segmenttikohtaisesti)
     *
     * @param object $launcher painike, jota klikkaamalla muokkaus käynnistetty
     * @param object newval uusi arvo muokatulle tyylille 
     *
     */
    this.Change = function($launcher, newval){
        //Määrittele tyylimuokkausten kohde
        var target = $launcher.attr("class").match(/(\w+)-changer/i)[1];
        //MÄärittele, onko kyse article- vai section-tason elementistä (jälkimmäinen lähinnä koko esitysnäytön kokoa muutettaessa)
            //SEKÄ lisäksi mahdollista, että muutetaan *ylätunnisteen* korkeutta
        var el_type = $launcher.parents(".positioncontroller").attr("class").match(/eltype-(\w+)/i)[1];
        //Käsittele erikseen tapaukset, joissa muokataan sekä kokoa että väriä
        if(["border"].indexOf(target)>-1){
            var size = $launcher.parents(".changer-parent").find(".slider").slider("value");
            var color = $launcher.parents(".changer-parent").find(".spectrum").spectrum("get").toRgbString();
            newval = size + "em solid " + color;
        }
        //Määrittele, mitä kaikkia css-sääntöjä on pakko muokata (jos esim. väriä muokataan, on lähetettävä force_all_levels-argumentti totena)
        var rules_to_edit = this.pres.styles.SetEditTarget(el_type, (["color","background","justifyContent"].indexOf(target)>-1 ? true : false));
        //Muokkaa kaikkia äsken määriteltyjä css-sääntöjä
        $.each(rules_to_edit,function(idx,rule){
                rule.style[target] = newval;
        });
    
        //Jos ei kyse numeerisista arvoista, päivitä kaikki säätimet
        if(!$launcher.hasClass("slider")){
           Slides.Styles.Controller.UpdateControllers(this.pres);
        } 
    };



};

Slides.Widgets.StyleWidgets.PositionChanger.prototype = Object.create(Slides.Widgets.LayoutWidget.prototype);

$(document).ready(function(){

    if($("body").hasClass("slides")){

        var list = new Portal.Servicelist.List();
        Utilities.SetAjaxPath("../php/ajax");
        Utilities.SetImgPath("../assets/images");
    
        Slides.Controls.Initialize();

        //Ladataan messujen lista
        $.when(
            Portal.Servicelist.SetSeasonByCurrentDate()
        ).done(() => {
            list.LoadServices(
                Slides.ContentLoader.AddServicesToSelect.bind(Slides.ContentLoader)
            );
        });
        
        if (!Portal.Menus.GetInitialized()){
            Portal.Menus.InitializeMenus();
        }
    
    }


});
