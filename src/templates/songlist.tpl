<form name="songlistform" action="[@action]" method="POST">
   <div class="innercontent">

       <section class="side-main">
            <h2>Majakkamessun laulut</h2>

            <div class="below-header">
                <span><a href="javascript:void(0)" class="songlistview-toggle">Selaa laulujen listaa</a></span>
                <span>Lue ohjeet</span>
            </div>

            <h3>Yksittäiset laulut</h3>

            <section  class="data-container">
            [@singlesongs]
            </section>

            <h3>Ylistys- ja rukouslaulut</h3>

            <section  class="data-container">

            [@worshipsongs]

            <div class="multisongs ws"><input type="button" class="increaser" value="+"> <input type="button" class="decreaser" value="-"></div>

            </section>


            <h3>Ehtoollislaulut</h3>

            <section  class="data-container">

            [@communionsongs]

            <div class="multisongs com"><input type="button" class="increaser" value="+"> <input type="button" class="decreaser" value="-"></div>

            </section>


            <h3>Liturgiset</h3> 
            <p>Valitse Jumalan karitsa ja Pyhä-hymnin versio. Jos haluat käyttää jotakin
            laulua, joka ei ole listassa, valitse kohta
            "jokin muu" ja kirjoita laulun nimi ja
            tarvittaessa sanat.</p>

            <section  class="data-container">
                <div  class="datarow">
                   <div class="">Jumalan karitsa</div> 
                   <div class="data-middle">[@jumalan_karitsa_menu]</div> 
                   <div class="lyricsindicator jklyr"></div> 
                </div>

                <div class="datarow">
                   <div class="">Pyhä-hymni</div> 
                   <div class="data-middle">[@pyha_menu]</div> 
                   <div class="lyricsindicator pyhlyr"></div> 
                </div>
            </section>

            <div><input type="submit" name="savesongs" value="Tallenna"></div>

        </section> 

        <!-- Erillinen laulujen selausnäkymä -->

        <section class='songlistview'>
                <h2>Laulujen lista</h2>
                <div><a href="javascript:void(0)" class="songlistview-toggle">Sulje laulujen lista</a></div>
                <p>Majakkamessun laulutietokannassa on tällä hetkellä <span id="number-of-songs"></span> laulua.
                Tässä ikkunassa voit selata olemassaolevia lauluja ja asettaa niille roolin messussa.
                Voit myös lisätä kokonaan uusia lauluja.
                </p>
                <section>
                    [@alphaselect]
                </section>
        </section>

        <!-- Sivuikkuna sanojen katselua ja muokkausta varten -->

        <section class='sideroller'>
            <p><a id="closewordeditlink" href="javascript:void(0);">Sulje sanojen näyttö</a></p>
            <h2></h2>
            <p><a id="editwordslink" href="javascript:void(0);">Muokkaa sanoja</a></p>
            <div class='versedata'></div>
        </section>


    </div>
</form>

