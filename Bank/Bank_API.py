import sqlite3
from datetime import datetime
import requests
import os

db = sqlite3.connect('../SI_MANDATORY_II/Bank/bank.sqlite')
print('Welcome to this lovely bank system')
db_cursor = db.cursor()


# CRUD for BankUser
def insert_in_bankUser():
    try:
        id = input("id: ")
        UserId = input("UserId: ")
        CreatedAt = input("CreatedAt: ")
        ModifiedAt = input("ModifiedAt: ")
        insert_command = '''INSERT INTO BankUser VALUES(?,?,?,?)'''

        db_cursor.execute(insert_command, (id, UserId, CreatedAt, ModifiedAt))
        db.commit()
    except:
        print("Error")



def retrieve_from_BankUser():
    retrieve_command = '''SELECT * FROM BankUser;'''

    db_cursor.execute(retrieve_command)
    try:
        record = db_cursor.fetchall()
        print(record)
    except:
        print("Error")


def update_in_BankUser():
    qry = "update BankUser set CreatedAt=?, ModifiedAt=? where id=?;"
    try:
        CreatedAt = input("CreatedAt: ")
        ModifiedAt = input("ModifiedAt: ")
        db_cursor.execute(qry, (CreatedAt, ModifiedAt, 1))
        db.commit()
        print("record updated successfully")
    except:
        print("error in operation")
        db.rollback()


def delete_from_BankUser():
    qry = "DELETE from BankUser where id=?;"
    try:
        id = input("id: ")
        db_cursor.execute(qry, (id,))
        db.commit()
        print("record deleted successfully")
    except:
        print("error in operation")
        db.rollback()


# CRUD for Account
def insert_in_Account():
    try:
        id = input("id: ")
        BankUserId = input("UserId: ")
        AccountNo = input("AccountNo: ")
        isStudent = input("isStudent: ")
        CreatedAt = input("CreatedAt: ")
        ModifiedAt = input("ModifiedAt: ")
        Amount = input("Amount: ")
        insert_command = '''INSERT INTO Account VALUES(?,?,?,?,?,?,?)'''

        db_cursor.execute(insert_command, (id, BankUserId, AccountNo, isStudent, CreatedAt, ModifiedAt, Amount))
        db.commit()
    except:
        print("Error")


def retrieve_from_Account():
    retrieve_command = '''SELECT * FROM Account;'''

    db_cursor.execute(retrieve_command)

    try:
        record = db_cursor.fetchall()
        print(record)

    except:
        print("Error")


def update_in_Account(Amount, BankUserId):
    qry = "update Account set Amount=? where id=?;"
    try:

        db_cursor.execute(qry, (Amount, BankUserId))
        db.commit()
        print("record updated successfully")
    except:
        print("error in operation")
        db.rollback()


def delete_from_Account():
    qry = "DELETE from Account where id=?;"
    try:
        id = input("id: ")
        db_cursor.execute(qry, (id,))
        db.commit()
        print("record deleted successfully")
    except:
        print("error in operation")
        db.rollback()


def add_deposit():
    response = requests.get('http://localhost:8000/deposit')
    data = response.json()

    if data["Amount"] > 0:
        # Save this to database
        interest = interest_function(data["Amount"])
        try:
            insert_command = '''INSERT INTO Deposit VALUES(?,?,?,?)'''

            db_cursor.execute(insert_command, (id, data["BankUserId"], datetime.now(), interest))
            db.commit()
        except:
            print("Error")
    else:
        print("Amount should be grater than 0")


def list_deposits():

    # sending get request and saving the response as response object 
    param={"BankUserId":1}
    try:
        r = requests.get(url='http://localhost:8000/deposits', params=param)
        print(r)

        retrieve_command = '''SELECT * FROM Deposit where BankUserId=?;'''

        return list(db_cursor.execute(retrieve_command, r['BankUserId']))
    except requests.exceptions.ConnectionError:
        requests.status_code = "Connection refused"
        print(requests.status_code)


def create_loan():
    BankUserId = input("Bank User Id: ")
    LoanAmount = input("Loan Amount: ")
    if LoanAmount < 0:
        LoanAmount = input("Add an Loan Amount bigger than 0: ")
    response = requests.post(url='http://localhost:8088/deposits', data=loan_Algorithm(BankUserId, LoanAmount))
    data = response.json()
    if response.status_code() == 200:
        sql_query = '''INSERT INTO Loan VALUES(?,?,?,?,?)'''
        id = input("id: ")
        db_cursor.execute(sql_query, [id, BankUserId, datetime.now(), datetime.now(), LoanAmount])
        db.commit()
        # Add new Amount to the Account
        query = '''Select Amount from Account where BankUserId=?'''
        old_amount = db_cursor.execute(query, [BankUserId])
        new_amount = old_amount + LoanAmount
        update_in_Account(LoanAmount, BankUserId)
    elif response.status_code() == 403:
        print("Error")


def pay_loan():
    BankUserId = input("Bank User Id: ")
    LoanId = input("Loan Id: ")
    query = '''Select Amount from Loan where id=?'''
    LoanAmount = db_cursor.execute(query, LoanId)
    db.commit()
    query = '''Select Amount from Account where id=?'''
    AccountAmount = db_cursor.execute(query, BankUserId)
    db.commit()
    if AccountAmount >= LoanAmount:
        AccountAmount = AccountAmount - LoanAmount
        update_in_Account(AccountAmount, BankUserId)
        qry = "update Loan set Amount=? where id=?;"
        db_cursor.execute(qry, (0, LoanId))
        db.commit()
        print("record updated successfully")

    else:
        print("Error")


def list_loan():
    BankUserId = input("Type the Bank User Id for which you want to see the loans: ")

    # sending get request and saving the response as response object 
    try:
        r = requests.Request(method="get", url='http://localhost:8088/loans', json={'BankUserId': BankUserId})
        data = r.json()
        retrieve_command = '''SELECT * FROM Loan where BankUserId=?;'''

        return list(db_cursor.execute(retrieve_command, data['BankUserId']))
    except requests.exceptions.ConnectionError:
        requests.status_code = "Connection refused"
        print(requests.status_code)


def withdrawl_money():
    param={"Amount":Amount,"UserId":UserId}
    r = requests.get(url='http://localhost:8000/withdrawl', params=param)
    data=r.json()
    retrive_command= ''' Select a.Amount, a.BankUserId FROM Account a join BankUser b on a.BankUserId=b.id where UserId=?'''
    data_1= db_cursor.execute(retrive_command, data['UserId'])
    new_Amount = data_1['Amount'] - data['Amount']
    if new_Amount > 0:
        update_in_Account(new_Amount,data_1['BankUserId'])
    else:
        print("Error")


def loan_Algorithm(Bank_User_Id, Loan_Amount):
    r = requests.Request(method="get", url='http://localhost:8088/loan_ALgorithm', json={'BankUserId': Bank_User_Id, 'LoanAmount':Loan_Amount})
    data= r.json()
    retrive_command= ''' Select Amount FROM Account where BankUserId=?'''
    Amount= db_cursor.execute(retrive_command, data['BankUserId'])
    if Loan_Amount < Amount*75/100:
        return 403
    else:
        return 200


def interest_function(Amount):
    r = requests.post(url='http://localhost:8088/interest')
    Interest_amount= Amount +Amount*2/100
    return Interest_amount


# add_deposit()
# insert_in_bankUser()

db.close()