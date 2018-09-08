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
                                <input class='slide_header'></input>
                            </div>
                            <div class='label-parent some-margin'>
                                <div>Dian teksti</div>
                                <textarea class='maintext' placeholder='esim. lauleskellaan yhdessä'></textarea>
                            </div>
                            <h4 class='closed'>Kuva?</h4>
                            <div class='label-parent some-margin hidden'>
                                <div>Kuvatiedosto</div>
                                <div class='with-preview'>
                                    <div class='img-select-parent'></div>
                                    <div class="preview"></div>
                                </div>
                                <div class="basic-flex">
                                    <div>Kuvan sijainti</div>
                                    <div>
                                        <select class="img-pos-select">
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
            return $li;
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
            this.AddImageLoader();
            $("#list_editor .edit_container h4").click(Portal.Menus.InitializeFoldMenu);
            //$(".datepicker_input").datepicker();
            $("#list_editor .header_settings")
                .append($("#headertemplate_container > *").clone(true));
            $("#list_editor .header_settings *").show();
            list.LoadServices(this.PrintSelectableServiceList.bind(this));
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
                        <input type='checkbox' value='${s.id}'></input>
                        ${s.servicedate}
                    </li>`;
                })
            );
            console.log($ul.get(0));
            $("#list_editor .selected_services").html("").append($ul);
        }


        /**
         *
         * Hakee diaa koskevat tiedot muokkaus- / lisäysikkunasta
         *
         */
        this.GetSlideParams = function(){
            var selector = "#list_editor .edit_container ";
            return {
                header: $(selector + ".slide_header").val(),
                //id: this.slide_id,
                maintext: $(selector + ".maintext").val(),
                imgname: $(selector + ".img-select").val() || "" ,
                imgposition: $(selector + ".img-pos-select").val(),
                header_id: $(selector + "[name='header_select']").val(),
            }
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
        }


        /**
         *
         * Hakee alkion muokkauksessa muuttuneet  parametrit
         *
         *
         */
        this.GetEditParams = function(){
            return params;
        }


};

