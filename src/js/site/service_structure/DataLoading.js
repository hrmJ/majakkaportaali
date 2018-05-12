GeneralStructure = GeneralStructure || {};

GeneralStructure.DataLoading = function(){


    /**
     *
     * Liittää datan lataamiseen  liittyvän toiminnallisuuden lähdeolioon
     *
     * @param source olio, johon liitetään
     *
     **/
    function Attach(source){

        /**
         * Hae dian sisältötiedot tietokannasta: tyypistä riippuen vähintään nimi ja luokka,
         * mahdollisesti myös teksti, laulun nimi, kuvat, ylätunniste jne.
         *
         */
        source.prototype.LoadParams = function(){
            //Huolehdi siitä, että kuvanvalintavalikot ovat näkyvissä ennen tietojen lataamista
            this.AddImageLoader();
            this.slot_number = this.$container.find(".slot-number").text();
            this.slot_name = this.$container.find(".slot_name_orig").val();
            this.$lightbox.find(".segment-name").val(this.slot_name);

            var self = this;
            $.getJSON("php/loaders/fetch_slide_content.php",{"slideclass":this.slideclass.replace(".",""),"id":this.id},function(data){
                switch(self.slideclass){
                    case ".songslide":
                        if(data.multiname != ""){
                            self.$lightbox.find("[value='multisong']").get(0).checked=true;
                            self.$lightbox.find(".multisongheader").val(data.multiname).show();
                        }
                        if(data.restrictedto != ""){
                            self.$lightbox.find("[value='restrictedsong']").get(0).checked=true;
                            self.$lightbox.find(".restrictionlist").val(data.restrictedto).show();
                        }
                        self.$lightbox.find(".songdescription").val(data.songdescription);
                        break;
                    case ".infoslide":
                        self.$lightbox.find(".slide-header").val(data.header);
                        self.$lightbox.find(".infoslidetext").val(data.maintext);
                        if(data.imgname){ 
                            self.$lightbox.find(".slide_img .img-select").val(data.imgname);
                            self.$lightbox.find(".slide_img .img-pos-select").val(data.imgposition);
                        }
                        if(data.genheader != ""){
                            //Lisää ruksi, jos määritetty, että on yläotsikko
                            self.$lightbox.find("[value='show-upper-header']").get(0).checked=true;
                        }
                        var used_img = self.$lightbox.find(".slide_img .img-select").val();
                        if(used_img!="Ei kuvaa"){
                            //Lataa valmiiksi kuvan esikatselu, jos kuva määritelty
                            Preview(self.$lightbox.find(".slide_img .img-select").parents(".with-preview"),"images/" + used_img);
                        }
                        break;
                }
            });

            return this;
        };

        /**
         * Tallenna dian tiedot tietokantaan (myös mahdollista esikatselua varten)
         */
        source.prototype.SetPreviewParams =  function(){
            var self = this;
            switch(this.slideclass){
                case ".infoslide":
                    var maintext = this.$lightbox.find(".slidetext").val();
                    //korvaa ät-merkit halutuilla arvoilla
                    this.$lightbox.find(".resp_select").each(function(){maintext = maintext.replace(/@/," [" + $(this).val() + "] ")});
                    var params = {
                        maintext:maintext,
                        genheader: self.$lightbox.find("[type='checkbox']").get(0).checked ? "Majakkamessu" : "",
                        subgenheader: self.$lightbox.find("[type='checkbox']").get(0).checked ? "Messun aihe" : "",
                        imgname:this.$lightbox.find(".slide_img .img-select").val() || "" ,
                        imgpos:this.$lightbox.find(".slide_img .img-pos-select").val() ,
                        header:this.$lightbox.find(".slide-header").val()
                    };
                    break;
                case ".songslide":
                    var params = {
                        multiname: this.$lightbox.find(".multisongheader").val(),
                        restricted_to: this.$lightbox.find(".restrictionlist").val(),
                        songdescription: this.$lightbox.find(".songdescription").val(),
                        };
                    break;
            }

            // Lisää tallennettaviin parametreihin tässä määritellyt
            $.extend(this.previewparams,
                params,
                {
                slot_number : self.slot_number==undefined ? $(".slot").length + 1 : self.slot_number,
                slot_name : this.$lightbox.find(".segment-name").val(),
                header_id : this.header_id
                }
            );
        };

        /**
         * Lataa näkyviin tietokantaan tallennetut kuvat valittavaksi esitykseen lisäämistä varten.
         *
         */
        source.prototype.AddImageLoader = function(){
            var self = this;
            this.$lightbox.find(".img-select").remove();
            $sel = $("<select class='img-select'><option>Ei kuvaa</option></select>")
                .on("change",function(){ 
                    Preview($(this).parents(".with-preview"),"images/" + $(this).val())}
                );
            $.getJSON("php/loaders/load_assets.php",{"asset_type":"backgrounds"},
                    //Luo ensin lista tallennetuista kuvista. 
                    function(data){
                        $.each(data, function(idx,imgname){
                            $("<option>").text(imgname).appendTo($sel);
                            } 
                        );
                        self.$lightbox.find(".img-select-parent").append($sel);
                        self.SetHeaderTemplates();
                    });
        };


        /**
         *
         * Lataa käytössä olevta messuosiot / dialuokat select-valikkoon
         *
         */
        source.prototype.SetSlideClasses = function(){
            var self = this;
            var selectedclass = self.$container.find(".addedclass").val();
            //Poistetaan kokonaan edellisellä avauksella näkyvissä ollut select
            self.$lightbox.find("select[name='addedclass']").remove();
            self.$lightbox.find(".addedclass_span").append("<select name='addedclass'>");
            $.getJSON("php/loaders/fetch_slide_content.php",{"slideclass":"list_all","id":""},function(data){
                $.each(data,function(idx, thisclass){
                    if([".Laulu",".Raamatunteksti"].indexOf(thisclass)==-1){
                        if(selectedclass){
                            var selectme = (selectedclass.replace(".","") == thisclass.replace(".","") ? " selected " : "");
                        }
                        self.$lightbox.find("select[name='addedclass']").append("<option value='" + thisclass + "' " + selectme + ">" + thisclass.replace(".","") + "</option>");
                    }
                });
                //Lisää vielä mahdollisuus lisätä uusi luokka
                self.$lightbox.find("select[name='addedclass']").append("<option value='Uusi luokka'>Uusi luokka</option>");
                self.$lightbox.find("select[name='addedclass']").select_withtext();
            });
            //lisää muokattu jquery ui -selectmenu mahdollistamaan uusien dialuokkien luomisen
        };

    }


    return {
        Attach,
    };

}();
