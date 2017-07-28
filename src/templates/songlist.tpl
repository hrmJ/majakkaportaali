<section>
   <article>
        <form name="songlistform" action="[@action]" method="POST">
            <h2>Majakkamessun laulut</h2>

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
            <div class="multisongs ws"><input type="button" class="increaser" value="+"> <input type="button" class="decreaser" value="-"></div>

            <h3>Ehtoollislaulut</h3>
            <table>
                <thead></thead>
                <tbody>
                    [@communionsongs]
                </tbody>
            </table>
            <div class="multisongs com"><input type="button" class="increaser" value="+"> <input type="button" class="decreaser" value="-"></div>

            <h3>Liturgiset</h3>
            <p>Valitse Jumalan karitsa ja Pyhä-hymnin versio. Jos haluat käyttää jotakin
            laulua, joka ei ole listassa, valitse kohta
            "jokin muu" ja kirjoita laulun nimi ja
            tarvittaessa sanat.</p>
            <table>
                <thead></thead>
                <tbody>
                    <tr>
                        <td>Jumalan karitsa</td>
                        <td>[@jkmenu]</td>
                        <td class="lyricsindicator jklyr"></td>
                    </tr>
                    <tr>
                        <td>Pyhä-hymni</td>
                        <td>[@pyhmenu]</td>
                        <td class="lyricsindicator pyhlyr"></td>
                    </tr>
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



