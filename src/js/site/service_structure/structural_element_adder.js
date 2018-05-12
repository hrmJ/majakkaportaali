

    /**
     *
     * Olio, jolla lisätään uusia esitykseen liittyviä messun rakenneosia.
     *
     * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
     *
     */
    var StructuralElementAdder = function($container){
            this.$lightbox = $("<div class='my-lightbox structural-element-adder'></div>");
            this.$preview_window = $(`<div class='preview-window'>
                                      <iframe scrolling='no' frameBorder='0'></iframe>
                                      <button>Sulje esikatselu</button></div>`);
            this.$container = $container;
            this.previewparams = {segment_type: this.segment_type};
            this.previewhtml = "";
            this.id = $container.find(".content_id").val();
            this.header_id = $container.find(".header_id").val();
            this.injectables = {"responsibilities":"vastuu tms.", "service_meta": "pvm tms."};
            if(!this.header_id){
                this.header_id = 0;
            }
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
            };
            this.$lightbox.append($buttons);
            this.$container.prepend(this.$lightbox);
            this.InitializeInjectableData();
            $("[value='multisong']").click(function(){self.$container.find(".multisongheader").toggle(); });
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
            this.$lightbox.html("").prepend($(this.slideclass).clone(true)
                                            .append($("#headertemplate_container > *").clone(true))
                                            );
            //Lisää syötettävän datan valitsimet
            this.$lightbox.find(".injection_placeholder").each(function(){
                $(this).html("").append($("#injected-data-container").clone(true));
            });
            this.$lightbox.css({"width":$(".innercontent").width(),"top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"}).show();
            this.SetSlideClasses();
        },


        /**
         *
         * Päivitä tietokantaan ylätunnisteeseen tehdyt muutokset, kuten
         * kuvan vaihtaminen tai kuvan sijainnin muuttaminen
         *
         */
        UpdatePickedHeader: function(){
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
        },


        /**
         * Tulostaa käyttäjän määrittämät ylätunnisteet.
         * Tallentaa myös muistiin ylätunnisteiden sisällön.
         * Huomaa, että tämä metodi kutsutaan AddImageLoader-metodista,
         * jotta ylätunnisteen kuvat ehtivät latautua.
         *
         * @param set_select_val boolean Tehdäänkö enemmän kuin vain ladataan ylätunnisteet: merkitäänkäö jokin tunniste valituksi
         *
         */
        SetHeaderTemplates: function(set_select_val){
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
        },

        /**
         *
         * Lataa näytettäväksi käyttäjän valitseman ylätunnisteen.
         * Jos käyttäjä syöttänyt kokonaan uuden, lisätään se ylätunnisteiden listaan.
         *
         * @param selected_item valittu elementti (jquery ui-oliona)
         *
         */
        PickHeader: function(selected_item){
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
                $(".structural-slots").load("php/loaders/loadslots.php",UkdateAdderEvents);
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
     * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
     *
     */
    var SongSlideAdder = function($container){
        this.slideclass = ".songslide";
        this.segment_type = "songsegment";
        StructuralElementAdder.call(this, $container);
        this.SetLightBox();
        return this;
    }

    SongSlideAdder.prototype = {

    }

    /**
     *
     * Yksittäisen diasisällön lisäävä olio.
     *
     * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
     *
     */
    var InfoSlideAdder = function($container){
        this.slideclass = ".infoslide";
        this.segment_type = "infosegment";
        StructuralElementAdder.call(this, $container);
        this.SetLightBox();
        return this;
    }


    InfoSlideAdder.prototype = {


    }

    /**
     *
     * Raamattusisällön lisäävä olio.
     *
     * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
     *
     */
    var BibleSlideAdder = function($container){
        this.slideclass = ".bibleslide";
        StructuralElementAdder.call(this, $container);
        this.SetLightBox();
        return this;
    }

    BibleSlideAdder.prototype = {

    }


    extend(StructuralElementAdder, InfoSlideAdder);
    extend(StructuralElementAdder, SongSlideAdder);
    extend(StructuralElementAdder, BibleSlideAdder);

    return {
        InfoSlideAdder,
        adder,
        currently_dragged_no
    }
