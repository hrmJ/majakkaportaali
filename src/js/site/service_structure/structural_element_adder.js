/**
 *
 * Olio, jolla lisätään uusia esitykseen liittyviä messun rakenneosia.
 *
 * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
 *
 */
var StructuralElementAdder = function($container){
        this.$lightbox = $("<div class='my-lightbox structural-element-adder'></div>");
        this.$preview_window = $("<div class='preview-window'><iframe></iframe></div>");
        this.$container = $container;
        this.previewparams = {};
        this.previewhtml = "";
}

StructuralElementAdder.prototype = {

    /**
     *  Näytä ikkuna, jossa käyttäjä voi valita lisättävän messun osan tyypin
     */
    ShowWindow: function(){
        var self = this;
        this.$container
            .prepend(this.$lightbox.append($("<div><button id='savebutton'>Tallenna</button></div>")))
            .prepend(this.$lightbox.append($("<div><button id='previewbutton'>Esikatsele</button></div>")));
        $("#savebutton").click(function(){self.SaveAndClose();});
        $("#previewbutton").click(function(){self.PreviewSlide()});
        $(".slidetext").on("change paste keyup",function(){self.InjectServiceData()});
    },

    /**
     * Nollaa lisäysvalikon sisältö ja syötä uusi sisältö.
     *
     * @param object $el jquery-olio, joka syötetään  lightbox-ikkunan sisään
     *
     */
    SetLightBox: function($el){
        this.$lightbox.html("").prepend($(this.slideclass).clone(true));
        this.$lightbox.css({"width":$(".innercontent").width(),"top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"}).show();
    },


    /**
     * Nollaa esikatseluikkunan sisältö ja syötä uusi sisältö.
     *
     */
    SetPreviewWindow: function($el){
        this.$preview_window.css({"width":$(".innercontent").width(),"top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"}).show();
    },

    /**
     *  Sulje lisäysvalikkoikkuna ja tallenna muutokset
     */
    SaveAndClose: function(){
        this.$lightbox.html("").hide();
    },

    /**
     *
     * Syötä valitsin, jolla voi liittää diaan tietoja messusta. Esimerkiksi sen, kuka on juontaja, kuka liturgi jne.
     *
     */
    InjectServiceData: function(){
        console.log("lkj");
        var atsings = this.$lightbox.find(".slidetext").val().match(/@/g);
        var number_of_atsings = atsings ? atsings.length : 0;
        if(this.$lightbox.find("select").length<number_of_atsings){
            //Laske ät-merkkien määrä ja vertaa select-elementtien määrään
            var $select = $("<select></select>");
            $.getJSON("php/loaders/load_data_for_injection.php",{fetch:"responsibilities"},
                function(data){$.each(data,function(idx,el){ $select.append("<option>" + el + "</option>")})});
            $select.appendTo(this.$lightbox.find(".injected-data"));
        }
        else if(this.$lightbox.find("select").length>number_of_atsings){
            while (this.$lightbox.find("select").length>number_of_atsings){
                this.$lightbox.find("select:last-of-type").remove();
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
        var params = {1:this.previewparams};
        $.post("php/loaders/slides.php",params,function(html){
            self.previewhtml = html;
            $(".preview-window iframe").attr({"src":"slides.html"});
        });
    },

    /**
     * Kun esikatseluikkuna latautunut, päivitä sen sisältö.
     */
    SetPreviewContent: function(){
        $(".preview-window iframe").contents().find("main").html(this.previewhtml);
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
        this.previewparams = {
            slideclass: ".infocontent",
            maintext:this.$lightbox.find(".slidetext").val(),
            header:this.$lightbox.find(".slide-header").val()};
    }
}


extend(StructuralElementAdder, InfoSlideAdder);
