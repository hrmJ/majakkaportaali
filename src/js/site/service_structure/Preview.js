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
