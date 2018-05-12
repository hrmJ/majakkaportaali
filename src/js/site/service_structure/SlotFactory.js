
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
        // kun luodaan uutta, liitä lightbox sivun yläreunan diviin
        slot.$container = $container || $(".structural-element-add");
        var $content_id = slot.$container.find(".content_id");
        var $header_id = slot.$container.find(".header_id");
        slot.id = ($content_id ? $content_id.val() : 0);
        slot.header_id = ($header_id ? $header_id.val() : 0);
        slot.previewparams = {segment_type: slot.segment_type};
        slot.previewhtml = "";
        slot.injectables = {"responsibilities":"vastuu tms.", "service_meta": "pvm tms."};
        slot.SetLightBox();
        GeneralStructure.Headers.Attach(this);
        return slot;
    };

    SlotFactory.prototype = {
        /**
         *  Näytä ikkuna, jossa käyttäjä voi muokata messun rakenteeseen lisättävää diaa
         */
        ShowWindow: function(){
            var self = this
            var $buttons = $("<div class='button-container'>")
            $("<button>Sulje tallentamatta</button>")
                .click(function(){ 
                        self.$lightbox.html("").hide();
                        $(".blurcover").remove();
                })
                .appendTo($buttons);
            $("<button>Tallenna</button>")
                .click(self.SaveAndClose)
                .appendTo($buttons);
            if(this.slideclass==".infoslide"){
                $("<button>Esikatsele</button>")
                    .click(self.PreviewSlide())
                    .appendTo($buttons)
            };
            this.$lightbox.append($buttons);
            this.$container.prepend(this.$lightbox);
            this.InitializeInjectableData();
            $("[value='multisong']")
                .click(function(){
                    self.$container.find(".multisongheader").toggle(); 
                });
            if(this.slideclass==".songslide") this.AddAutoComplete();
        },

        /**
         *
         * Hakee tiedot datasta, jota messun dioihin voi syöttää, kuten juontajan nimen tms.
         * Data tallennetaan valmiina jquery-elementteinä (select).
         *
         */
        InitializeInjectableData: function(){ 
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
        },

        /**
         *
         * Lisää listan syötettävistä dataelementeistä niihin diaelementteihin, joissa sitä voidaan hyödyntää.
         *
         * @param $select syötettävä jquery-muotoinen select-elementtiä kuvaava olio
         *
         */
        InsertInjectableData: function($select){ 
            this.$lightbox.find(".injected-data").each(function(){ 
                if( !$(this).find($select.attr("class")).length ){ 
                    $(this).append($select.clone(true));
                }
            });
        },

        /**
         * Hae dian sisältötiedot tietokannasta: tyypistä riippuen vähintään nimi ja luokka,
         * mahdollisesti myös teksti, laulun nimi, kuvat, ylätunniste jne.
         *
         */
        LoadParams: function(){
            //Huolehdi siitä, että kuvanvalintavalikot ovat näkyvissä ennen tietojen lataamista
            this.AddImageLoader();
            this.slot_number = this.$container.find(".slot-number").text();
            this.slot_name = this.$container.find(".slot_name_orig").val();
            this.$lightbox.find(".segment-name").val(this.slot_name);

            var self = this;
            $.getJSON("php/loaders/fetch_slide_content.php",{"slideclass":this.slideclass.replace(".",""),"id":this.id},function(data){
                switch(self.slideclass){
                    case ".songslide":
                        if(data.multiname != ""){
                            self.$lightbox.find("[value='multisong']").get(0).checked=true;
                            self.$lightbox.find(".multisongheader").val(data.multiname).show();
                        }
                        if(data.restrictedto != ""){
                            self.$lightbox.find("[value='restrictedsong']").get(0).checked=true;
                            self.$lightbox.find(".restrictionlist").val(data.restrictedto).show();
                        }
                        self.$lightbox.find(".songdescription").val(data.songdescription);
                        break;
                    case ".infoslide":
                        self.$lightbox.find(".slide-header").val(data.header);
                        self.$lightbox.find(".infoslidetext").val(data.maintext);
                        if(data.imgname){ 
                            self.$lightbox.find(".slide_img .img-select").val(data.imgname);
                            self.$lightbox.find(".slide_img .img-pos-select").val(data.imgposition);
                        }
                        if(data.genheader != ""){
                            //Lisää ruksi, jos määritetty, että on yläotsikko
                            self.$lightbox.find("[value='show-upper-header']").get(0).checked=true;
                        }
                        var used_img = self.$lightbox.find(".slide_img .img-select").val();
                        if(used_img!="Ei kuvaa"){
                            //Lataa valmiiksi kuvan esikatselu, jos kuva määritelty
                            Preview(self.$lightbox.find(".slide_img .img-select").parents(".with-preview"),"images/" + used_img);
                        }
                        break;
                }
            });

            return this;
        },
/**
         * Tallenna dian tiedot tietokantaan (myös mahdollista esikatselua varten)
         */
        SetPreviewParams: function(){
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
        },

        /**
         * Nollaa lisäysvalikon sisältö ja syötä uusi sisältö.
         *
         * @param object $el jquery-olio, joka syötetään  lightbox-ikkunan sisään
         *
         */
        SetLightBox: function($el){
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
                 "width":$(".innercontent").width(),
                 "top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"
                }
            ).show();
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

        /**
         * Lataa näkyviin tietokantaan tallennetut kuvat valittavaksi esitykseen lisäämistä varten.
         *
         */
        AddImageLoader: function(){
            console.log("HERE");
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
                        self.SetHeaderTemplates();
                    });
        }
    }



    /**
     *
     * Laulusisällön lisäävä olio.
     *
     */
    SlotFactory.songslide = function(){
        this.slideclass = ".songslide";
        this.segment_type = "songsegment";
    }


    /**
     *
     * Yksittäisen diasisällön lisäävä olio.
     *
     */
    SlotFactory.infoslide = function(){
        this.slideclass = ".infoslide";
        this.segment_type = "infosegment";
    }


    /**
     *
     * Raamattusisällön lisäävä olio.
     *
     * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
     *
     */
    SlotFactory.bibleslide = function(){
        this.slideclass = ".bibleslide";
    }


    return {
    
        SlotFactory,
    
    }


}();

