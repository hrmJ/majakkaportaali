GeneralStructure = GeneralStructure || {};

GeneralStructure.LightBox = function(){

    /**
     *
     * Liittää messurakenteen lightbox-ikkunaan liittyvän toiminnallisuuden
     * lähdeolioon
     *
     * @param source olio, johon liitetään
     *
     **/
    function Attach(source){

        /**
         *  Näytä ikkuna, jossa käyttäjä voi muokata messun rakenteeseen lisättävää diaa
         */
        source.prototype.ShowWindow = function(){
            var self = this
            var $buttons = $("<div class='button-container'>")
            $("<button>Sulje tallentamatta</button>")
                .click(function(){ 
                        self.$lightbox.html("").hide();
                        $(".blurcover").remove();
                })
                .appendTo($buttons);
            $("<button>Tallenna</button>")
                .click(function(){
                    console.log("SAVING---->");
                    self.SetSlideParams()
                        .SaveParams(function(d){
                            console.log("php data:" + d);
                            self.CloseLightBox();
                            GeneralStructure.ReloadSlots();
                        });
                })
                .appendTo($buttons);
            if(this.slideclass==".infoslide"){
                $("<button>Esikatsele</button>")
                    .click(self.PreviewSlide.bind(self))
                    .appendTo($buttons)
            };
            this.$lightbox.append($buttons);
            this.$container.append(this.$lightbox);
            this.InitializeInjectableData();
        };



        /**
         * Nollaa lisäysvalikon sisältö ja syöttää uuden sisällön
         *
         * @param object $el jquery-olio, joka syötetään  lightbox-ikkunan sisään
         *
         */
        source.prototype.SetLightBox = function($el){
            Utilities.BlurContent();
            //Tuo templatesta varsinainen diansyöttövalikko ja ylätunnisteen syöttövalikko
            this.$lightbox.html("")
                .prepend(
                    $(this.slideclass)
                    .clone(true)
                    .append(
                        $("#headertemplate_container > *").clone(true)
                    ));
            //Lisää syötettävän datan valitsimet
            this.$lightbox.find(".injection_placeholder")
                    .each(function(){
                            $(this).html("")
                            .append($("#injected-data-container")
                            .clone(true));
                    });
            this.$lightbox.css(
                {
                 "width":$(".innercontent").width() - 40 + "px",
                 "top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"
                }
            ).show();
            this.GetSlideClasses();
        };



        /**
         *  Sulkee lisäysvalikkoikkunan 
         */
        source.prototype.CloseLightBox = function(){
            this.$lightbox.html("").hide();
            $(".blurcover").remove();
        };


    }


    return {
        Attach,
    };

}();
