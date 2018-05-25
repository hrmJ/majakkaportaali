GeneralStructure.SlotFactory = GeneralStructure.SlotFactory || {};


/**
 *
 * Yksittäisen diasisällön lisäävä olio.
 *
 */
GeneralStructure.SlotFactory.infoslide = function(){
    this.slideclass = ".infoslide";
    this.segment_type = "infosegment";



    /**
     *
     * Lisää ajax-ladatun datan slottiin
     *
     * @param data dian tiedot ajax-responssina 
     *
     **/
    this.FillInData = function(data){
        var self = this;
        self.$lightbox.find(".slide-header").val(data.header);
        self.$lightbox.find(".infoslidetext").val(data.maintext);
        if(data.imgname){ 
            self.$lightbox.find(".slide_img .img-select").val(data.imgname);
            self.$lightbox.find(".slide_img .img-pos-select").val(data.imgposition);
        }
        if(data.genheader){
            //Lisää ruksi, jos määritetty, että on yläotsikko
            self.$lightbox.find("[value='show-upper-header']").get(0).checked=true;
        }
        var used_img = self.$lightbox.find(".slide_img .img-select").val();
        if(used_img!="Ei kuvaa"){
            //Lataa valmiiksi kuvan esikatselu, jos kuva määritelty
            Preview(self.$lightbox.find(".slide_img .img-select").parents(".with-preview"),"images/" + used_img);
        }
    };

    /**
     *
     * Kerää diaan liittyvän informaation tallentamista tai esikatselua
     * varten
     *
     **/
    this.SetSlideParams = function(){
        var maintext = this.$lightbox.find(".slidetext").val();
        this.slide_params = {
                maintext:maintext,
                id: this.slide_id,
                header:this.$lightbox.find(".slide-header").val(),
                genheader: this.$lightbox.find("[type='checkbox']").get(0).checked ? "Majakkamessu" : "",
                subgenheader: this.$lightbox.find("[type='checkbox']").get(0).checked ? "Messun aihe" : "",
                imgname:this.$lightbox.find(".slide_img .img-select").val() || "" ,
                imgposition:this.$lightbox.find(".slide_img .img-pos-select").val()
        }
        return this;
    };
}

