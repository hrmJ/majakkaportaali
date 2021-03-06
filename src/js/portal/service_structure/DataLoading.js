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
         * @param new_slot jos määritetty, kyseessä on uusi slotti eikä vanhan datan lataus
         *
         */
        source.prototype.LoadParams = function(new_slot){
            var new_slot = new_slot || false;
            //Huolehdi siitä, että kuvanvalintavalikot ovat näkyvissä ennen tietojen lataamista
            this.AddImageLoader();
            this.slot_number = this.$container.find(".slot-number").text() || $(".slot").length + 1 ;
            this.slot_name = this.$container.find(".slot_name_orig").val();
            this.instruction = this.$container.find(".instruction_orig").val();
            this.$lightbox.find(".segment-name").val(this.slot_name);
            this.$lightbox.find(".instruction").val(this.instruction);
            if(!new_slot){
                $.getJSON("php/ajax/Loader.php",
                    {
                        "action": "get_" + this.segment_type.replace("segment","slide"),
                        "id" : this.slide_id,
                        "service_id": this.service_id
                    },
                    this.FillInData.bind(this));
            }

            return this;
        };

        /**
         *
         * Tallentaa diaaan tehdyt muutokset
         *
         * @param callback, funktio,joka laukaistaan, kun tallennus valmis
         *
         */
        source.prototype.SaveParams = function(callback){
            callback = callback || function(){};
            var self = this,
                params = {
                    action: "save_slide",
                    table: this.segment_type + "s",
                    id: this.slide_id,
                    params: this.slide_params
                },
                path = Utilities.GetAjaxPath("Saver.php");
            $.post(path, params,function(){
                self.SetSlotParams();
                if(!self.id){
                    self.AddNewSlot(callback);
                }
                else{
                    self.UpdateSlot(callback);
                }
            });
            return this;
        };


        /**
         *
         * Hakee yleiset, tätä slottia koskevat tiedot ja tallentaa ne
         * slot_params-attribuuttiin
         *
         */
        source.prototype.SetSlotParams = function(){
            var addedclass = this.$lightbox.find("select[name='addedclass']").val();
            addedclass = (addedclass.substr(0,1) == "." ? addedclass : "." + addedclass);
            this.slot_params = {
                "slot_name" : this.$lightbox.find(".segment-name").val(),
                "slot_number" : this.slot_number,
                "slot_type" : this.segment_type,
                "id_in_type_table" : null,
                "addedclass" : addedclass,
                "header_id" : this.header_id,
                "content_id" : this.slide_params.id,
                "instruction" : this.$lightbox.find(".instruction").val(),
            };


            return this;
        };

        /**
         *
         * Päivittää tietokantaan käyttäjän muuttamat slottikohtaiset tiedot
         *
         * @param callback funktio, joka suoritetaan, kun valmis
         *
         */
        source.prototype.UpdateSlot = function(callback){
            var params = {
                params: this.slot_params,
                id: this.id,
                action: "save_slot"
            },
            path = Utilities.GetAjaxPath("Saver.php");
            if(this.service_id){
                //Tarkistetaan, onko kyseessä messukohtainen dia
                params.params.service_id = this.service_id;
                params.service_id = this.service_id;
            }
            $.post(path, params, callback.bind(this));
        };

        /**
         *
         * Lisää kokonaan uuden slotin tietokantaan: jos esimerkiksi käyttäjä
         * lisää slotin "alkuinfo", tämä lisätään presentation_structure-tauluun samalla
         * kun dian konkreettinen lisätään infosegments-tauluun
         *
         * @param callback funktio, joka suoritetaan, kun valmis
         *
         */
        source.prototype.AddNewSlot = function(callback){
            var params = {
                action: "add_new_slot",
                params: this.slot_params
                },
                path = Utilities.GetAjaxPath("Loader.php");
            if(this.service_id){
                //Tarkistetaan, onko kyseessä messukohtainen dia
                params.params.service_id = this.service_id;
                params.service_id = this.service_id;
            }
            //Haetaan tietokannasta viimeisimmän tämän tyypin diasisällön id ja
            //vasta sitten jatketaan
            $.getJSON(path,
                {
                    action : "check_last_index_of_segment_type",
                    segment_type: this.segment_type
                }, 
                function(max_id){
                    params.params.content_id = max_id * 1;
                    $.post("php/ajax/Saver.php", params, callback.bind(this));
                });
        };

        /**
         *
         * Hakee luokan, jos asetetu
         *
         */
        source.prototype.GetSlideClass = function(){
            if(this.$lightbox.find("select[name='addedclass']").length>0){
                this.slide_params.addedclass = this.$lightbox.find("select[name='addedclass']").val();
            }
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
         *
         * Lataa käytössä olevta messuosiot / dialuokat tietokannasta
         *
         */
        source.prototype.GetSlideClasses = function(){
            var self = this;
            self.selectedclass = self.$container.find(".addedclass").val();
            //Poistetaan kokonaan edellisellä avauksella näkyvissä ollut select
            self.$lightbox.find("select[name='addedclass']").remove();
            self.$lightbox.find(".addedclass_span").append("<select name='addedclass'>");
            $.getJSON("php/ajax/Loader.php", {"action":"get_slideclass_names"},
                this.SetSlideClasses.bind(this));
        };

        /**
         *
         * Syötä käytössä olevta messuosiot / dialuokat select-valikkoon
         *
         * @param data ajax-responssina saatu data eli lista käytössä olevista luokista
         *
         */
        source.prototype.SetSlideClasses = function(data){
            var self = this;
            $.each(data,function(idx, thisclass){
                if([".Laulu",".Raamatunteksti"].indexOf(thisclass)==-1){
                    if(self.selectedclass){
                        var selectme = (self.selectedclass.replace(".","") == thisclass.replace(".","") 
                            ?  " selected " : "");
                    }
                    self.$lightbox.find("select[name='addedclass']")
                        .append(`<option value='${thisclass}' ${selectme}>
                                ${thisclass.replace(".","")}
                                </option>`);
                }
            });
            //Lisää vielä mahdollisuus lisätä uusi luokka
            self.$lightbox.find("select[name='addedclass']").append("<option value='Uusi luokka'>Uusi luokka</option>");
            self.$lightbox.find("select[name='addedclass']").select_withtext();
        };

    }


    return {
        Attach,
    };

}();
