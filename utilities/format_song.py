# Pikku skripti, jolla tekstitiedostosta tehdään laulu-html testattavaksi
import sys
import re

try:
    with open(sys.argv[1],"r") as f:
        s = f.read().split("\n"*2)
except IndexError:
    print("Käyttö: {} <tekstitiedosto>".format(sys.argv[0]))
    sys.exit(0)

output = """
<section class='song'>
    <header>
        <h2>{}</h2>
         <div class='byline'>
            <div>Säv. Trad</div>
            <div>San. Trad</div>
         </div>
    </header>
    """.format(s[0])
for verse in s[1:]:
    output += """

            <article class='verse'>
                {}
            </article>
            
            """.format(re.sub(r"\n",r"<br>\n{}".format(" "*16),verse))
output += "</section>"

print(output)

