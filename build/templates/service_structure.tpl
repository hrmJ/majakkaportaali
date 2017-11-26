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
            <h2 class="subwindow-opener slide-section-controller">Dian perustiedot</h2>
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
            <div class="slidemodel-flex">
            </div>
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


        <div class="songslide slidemodel">
            <h2>Lisää lauludia</h2>
            <div class="slidemodel-flex-column">
                <div class="class-adder">
                    <span>Valitse dian tyyppi: </span> <span class="addedclass_span"></span>
                </div>
                <div>
                    <input type="text" class="segment-name" placeholder="Laulun nimi"></input>
                </div>
                <div>
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
                <div class="slidemodel-flex">
                    <div><textarea class='songslidetext songdescription' placeholder="Kirjoita kuvaus siitä, minkälaisia lauluja tässä yleensä pitäisi olla"></textarea></div>
                </div>
            </div>
        </div>

    <div>
</div>
