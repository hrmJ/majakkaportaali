var GeneralStructure = GeneralStructure || {};

GeneralStructure.DragAndDrop = function(){

    /**
     *
     * Kokonaisuus, johon slottien (tms.)  järjestelyominaisuus voidaan
     * liittää. Jquery uI:n sortable olisi ollut kiva, muttei toimi mobiilissa
     * edes touch and punch -hackillä.
     *
     *
     **/
    var SortableList = function(dd_params){

        this.currently_dragged_no = undefined;
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
        this.Initialize = function(){

            var self = this;

            var options = {
                    revert: true,
                    start: self.DragStart,
                    stop: self.CleanUp
            };
            if(this.dd_params.draghandle){
                options.handle = this.dd_params.handle;
            }
            $(this.dd_params.draggables).draggable(options);

            $(this.dd_params.droppables).droppable({
                    drop: self.Drop.bind(this),
                    over: self.DragOver.bind(this),
                    classes: {
                      "ui-droppable-active": "songslot_waiting",
                      "ui-droppable-hover": "songslot_taking",
                    },
                    out: self.DragLeave.bind(this)
                });
        };


        /**
         *
         * Määrittelee, mitä tapahtuu, kun käyttäjä alkaa raahata jotakin
         * slottia
         *
         **/
        this.DragStart = function(event){
            this.currently_dragged_no = $(event.target).find(".slot-number").text() * 1;
            console.log(this.currently_dragged_no);
        };

        /**
         *
         * Poista raahauksen aikana lisätyt luokat, tekstit ym.
         *
         **/
        this.CleanUp = function(){
            $(".drop-highlight").text("").removeClass("drop-highlight");
            //songslot_waiting
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
            console.log("leaving..");
            $(event.target).text("").removeClass("drop-highlight");
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
            $(event.target).addClass("drop-highlight").text("Siirrä tähän");
        };


        /**
         *
         *
         * Määrittelee, mitä tapahtuu, kun käyttäjä on tiputtanut raahaamansa elementin kohteeseen.
         *
         * @param event funktion käynnistänyt tapahtuma
         * @param callback funktio, joka ajetaan kun uudet numerot laskettu
         *
         **/
        this.Drop = function(event, callback){
            var self = this;
            event.preventDefault();  
            event.stopPropagation();
            var prevno = $(event.target).prev().find(self.dd_params.number).text();
            if(prevno=="") prevno = 0;
            var newids = [];
            console.log("PREVNO: " + prevno);
            $(this.dd_params.draggables).each(function(){
                var thisno = $(this).find(self.dd_params.number).text()*1;
                console.log("THISNO: " + thisno);
                var id = $(this).find(self.dd_params.id_class).val()*1;
                var newno = thisno*1;
                if(thisno == self.currently_dragged_no){
                    newno = prevno*1 + 1;
                    if(prevno > self.currently_dragged_no)
                        newno -= 1;
                }
                else if(thisno>self.currently_dragged_no && thisno > prevno) newno = thisno;
                else if(thisno>self.currently_dragged_no && thisno <= prevno) {
                    console.log("CUR " + self.currently_dragged_no);
                    newno = thisno -1;
                    console.log("NOW " + newno);
                }
                else if(thisno>prevno && thisno != self.currently_dragged_no) newno = thisno*1 +1;
                else if(thisno==prevno && thisno >  self.currently_dragged_no) newno = thisno*1 -1;
                else if(thisno==prevno) newno = thisno;
                //PREVENT zeros
                //newno = newno || 1;

                var keypair = {"newnumber" : newno};
                keypair[self.dd_params.idkey] = id;
                console.log({idkey:id, "newnumber":newno});
                newids.push(keypair);
                });

            //this.dd_params.drop_callback(newids);
            //GeneralStructure.SaveSlotOrder(newids);
        };
        
    


    }



    return {
        SortableList,
    }

}();
