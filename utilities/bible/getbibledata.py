import pysword
import books
import db
import sys
#Pysword credits: https://github.com/tgc-dk/pysword

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
            args = [verse[3].decode("utf-8"), verse[0].osis_name,verse[1],verse[2]]
            session.add(db.OtVerse(*args) if testament_name=="ot" else db.NtVerse(*args))
print("Now committing the data, this may take a while...")
session.commit()
