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
        if(!$launcher.hasClass("slider")) UpdateControllers(this.pres);
    };



};

Slides.Widgets.StyleWidgets.PositionChanger.prototype = Object.create(Slides.Widgets.LayoutWidget.prototype);
