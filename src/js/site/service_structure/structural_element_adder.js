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
                    var selectme = (selectedclass.replace(".","") == thisclass.replace(".","") ? " selected " : "");
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
            header:this.$lightbox.find(".slide-header").val()};
    },

    /**
     * Hae dian sisältötiedot tietokannasta
     *
     * @param int id haettavan sisällön id infosegments-taulussa
     */
    LoadParams: function(id){
        this.slot_number = this.$container.find(".slot-number").text();
        this.slot_name = this.$container.find(".slot_name_orig").val();
        var self = this;
        $.getJSON("php/loaders/fetch_slide_content.php",{"slideclass":"infosegment","id":id},function(data){
            self.$lightbox.find(".slide-header").val(data.header);
            self.$lightbox.find(".infoslidetext").val(data.maintext);
            self.$lightbox.find(".segment-name").val(self.slot_name);
            if(data.genheader != "")
                self.$lightbox.find("[value='show-upper-header']").get(0).checked=true;
            }
        );
    },

    /**
     * Lataa näkyviin tietokantaan tallennetut kuvat valittavaksi esitykseen lisäämistä varten.
     *
     */
    AddImageLoader: function(){
        var self = this;
        this.$lightbox.find(".img-select").remove();
        $sel = $("<select class='img-select'>")
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


extend(StructuralElementAdder, InfoSlideAdder);
extend(StructuralElementAdder, SongSlideAdder);
