import bs4
import urllib
import re
import sys

def GetHymn(no): 
    no = str(no)
    while len(no)<3:
        no = "0" + no
    url = "http://notes.evl.fi/Virsikirja.nsf/pudotusvalikko/{}?OpenDocument".format(no)
    try:
        req = urllib.request.urlopen(url)
    except:
        try:
            url = "http://notes.evl.fi/Virsikirja.nsf/pudotusvalikko/{}a?OpenDocument".format(no)
            req = urllib.request.urlopen(url)
        except:
            print("Error with no {}  ".format(no))
            return 0
    s = bs4.BeautifulSoup(req)
    verses = s.findAll("font",{"size":"2"})
    versetext = "Virsi {}\n\n".format(no)
    for verse in verses:
        if verse.text:
            versetext += verse.text + "\n"*2
    versetext = re.sub(r"(\d+)\..*\n",r"\1.",versetext)
    with open("virsi_{}.txt".format(no),"w") as f:
        f.write(versetext.strip())
    print("Wrote hymn no {}".format(no))
    return verses

try:
    for idx in range(int(sys.argv[1]),int(sys.argv[2])):
        GetHymn(idx)
except IndexError:
    print("Usage: {} <first hymn number> <last hymn number>".format(sys.argv[0]))

