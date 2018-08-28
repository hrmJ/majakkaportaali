Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messukausien hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Offerings = function(){

    this.edithtml = `
                    <article>
                        <section>
                            <div class='label_parent'>
                                <div>Kolehtikohteen nimi</div>
                                <div>
                                    <input class='target_name' type='text' value=''></input>
                                </div>
                            </div>
                            <div class='label_parent'>
                                <div>kohteen kuvaus</div>
                                <div>
                                <textarea placeholder='esim. "Lastenkoti X maassa Y on perustettu vuonna... Se on..."' class='target_description'></textarea>
                                </div>
                            </div>
                        </section>
                        <h4 class='closed'>Lisää ensimmäinen tavoite kohteeseen</h4>
                    </article>
                    `;

    this.newgoal_html = `
                    <section class='hidden'>
                        <div class='label_parent'>
                                <div>Tavoitteen nimi</div>
                                <div>
                                    <input class='goal_name' type='text' value=''></input>
                                </div>
                        </div>
                        <div class='label_parent'>
                                <div>Määrä (<span class='amount_num'>0</span> €)</div>
                                <div class='goal_amount'></div>
                        </div>
                        <div class='label_parent'>
                                <div>Tavoitteen kuvaus</div>
                                <div>
                                    <textarea class='goal_description' placeholder='esimerkiksi "vuoden ruoka ja vaatteet kymmenelle lastenkodin lapselle"'></textarea>
                                </div>
                        </div> 
                    </section>`;


        /**
         *
         * @param raw_data tarvittavat tiedot tietokannasta
         * @param $li muokattava ja palautettava listaelementti
         *
         */
        this.AddListRow = function(raw_data, $li){
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
        }

        /**
         *
         * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.EditEntry = function(){
        };

        /**
         *
         * Hakee alkion muokkauksessa muuttuneet  parametrit
         *
         */
        this.GetEditParams = function(){
        }

        /**
         *
         * Tallentaa lisätyn kolehtikohteen sekä mahdollisen tavoitteen
         *
         */
        this.GetAddedParams = function(){
            if($("#list_editor .goal_name").val()){
                goals = [
                    {
                        name: $("#list_editor .goal_name").val(),
                        description: $("#list_editor .goal_description").val(),
                        amount: $("#list_editor .amount_num").text()*1,
                    }
                ]
            }

            return {
                target_name: $("#list_editor .target_name").val(),
                target_description: $("#list_editor .target_description").val(),
                goals: goals,
            }
        };


        /**
         *
         * Lisää uuden alkion listaan.
         *
         *
         */
        this.AddEntry = function(){
            this.OpenBox();
            $(this.edithtml)
                .append(this.newgoal_html)
                .appendTo("#list_editor .edit_container");
            $("#list_editor .edit_container h4").click(Portal.Menus.InitializeFoldMenu);
            $(".goal_amount").slider(
                {
                    min: 0,
                    max: 20000,
                    step: 100,
                    slide: (ev, ui) => $("#list_editor .amount_num").text(ui.value)
                }
            );
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
        }
    
};

