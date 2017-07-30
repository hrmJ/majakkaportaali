<!DOCTYPE html>
<html>
<head>
<meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1'>
<link rel="stylesheet" href="js/vendor/jquery-ui-1.12.1.custom/jquery-ui.min.css">
<link rel="stylesheet" href="stylesheets/main.css">
<script src="js/vendor/jquery-3.2.1.min.js"></script>
<script src="js/vendor/jquery-ui-1.12.1.custom/jquery-ui.min.js"></script>
<script src="js/main.js"></script>
<title>[@title]</title>
</head>

<body class='[@bodyclass]'>

<div class='container'>
    <header>
        <h1>Majakkaportaali</h1>
    </header>
    <nav>
        <span class='hamburger hamburger-icon'></span>
        <div class='dropdown'>
            <ul>
            <li><a href="servicelist.php">Yleisnäkymä</a></li>
            <li><a href="songs.php">Syötä lauluja</a></li>
            <li>Ylläpito</li>
            <li>Kirjaudu ulos</li>
            </ul> 
        </div>
    </nav>
    <div class="byline">[@byline]</div>
    <main>
    [@content]
    </main>
</div>

</body>

</html>
