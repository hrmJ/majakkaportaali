GeneralStructure = GeneralStructure || {};
GeneralStructure.SlotFactory = GeneralStructure.SlotFactory || {};

GeneralStructure.Headers = function(){


    /**
     *
     * Liittää ylätunnisteisiin liittyvän toiminnallisuuden lähdeolioon
     *
     * @param source olio, johon liitetään
     *
     **/
    function Attach(source){
    
        /**
         *
         * Päivitä tietokantaan ylätunnisteeseen tehdyt muutokset, kuten
         * kuvan vaihtaminen tai kuvan sijainnin muuttaminen
         *
         */
        source.prototype.UpdatePickedHeader = function(){
            var self = this,
                $header = this.$lightbox.find(".headertemplates"),
                is_aside = this.$lightbox.find("input[name='header_type']").get(0).checked ? 1 : 0,
                header_id = $header.find("select[name='header_select']").val(),
                params = {
                    is_aside: is_aside,
                    imgposition: $header.find(".img-pos-select").val(),
                    imgname: $header.find(".img-select").val(),
                    maintext: $header.find("textarea").val(),
                },
                temp_params = {
                    is_aside: is_aside,
                    imgpos: $header.find(".img-pos-select").val(),
                    imgname: $header.find(".img-select").val(),
                    maintext: $header.find("textarea").val(),
                    header_id: header_id
                },
                path = Utilities.GetAjaxPath("Saver.php");
            //temp_params.header_id = header_id;
            //Päivitetään muuttuneet arvot myös nykyiseen headers-attribuuttiin
            self.headerdata[header_id] = temp_params;
            $.post(path,
                {
                    params: params,
                    header_id: header_id,
                    action: "update_headertemplate"
                },
                function(data){
                    $("body").prepend(data);
                });
        };


        /**
         * Tulostaa käyttäjän määrittämät ylätunnisteet.
         * Tallentaa myös muistiin ylätunnisteiden sisällön.
         * Huomaa, että tämä metodi kutsutaan AddImageLoader-metodista,
         * jotta ylätunnisteen kuvat ehtivät latautua.
         *
         * @param set_select_val boolean Tehdäänkö enemmän kuin vain ladataan ylätunnisteet: merkitäänkäö jokin tunniste valituksi
         *
         */
        source.prototype.SetHeaderTemplates = function(set_select_val){
            var path = Utilities.GetAjaxPath("Loader.php");
            if(set_select_val === undefined){ 
                var set_select_val = true;
            }
            var self = this;
            self.$lightbox.find(".headertemplates select").on("change",function(){self.UpdatePickedHeader()});
            self.$lightbox.find(".headertemplates textarea").on("change paste keyup",function(){self.UpdatePickedHeader()});
            self.$lightbox.find(".headertemplates [name='header_type']").on("click",function(){self.UpdatePickedHeader()});
            self.headerdata = {};
            $.getJSON(path, {"action":"get_slide_headers"},
                function(headers){
                //Jos alustetaan käyttöä varten ensimmäistä kertaa
                var $sel = self.$lightbox.find("select[name='header_select']");
                try{
                    $sel.select_withtext("destroy").html("");
                }
                catch(e){
                    $sel.select_withtext().html("");
                }
                $("<option value='0'></option>").text("Ei ylätunnistetta").appendTo($sel);
                $.each(headers,function(idx,header){
                    var is_selected = ""
                    if( !set_select_val & idx === headers.length - 1 ){ 
                        //Jos syötetty kokonaan uusi tunniste, valitaan se
                        var is_selected = " selected";
                        self.header_id = header.id;
                    }
                    else if( set_select_val & header.id == self.header_id ){ 
                        var is_selected = " selected";
                    }
                    $("<option value='" + header.id + "' "+ is_selected +"></option>").text(header.template_name).appendTo($sel);
                    //Tallenna ylätunniste id:n perusteella
                    self.headerdata[header.id] = header;
                });
                $("<option>").text("Uusi tunniste").appendTo($sel);
                self.$lightbox.find("select[name='header_select']")
                    .select_withtext({select:function(event, ui){self.PickHeader(ui.item)}})
                    .select_withtext("refresh");
                self.PickHeader();
            });
        };

        /**
         *
         * Lataa näytettäväksi käyttäjän valitseman ylätunnisteen.
         * Jos käyttäjä syöttänyt kokonaan uuden, lisätään se ylätunnisteiden listaan.
         *
         * @param selected_item valittu elementti (jquery ui-oliona)
         *
         */
        source.prototype.PickHeader = function(selected_item){
            var self = this,
                $sel = this.$lightbox.find("select[name='header_select']"),
                header = undefined,
                path = Utilities.GetAjaxPath("Saver.php");
            if (selected_item){
                //Jos funktio ajettu todellisen valinnan seurauksena
                //eikä vain muokkausikkunan avaamisen yhteydessä

                if (isNaN(selected_item.value)*1){
                    //Jos syötetty kokonaan uusi ylätunniste
                    //(arvo ei-numeerinen)
                    console.log(path);
                    $.post(path, 
                        { 
                            "action": "insert_headertemplate",
                            "template_name" : selected_item.value
                        },function(data){
                            self.SetHeaderTemplates(false);
                            self.$lightbox.find(".headertemplates .img-select").val("Ei kuvaa");
                            self.$lightbox.find(".headertemplates .img-pos-select").val("left");
                            self.$lightbox.find(".headertemplates textarea").val("");
                            Utilities.Preview(self.$lightbox.find(".headertemplates .img-select").parents(".with-preview"),
                                "Ei kuvaa");
                        });
                    return 0;
                }
                else if ( selected_item.value *1 === 0 ){
                    // Valittu "Ei ylätunnistetta"
                    self.header_id = 0;
                }
                else{
                    var header = this.headerdata[selected_item.value];
                    self.header_id = selected_item.value;
                }
            }
            else{
                //Ladataan valittu tunniste ennen kuin niitä on vaihdettu tai muokattu
                header = this.headerdata[this.header_id];
            }

            if($sel.val() === "0"){
                this.$lightbox.find(".headertemplates_hiddencontent").hide();
            }
            else{
                this.$lightbox.find(".headertemplates_hiddencontent").show();
            }
            
            if(header){
                this.$lightbox.find(".headertemplates textarea").val(header.maintext);
                this.$lightbox.find(".headertemplates .img-select").val(header.imgname);
                this.$lightbox.find(".headertemplates .img-pos-select").val(header.imgposition);
                if(header.is_aside == 1){
                    this.$lightbox.find(".headertemplates input[name='header_type']")[0].checked = true;
                }
                else{
                    this.$lightbox.find(".headertemplates input[name='header_type']")[0].checked = false;
                }
                if(header.imgname !== "Ei kuvaa"){ 
                    Utilities.Preview(this.$lightbox.find(".headertemplates .img-select").parents(".with-preview"), 
                        header.imgname);
                }
            }

        };




            
            
            };


    return {
    
        Attach,
    
    }

}();

