Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messujen hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Smallgroups = function(){

        this.keys = ["name", "description", "resp_name", "day", "time_and_place"];
        this.addhtml = (`
                    <section>
                        <div class='label-parent some-margin'>
                            <div>Pienryhmän nimi</div>
                            <input type='text' class='name'></input>
                        </div>
                        <div class='label-parent some-margin'>
                            <div>Ryhmän kuvaus</div>
                            <textarea class='description'></textarea>
                        </div>
                        <div class='label-parent some-margin'>
                            <div>Kokoontumispäivä</div>
                            <select class='day'>
                                <option>Maanantai</option>
                                <option>Tiistai</option>
                                <option>Kesiviikko</option>
                                <option>Torstai</option>
                                <option>Perjantai</option>
                                <option>Lauantai</option>
                                <option>Sunnuntai</option>
                            </select>
                        </div>
                        <div class='label-parent some-margin'>
                            <div>Kokoontumispaikka ja kellonaika</div>
                            <input type='text' class='time_and_place'></input>
                        </div>
                        <div class='label-parent some-margin'>
                            <div>Vastuuhenkilön etunimi</div>
                            <input type='text' class='resp_name'></input>
                        </div>
                        <div class='label-parent some-margin'>
                            <div>Tällä hetkellä käynnissä?</div>
                            <input type='checkbox' class='is_active'></input>
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
            $li.find("span").text(raw_data.name);
            $.each(this.keys.concat(["id"]), (idx, key) => {
                $li.append(`<input type='hidden' class='${key}-container' 
                    value='${raw_data[key]}'></input>`)
            }
            );
            $li.append(`<input type='hidden' class='is_active-container' 
                value='${raw_data.is_active}'></input>`);
            return $li;
        }

        /**
         *
         * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.EditEntry = function(){
            var selector = "#list_editor .edit_container .",
                checked = this.$current_li.find(".is_active-container").val()*1;
            this.PrintEditOrAdderBox(this.addhtml);
            $.each(this.keys, (idx, key) => {
                var oldval = this.$current_li.find("." + key + "-container").val();
                $(selector + key).val(oldval);
            });
            if(checked){
                $(selector + "is_active").get(0).checked = true;
            }
        };


        /**
         *
         * Tulostaa muokkauslaatikon tai uuden lisäämislaatikon
         *
         * @param htmlstring mikä sisältö laatikolle annetaan
         *
         */
        this.PrintEditOrAdderBox = function(htmlstring){
            $("#list_editor .edit_container").html("");
            $(htmlstring).appendTo("#list_editor .edit_container");
        }


        /**
         *
         * Hakee muokatut / lisätyt arvot editori-ikkunasta
         *
         */
        this.GetParams = function(){
            var selector = "#list_editor .edit_container .",
                params = {},
                is_active = $(selector + "is_active").is(":checked"),
                vals = this.keys.map((key) => $(selector + key).val());
            $.each(this.keys,(idx,el)=>params[el] = vals[idx]);
            params.is_active = (is_active ? 1 : 0);
            return params;
        };

        /**
         *
         * Tallentaa lisätyn ryhmän
         *
         */
        this.GetAddedParams = function(){
            return this.GetParams();
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
            this.AddSaveButton(this.SaveAdded);
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
                "action" : "remove_smallgroup",
                "id" : $li.find(".id-container").val()
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
            return  {
                 "cols" : this.GetParams(),
                 "id" : this.$current_li.find(".id-container").val(),
                }
        }


};

