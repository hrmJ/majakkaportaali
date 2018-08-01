#Syöttää testaamista varten kaikki src/assets/backgrounds-kansiossa olevien kuvien nimet taustakuvatietokantaan
import db
import glob

config = db.configparser.ConfigParser()
config.read("../../config_py.ini")
engine = db.create_engine('mysql://{}:{}@localhost'.format(db.config['DB']['un'],db.config['DB']['pw']), echo=False)
Base = db.declarative_base()
engine.execute("USE {}".format(db.config['DB']['dbname'])) 
engine.execute("DELETE FROM backgrounds");

Session = db.sessionmaker(bind=engine)
session = Session()
for filename in glob.glob("../src/assets/images/*.jpg"):
    session.add(db.backgrounds(filename[filename.rfind("/")+1:],"") )
for filename in glob.glob("../src/assets/images/*.png"):
    session.add(db.backgrounds(filename[filename.rfind("/")+1:],"") )
session.commit()
