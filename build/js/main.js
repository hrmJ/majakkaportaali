/**
 *
 * Jquery ui:n selectmenu-pluginin muokkaus niin, että
 * mahdollista valita myös tekstikenttä.
 *
 */
 $.widget("custom.select_withtext", $.ui.selectmenu, 
     { 
         _renderItem: function( ul, item ) {
            var custom_labels = ["Uusi luokka", "Uusi tunniste"];
            if(custom_labels.indexOf(item.label) > -1){
                //TODO: abstract this, so that these options can be set appropriately and don't have to be hard coded.
                var $input = $("<input type='text' placeholder='" + item.label + "...'>");
                $input.on("keydown",function(){
                    var $div = $(this).parents(".other-option");
                    if ($div.find("button").length==0){
                        $("<button>Lisää</button>")
                            .click(function(){
                                //Lisää äsken lisätty uusi arvo KAIKKIIN tällä sivulla oleviin select-elementteihin, joissa addedclass-nimi
                                console.log($(this));
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
    if( filename.indexOf("Ei kuvaa") > -1 ){ 
        $div.find(".preview img").remove();
    }
    else{
        $("<img>").attr({"src":"assets/" + filename,
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
    this.$box = $("<div></div>").text(msg).attr({"class":"msgbox"});
    this.$parent_el = $parent_el || $("body");
    return this;
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
        var offtime = offtime || 2000;
        this.$parent_el.css({"position":"relative"});
        this.$box.appendTo(this.$parent_el).fadeIn("slow");
        setTimeout(function(){
            self.$parent_el.find(".msgbox").fadeOut("slow",function(){
                self.$parent_el.find(".msgbox").remove();
            });
        },offtime)
        
        //BlurContent(self.box);
    },
}




/**
 *
 * Moduuli erilaisille menuille
 *
 **/
var Menus = function(){

    var Hamburgermenu = function(){

        this.Initialize = function(){
        
            $(".hamburger").click(function(){$(this).next(".dropdown").slideToggle();});

        }
    
    
    }


    /**
     *
     * Yksinkertainen, koko ruudun peittävä menu
     *
     **/
    var Covermenu = function(){
    
        /**
         *
         * Avaa oikean menun, kun klikattu oikeaa linkkiä
         *
         * @param $launcher menu-klikkauksen laukaissut linkki
         *
         **/
        this.OpenMenu = function($launcher){
            var target = $launcher.attr("class").replace(/.*covermenu-target_(songlist)/g, "$1");
            $("#" + target).show();
            BlurContent();
        }


        /**
         *
         * Alustaa itse menujen toiminnallisuuden:
         * sulkulinkki ym.
         *
         **/
        this.Initialize = function(){
           var self = this;
           console.log("Initializing cover menus...");
           var $closerdiv = $(`
                <div class='closer_div' id='close_covermenu'>
                    <a href='javascript:void(0);'>Sulje valikko</a>
                </div>`);
            $closerdiv.click(function(){
                $(this).parents(".covermenu").hide();
                $(".blurcover").remove();
            });
            $(".covermenu").find('.closerdiv').remove();
            $(".covermenu").prepend($closerdiv.clone(true));
            $(".covermenu-launcher").click(function(){self.OpenMenu($(this))});
        }
        
    }

    function InitializeMenus(){
    
        //Aseta taittovalikot toimintakuntoon
        $(".controller-subwindow").hide()
        $(".subwindow-opener").click(function(){ 
            //Avaa tai sulje tarkemmat fonttien muokkaussäätimet ym
            $(this).next().slideToggle(); 
            $(this).toggleClass("opened");
        });

        var covermenu = new Covermenu();
        covermenu.Initialize();
    
    }




    return {
        InitializeMenus,
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
        ScrollToCenter($details);
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
            service_id: Service.GetServiceId()
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
                           service_id:Service.GetServiceId(),
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
            action: "get_responsibilities_list",
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




/**
 *
 * Moduuli yhden messun laulusloteista
 *
 **/
var SongSlots = function(){


    /**
     *
     * Hakee tietokannassa olevien laulujen nimet
     *
     **/
    function LoadSongTitles(request, response){
        console.log("test..");
        $.getJSON("php/ajax/Loader.php",{
            action: "get_song_titles",
            service_id: Service.GetServiceId(),
            title:request.term
        }, 
            function(data){
                response(data)
            }
        );
    }

    /**
     *
     * Hakee nyt käsiteltävässä messussa käytössä olevat laulut
     *
     **/
    function LoadSongsToSlots(){
        $.get("php/ajax/Loader.php", {
            action: "get_song_slots",
            service_id: Service.GetServiceId()
            }, 
            InitializeContainers);
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
        //TODO: multisongs!
        $("#songslots").html(slot_data);
        $(".slotcontainer").each(function(){
            var Cont = new SlotContainer($(this));
            Cont.SetName( $(this).find(".cont_name").text());
            Cont.SetMultisongButtons().FetchSlots();
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
            console.log("fetching.." + this.name);
            $.getJSON("php/ajax/Loader.php",{
                action: "load_slots_to_container",
                service_id: Service.GetServiceId(),
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
            $.each(slots,function(idx,slot_data){
                var slot = new SongSlot(slot_data.song_title,
                    slot_data.multisong_position, self.$ul);
                slot.Create().AttachEvents();
            });
            //Finally, attach
            this.AddSortability();
        }

        /**
         *
         * Lisää järjestelymahdollisuuden konttiin, jossa monta lauluslottia
         *
         **/
        this.AddSortability = function(){
            this.$ul.find(".between-slots").remove();
            this.$ul.find("li").before("<li class='between-slots'></li>");
            this.$ul.find("li:last-of-type").after("<li class='between-slots'></li>");
        }

        /**
         *
         * Lisää painikkeet, joilla voidaan lisätä tai vähentää lauluja tästä
         * "kontista"
         *
         *
         **/
        this.SetMultisongButtons = function(){
            //TODO: painikkeet yksittäisen laulun poistamiseen mistä kohtaa 
            //tahansa EIKÄ niinkään, että koko kontin lopussa miinuspainike
            //Plussapainike kylläkin
            //USE fontawesome icons?
            var $add = $(`<i class="fa fa-plus" aria-hidden="false"></i>`)
                            .click(this.AddNewSlot.bind(this));
            this.$ul.parents(".slotcontainer").append(
                $("<div class='buttons_cont'></div>").append($add)
            );

            return this;
        };


        /**
         *
         * Lisää tämän kontin alle uuden slotin
         *
         **/
        this.AddNewSlot = function(){
            var slot_no = this.$ul.find(".songinput").length;
            var slot = new SongSlot("", slot_no, this.$ul);
            slot.Create().AttachEvents();
            this.AddSortability();
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
     * @param $cont slotin sisältävä "kontti" DOMissa
     *
     **/
    var SongSlot = function(title, position, $cont){

        var self = this;
        this.title = title;
        this.position = position;
        this.$cont = $cont;

        /**
         *
         * Lisää DOMiin divin, jossa varsinainen slotti on kuvattuna
         *
         **/
        this.Create = function(){
            this.$div = $(`<li class="songslot">
                <div>
                    <input type="hidden" class=" " value="${this.position}"> 
                    <input type="text" class="songinput " value="${this.title}"> 
                </div>
                <div class='slot_handle'><i class='fa fa-arrows'></i></div>
                </li>`);
            var $remove_icon = $("<div><i class='fa fa-trash'></i></div>");
            $remove_icon.click(this.Remove.bind(this)).appendTo(this.$div);
            this.$cont.append(this.$div);
            return this;
        };


        /**
         *
         * Poistaa tämän laulun kontista
         *
         **/
        this.Remove = function(){
            //..vain jos ei viimeinen
            console.log("Removing...");
        };

        /**
         *
         * Liittää tähän slottiin jonkin laulun esimerkiksi sen jälkeen, kun
         * käyttäjä on raahannnut laululistan selauksen jälkeen näytölle
         * jääneen laulun slotin päälle.
         *
         * @param drop_event  mahdollinen pudotustapahtuma, joka kuuluu lauluslotti-diviin
         *
         **/ 
        this.AttachSong = function(drop_event){
            if(drop_event){
                $("#prepared_for_insertion").hide();
                var $target = $(drop_event.target);
            }
            $target.find(".songinput").val(SongLists.GetWaitingForAttachment());
        }

        /**
         *
         * Tarkistaa, onko tämän laulun sanoja tietokannassa
         *
         **/
        this.CheckLyrics = function(){
            var self = this;
            var title = this.$div.find(".songinput:eq(0)").val();
            $.getJSON("php/ajax/Loader.php",{
                    action:  "check_song_title",
                    service_id: Service.GetServiceId(),
                    title: title
                    },
                    self.IndicateLyrics
                    );
        };

        /**
         *
         *
         * Tulostaa informaation siitä, onko laulun sanoja tietokannassa
         *
         * @param data getJSON-funktiolta saatu response
         *
         **/
        this.IndicateLyrics = function(data){
        
            console.log(data);
        
        };

        /**
         *
         * Liittää lauluslottiin kuuluvat tapahtumat
         *
         **/
        this.AttachEvents = function(){
            this.$div.find(".songinput").autocomplete( {
                source: LoadSongTitles,
                minLength: 2,
                select: this.CheckLyrics.bind(this),
                }
            ).on("change paste keyup",self.CheckLyrics.bind(this));

            //Attach a listener for dropping
            console.log("Attaching droppability...");
            this.$div.droppable({
                drop: this.AttachSong,
                      classes: {
                        "ui-droppable-active": "songslot_waiting",
                        "ui-droppable-hover": "songslot_taking"
              },
            });
        }



        //$(`
        //<div class='songslot_info'> &#10003; Laulu on tietokannassa</div>
        //<div class='songslot_info'>Katso sanat</div>
        //`).appendTo()


    
    }



    return {
    
        LoadSongsToSlots,
    
    };

}();

/**
 *
 * Moduuli erilaisille laulujen selauslistoille
 *
 *
 **/
var SongLists = function(){

    var waiting_for_attachment = undefined;

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
                    service_id: Service.GetServiceId(),
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
            $ul = $("<ul></ul>").appendTo($launcher);
            $.each(songs, function(idx, el){
                var $li = $(`
                        <li>${el}</li>
                    `);
                $li.on("hover",function(){console.log("haa")});
                $li.click(function(e){
                    e.stopPropagation();
                    self.PrepareSongForInsertion($(this));
                });
                $ul.append($li);
            });
        };


        /**
         *
         * Erottaa listasta valitun laulun, niin että se voidaan
         * liittää osaksi messua.
         *
         * @param $launcher tapahtuman laukaissut laulu
         *
         **/
        this.PrepareSongForInsertion = function($launcher){
            waiting_for_attachment =  $launcher.text();
            $("#songlist").hide();
            $(".blurcover").remove();
            $("#prepared_for_insertion").show()
                .find("h4").text(waiting_for_attachment);
        };

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
                        service_id: Service.GetServiceId(),
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
     **/
    function LoadSongLists(){
        var alphalist = new AlphabeticalSonglist();
        alphalist.GetAndSetSubCategories();
    }

    /**
     *
     * Hae liittämistä odottavan laulun nimi
     *
     **/
    function GetWaitingForAttachment(){
        return waiting_for_attachment;
    }



    AlphabeticalSonglist.prototype = Object.create(Songlist.prototype);


    return {

        LoadSongLists,
        GetWaitingForAttachment

    };

}();

/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/


var Service = function(){

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
        self = this;
        this.tabdata = this.GetTabData();
        $.post("php/ajax/Saver.php",{
            action: self.action,
            service_id: Service.GetServiceId(),
            data: self.tabdata
            }, self.AfterSavedChanges.bind(self));
    };

    /**
     *
     * Tarkastelee muutoksia ja ilmoittaa käyttäjälle, jos tallentamattomia
     * muutoksia havaitaan
     *
     **/
    TabFactory.prototype.MonitorChanges = function(){
        var $tabheader = $(`.${this.tab_type}_tabheader`);
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
        this.MonitorChanges();
        var msg = new Message("Muutokset tallennettu", this.$div);
        msg.Show();
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
     **/
    function GetServiceId(){
        return service_id;
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
        TabObjects.People.GetResponsibles(TabObjects.People.SetResponsibles);
        TabObjects.Structure.GetStructure(TabObjects.Structure.SetStructure);
        for(this_tab in TabObjects){
            TabObjects[this_tab].AddSaveButton();
        }

        Comments.LoadComments();
        Comments.CreateThemeSelect();
        SongSlots.LoadSongsToSlots();
        SongLists.LoadSongLists();
        $("#prepared_for_insertion").hide()
            .draggable({
                revert: "valid"
            });
        //Luodaana kustakin välilehdestä oma olionsa
    }


    return {
        Initialize,
        GetServiceId,
        TabFactory,
    };

}();

/**
 *
 * Messun vastuunkantajat. (Vastuunkantajat-välilehti)
 *
 **/
Service.TabFactory.People = function(){

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
Service.TabFactory.Details = function(){

    this.action = "save_details";


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
     * Kerää kaiken välilehden sisältämän datan joko tallentamista
     * varten tai jotta voitaisiin nähdä, onko tehty muutoksia.
     *
     **/
    this.GetTabData = function(){
        var data = [
                {"type":"theme","value":$("#service_theme").val()}
            ];
        return data;
    }



};



/**
 *
 * Messun rakenteen säätely
 *
 **/
Service.TabFactory.Structure = function(){

    /**
     *
     * Syöttää tietokannasta haetun rakennedatan html:ään
     *
     **/
    this.SetStructure = function(html){
        $("#service_specific_structure").html(html);
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
            action : "get_service_specific_slots",
            service_id: Service.GetServiceId()
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
Service.TabFactory.Infoslides = function(){
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
Service.TabFactory.Songs = function(){

    /**
     *
     *
     **/
    this.SaveTabData = function(){
    };

};

/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/


var Servicelist = function(){

    season = "?";

    /**
     *
     * Lista kaikista yhden tietyn kauden messuista
     *
     **/
    var List = function(){
    

        /**
         *
         * Lataa messulista
         *
         * @param callback funktio, joka ajetaan kun lataus on valmis
         *
         **/
        this.LoadServices = function(callback){
            $.getJSON("php/ajax/Loader.php",{
                action: "get_list_of_services"
                }, callback);
        };

        /**
         *
         * Tulostaa listan ja liittää sen osaksi html-DOMia
         *
         * @param data listaan syötettävät tiedot
         *
         **/
        this.Output = function(data){
            $("#servicelist").html("");
            var prevmonth = 0;
            $.each(data,function(idx, service){
                thismonth = service.servicedate.replace(/\d+\.(\d+)\.\d+/g,"$1") * 1 ;
                if (thismonth != prevmonth){
                    prevmonth = thismonth;
                    $("#servicelist").append(`<li>${MonthName(thismonth)}</li>`);
                }
                $("#servicelist").append(`
                    <li class='service_link_li' id="service_id_${service.id}">
                    <span>${service.servicedate}</span>
                    <span>${service.theme}</span>
                    </li>
                    `);
            });
            
            //Lisää siirtyminen messukohtaiseen näkymään:
            $(".service_link_li").click(function(){
                var id = $(this).attr("id").replace(/.*id_(\d+)/,"$1");
                window.location = window.location.href = "service.php?service_id=" + id;
            });
        };
    }

    /**
     *
     * Alusta messunäkymän sisältö, tapahtumat ym.
     *
     **/
    function Initialize(){
        console.log("Initializing the list of services...");
        List_of_services.LoadServices(List_of_services.Output);
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

    //Alustetaan eri osiot
    var List_of_services = new List();

    return {
        Initialize,
    };

}()

/**
 *
 * Moduuli, jolla hallitaan messujen rakennetta: lauluja, raamatunkohtia, 
 * messukohtaisia tai yleisempiä infodioja jne.
 *
 **/
var GeneralStructure = function(){

    var adder;
    var slot_types = [ "infoslide", "songslide"];

    /**
     *
     * Lataa informaation messun rakenneosista
     *
     * @param data ajax-responssina tullut informaatio sloteista
     *
     **/
    function ReloadSlots(data){
        $(".structural-slots").load("php/ajax/Structure.php",
            {"action":"load_slots"},
            function(){
                InitializeSlotFunctionality();
            }
        );
    }

    /**
     *
     * Poista jokin messun rakenneosa kokonaan
     *
     **/
    function RemoveSlot(){
        $.post("php/ajax/Structure.php", {
            "action":"remove_slide",
            "id":$(this).parents(".slot").find(".slot_id").val()
            }, 
            ReloadSlots
        );
    }

    /**
     *
     * Tallentaa muutokset slottien järjestykseen
     *
     * $param newids slottien järjestysnumerot siirron jälkeen
     *
     **/
    function SaveSlotOrder(newids){
        console.log("MOOROO");
        console.log(newids);
        //Save the changes
        $.post("php/ajax/Saver.php",{
            "action":"update_slot_order",
            "newids":newids },
            ReloadSlots);
    }


    /**
     *
     * Alustaa uusia slotteja lisäävän jquery-ui-menun toiminnallisuuden
     *
     **/
    function InitializeNewslotMenu(){
        $(".menu").menu({ 
            position: { my: "bottom", at: "right-5 top+5" },
            select: function(e, u){
                var slot_type = u.item.find(">div:eq(0)").attr("id").replace(/([^_]+)_launcher/,"$1");
                if(slot_types.indexOf(slot_type)>-1){
                    GeneralStructure.SlotFactory.SlotFactory.make(slot_type)
                        .LoadParams()
                        .ShowWindow();
                }
                }
            });
    }

    /**
     *
     * Lisää toiminnallisuuden messuslotteihin
     *
     **/
    function InitializeSlotFunctionality(){
        $(".slot:last-of-type").after("<div class='drop-target'></div>");
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
                .make(slot_type, $container)
                .LoadParams()
                .ShowWindow();
        });

        sortable_slot_list =  new GeneralStructure.DragAndDrop.SortableList(
            {
                draggables: ".slot",
                droppables: ".drop-target",
                drop_callback: SaveSlotOrder,
                number: ".slot-number",
                id_class: ".slot_id",
                idkey: "slot_id",
                handle: ".drag_handle"
            }
            );
        sortable_slot_list.Initialize();
    }

    /**
     *
     * Alusta kaikki messun rakenneosiin liittyvät tapahtumat
     *
     **/
    function Initialize(){
        InitializeNewslotMenu();
        InitializeSlotFunctionality();
        //Vain testaamista varten: lisäillään vähän id:itä
        //$(".menu").find("li").each(function(){if($(this).text()=="Laulu")$(this).attr({"id":"addsongmenu"});});
    }


    return {
         Initialize,
         ReloadSlots,
         SaveSlotOrder
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
        if(data.multiname){
            this.$lightbox.find("[value='multisong']").get(0).checked=true;
            this.$lightbox.find(".multisongheader").show();
            this.$lightbox.find(".multisongheader input[type='text']").val(data.multiname);
        }
        if(data.restrictedto){
            this.$lightbox.find("[value='restrictedsong']").get(0).checked=true;
            this.$lightbox.find(".restrictionlist").show();
            this.$lightbox.find("[name=restrictions_input]").val(data.restrictedto);
        }
        this.$lightbox.find(".songdescription").val(data.songdescription);
        this.AddAutoComplete();

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
        var $multiheader = this.$lightbox.find(".multisongheader");
        this.slide_params = {
            songdescription: this.$lightbox.find(".songdescription").val(),
            singlename: this.$lightbox.find(".segment-name").val(),
            multiname: $multiheader.find("input[type='text']").val(),
            restrictedto: this.$lightbox.find("[name='restrictions_input']").val()
        }
        if(!this.$lightbox.find("[value='restrictedsong']").get(0).checked){
            //Jos ei ruksia rajoita-laatikossa, ignooraa kirjoitetut rajoitukset
            this.slide_params.restrictedto = "";
        }
        return this;
    }

    /**
     * Aseta autocomplete-mahdollisuus etsiä lauluja rajoitettuun listaan
     * Käytetään hyväksi jquery ui:n skriptiä useista autocomplete-arvoista
     * (https://jqueryui.com/autocomplete/#multiple)
     */
    this.AddAutoComplete = function(){
        var self = this;
        function split( val ) {
          return val.split( /,\s*/ );
        }
        function extractLast( term ) {
          return split( term ).pop();
        }
        self.$container.find("[name='restrictions_input']")
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
                                $.getJSON("php/ajax/Loader.php",
                                    {
                                    action: "get_song_titles",
                                    title:extractLast(request.term)
                                    },
                                    response);
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
    };


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
            Preview(self.$lightbox.find(".slide_img .img-select").parents(".with-preview"),"images/" + used_img);
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

GeneralStructure.SlotFactory = function(){


    /**
     *
     * Factory-pattern eri välilehtiä edustavien olioiden luomiseksi
     *
     **/
    function SlotFactory(){
        this.tabdata = [];
    }

    /**
     *
     * Tuottaa yhden välilehtiolion haluttua tyyppiä
     *
     * @param slot_type luotavan slotin tyyppi 
     *
     **/
    SlotFactory.make = function(slot_type, $container){
        var constr = slot_type;
        var slot;
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
        slot.id = ($slot_id ? $slot_id.val() : 0);
        slot.header_id = ($header_id ? $header_id.val() : 0);
        slot.previewparams = {segment_type: slot.segment_type};
        slot.previewhtml = "";
        slot.injectables = {"responsibilities":"vastuu tms.", "service_meta": "pvm tms."};
        GeneralStructure.DataLoading.Attach(this);
        GeneralStructure.InjectableData.Attach(this);
        GeneralStructure.Headers.Attach(this);
        GeneralStructure.Images.Attach(this);
        GeneralStructure.LightBox.Attach(this);
        GeneralStructure.Preview.Attach(this);
        slot.SetLightBox();
        return slot;
    };

    SlotFactory.prototype = {


    }


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
            if(this.slideclass==".songslide") this.AddAutoComplete();
        };



        /**
         * Nollaa lisäysvalikon sisältö ja syöttää uuden sisällön
         *
         * @param object $el jquery-olio, joka syötetään  lightbox-ikkunan sisään
         *
         */
        source.prototype.SetLightBox = function($el){
            BlurContent();
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
            var self = this;
            var $header = this.$lightbox.find(".headertemplates");
            var is_aside = this.$lightbox.find("input[name='header_type']").get(0).checked ? 1 : 0;
            var params = {segment_type:"update_headertemplate",is_aside: is_aside};
            params.header_id = $header.find("select[name='header_select']").val();
            params.imgpos = $header.find(".img-pos-select").val();
            params.imgname = $header.find(".img-select").val();
            params.maintext = $header.find("textarea").val();
            //Päivitetään muuttuneet arvot myös nykyiseen headers-attribuuttiin
            self.headerdata[params.header_id] = params;
            $.post("php/loaders/save_structure_slide.php",params,function(data){
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
            if(set_select_val === undefined){ 
                var set_select_val = true;
            }
            var self = this;
            self.$lightbox.find(".headertemplates select").on("change",function(){self.UpdatePickedHeader()});
            self.$lightbox.find(".headertemplates textarea").on("change paste keyup",function(){self.UpdatePickedHeader()});
            self.$lightbox.find(".headertemplates [name='header_type']").on("click",function(){self.UpdatePickedHeader()});
            self.headerdata = {};
            $.getJSON("php/loaders/fetch_slide_content.php",{"slideclass":"headernames","id":""}, function(headers){
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
            var self = this;
            var $sel = this.$lightbox.find("select[name='header_select']");
            var header = undefined;
            if (selected_item){
                //Jos funktio ajettu todellisen valinnan seurauksena
                //eikä vain muokkausikkunan avaamisen yhteydessä

                if (isNaN(selected_item.value)*1){
                    //Jos syötetty kokonaan uusi ylätunniste
                    //(arvo ei-numeerinen)
                    $.post("php/loaders/save_structure_slide.php",{"segment_type":"insert_headertemplate",
                        "template_name":selected_item.value},function(data){
                            self.SetHeaderTemplates(false);
                            self.$lightbox.find(".headertemplates .img-select").val("Ei kuvaa");
                            self.$lightbox.find(".headertemplates .img-pos-select").val("left");
                            self.$lightbox.find(".headertemplates textarea").val("");
                            Preview(self.$lightbox.find(".headertemplates .img-select").parents(".with-preview"),"Ei kuvaa");
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
                console.log(header.is_aside);
                if(header.is_aside == 1){
                    this.$lightbox.find(".headertemplates input[name='header_type']")[0].checked = true;
                }
                else{
                    this.$lightbox.find(".headertemplates input[name='header_type']")[0].checked = false;
                }
                if(header.imgname !== "Ei kuvaa"){ 
                    Preview(this.$lightbox.find(".headertemplates .img-select").parents(".with-preview"),"images/" + header.imgname);
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
            $.getJSON("php/ajax/Loader.php",
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
                Preview($(this).parents(".with-preview"),"images/" + $(this).val())}
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
            var self = this;
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
                $.getJSON("php/loaders/load_data_for_injection.php",{"fetch": identifier},
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
         */
        source.prototype.LoadParams = function(){
            //Huolehdi siitä, että kuvanvalintavalikot ovat näkyvissä ennen tietojen lataamista
            this.AddImageLoader();
            this.slot_number = this.$container.find(".slot-number").text() || $(".slot").length + 1 ;
            this.slot_name = this.$container.find(".slot_name_orig").val();
            this.$lightbox.find(".segment-name").val(this.slot_name);

            var self = this;
            $.getJSON("php/ajax/Loader.php",
                {
                    "action": "get_" + this.segment_type.replace("segment","slide"),
                    "id" : this.slide_id,
                },
                //This method is child-specific, cf. infoslide.js, songslide.js etc
                this.FillInData.bind(this));

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
            this.slot_params = {
                "slot_name" : this.$lightbox.find(".segment-name").val(),
                "slot_number" : this.slot_number,
                "slot_type" : this.segment_type,
                "id_in_type_table" : null,
                "addedclass" : this.$lightbox.find("select[name='addedclass']").val(),
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
            //Haetaan tietokannasta viimeisimmän tämän tyypin diasisällön id ja
            //vasta sitten jatketaan
            $.getJSON("php/ajax/Loader.php",
                {
                    action : "check_last_index_of_segment_type",
                    segment_type: this.segment_type
                }, 
                function(max_id){
                    params.params.content_id = max_id;
                    params.params.slot_number = max_id;
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
                thisclass = thisclass.classname;
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
     *
     **/
    var SortableList = function(dd_params){

        this.currently_dragged_no = undefined;
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
        this.Initialize = function(){

            var self = this;

            var options = {
                    revert: true,
                    start: self.DragStart.bind(this),
                    stop: self.CleanUp.bind(this),
                    handle: this.dd_params.handle
            };
            $(this.dd_params.draggables).draggable(options);

            $(this.dd_params.droppables).droppable({
                    drop: self.Drop.bind(this),
                    over: self.DragOver.bind(this),
                    classes: {
                      "ui-droppable-active": "songslot_waiting",
                      "ui-droppable-hover": "songslot_taking",
                    },
                    out: self.DragLeave.bind(this)
                });
        };


        /**
         *
         * Määrittelee, mitä tapahtuu, kun käyttäjä alkaa raahata jotakin
         * slottia
         *
         **/
        this.DragStart = function(event){
            this.currently_dragged_no = $(event.target).find(".slot-number").text() * 1;
            $(event.target).addClass("dragging");
            console.log(this.currently_dragged_no);
        };

        /**
         *
         * Poista raahauksen aikana lisätyt luokat, tekstit ym.
         *
         **/
        this.CleanUp = function(event){
            $(".drop-highlight").text("").removeClass("drop-highlight");
            $(event.target).removeClass("dragging");
            //songslot_waiting
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
            console.log("leaving..");
            $(event.target).text("").removeClass("drop-highlight");
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
            //$(event.target).addClass("drop-highlight").text("Siirrä tähän");
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
            var self = this;
            event.preventDefault();  
            event.stopPropagation();
            var prevno = $(event.target).prev().find(self.dd_params.number).text();
            if(prevno=="") prevno = 0;
            var newids = [];
            $(this.dd_params.draggables).each(function(){
                var thisno = $(this).find(self.dd_params.number).text()*1;
                var id = $(this).find(self.dd_params.id_class).val()*1;
                var newno = thisno*1;
                if(thisno == self.currently_dragged_no){
                    newno = prevno*1 + 1;
                    if(prevno > self.currently_dragged_no)
                        newno -= 1;
                }
                else if(thisno>self.currently_dragged_no && thisno > prevno) newno = thisno;
                else if(thisno>self.currently_dragged_no && thisno <= prevno) newno = thisno -1;
                else if(thisno>prevno && thisno != self.currently_dragged_no) newno = thisno*1 +1;
                else if(thisno==prevno && thisno >  self.currently_dragged_no) newno = thisno*1 -1;
                else if(thisno==prevno) newno = thisno;

                var keypair = {"newnumber" : newno};
                keypair[self.dd_params.idkey] = id;
                console.log({idkey:id, "newnumber":newno});
                newids.push(keypair);
                });

            this.dd_params.drop_callback(newids);
        };
        
    


    }



    return {
        SortableList,
    }

}();

/**
 *
 * Lisää toiminnallisuuden sivulle: lataa sisällön,
 * liittää eventit... Eri tavalla riippuen siitä, mikä osasivu ladattuna.
 *
 *
 */
$(function(){
    //Navigation etc:
    Menus.InitializeMenus();
    //Other actions:
    if ($("body").hasClass("servicedetails")){
        //Messukohtainen näkymä
        $("#tabs").tabs();
        Service.Initialize();
    }
    else if ($("body").hasClass("servicelist")){
        //Kaikkien messujen lista
        Servicelist.Initialize();
        //Ehkä filtteröitynä?
    }
    else if ($("body").hasClass("service_structure")){
        //Kaikkien messujen lista
        GeneralStructure.Initialize();
        //Ehkä filtteröitynä?
    }

});
