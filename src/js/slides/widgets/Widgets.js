Slides = Slides || {};

/**
 *
 * Diaesityksen ja sisällön hallinnan lähtökohtaiset luokat
 *
 */
Slides.Widgets = function(){

    /**
     * Olio, josta kaikki esityksen hallintawidgetit periytyvät.
     *
     * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
     * @param object loaded_content valmis ajax-ladattu sisältö
     *
     */
    var Widget = function(parent_presentation){
        this.pres = parent_presentation;
        this.$loaded_content = undefined;
    };


    /**
     * Olio, josta kaikki sisältöä lisäävät hallintawidgetit periytyvät.
     *
     * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
     *
     */
    var ContentAdder = function(parent_presentation){

        Widget.call(this, parent_presentation);

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
            var newclass = this.addedclass;
            if (this.addedclass2){
                newclass += " " + this.addedclass2;
            }
            return $("<section class='" + newclass + "'></section>");
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
                .click(self.CreateSlideDOM.bind(self))
                .insertBefore("#original-content li");
            //Poista pseudo-li
            $("#original-content li:last-child").remove();
            //Utilities.BlurContent($("#original-content"));
        };

        /**
         *
         * Luo uusi dia / uudet diat ja sijoita ne esitykseen.
         *
         * @param ev klikkaustapahtuma
         *
         */
        this.CreateSlideDOM = function(ev){
            var $launcher = $(ev.target);
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

    ContentAdder.prototype = Object.create(Widget.prototype);


    /**
     * Olio, josta kaikki esityksen tyylinhallintawidgetit periytyvät.
     * Perii Itse ContentAdder-widgetistä
     *
     * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
     *
     */
    var LayoutWidget = function(parent_presentation){
        ContentAdder.call(this, parent_presentation);
        this.pres = parent_presentation;
        this.defaults = {};
        //jos luokalla on oma InitializeEvents-metodinsa, käynnistä se.
        if(this.hasOwnProperty("InitializeEvents"))
            this.InitializeEvents();
    };

    LayoutWidget.prototype = Object.create(ContentAdder.prototype);

    return {
    
        Widget,
        LayoutWidget,
        ContentAdder
    }

}();
