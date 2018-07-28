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
 *
 */
var FontController = function($parent_el, parent_controller, add_separate_div){
    this.$parent_el = $parent_el;
    this.parent_controller = parent_controller;
    this.css_property= $parent_el.attr("class").match(/(\w+-changer)-parent/i)[1]
    //Ympyröi säätimet vielä yhdellä divillä, jotta ne voidaan helposti näyttää ja piilottaa
    if(add_separate_div)
        this.$container = $("<div>").appendTo(this.$parent_el);
};

/**
 *
 * @param string css_property se css-ominaisuus, jota muokataan  (esim.
 * fontSize). Tämä on javascriptin style-attribuutin mukainen ja napataan
 * [TYYPPI]-changer-parent-css-luokasta
 *
 */
FontController.prototype = {
    css_property : "",


    /**
     * Lisää yhtä tiettyä tekstitasoa kontrolloivan säätimen otsikoineen.
     *
     * @param string level tekstitaso, jota muokataan (h1, h2, p...)
     * @param string label miten taso käyttäjälle esitetään (1-otsikko, leipäteksti,...)
     */
    AddTextLevel: function(level, label){
        var self = this;
        //Lisää myös otsikko ja liitä mukaan varsinaiseen html-tiedostoon
        $("<div class='adjuster-parent changer-parent level-" + level + "'>")
            .append($("<div>" + label + "</div>"))
            .append(self.GetAdjuster())
            .appendTo(self.$container);
    },
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
}

/**
 *
 * @param object adjuster jquery-esitys siitä html-elementistä, joka suorittaa varsinaisen säädön muutoksen
 *
 */
NumericFontController.prototype = {

    /**
     * Luo varsinaisen säätimen, jolla css-arvoja ja -ominaisuuksia  muutetaan. Numeerisissa
     * tapauksissa tämä on jquery-ui:n slider-plugin.
     */
    GetAdjuster: function(){
        var self = this;
        $adjuster = $("<div class='slider adjuster " + self.css_property + "'></div>");
        $adjuster.slider(self.slider_options);
        return $adjuster;
    
    },

}

extend(FontController, NumericFontController);


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
    var self = this;
}

/**
 *
 * @param string css_property se css-ominaisuus, jota muokataan  (esim.
 * fontSize). Tämä on javascriptin style-attribuutin mukainen ja napataan
 * [TYYPPI]-changer-parent-css-luokasta
 *
 */
ColorFontController.prototype = {

    /**
     * Luo varsinaisen säätimen, jolla css-arvoja ja -ominaisuuksia  muutetaan. Numeerisissa
     * tapauksissa tämä on jquery-ui:n slider-plugin.
     *
     * @return object jquery-esitys <div>-elementistä, jonka sisällä varsinainen säädin on
     */
    GetAdjuster: function(){
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
    },

}

extend(FontController, ColorFontController);

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
    var self = this;
}


/**
 *
 * @param string css_property se css-ominaisuus, jota muokataan  (esim.
 * fontSize). Tämä on javascriptin style-attribuutin mukainen ja napataan
 * [TYYPPI]-changer-parent-css-luokasta
 *
 */
SelectFontController.prototype = {

    /**
     * Luo varsinaisen säätimen, jolla css-arvoja ja -ominaisuuksia  muutetaan.
     * Select-tapapuksessa tämä on select-elementti, jonka arvot saadaan options-luokalla merkitystä
     * input-elementistä. (TODO: vaihtoehtoisesti voidaan asettaa erilliset value-arvot)
     * Näissä input-elementeissä select-elementin tulevat arvot on erotettu toisistaan pilkulla.
     *
     * @return object jquery-esitys <div>-elementistä, jonka sisällä varsinainen säädin on
     */
    GetAdjuster: function(){
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
    },

}

extend(FontController, SelectFontController);


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
function CreateFontController($el, parent_controller){
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
}

/**
 *
 * @param string css_property se css-ominaisuus, jota muokataan  (esim.
 * fontSize). Tämä on javascriptin style-attribuutin mukainen ja napataan
 * [TYYPPI]-changer-parent-css-luokasta
 *
 */
NumericAndColorFontController.prototype = {
    css_property : "",


    /**
     * Lisää yhtä tiettyä tekstitasoa kontrolloivan säätimen otsikoineen.
     *
     * @param string level tekstitaso, jota muokataan (h1, h2, p...)
     * @param string label miten taso käyttäjälle esitetään (1-otsikko, leipäteksti,...)
     */
    AddTextLevel: function(level, label){
        var self = this;
        //Lisää myös otsikko ja liitä mukaan varsinaiseen html-tiedostoon
        $("<div class='adjuster-parent changer-parent level-" + level + "'>")
            .append($("<div>" + label + "</div>"))
            .append(self.numeric_controller.GetAdjuster())
            .append(self.color_controller.GetAdjuster())
            .appendTo(self.$container);
    },
};

