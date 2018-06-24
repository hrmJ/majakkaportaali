var GeneralStructure = GeneralStructure || {};

GeneralStructure.DragAndDrop = function(){

    /**
     *
     * Kokonaisuus, johon slottien (tms.)  järjestelyominaisuus voidaan
     * liittää. Jquery uI:n sortable olisi ollut kiva, muttei toimi mobiilissa
     * edes touch and punch -hackillä.
     *
     * @param $ul järjesteltäväksi tarkoitetun listan jquery-representaatio
     * @param dd_params jqueri ui draggable + droppable -asetukset
     *
     **/
    var SortableList = function($ul, dd_params){

        this.$ul = $ul;
        this.currently_dragged_no = undefined;
        this.$currently_dragged = undefined;
        this.dd_params = dd_params;
        
        

        /**
         *
         * Liittää messuslotteihin raahaamiseen liittyvät toiminnot
         *
         * @param parameters mudossa 
         *
         * {
         *    draggables: ".css_class",
         *    droppables: ".css_class",
         *    drop_callback: function_reference,
         * }
         *
         **/
        this.Initialize = function(axis){

            var self = this;
            var options = {
                    revert: true,
                    start: self.DragStart.bind(this),
                    stop: self.CleanUp.bind(this),
                    handle: this.dd_params.handle,
                    axis: axis || "y",
                    refreshPositions: true,
                    cursor: "move",
                    opacity:0.99,
                    zIndex:100,
                    //snapMode: "inner",
                    //snap: true,
            };
            this.numberclass = this.dd_params.numberclass || undefined;
            this.draggables = this.dd_params.draggables;
            this.$ul.find(this.dd_params.draggables).draggable(options);
            this.RefreshPseudoSlots().AddDroppables();
            return this;
        };


        /**
         *
         *  Päivitä (tai luo) varsinaisten slottien välissä olevat
         *  "pseudo-slotit", joita käytetään osoittamaan paikat, jonne
         *  raahattavan elementin voi tiputtaa/
         *
         **/
        this.RefreshPseudoSlots = function(){
            var self = this;
            this.$ul.find(".between-slots").remove();
            this.$ul.find("li").before("<li class='between-slots'></li>");
            this.$ul.find("li:last-of-type").after("<li class='between-slots'></li>");
            this.$ul.find(this.draggables).each(function(idx,el){
                //Jos listassa on näkyvillä numeroita, päivitä ne
                $(this).find(self.numberclass).text(idx+1);
            });
            return this;
        }

        /**
         *
         * Initializes or refreshes the droppables
         *
         **/
        this.AddDroppables = function(){
            var self = this;
            this.$ul.find(".between-slots").droppable({
                    drop: self.Drop.bind(this),
                    over: self.DragOver.bind(this),
                    classes: {
                      //"ui-droppable-active": "songslot_waiting",
                      "ui-droppable-hover": "structural_slot_taking",
                    },
                    out: self.DragLeave.bind(this)
                });
            return this;
        }


        /**
         *
         * Määrittelee, mitä tapahtuu, kun käyttäjä alkaa raahata jotakin
         * slottia
         *
         **/
        this.DragStart = function(event){
            var $el = $(event.target);
            this.$currently_dragged = $el;
            $el.prev(".between-slots").hide();
            //$el.next(".between-slots").hide();
            $el.addClass("dragging");
            //this.$ul.find(".between-slots").addClass("drop-highlight");
        };

        /**
         *
         * Poista raahauksen aikana lisätyt luokat, tekstit ym.
         *
         **/
        this.CleanUp = function(event){
            this.$ul.find(".between-slots").removeClass("drop-highlight").text("");
            $(event.target).removeClass("dragging");
            this.RefreshPseudoSlots().AddDroppables();
            return this;
        };


        /**
         *
         * Määrittelee, mitä tapahtuu, kun raahattu
         * elementti poistuu slottien välisen alueen
         * päältä
         *
         * @param event funktion käynnistänyt tapahtuma
         *
         **/
        this.DragLeave = function(event){
            $(event.target).text("");
        }


        /**
         * 
         * Määrittelee, mitä tapahtuu, kun elementti
         * raahataan slottien välisen tilan ylle
         *
         * @param event funktion käynnistänyt tapahtuma
         *
         **/
        this.DragOver = function(event){
            //$(event.target).prev().css({"margin-bottom":"35px"});
            //this.original_height = $(event.target).height();
            //$(event.target).css({"margin-top":"1em"});
            //$(event.target).text("Siirrä tähän");
            //$(event.target).addClass("drop-highlight");
        };


        /**
         *
         *
         * Määrittelee, mitä tapahtuu, kun käyttäjä on tiputtanut raahaamansa elementin kohteeseen.
         *
         * @param event funktion käynnistänyt tapahtuma
         *
         **/
        this.Drop = function(event){
            var $el = $(event.target);
            var $parent_el = $el.parents("ul");
            this.$currently_dragged.insertAfter($el);
            //this.dd_params.drop_callback($parent_el);
        };
        
    


    }



    return {
        SortableList,
    }

}();
