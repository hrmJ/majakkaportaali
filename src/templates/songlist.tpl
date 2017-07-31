<section>
   <article>
        <form name="songlistform" action="[@action]" method="POST">
            <h2>Majakkamessun laulut</h2>

            <h3>Yksittäiset laulut</h3>

            <section>[@singlesongs]</section>

            <h3>Ylistys- ja rukouslaulut</h3>

            <section>[@worshipsongs]</section>

            <div class="multisongs ws"><input type="button" class="increaser" value="+"> <input type="button" class="decreaser" value="-"></div>

            <h3>Ehtoollislaulut</h3>

            <section>[@communionsongs]</section>

            <div class="multisongs com"><input type="button" class="increaser" value="+"> <input type="button" class="decreaser" value="-"></div>

            <h3>Liturgiset</h3>

            <p>Valitse Jumalan karitsa ja Pyhä-hymnin versio. Jos haluat käyttää jotakin
            laulua, joka ei ole listassa, valitse kohta
            "jokin muu" ja kirjoita laulun nimi ja
            tarvittaessa sanat.</p>

            <section>
               <div>Jumalan karitsa</div> 
               <div>[@jumalan_karitsa_menu]</div> 
               <div class="lyricsindicator jklyr"></div> 
            </section>
            <section>
               <div>Pyhä-hymni</div> 
               <div>[@pyha_menu]</div> 
               <div class="lyricsindicator pyhlyr"></div> 
            </section>

            <div><input type="submit" name="savesongs" value="Tallenna"></div>
        </form>
    </article> 
    <article class='sideroller'>
        <h2></h2>
        <p><a href="javascript:void(0);">Muokkaa sanoja</a></p>
        <div class='versedata'></div>
    </article>
</section>



