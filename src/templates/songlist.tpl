<section>
    <form name="songlistform" action="[@action]" method="POST">
        <h2>Majakkamessun laulut</h2>
        <hr>

        <h3>Yksittäiset laulut</h3>
        [@singlesongs]

        <h3>Ylistys- ja rukouslaulut</h3>
        [@worshipsongs]
        <div><button>+</button> <button>-</button></div>

        <h3>Ehtoollislaulut</h3>
        [@communionsongs]
        <div><button>+</button> <button>-</button></div>

        <h3>Liturgiset</h3>
        [@liturg]

        <div><input type="submit" name="savesongs" value="Tallenna"></div>
    </form>
</section>
