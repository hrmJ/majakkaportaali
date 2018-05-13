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
        console.log(data);
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
    }
}

