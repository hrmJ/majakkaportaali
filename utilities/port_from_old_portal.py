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
        self.odetails = {}
        self.service_ids = []

    def ReadSource(self):
        with open(sys.argv[1], "r") as f:
            self.raw_sql = f.read()

    def GetTableData(self, table_name, cols, delete=None):
        """
        Hakee yhden vanhan portaalin taulun datan, jos rakenne identtinen

        - table_name: [vanhan taulun nimi, uuden taulun nimi]
        - cols: sarakkeiden nimet, jotka korvataan
        """
        block = self.GetTableBlock(table_name[0])
        if block:
            block = re.sub(table_name[0], table_name[1], block)
            if delete:
                block  = self.RemoveColFromBlock(block, delete)
            for col in cols:
                for old_name, new_name in col.items():
                    block = re.sub(old_name, new_name, block)
        self.new_sql += "\n\n" + block + "\n\n";

    def GetTableBlock(self, table_name):
        """
        Hakee yhden taulukon datan tiedot vanhasta sql:stä
        """
        blockmatch = re.search("INSERT INTO `" + table_name +"`.*\n((.){1,}\n)*",
                self.raw_sql, re.MULTILINE)
        if blockmatch:
            return blockmatch.group(0)
        return none

    def Output(self):
        """
        Tulostaa muokatun sql:n
        """
        with open("edited_data.sql","w") as f:
            f.write(self.new_sql)

    def RemoveColFromBlock(self, block, colnames):
        newblock = block
        #lines[0] = re.sub(", `{}`, ".format(colname), ", ", lines[0])
        for colname in colnames:
            lines = newblock.splitlines()
            header = re.sub(".*\(([^\)]+)\).*", "\\1", lines[0])
            f = StringIO(header)
            reader = csv.reader(f, skipinitialspace=True, quotechar="`")
            for cols in reader:
                del_idx = cols.index(colname)
                cols.pop(del_idx)
                newblock = "(" + ", ".join(["`" + col + "`" for col in cols]) + ")"
                break
            newblock = re.sub("\([^\)]+\)", newblock, lines[0])
            for line in lines[1:]:
                if not ("Saarnateksti" in line and "responsibilities" in newblock) \
                and not "INSERT INTO" in line:
                    if line[-1] == ";":
                        line = line[:-1]
                    line = re.sub("^\(","",line)
                    line = re.sub("\),?$","",line)
                    line = line.replace(r"\'","")
                    f = StringIO(line)
                    reader = csv.reader(f, skipinitialspace=True, quotechar="'")
                    for cols in reader:
                        cols.pop(del_idx)
                        newcols = cols
                        newcols = [col if col.strip() else "NULL" for col in cols]
                        if not("responsibilities" in newblock and newcols[1] not in self.service_ids):
                            newblock += "\n(" + ", ".join(["'" + col + "'" if col != "NULL" and re.search("[a-öA-Ö-]",col) else col for col in newcols]) + "),"
            newblock = newblock[:-1] + ";"
        return newblock



    def GetServiceTableData(self):
        """
        Spesifisti messutaulu
        """
        block = self.GetTableBlock("messut")
        newblock = "INSERT INTO services (id, servicedate, theme) VALUES"
        for line in block.splitlines()[1:]:
            line = re.sub("^\(","",line)
            line = re.sub("\),?$","",line)
            f = StringIO(line)
            reader = csv.reader(f, skipinitialspace=True, quotechar="'")
            for cols in reader:
                self.service_ids.append(cols[0])
                if cols[4] != "NULL":
                    if cols[4] not in self.odetails:
                        self.odetails[cols[4]] = {}
                    if cols[5] not in self.odetails[cols[4]]:
                        self.odetails[cols[4]][cols[5]] = []
                    self.odetails[cols[4]][cols[5]].append({"service_id":cols[0],"amount": cols[6]})
                newblock += "\n({}, '{}', '{}'),".format(*cols[0:3])
        newblock = newblock[:-1]
        newblock += ";"
        self.new_sql += "\n\n" + newblock

    def GetOfferingData(self):
        """
        Tulostaa kolehtien tiedot
        """
        targetblock = "INSERT INTO offering_targets (id, name) VALUES"
        goalblock = "INSERT INTO offering_goals (id, target_id, name, amount) VALUES"
        collectedblock = "INSERT INTO collected_offerings (target_id, service_id, amount) VALUES"
        target_id = 0;
        goal_id = 0;
        for targetname, goals in self.odetails.items():
            target_id += 1
            targetblock += "\n({}, '{}'),".format(target_id, targetname)
            for goalname, collected in goals.items():
                goal_id += 1
                goalblock += "\n({}, {}, '{}', 5000),".format(goal_id, target_id, goalname)
                for entry in collected:
                    collectedblock += "\n({}, {}, {}),".format(goal_id, entry["service_id"], entry["amount"])
        targetblock = targetblock[:-1] + ";"
        goalblock = goalblock[:-1] + ";"
        collectedblock = collectedblock[:-1] + ";"
        self.new_sql += "\n\n{}\n\n{}\n\n{}\n\n".format(targetblock, goalblock, collectedblock)

sql = SqlSource()
sql.new_sql ="""

DELETE FROM seasons;
DELETE FROM services;
DELETE FROM offering_targets;
DELETE FROM offering_goals;
DELETE FROM collected_offerings;
DELETE FROM responsibilities;
DELETE FROM songdata;
DELETE FROM versedata;
DELETE FROM comments;
DELETE FROM servicesongs;


"""

sql.GetServiceTableData()
sql.GetOfferingData()
sql.GetTableData(["comments","comments"],[{"messu_id": "service_id"}])
sql.GetTableData(["kaudet","seasons"],[
    {"alkupvm": "startdate"},
    {"loppupvm": "enddate"},
    {"nimi": "name"},
    {"teema": "theme"},
    {"kommentit": "comments"},
    ],
    delete=["tyyppi"]
    )
sql.GetTableData(["laulut","servicesongs"],[
    {"messu_id": "service_id"},
    {"nimi": "song_title"},
    {"tyyppi": "songtype"},
    ],
    delete=["songlink"]
    )
sql.GetTableData(["songs","songdata"],[
    ],
    delete=["filename","added","sav","san"]
    )
sql.GetTableData(["verses","versedata"],[
    {"content": "verse"},
    ]
    )
sql.GetTableData(["vastuut","responsibilities"],[
    {"vastuu": "responsibility"},
    {"vastuullinen": "responsible"},
    {"messu_id": "service_id"},
    ],
    delete = ["kommentit"]
    )
sql.new_sql = sql.new_sql.replace("responsibilityllinen","responsible")
sql.new_sql += """

UPDATE comments SET reply_to = 0 WHERE reply_to is NULL;

"""
sql.Output()

