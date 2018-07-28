/**
 *
 * Fonttien kokoa ja tyyppiä muuttava layoutwidget
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param adderclass string css-luokka, josta widgetin sijainnin sivulla tunnistaa
 *
 */
var FontChanger = function(parent_presentation){
    LayoutWidget.call(this, parent_presentation);
    this.CreateFontControllers();
    UpdateControllers(this.pres);
    return this;
}

/**
 * @param string adderclass sisällön lisävän widgetin css-luokka
 * @param string addedclass itse sisällön css-luokka
 * @param string address mistä raamatun kohdasta alkaen ja mihin asti sisältö on otettu
 * @param Array numericProperties mitkä css-ominaisuudet ovat sellaisia, ettäniiden muuttaminen on kasvattamista tai pienentämistä
 *
 */
FontChanger.prototype = {

    adderclass: ".fontchanger",
    numericProperties: ["fontSize","padding","marginLeft","marginTop","border"],

    /**
     *
     * Luo widgetit, joilla muokataan yksittäisiä fonttien ominaisuuksia kuten
     * kokoa, väriä yms. Kohteena kaikki html-elementit, jotka on merkattu
     * .fontcontroller-css-luokalla.
     * 
     */
    CreateFontControllers: function(){
        var self = this;
        $(".fontcontroller").each(function(){
            //Määritä widgetin tyyppi  ja luo sitä vastaava FontController-olion lapsiolio
            var controller = CreateFontController($(this), self);
            var include_img = false || $(this).attr("class").match("(border)");
            //Käy läpi kaikki  esityksen eri tekstitasot
            $.each(self.pres.text_levels,function(level,label){
                if(level != "img" || include_img){
                    //Huom: kuville ei luoda kuin tietyt säätimet
                    controller.AddTextLevel(level, label)
                }
            });
        });
    },


    /**
     * Tekee muutoksia fonttien väriin tai kokoon. Määrittelee ensin, mitä muutokset koskevat ja 
     * muutoksen kohteesta riippuen säätää css-sääntöjä joko koko esityksen laajuisesti
     * tai segmenttityypittäin (tai, TODO, segmenttikohtaisesti)
     *
     * @param object $launcher painike, jota klikkaamalla muokkaus käynnistetty
     * @param object newval uusi arvo muokatulle tyylille 
     *
     */
    Change: function($launcher, newval){
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
        if(!$launcher.hasClass("slider")) UpdateControllers(this.pres);
    
    },

} 

extend(LayoutWidget, FontChanger);
