/**
 * Layoutwidget, jolla muutetaan ruudulla näkyvien elementtien
 * sijaintia ja niihin liittyviä marginaaleja.
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 *
 */
var PositionChanger = function(parent_presentation){
    LayoutWidget.call(this, parent_presentation);
    this.CreateControllers();
    UpdateControllers(this.pres);
    return this;
}

/**
 *
 * @param string adderclass sisällön lisävän widgetin css-luokka
 *
 */
PositionChanger.prototype = {
    adderclass: ".positionchanger",


    /**
     *
     * Luo widgetit, joilla muokataan mm. koko sisällön etäisyyttä yläreunasta
     * Kohteena kaikki html-elementit, jotka on merkattu
     * .positioncontroller-css-luokalla.
     * 
     */
    CreateControllers: function(){
        var self = this;
        $(".positioncontroller").each(function(){
            //Määritä widgetin tyyppi  ja luo sitä vastaava FontController-olion lapsiolio
            var controller = CreateFontController($(this), self);
            //MÄärittele, onko kyse article- vai section-tason elementistä
            //(jälkimmäinen lähinnä koko esitysnäytön kokoa muutettaessa)
            //SEKÄ lisäksi mahdollista, että muutetaan *ylätunnisteen* korkeutta
            var el_type = $(this).attr("class").match(/eltype-(\w+)/i)[1];
            //Käy läpi kaikki esityksen eri tekstitasot
            controller.AddTextLevel(el_type, "");
        });
    },


    /**
     * Toteuttaa muutokset, jotka liittyvät sijaintiin ja marginaaleihin. Määrittelee ensin, mitä muutokset koskevat ja 
     * muutoksen kohteesta riippuen säätää css-sääntöjä joko koko esityksen laajuisesti
     * tai segmenttityypittäin (tai, TODO, segmenttikohtaisesti)
     *
     * @param object $launcher painike, jota klikkaamalla muokkaus käynnistetty
     * @param object newval uusi arvo muokatulle tyylille 
     *
     */
    Change: function($launcher, newval){
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
        if(!$launcher.hasClass("slider")) UpdateControllers(this.pres);
    },



} 


extend(LayoutWidget, PositionChanger);
