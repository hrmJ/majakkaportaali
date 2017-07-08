<section>
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
        <div class="multisongs ws"><button class="increaser">+</button> <button class="decreaser">-</button></div>

        <h3>Ehtoollislaulut</h3>
        <table>
            <thead></thead>
            <tbody>
            [@communionsongs]
            </tbody>
        </table>
        <div class="multisongs com"><button class="increaser">+</button> <button class="decreaser">-</button></div>

        <h3>Liturgiset</h3>
        <table>
            <thead></thead>
            <tbody>
            [@liturg]
            </tbody>
        </table>

        <div><input type="submit" name="savesongs" value="Tallenna"></div>
    </form>
</section>
