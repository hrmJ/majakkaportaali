GeneralStructure.SlotFactory = GeneralStructure.SlotFactory || {};

/**
 *
 * Laulusisällön lisäävä olio.
 *
 */
GeneralStructure.SlotFactory.songslide = function(){
    this.slideclass = ".songslide";
    this.segment_type = "songsegment";


    /**
     *
     * Lisää ajax-ladatun datan slottiin
     *
     * @param data dian tiedot ajax-responssina 
     *
     **/
    this.FillInData = function(data){
        console.log(data);
        var self = this;
        this.$lightbox.find("[value='multisong']").get(0).checked=false;
        if(data.is_multi){
            this.$lightbox.find("[value='multisong']").get(0).checked=true;
        }
        this.$lightbox.find(".songdescription").val(data.songdescription);
        this.$lightbox.find("#restrict_to_tags").val(data.restrictedto);

        //Lisää toiminnallisuus valintalaatikkoihin
        this.$lightbox.find("[type='checkbox']").click(function(){ 
            $(this).parents(".checkbox-parent").next().toggle();
        });

    };


    /**
     *
     * Kerää diaan liittyvän informaation tallentamista tai esikatselua
     * varten
     *
     **/
    this.SetSlideParams = function(){
        this.slide_params = {
            songdescription: this.$lightbox.find(".songdescription").val(),
            singlename: this.$lightbox.find(".segment-name").val(),
            is_multi: (this.$lightbox.find("[value='multisong']").get(0).checked ? 1 : 0),
            restrictedto: this.$lightbox.find("#restrict_to_tags select").val()
        }
        return this;
    }

    /**
     * Lisätään select-elementti, jonka avulla laulut voidaan rajata vain
     * tiettyyn tägiin. Käytetään with_text-lisäystä, niin että voidaan lisätä
     * uusia.
     *
     */
    this.AddTagSelect = function(){
        var $sel = $("<select><option value=''>Ei rajoitusta</option></select>"),
            path = Utilities.GetAjaxPath("Loader.php");
        $.getJSON(path, {"action": "get_song_tags"}, 
            (tags) => {
                $sel
                    .append(tags.map((tag)=>`<option>${tag}</option>`))
                    .appendTo("#restrict_to_tags")
                    .selectmenu()
            });
    };


    /**
     *
     * Alustaa toiminnallisuuden
     *
     */
    this.Initialize = function(){
        this.AddTagSelect();
    }

}
