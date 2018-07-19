from sqlalchemy import create_engine, ForeignKey
from sqlalchemy import Column, Date, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref, sessionmaker
import configparser

config = configparser.ConfigParser()
config.read("../config_py.ini")

Base = declarative_base()
engine = create_engine('mysql://{}:{}@localhost'.format(config['DB']['un'],config['DB']['pw']), echo=False)
engine.execute("USE {}".format(config['DB']['dbname'])) 

class backgrounds(Base):
    """Taustakuvien nimet kattava taulu"""
    __tablename__ = "backgrounds"
    id = Column(Integer, primary_key=True)
    filename = Column(String(200),default='unspecified')
    description = Column(String(999),default='unspecified')

    def __init__(self,filename, description):
        self.filename = filename
        self.description = description

Base.metadata.create_all(engine)
