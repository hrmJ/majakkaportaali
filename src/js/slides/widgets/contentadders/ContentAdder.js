Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.ContentAdders = Slides.Widgets.ContentAdders || {};

/**
 * Olio, josta kaikki sisältöä lisäävät hallintawidgetit periytyvät.
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 *
 */
Slides.Widgets.ContentAdders.ContentAdder = function(parent_presentation){

    Slides.Widgets.Widget.call(this, parent_presentation);

    /**
     * Avaa näkyville tyyppikohtaisen sisällön lisäysvalikon
     * @param object launcher otsikko, jota klikkaamalla laukaistiin
     */
    this.OpenWidget = function($launcher){
        $(this.adderclass + " .contentadder-open:eq(0)").slideToggle();
        //$launcher.
    };

    /**
     * Palauttaa section-elementin, jonka sisään sisältö luodaan
     *
     * @return object jquery-elementti, johon sisältö luodaan
     *
     */
    this.GiveContainer = function(){
        return $("<section class='" + this.addedclass + "'></section>");
    };

    /**
     * Tulosta paikat, joihin widgetillä luodun sisällön voi esityksessä syöttää 
     */
    this.AddToPres = function(){
        var self = this;
        //Poista väliaikaisesti segmenttien raahaamisen mahdollistavat li-elementtien välissä sijaitsevat li-elementit
        $(".drop-target").remove();
        $("#original-content li").addClass("set-new-content-list");
        //Lisää pseudo-li, jotta insertBefore toimisi myös viimeiselle sisältöelementille
        $("#original-content ul").append("<li></li>");
        //Lisää pseudolistaelementtiin myös klikkaustoiminto, joka sijoittaa uuden sisällön esitykseen
        $("<li class='add-here-option'>Lisää tähän</li>")
            .click(function(){self.CreateSlideDOM($(this))})
            .insertBefore("#original-content li");
        //Poista pseudo-li
        $("#original-content li:last-child").remove();
        BlurContent($("#original-content"));
    };

    /**
     *
     * Luo uusi dia / uudet diat ja sijoita ne esitykseen.
     *
     * @param object $launcher klikattu sisällysluettelon kohta, johon uusi sisältö halutaan
     *
     */
    this.CreateSlideDOM = function($launcher){
        //Luo sisältö
        this.CreateContent();
        //Määritä, mihin kohtaan sijoitetaan - sen perusteella, mones sisältölistan elementti on ennen klikattua linkkiä (tai jälkeen, jos klikattu ekaa)
        var inserthere = $launcher.prev().length > 0 ? {"where":"insertAfter","idx":1*$launcher.prev().attr("id").replace("content_","")} : {"where":"insertBefore","idx":1*$launcher.next().attr("id").replace("content_","")};
        //Sijoita aiemmin ladattu sisältö määrittelyn mukaiseen kohtaan itse esityksessä
        this.$loaded_content[inserthere.where](this.pres.d.find("section:eq("+ inserthere.idx +")"));
        //Siisti pois valikot:
        $("#original-content li").removeClass("set-new-content-list");
        $(".add-here-option, .blurcover").remove();
        //Päivitä sisältölista
        this.pres.controls.contentlist.GetContents().PrintContentList().HighlightCurrentContents();
        //Päivitä myös ulkoasunsäätölista
        this.pres.UpdateSegmentListForLayoutEditing();
    };

};


Slides.Widgets.ContentAdders.ContentAdder.prototype = Object.create(Slides.Widgets.Widget.prototype);
