<section>
   <article>
        <form name="songlistform" action="[@action]" method="POST">
            <h2>Majakkamessun laulut</h2>
            <hr>

            <h3>Yksittäiset laulut</h3>
            <table>
                <thead></thead>
                <tbody>
                [@singlesongs]
                </tbody>
            </table>

            <h3>Ylistys- ja rukouslaulut</h3>
            <table>
                <thead></thead>
                <tbody>
                [@worshipsongs]
                </tbody>
            </table>
            <div class="multisongs ws"><input type="button" class="increaser" value="+"> <input type="button" class="decreaser" value="-"></div></div>

            <h3>Ehtoollislaulut</h3>
            <table>
                <thead></thead>
                <tbody>
                [@communionsongs]
                </tbody>
            </table>
            <div class="multisongs com"><input type="button" class="increaser" value="+"> <input type="button" class="decreaser" value="-"></div>

            <h3>Liturgiset</h3>
            <table>
                <thead></thead>
                <tbody>
                [@liturg]
                </tbody>
            </table>

            <div><input type="submit" name="savesongs" value="Tallenna"></div>
        </form>
    </article> 
    <article class='sideroller'>
        <h2></h2>
        <p><a href="javascript:void(0);">Muokkaa sanoja</a></p>
        <div class='versedata'></div>
    </article>
</section>
