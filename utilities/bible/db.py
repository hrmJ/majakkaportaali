from sqlalchemy import create_engine, ForeignKey
from sqlalchemy import Column, Date, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref, sessionmaker
import configparser

config = configparser.ConfigParser()
config.read("../../config_py.ini")

Base = declarative_base()
engine = create_engine('mysql://{}:{}@localhost'.format(config['DB']['un'],config['DB']['pw']), echo=False)
engine.execute("USE {}".format('bibles')) 

class OtVerse(Base):
    """Vanhan testamentin jae"""
    __tablename__ = "verses_ot_fi"
    id = Column(Integer, primary_key=True)
    content = Column(String(9999),default='unspecified')
    book = Column(String(100),default='unspecified')
    chapterno = Column(Integer)
    verseno = Column(Integer)

    def __init__(self,content,book,chapterno,verseno):
        self.content = content
        self.book = book
        self.chapterno = chapterno
        self.verseno = verseno

class NtVerse(Base):
    """Uuden testamentin jae"""
    __tablename__ = "verses_nt_fi"
    id = Column(Integer, primary_key=True)
    content = Column(String(9999),default='unspecified')
    book = Column(String(100),default='unspecified')
    chapterno = Column(Integer)
    verseno = Column(Integer)

    def __init__(self,content,book,chapterno,verseno):
        self.content = content
        self.book = book
        self.chapterno = chapterno
        self.verseno = verseno

Base.metadata.create_all(engine)
