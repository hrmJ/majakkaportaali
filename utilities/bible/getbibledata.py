import pysword
import books
import db
import sys
#Pysword credits: https://github.com/tgc-dk/pysword

def TranslateBookName(en_name, testament):
    finnish_booknames = {"nt" : [
        'Matt', 'Mark', 'Luuk', 'Joh', 'Apt', 'Room', '1Kor', '2Kor', 
        'Gal', 'Ef', 'Fil', 'Kol', '1Tess', '2Tess', '1Tim', '2Tim', 
        'Tit', 'Filem', 'Hepr', 'Jaak', '1Piet', '2Piet', '1Joh', 
        '2Joh', '3Joh', 'Juud', 'Ilm'],
        "ot":
        ['1Moos', '2Moos', '3Moos', '4Moos', '5Moos', 'Joos', 'Tuom',
        'Ruut', '1Sam', '2Sam', '1Kun', '2Kun', '1Aik', '2Aik', 'Esra', 'Neh',
        'Est', 'Job', 'Ps', 'Sananl', 'Saarn', 'Laull', 'Jes', 'Jer', 'Valit',
        'Hes', 'Dan', 'Hoos', 'Joel', 'Aam', 'Ob', 'Joona', 'Miika', 'Nah',
        'Hab', 'Sef', 'Hagg', 'Sak', 'Mal' ]
        }
    english_booknames = {"nt":
        ["Matt", "Mark", "Luke", "John",
        "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col",
        "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas",
        "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"],
        "ot":
        [ "Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth",
            "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job",
            "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos",
            "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech",
            "Mal" ]
        };
    book_idx = english_booknames[testament].index(en_name)
    return finnish_booknames[testament][book_idx]


config = db.configparser.ConfigParser()
config.read("../../config_py.ini")

module = pysword.ZModule('finpr92')
#engine = db.create_engine('sqlite:///../../src/assets/bibles.db', echo=False)
engine = db.create_engine('mysql://{}:{}@localhost'.format(db.config['DB']['un'],db.config['DB']['pw']), echo=False)
Base = db.declarative_base()
engine.execute("USE {}".format('bibles')) 

Session = db.sessionmaker(bind=engine)
session = Session()
print("Collecting data with pysword..")
for testament_name, testament in books.testaments.items():
    for book in testament:
        print(book.osis_name)
        verses=module.all_verses_in_book(book)
        for verse in verses:
            #verse[1]:luku, verse[2]:jae, verse[3]:teksti
            bookname =  TranslateBookName(verse[0].osis_name, testament_name)
            print(verse[0].osis_name +  ": " + bookname)
            args = [verse[3].decode("utf-8"), bookname, verse[1],verse[2]]
            session.add(db.OtVerse(*args) if testament_name=="ot" else db.NtVerse(*args))
print("Now committing the data, this may take a while...")


session.commit()
