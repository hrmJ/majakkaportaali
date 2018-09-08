Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messujen hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Infos = function(){

        this.addhtml = (`
                    <section>
                            <div class='label-parent some-margin'>
                                <div>Dian otsikko</div>
                                <input class='header'></input>
                            </div>
                            <div class='label-parent some-margin'>
                                <div>Dian teksti</div>
                                <textarea class='maintext' placeholder='esim. lauleskellaan yhdessä'></textarea>
                            </div>
                            <h4 class='closed'>Kuva?</h4>
                            <div class='label-parent some-margin hidden slide-img'>
                                <div>Kuvatiedosto</div>
                                <div class='with-preview'>
                                    <div class='img-select-parent'></div>
                                    <div class="preview"></div>
                                </div>
                                <div class="basic-flex">
                                    <div>Kuvan sijainti</div>
                                    <div>
                                        <select class="img-pos-select imgposition">
                                            <option value="left">Tekstin vasemmalla puolella</option>
                                            <option value="right">Tekstin oikealla puolella</option>
                                            <option value="top">Tekstin yläpuolella</option>
                                            <option value="bottom">Tekstin alapuolella</option>
                                            <option value="wholescreen">Koko ruutu</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <h4 class='closed'>Messut, joissa infoa näytetään</h4>
                            <div class='label-parent some-margin hidden selected_services'>
                            </div>
                            <h4 class='closed'>Lisäasetukset</h4>
                            <div class='hidden header_settings'>
                            </div>
                    </section>
                `);


        /**
         *
         * @param raw_data tarvittavat tiedot tietokannasta
         * @param $li muokattava ja palautettava listaelementti
         *
         */
        this.AddListRow = function(raw_data, $li){
            var keys = ["id", "header_id", "header", "imgname", "imgposition", "maintext"];
            $li.find("span").html(`${raw_data.header}`);
            console.log(raw_data);
            $.each(keys, (idx, key) => {
                $li.append(`<input type='hidden' class='${key}-container' 
                    value='${raw_data[key]}'></input>`)
            }
            );
            $li.append(`<input type='hidden' class='services-container' 
                value='${raw_data.services.join(";")}'></input>`);
            return $li;
        }

        /**
         *
         * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.EditEntry = function(){
            var selector = "#list_editor .edit_container",
                keys = ["header", "imgposition", "maintext"],
                oldval = undefined,
                service_ids = this.$current_li.find(".services-container").val().split(";");
            //Header_id-attribuutin asettaminen valitsee automaattisesti oikean ylätunnisteen listasta
            this.header_id = this.$current_li.find(".header_id-container").val();
            this.PrintEditOrAdderBox(this.addhtml);
            //Kuvan lataus vasta kun tietokannasta haku valmis
            $.when(this.imageloader_added).done(() => {
                oldval = this.$current_li.find(".imgname-container").val();
                $(".slide-img .img-select").val(oldval);
            });
            //Messujen valinta kun tietokannasta haku valmis
            $.when(this.servicelist_added).done(() => {
                $.each(service_ids, (idx, service_id) => {
                    $(`.service_for_info[value='${service_id}']`).get(0).checked = true;
                });
            });
            //Muut arvot: otsikko, kuvan paikka, teksti
            $.each(keys, (idx, key) => {
                oldval = this.$current_li.find("." + key + "-container").val();
                $(selector + " ."  + key).val(oldval);
            });
        };


        /**
         *
         * Tulostaa muokkauslaatikon tai uuden lisäämislaatikon
         *
         * @param htmlstring mikä sisältö laatikolle annetaan
         *
         */
        this.PrintEditOrAdderBox = function(htmlstring){
            var list = new Portal.Servicelist.List();
            $("#list_editor .edit_container").html("");
            $(htmlstring).appendTo("#list_editor .edit_container");
            this.$lightbox = $("#list_editor");
            this.imageloader_added =  this.AddImageLoader();
            $("#list_editor .edit_container h4").click(Portal.Menus.InitializeFoldMenu);
            //$(".datepicker_input").datepicker();
            $("#list_editor .header_settings")
                .append($("#headertemplate_container > *").clone(true));
            $("#list_editor .header_settings *").show();
            this.servicelist_added = list.LoadServices(this.PrintSelectableServiceList.bind(this));
        }


        /**
         *
         * Lisää lisäysikkunaan listan messuista ja mahdollisuuden valita, missä 
         *
         * @param services lista messuista
         *
         */
        this.PrintSelectableServiceList = function(services){
            var $ul = $("<ul></ul>");
            $ul.append(
                services.map((s)=> {
                    return `<li>
                        <input type='checkbox' class='service_for_info' value='${s.id}'></input>
                        ${s.servicedate}
                    </li>`;
                })
            );
            $("#list_editor .selected_services").html("").append($ul);
        }


        /**
         *
         * Hakee diaa koskevat tiedot muokkaus- / lisäysikkunasta
         *
         */
        this.GetSlideParams = function(){
            var selector = "#list_editor .edit_container ",
                $checked = $(selector  + ".service_for_info:checked"),
                service_ids = [];
            this.cancel_save = false;
            $.each($checked, (idx, el) => service_ids.push($(el).val()));
            return {
                header: $(selector + ".header").val(),
                //id: this.slide_id,
                maintext: $(selector + ".maintext").val(),
                imgname: $(selector + ".img-select").val() || "" ,
                imgposition: $(selector + ".img-pos-select").val(),
                header_id: $(selector + "[name='header_select']").val(),
                service_ids:  service_ids
            };
        };

        /**
         *
         * Tallentaa lisätyn messun
         *
         */
        this.GetAddedParams = function(){
            return this.GetSlideParams();
        };


        /**
         *
         * Lisää uuden alkion listaan.
         *
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.AddEntry = function(){
            this.OpenBox();
            this.PrintEditOrAdderBox(this.addhtml);
            this.AddSaveButton(this.CheckAndSave);
        };


        /**
         *
         * Tarkistaa, että kaikki tarpeellinen on valittu ja käynnistää tallennusprosessin
         *
         *
         */
        this.CheckAndSave = function(){
            var params = this.GetSlideParams();
            if(!params.service_ids.length){
                alert("Valitsi ainakin yksi messu, jossa infoa näytetään!");
            }
            else{
                this.SaveAdded();
            }
        };


        /**
         *
         * Hakee alkion poistoa varten tarvittavat listatyyppikohtaiset parametrit
         *
         * @param $li se listan alkio, jota ollaan poistamassa.
         *
         */
        this.GetRemoveParams = function($li){
            var params =  {
                "action" : "remove_info",
                "content_id" : $li.find(".id-container").val()
            };
            return params;
        }


        /**
         *
         * Hakee alkion muokkauksessa muuttuneet  parametrit
         *
         *
         */
        this.GetEditParams = function(){
            var params =  this.GetSlideParams();
            params.content_id = this.$current_li.find(".id-container").val();
            return params;
        }


};

