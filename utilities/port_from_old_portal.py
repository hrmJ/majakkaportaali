import re
import sys
import csv
from io import StringIO

class SqlSource:
    """
    sql-dumppi, jota muokataan
    """

    def __init__(self):
        self.ReadSource()
        self.new_sql = ""

    def ReadSource(self):
        with open(sys.argv[1], "r") as f:
            self.raw_sql = f.read()

    def GetTableData(self, table_name, cols):
        """
        Hakee yhden vanhan portaalin taulun datan, jos rakenne identtinen

        - table_name: [vanhan taulun nimi, uuden taulun nimi]
        - cols: sarakkeiden nimet, jotka korvataan
        """
        block = self.GetTableBlock(table_name[0])
        if block:
            block = re.sub(table_name[0], table_name[1], block)
            for col in cols:
                for old_name, new_name in col.items():
                    block = re.sub(old_name, new_name, block)
        self.new_sql += block;

    def GetTableBlock(self, table_name):
        """
        Hakee yhden taulukon datan tiedot vanhasta sql:stä
        """
        blockmatch = re.search("INSERT INTO `" + table_name +"`.*\n((.){1,}\n)*",
                self.raw_sql, re.MULTILINE)
        if blockmatch:
            return blockmatch.group(0)
        return none

    def GetServiceTableData(self):
        """
        Spesifisti messutaulu
        """
        block = self.GetTableBlock("messut")
        newblock = ""
        for line in block.splitlines()[1:]:
            line = re.sub("^\(","",line)
            line = re.sub("\),?$","",line)
            f = StringIO(line)
            reader = csv.reader(f, skipinitialspace=True, quotechar="'")
            for row in reader:
                if row[0] == "101":
                    print(row)
            #csv_object = csv.reader(line)
            #cols = csv_object.next()
            #print(cols)
            #break
            #cols = [col for col in re.sub("[\(\);]","",line).split(",") if col]



sql = SqlSource()
sql.GetTableData(["comments","comments"],[{"messu_id": "service_id"}])
sql.GetServiceTableData()

#sql.GetTableData(["seasons","seasons"], [
#    {"alkupvm": "startdate"}, 
#    {"loppupvm": "enddate"},
#    {"nimi":"name"},
#    {"tyyppi":"type"}, 
#    {"teema":"theme"},
#    {"kommentit":"comments"}
#    ])


#INSERT INTO "messut" [{"pvm": "servicedate"}, {"teema":"theme"}, "kolehtikohde", "kolehtitavoite", "kolehtia_keratty"] VALUES
#INSERT INTO `messut` (`id`, `pvm`, `teema`, `info`, `kolehtikohde`, `kolehtitavoite`, `kolehtia_keratty`) VALUES
#
#`kolehtitavoitteet` (`id`, `kohde`, `tavoite`, `kuvaus`, `tavoitemaara`, `kuva`) VALUES
