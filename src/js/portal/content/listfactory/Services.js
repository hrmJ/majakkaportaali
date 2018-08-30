Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messujen hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Services = function(){

        this.addhtml = (`
                    <section>
                        <h4 class='closed'>Lisää yksittäinen messu</h4>
                        <div class='hidden '>
                            <div class='label-parent'>
                                <div>Messun pvm</div>
                                <input name='single_date' class='datepicker_input'></input>
                            </div>
                        </div>
                        <h4 class='closed'>Lisää useita messuja</h4>
                        <div class='hidden basic-flex'>
                            <div class='label-parent'>
                                <div>Ensimmäinen messu</div>
                                <input name='start_date' class='datepicker_input'></input>
                            </div>
                            <div class='label-parent'>
                                <div>Viimeinen messu</div>
                                <input name='end_date' class='datepicker_input'></input>
                            </div>
                        </div>
                    </section>
                `);

        this.edithtml = (`
                    <section>
                            <div class='label-parent'>
                                <div>Messun päivämäärä</div>
                                <input name='service_date' class='datepicker_input'></input>
                            </div>
                            <div class='label-parent'>
                                <div>Messun aihe</div>
                                <input name='service_theme' class=''></input>
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
            $li.find("span").html(`<strong>${raw_data.servicedate}</strong>:  ${raw_data.theme}`);
            $li.append(
                (`<input type='hidden' class='id_container' value='${raw_data.id}'></input>
                   <input type='hidden' class='theme_container' value='${raw_data.theme}'></input>
                    `)
            );
            return $li;
        }

        /**
         *
         * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.EditEntry = function(){
            var $html = $(this.edithtml),
                sdate = $.datepicker.parseDate("dd.mm.yy",
                        this.$current_li.find("strong").text());
            this.PrintEditOrAdderBox($html);
            $html.find("[name='service_date']").datepicker("setDate", sdate);
            $html.find("[name='service_theme']").val(this.$current_li.find(".theme_container").val());
        };


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
            $html.find("h4").click(Portal.Menus.InitializeFoldMenu);
            $html.find(".hidden").hide();
            $(".datepicker_input").datepicker();
        }


        /**
         *
         * Tallentaa lisätyn messun
         *
         */
        this.GetAddedParams = function(){
            var start_date = $("[name='start_date']").datepicker("getDate"),
                end_date = $("[name='end_date']").datepicker("getDate"),
                single_date = $("[name='single_date']").datepicker("getDate"),
                newdates = [];
            if(start_date && end_date){
                newdates = Utilities.getDaysBetweenDates(start_date, end_date, start_date.getUTCDay());
            }
            else if (single_date){
                newdates = [$.datepicker.formatDate('yy-mm-dd', single_date)];
            }
            return {
                dates: newdates,
            };
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
            this.PrintEditOrAdderBox($(this.addhtml));
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
                "action" : "remove_service",
                "service_id" : $li.find(".id_container").val()
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
            var newdate = $("[name='service_date']").datepicker("getDate");
            newdate = $.datepicker.formatDate('yy-mm-dd', newdate);
            var params =  {
                "newvals" : {
                    "theme" : $("#list_editor").find("[name='service_theme']").val(),
                    "servicedate" : newdate
                },
                "service_id" : this.$current_li.find(".id_container").val(),
            };
            console.log(params)

            return params;
        }


};

