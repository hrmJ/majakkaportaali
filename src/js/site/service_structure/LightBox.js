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
                .click(self.SaveAndClose)
                .appendTo($buttons);
            if(this.slideclass==".infoslide"){
                $("<button>Esikatsele</button>")
                    .click(self.PreviewSlide)
                    .appendTo($buttons)
            };
            this.$lightbox.append($buttons);
            this.$container.prepend(this.$lightbox);
            this.InitializeInjectableData();
            $("[value='multisong']")
                .click(function(){
                    self.$container.find(".multisongheader").toggle(); 
                });
            if(this.slideclass==".songslide") this.AddAutoComplete();
        };



        /**
         * Nollaa lisäysvalikon sisältö ja syöttää uuden sisällön
         *
         * @param object $el jquery-olio, joka syötetään  lightbox-ikkunan sisään
         *
         */
        source.prototype.SetLightBox = function($el){
            BlurContent();
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
                 "width":$(".innercontent").width(),
                 "top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"
                }
            ).show();
            this.GetSlideClasses();
        };



        /**
         * Nollaa esikatseluikkunan sisällön ja syöttää uuden.
         *
         */
        source.prototype.SetPreviewWindow = function($el){
            this.$preview_window.css(
                {
                    "width":$(".innercontent").width(),
                    "top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"
                })
                .show();
            this.$preview_window.find("iframe")
                .attr(
                    {
                        "width":$(".innercontent").width()-30 + "px",
                        "height":($(".innercontent").width()-30)/4*3+"px",
                        "border":"0"
                    })
                .show();
        };

        /**
         *  Sulkee lisäysvalikkoikkunan ja tallentaa muutokset. Lataa myös tehdyt muutokset sivulle näkyviin.
         */
        source.prototype.SaveAndClose = function(){
            var self = this;
            this.SetPreviewParams();
            if(this.$lightbox.find("select[name='addedclass']").length>0){
                //Tallenna myös dian luokka, jos asetetu
                this.previewparams.addedclass = this.$lightbox.find("select[name='addedclass']").val();
            }
            $.post("php/loaders/save_structure_slide.php",this.previewparams,function(html){
                $(".structural-slots").load("php/loaders/loadslots.php",UpdateAdderEvents);
                $("body").prepend(html);
            });
            this.$lightbox.html("").hide();
            $(".blurcover").remove();
        };

        /**
         * Avaa ikkuna, jossa voi esikatsella diaa.
         */
        source.prototype.PreviewSlide = function(){
            var self = this;
            this.SetPreviewParams();
            this.$container.prepend(this.$preview_window);
            this.SetPreviewWindow();
            this.$preview_window.find("button").click(function(){self.$preview_window.hide()});
            $.post("php/loaders/slides_preview.php",this.previewparams,function(html){
                self.previewhtml = html;
                console.log(html);
                $(".preview-window iframe").attr({"src":"slides.html"});
            });
        };

        /**
         * Kun esikatseluikkuna latautunut, päivitä sen sisältö.
         */
        source.prototype.SetPreviewContent = function(){
            $(".preview-window iframe").contents().find("main").html(this.previewhtml);
        };

    }


    return {
        Attach,
    };

}();
