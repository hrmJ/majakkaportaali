GeneralStructure = GeneralStructure || {};

GeneralStructure.Images = function(){


    /**
     *
     * Liittää kuvien lataamiseen  liittyvän toiminnallisuuden lähdeolioon
     *
     * @param source olio, johon liitetään
     *
     **/
    function Attach(source){

        /**
         *
         * Listaa tietokantaan tallennettujen kuvien nimet
         *
         */
        source.prototype.AddImageLoader = function(){
            var self = this;
            this.$lightbox.find(".img-select").remove();
            return $.getJSON("php/ajax/Loader.php",
                    {"action":"get_slide_image_names"},
                    this.CreateListOfImages.bind(this));
        };

        /**
         *
         * Prosessoi ladattujen kuvannimien listan ja luo siitä
         * select-elementin
         *
         * @param data dian tiedot ajax-responssina 
         *
         **/
        source.prototype.CreateListOfImages = function(data){
            var self = this,
                $sel = $(`<select class='img-select'>
                        <option>Ei kuvaa</option>
                      </select>`);
            $sel.on("change",function(){ 
                Utilities.Preview($(this).parents(".with-preview"), $(this).val())}
            );
            $.each(data, function(idx,imgname){
                imgname = imgname.filename;
                $("<option>").text(imgname).appendTo($sel);
                } 
            );
            self.$lightbox.find(".img-select-parent").append($sel);
            //Kuvien lautauksen jälkeen lataa ylätunnisteet
            self.SetHeaderTemplates();
        };



    }


    return {
        Attach,
    };

}();
