Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messukausien hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Seasons = function(){

        var comment_placeholder =  `Tähän voi kirjoittaa ajatuksia siitä,
        mitä messukauden teemalla tarkoitetaan tai esimerkiksi  lyhyen toimintakertomuksen
        messukaudesta`.replace(/\s+/g,' ');

        this.edithtml = (`
                    <section>
                        <div class='label_parent'>
                            <div>Alkupäivämäärä</div>
                            <input name='start_date' class='datepicker_input'></input>
                        </div>
                        <div class='label_parent'>
                            <div>Loppupäivämäärä</div>
                            <input name='end_date' class='datepicker_input'></input>
                        </div>
                        <div class='label_parent'>
                            <div>Messukauden nimi</div>
                            <div>
                                <input name='season_name' type='text' value=''></input>
                            </div>
                        </div>
                        <div class='label_parent'>
                            <div>Messukauden teema</div>
                            <div>
                                <input name='season_theme' type='text' value=''></input>
                            </div>
                        </div>
                        <div class='label_parent'>
                            <div>Kommentteja kaudesta / kauden teemasta</div>
                            <div>
                            <textarea placeholder='${comment_placeholder}' class='description'></textarea>
                            </div>
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
                <input type='hidden' class='season_name' value='${raw_data.name}'></input>
                <input type='hidden' class='start_date' value='${raw_data.startdate}'></input>
                <input type='hidden' class='end_date' value='${raw_data.enddate}'></input>
                <input type='hidden' class='season_theme' value='${raw_data.theme}'></input>
                <input type='hidden' class='season_id' value='${raw_data.id}'></input>
                <input type='hidden' class='season_description' value='${raw_data.description}'></input>
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
                        this.$current_li.find(".end_date").val()),
                vals = {
                    description: this.$current_li.find(".season_description").val(),
                    theme: this.$current_li.find(".season_theme").val(),
                    name: this.$current_li.find(".season_name").val()
                }
            this.PrintEditOrAdderBox($html);
            $.each(vals, function(name, val){
                val = (!val || val == 'null' ? '' : val);
                $html.find("[name='season_" + name + "']").val(val);
            });
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

            var dates = {
                startdate: $("[name='start_date']").datepicker("getDate"),
                enddate : $("[name='end_date']").datepicker("getDate")
                },
                params = {
                    newvals : {
                        "theme" : $("#list_editor").find("[name='season_theme']").val(),
                        "description" : $("#list_editor").find("[name='season_description']").val(),
                        "name" : $("#list_editor").find("[name='season_name']").val()
                    },
                    "season_id":  this.$current_li.find(".season_id").val()
                };
            $.each(dates, function(name, val){
                params.newvals[name] = $.datepicker.formatDate('yy-mm-dd', val);
            });

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
