import sqlite3
db = sqlite3.connect('Bank.sqlite')
print('Welcome to this lovely bank system')
db_cursor = db.cursor()

#CRUD for BankUser
def insert_in_bankUser():
    try:
       id= input("id: ")
       UserId = input("UserId: ")
       CreatedAt = input("CreatedAt: ")
       ModifiedAt = input("ModifiedAt: ")
       insert_command = '''INSERT INTO BankUser VALUES(?,?,?,?)'''

       db_cursor.execute(insert_command, (id,UserId, CreatedAt, ModifiedAt))
       db.commit()
    except:
        print("Error")

def retrieve_from_BankUser():
    retrieve_command = '''SELECT * FROM BankUser;'''

    db_cursor.execute(retrieve_command)
    try:
        record=db_cursor.fetchall()
        print(record)
    except:
        print("Error")

def update_in_BankUser():
    qry="update BankUser set CreatedAt=?, ModifiedAt=? where id=?;"
    try:
        CreatedAt = input("CreatedAt: ")
        ModifiedAt = input("ModifiedAt: ")
        db_cursor.execute(qry, (CreatedAt,ModifiedAt,1))
        db.commit()
        print("record updated successfully")
    except:
        print("error in operation")
        db.rollback()


def delete_from_BankUser():
    qry="DELETE from BankUser where id=?;"
    try:
       id=input("id: ")
       db_cursor.execute(qry, (id,))
       db.commit()
       print("record deleted successfully")
    except:
       print("error in operation")
       db.rollback()


#CRUD for Account
def insert_in_Account():
    try:
       id= input("id: ")
       BankUserId = input("UserId: ")
       AccountNo = input("AccountNo: ")
       isStudent = input("isStudent: ")
       CreatedAt = input("CreatedAt: ")
       ModifiedAt = input("ModifiedAt: ")
       Amount = input("Amount: ")
       insert_command = '''INSERT INTO Account VALUES(?,?,?,?,?,?,?)'''

       db_cursor.execute(insert_command, (id,BankUserId, AccountNo, isStudent, CreatedAt, ModifiedAt, Amount))
       db.commit()
    except:
        print("Error")

def retrieve_from_Account():
    retrieve_command = '''SELECT * FROM Account;'''

    db_cursor.execute(retrieve_command)
    
    try:
        record=db_cursor.fetchall()
        print(record)
            
    except:
        print("Error")


def update_in_Account():
    qry="update Account set isStudent=?, CreatedAt=?, ModifiedAt=?, Amount=? where id=?;"
    try:
        isStudent = input("isStudent: ")
        CreatedAt = input("CreatedAt: ")
        ModifiedAt = input("ModifiedAt: ")
        Amount = input("Amount: ")
        db_cursor.execute(qry, (Amount,1))
        db.commit()
        print("record updated successfully")
    except:
        print("error in operation")
        db.rollback()


def delete_from_Account():
    qry="DELETE from Account where id=?;"
    try:
       id=input("id: ")
       db_cursor.execute(qry, (id,))
       db.commit()
       print("record deleted successfully")
    except:
       print("error in operation")
       db.rollback()

def add_deposit():
    pass
def list_deposits():
    pass
def create_loan():
    pass
def pay_loan():
    pass
def list_loan():
    pass
def withdrowl_money():
    pass

def loan_Algorithm():
    pass
def interest():
    pass



db.close()

