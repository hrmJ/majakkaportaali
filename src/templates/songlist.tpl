<form name="songlistform" action="[@action]" method="POST">
   <div class="innercontent">

        <!-- Erillinen laulujen selausnäkymä -->

        <section class='songlistview'>
                <h2>Laulujen lista</h2>
                <div><a href="javascript:void(0)" class="songlistview-toggle">Sulje laulujen lista</a></div>
                <p>Majakkamessun laulutietokannassa on tällä hetkellä <span id="number-of-songs"></span> laulua.
                Tässä ikkunassa voit selata olemassaolevia lauluja ja asettaa niille roolin messussa.
                Voit myös lisätä kokonaan uusia lauluja.
                </p>
                <div>[@alphaselect]</div>
                <section class="songnames-container">
                </section>
        </section>


       <section class="side-main">
            <h2>Majakkamessun laulut</h2>

            <div class="below-header">
                <span><a href="javascript:void(0)" class="songlistview-toggle">Selaa laulujen listaa</a></span>
                <span>Lue ohjeet</span>
            </div>

            [@songs]

            <div><input type="submit" name="savesongs" value="Tallenna"></div>

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

