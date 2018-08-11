Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messukausien hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Seasons = function(){

        this.edithtml = (`
                    <section>
                        <div class='label-parent'>
                            <div>Alkupäivämäärä</div>
                            <input name='start_date' class='datepicker_input'></input>
                        </div>
                        <div class='label-parent'>
                            <div>Loppupäivämäärä</div>
                            <input name='end_date' class='datepicker_input'></input>
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
            $li.find("span").html(`
                ${raw_data.name} ${raw_data.startdate} - ${raw_data.enddate}
                <input type='hidden' class='start_date' value='${raw_data.startdate}'></input>
                <input type='hidden' class='end_date' value='${raw_data.enddate}'></input>
                `);
            return $li;
        }


        /**
         *
         * Tulostaa muokkauslaatikon tai uuden lisäämislaatikon
         *
         * @param htmlstring mikä sisältö laatikolle annetaan
         *
         */
        this.PrintEditOrAdderBox = function($html){
            $("#list_editor .edit_container").html("");
            $html.appendTo("#list_editor .edit_container");
            $(".datepicker_input").datepicker();
        }

        /**
         *
         * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.EditEntry = function(){
            var $html = $(this.edithtml),
                start_date = $.datepicker.parseDate("dd.mm.yy",
                        this.$current_li.find(".start_date").val()),
                end_date = $.datepicker.parseDate("dd.mm.yy",
                        this.$current_li.find(".end_date").val());
            this.PrintEditOrAdderBox($html);
            console.log(start_date);
            console.log(end_date);
            $html.find("[name='start_date']").datepicker("setDate", start_date);
            $html.find("[name='end_date']").datepicker("setDate", end_date);
        };

        /**
         *
         * Hakee alkion muokkauksessa muuttuneet  parametrit
         *
         *
         */
        this.GetEditParams = function(){

            return params;
        }


        /**
         *
         * Lisää uuden alkion listaan.
         *
         *
         */
        this.AddEntry = function(){
            var $html = $(this.edithtml);
            this.PrintEditOrAdderBox($html);
            $("#list_editor").show();
        };

        /**
         *
         * Poistaa yhden listan alkion
         *
         */
        this.RemoveEntry = function(){
            console.log("REmoving");
        };
    
};

