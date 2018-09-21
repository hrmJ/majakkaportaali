GeneralStructure.SlotFactory = GeneralStructure.SlotFactory || {};


/**
 *
 * Yksittäisen diasisällön lisäävä olio.
 *
 */
GeneralStructure.SlotFactory.liturgicalslide = function(){

    this.slideclass = ".liturgicalslide";
    this.segment_type = "liturgicalsegment";

    /**
     *
     * Lisää ajax-ladatun datan slottiin
     *
     * @param data dian tiedot ajax-responssina 
     *
     **/
    this.FillInData = function(data){
        if(data.use_as_header*1){
            this.$lightbox.find(".use_as_header").get(0).checked = true;
        }
        $.when(this.AddTextSelect()).done(()=>{
            this.$lightbox.find(".picked_text").val(data.text_title);
            this.$lightbox.find(".picked_text").selectmenu("refresh");
            this.PrintTextPreview();
        });
        
        var self = this;
    };

    /**
     * Lisätään select-elementti, joka sisältää mahdolliset liturgiset tekstit
     *
     */
    this.AddTextSelect = function(){
        var path = Utilities.GetAjaxPath("Loader.php"),
            $sel = $("<select class='picked_text'><option>Valitse teksti</option></select>");
        this.$lightbox.find(".liturgical_text_select").html("");
        return $.getJSON(path, {"action": "mlist_LiturgicalTexts"}, 
            (texts) => {
                console.log(texts);
                $sel
                    .append(texts.map((text)=>`<option>${text.title}</option>`))
                    .appendTo(this.$lightbox.find(".liturgical_text_select"))
                    .selectmenu()
                $sel.on("selectmenuchange", this.PrintTextPreview.bind(this))
            });
    };

    /**
     *
     * Näyttää esikatselun valitusta tekstistä
     *
     */
    this.PrintTextPreview = function(){
        var path = Utilities.GetAjaxPath("Loader.php");
        $.getJSON(path,
            {
                "action" : "get_ltext_verses",
                "title" : this.$lightbox.find(".picked_text").val()
            }, (verses) => {
                this.$lightbox.find(".text_preview")
                    .html("")
                    .append(verses.map((v) => `<p>${v.verse}</p>`));
                this.$lightbox.find(".text_preview").show();
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
            text_title: this.$lightbox.find(".picked_text").val(),
            use_as_header: this.$lightbox.find(".use_as_header").is(":checked") ? 1 : 0,
        }
        return this;
    };

    /**
     *
     * Alustaa toiminnallisuuden
     *
     */
    this.Initialize = function(){
        this.AddTextSelect();
        this.$lightbox.find(".text_preview").hide();
    }

};

