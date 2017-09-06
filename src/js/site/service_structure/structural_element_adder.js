/**
 *
 * Olio, jolla lisätään uusia esitykseen liittyviä messun rakenneosia.
 *
 * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
 *
 */
var StructuralElementAdder = function($container){
        this.$lightbox = $("<div class='my-lightbox structural-element-adder'></div>");
        this.$container = $container;
}

StructuralElementAdder.prototype = {

    /**
     *  Näytä ikkuna, jossa käyttäjä voi valita lisättävän messun osan tyypin
     *
     */
    ShowWindow: function(){
        var self = this;
        this.$container.prepend(this.$lightbox.append($("<div><button id='savebutton'>Tallenna</button></div>")));
        $("#savebutton").click(function(){self.SaveAndClose();});
    },

    /**
     * Nollaa lisäysvalikon sisältö ja syötä uusi sisältö.
     *
     * @param object $el jquery-olio, joka syötetään  lightbox-ikkunan sisään
     *
     */
    SetLightBox: function($el){
        this.$lightbox.html("").prepend($(this.slideclass).clone(true));
    },

    /**
     *  Sulje lisäysvalikkoikkuna ja tallenna muutokset
     */
    SaveAndClose: function(){
        this.$lightbox.html("");
    },

}


/**
 *
 * Yksittäisen diasisällön lisäävä olio.
 *
 * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
 *
 */
var SingleSlideAdder = function($container){
    StructuralElementAdder.call(this, $container);
    this.slideclass = ".singleslide";
    this.SetLightBox();
    return this;
}



extend(StructuralElementAdder, SingleSlideAdder);
