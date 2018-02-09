<div>
    <section class="innercontent">
        <h2>Messun rakenne</h2>
        <p>Tällä sivulla voit määritellä messun rakenteen tai tarkemmin
        sanottuna sen, millaisena rakenne näyttäytyy diaesityksessä</p>
        <div>
            <div class='structural-slots'>
            [@units]
            </div>
            <div class='structural-element-add'>
                [@addermenu]
            </div>
        </div>
    </section>
    <div class="hidden">
        <div class="infoslide slidemodel">
            <h2 class="subwindow-opener slide-section-controller">Otsikot ja luokka</h2>
            <div class="slidemodel-flex-column controller-subwindow">
                <div class="class-adder">
                    <div>Luokka:</div> <div class="addedclass_span"></div>
                </div>
                <div>
                    <div>Tunniste:</div> <div><input type="text" class="segment-name"></input></div>
                </div>
                <div>
                     <div>Otsikko:</div> <div><input type="text" class="slide-header" placeholder="Jos et halua otsikkoa, jätä tyhjäksi"></input></div>
                </div>
                <div>
                    <input type="checkbox" value="show-upper-header">Näytä koko messun otsikko</input>
                </div>
            </div>
            <h2 class="subwindow-opener slide-section-controller">Kuva</h2>
            <div class="slidemodel-flex controller-subwindow img-adder with-preview">
                <div class="with-preview">
                    <div class="img-select-parent"></div>
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
            <h2 class="subwindow-opener slide-section-controller">Teksti</h2>
            <div class="controller-subwindow">
                <div class="slidemodel-flex">
                    <div>
                        <h3>Dian varsinainen teksti</h3>
                        <div><textarea class='infoslidetext slidetext' placeholder="Kirjoita diassa leipätekstinä näytettävä informaatio tähän."></textarea></div>
                    </div>
                    <div>
                        <h3>Upota messudataa</h3>
                        <p>Voit lisätä diaan tietoja kyseisen päivän messusta. Tämä tapahtuu kirjoittamalla
                        tekstikenttään @-merkki, minkä jälkeen tämän tekstin alle ilmestyy pudotusvalikko, josta voit
                        valita syötettävän tiedon. Ensimmäinen pudotusvalikko vastaa ensimmäistä @-merkkiä, toinen
                        toista ja niin edelleen.
                        </p>
                        <div class="injected-data">
                        
                        </div>
                    </div>
                </div>
            </div>
            <h2 class="subwindow-opener slide-section-controller">Ylätunniste</h2>
            <div class="controller-subwindow">
                <div>
                    <select name="header_select">
                    </select>
                </div>
                <div class="slidemodel-flex headertemplates">
                    <div>
                        <h3>Ylätunnisteen teksti</h3>
                        <div><textarea class='' placeholder="Esimerkiksi @messu:  @aihe . Jos et halua ylätunnistetta, jätä tyhjäksi. TODO: pudotusvalikko "></textarea></div>
                    </div>
                    <div>
                        <h3>Upota messudataa</h3>
                        <p>Voit lisätä diaan tietoja kyseisen päivän messusta. Tämä tapahtuu kirjoittamalla
                        tekstikenttään @-merkki, minkä jälkeen tämän tekstin alle ilmestyy pudotusvalikko, josta voit
                        valita syötettävän tiedon. Ensimmäinen pudotusvalikko vastaa ensimmäistä @-merkkiä, toinen
                        toista ja niin edelleen.
                        </p>
                        <div class="injected-data">
                        
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div class="songslide slidemodel">
            <h2 class = "subwindow-opener">Laulun nimi ja luokka</h2>
            <section class="slidemodel-flex-column controller-subwindow">
                <div class="class-adder">
                    <div>Dian luokka: </div> <div class="addedclass_span"></div>
                </div>
                <div>
                    <div>Laulun nimi: </div>
                    <div><input type="text" class="segment-name" placeholder="Esim. alkulaulu"></input></div>
                </div>
            </section>
            <h2 class = "subwindow-opener">Tarkempi kuvaus</h2>
            <section class="slidemodel-flex-column controller-subwindow">
                <div class="slidemodel-flex">
                    <div><textarea class='songslidetext songdescription' placeholder="Kirjoita kuvaus siitä, minkälaisia lauluja tässä yleensä pitäisi olla"></textarea></div>
                </div>
            </section>
            <h2 class="subwindow-opener">Lisävalinnat</h2>
            <section class="controller-subwindow">
                <div class="some-margin">
                    <input type="checkbox" value="multisong">Useita lauluja?</input>
                    <input type='text' class='multisongheader hidden' placeholder='Anna yhteinen otsikko kaikille lauluille'></input>
                </div>
                <div "slidemodel-flex">
                    <div>
                        <input type="checkbox" value="restrictedsong">Käytä rajattua laulujen listaa avoimen kentän sijasta?</input>
                        <input type='text' class='restrictionlist hidden' placeholder='Kirjoita hyväksyttyjen laulujen nimet pilkulla erotettuna'></input>
                    </div>
                    <div id="autocomptarget">
                        <!-- Tänne tulostetaan selattavia lauluja laulujen rajausta varten -->
                    </div>
                </div>
                <div> </div>
            </section>
            </div>


        <div class="bibleslide slidemodel">
            <div class="">
                <div class="class-adder">
                    <div>Valitse dian luokka: </div> <div class="addedclass_span"></div>
                </div>
            </div>
            <div class="">
                <div class="">
                    <span>Dian tunniste (esim. "Päivän evankeliumi")</span> <span class=""><input type="text" class="segment-name" placeholder=""></input></span>
                </div>
            </div>
        </div>


    <div>
</div>
