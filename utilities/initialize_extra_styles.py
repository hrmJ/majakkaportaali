#Luo tietokannan tyylien säilyttämistä varten ja syöttää oletusdatan
from sqlalchemy import create_engine, ForeignKey
from sqlalchemy import Column, Date, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref, sessionmaker
import configparser
import collections


Base = declarative_base()

class Style(Base):
    """Css-tyylit tallentava tietokantataulu"""
    __tablename__ = "styles"
    id = Column(Integer, primary_key=True)
    classname = Column(String(200),default='')
    tagname = Column(String(200),default='')
    attr = Column(String(200),default='')
    value = Column(String(200),default='')
    #stylesheet-sarakkeeseen tallennetaan mukautetut tyylisetit
    stylesheet = Column(String(200),default='')

    def __init__(self, classname, tagname, attr, val, stylesheet):
        self.classname=classname
        self.tagname=tagname
        self.attr=attr
        self.value=val
        self.stylesheet=stylesheet



#Starttaa sqlalchemy ja yhdistä majakkaportaalinn tietokantaan
config = configparser.ConfigParser()
config.read("../config_py.ini")
engine = create_engine('mysql://{}:{}@localhost'.format(config['DB']['un'],config['DB']['pw']), echo=False)
engine.execute("USE {}".format(config['DB']['dbname'])) 
#Luo taulu, jos ei olemassa
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()



text_tags = ["ul", "ol"];

#Arvot, jotka ovat joka tägille ja tekstitasolle oletuksena samat
common_vals = {"font-family"   : "'Roboto', sans-serif",
               "color"         : "grey",
               "margin-top"    : "0.1em",
               "margin-left"   : "0.1em",
               "padding"       : "0.1em",
               "border"        : "0em solid black",
               "background"    : "none",
               "text-shadow"    : "none",
               "border-radius" : "0em",
               "overflow"      : "hidden"}

container_vals=  {"display"         : "flex",
                  "flex-flow" : "column",
                  "justify-content" : "flex-start",
                  "align-items"     : "center",
                  "width"           : "auto",
                  "position"           : "relative",
                  "z-index"           : "0",
                  "height"          : "auto"}

bodyvals = collections.OrderedDict([
    ("font-family" ,  "'Roboto', sans-serif"),
    ("color" , "blue"),
    ("overflow" , "hidden"),
    ("font-size" , "1em"),
    ("background" , "none"),
    ("background-size" , "cover"),
    #("background-size" , "100%"),
    ("background-repeat" , "no-repeat"),
    ("align-items" , "center"),
    ("justify-content" , "flex-start"),
    ("border" , "0em solid black")
    ])


#Oletuksena mukana olevat segmenttityypit:
default_classes = ["sample", ".Laulu", ".Raamatunteksti", ".Teksti", ".Infodia"]


for classname in default_classes:
    for bodyval_key, bodyval_item in bodyvals.items():
        #Arvot, jotka eivät liity suoraan mihinkään tägiin
        session.add(Style(classname,"",bodyval_key,bodyval_item,"default"))

    #Fonttikoot tekstitasokohtaisesti
    for attr, val in common_vals.items():
        #Syötä kakista tägeistä  ne arvot, jotka oletuksena ovat samoja
        for tagname in layout_tags + text_tags:
            session.add(Style(classname,tagname,attr,val,"default"))

session.commit()

