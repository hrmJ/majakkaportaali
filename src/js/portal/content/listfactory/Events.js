Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messukausien hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Events = function(){

        this.keys = ["name", "event_date", "description", "place_and_time"];
        this.addhtml = (`
                    <section>
                        <div class='label-parent some-margin'>
                            <div>Tapahtuman nimi</div>
                            <input type='text' class='name'></input>
                        </div>
                        <div class='label-parent some-margin'>
                            <div>Tapahtuman kuvaus</div>
                            <textarea class='description'></textarea>
                        </div>
                        <div class='label-parent some-margin'>
                            <div>Päivämäärä</div>
                            <input type='text' class='event_date'></input>
                        </div>
                        <div class='label-parent some-margin'>
                            <div>Paikka ja kellonaika</div>
                            <input type='text' class='place_and_time'></input>
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
            return $li;
        }

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
            $(".event_date").datepicker();
        }


        /**
         *
         * Hakee muokatut / lisätyt arvot editori-ikkunasta
         *
         */
        this.GetParams = function(){
            var selector = "#list_editor .edit_container .",
                params = {},
                ev_date = $(selector + "event_date").datepicker("getDate");
            vals = this.keys.map((key) => $(selector + key).val());
            $.each(this.keys,(idx,el)=>params[el] = vals[idx]);
            params.event_date = $.datepicker.formatDate('yy-mm-dd', ev_date);
            console.log(params)
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
         *
         */
        this.AddEntry = function(){
            this.OpenBox();
            this.PrintEditOrAdderBox(this.addhtml);
            $("<div class='below_box'><button>Tallenna</button></div>")
                .click(this.SaveAdded.bind(this))
                .appendTo($("#list_editor"));
        };

        /**
         *
         * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
         *
         */
        this.EditEntry = function(){
            var selector = "#list_editor .edit_container .";
            this.PrintEditOrAdderBox(this.addhtml);
            $.each(this.keys, (idx, key) => {
                oldval = this.$current_li.find("." + key + "-container").val();
                console.log(oldval);
                $(selector + key).val(oldval);
                if(key == "event_date"){
                    oldval = $.datepicker.parseDate("yy-mm-dd", oldval);
                    $(selector + key).datepicker("setDate", oldval);
                }
            });
        };


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

        /**
         *
         * Hakee alkion poistoa varten tarvittavat listatyyppikohtaiset parametrit
         *
         * @param $li se listan alkio, jota ollaan poistamassa.
         *
         */
        this.GetRemoveParams = function($li){
            var params =  {
                "action" : "remove_event",
                "id" : $li.find(".id-container").val()
            };
            return params;
        }
    
};

