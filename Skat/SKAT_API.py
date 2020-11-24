# Imports
import sqlite3
import requests
from datetime import datetime
from random import random

db = sqlite3.connect('Skat.sqlite')
db_cursor = db.cursor()


# MENU for main operations
def menu_switch():
    print("")
    print('Welcome to your personal SKAT page')
    print("______________________________________________________________")
    print("Pick an option.")
    print("Enter 1 to work with User information!")
    print("Enter 2 to edit Skat Year information!")
    print("Enter 3 to pay taxes!")
    print("")
    menu_option = int(input("Enter a Number: "))

    print("______________________________________________________________")

    if menu_option == 1:
        User_CRUD_menu()
    elif menu_option == 2:
        skat_Year_CRUD_menu()
    elif menu_option == 3:
        pay_taxes()
    else:
        menu_switch()


# MENU for user
def User_CRUD_menu():
    print("")
    print("______________________________________________________________")
    print("")
    print('This is your User information page ')
    print("You have the following option: ")
    print("Enter 1 to create new user!")
    print("Enter 2 to get all user data!")
    print("Enter 3 to update existing user information!")
    print("Enter 4 to delete existing user entry!")
    print("")

    user_menu_option = int(input("Enter your number: "))

    print("______________________________________________________________")

    if user_menu_option == 1:
        create_new_skat_user()
    elif user_menu_option == 2:
        read_skat_user()
    elif user_menu_option == 3:
        update_skat_user()
    elif user_menu_option == 4:
        delte_skat_user()
    else:
        menu_switch()


# MENU for user year
def skat_Year_CRUD_menu():
    print("")
    print("______________________________________________________________")
    print("")
    print('This is your skat user year information page ')
    print("You have the following option: ")
    print("Enter 1 to create new year!")
    print("Enter 2 to get all year information!")
    print("Enter 3 to update existing year information!")
    print("Enter 4 to delete existing year entry!")
    print("")

    year_menu_option = int(input("Enter number: "))

    print("______________________________________________________________")

    if year_menu_option == 1:
        create_new_skat_year()
    elif year_menu_option == 2:
        read_skat_year()
    elif year_menu_option == 3:
        update_skat_year()
    elif year_menu_option == 4:
        delte_skat_year()
    else:
        menu_switch()


# CRUD operations for SkatUser
def create_new_skat_user():
    try:
        print("")
        print("CREATE NEW USER")
        print("You are inserting new skat user ")
        print("______________________________________________________________")
        print("Date needed: id, UserId, CreatedAt and IsActive.")
        #print("CreatedAt formating: yyyy-mm-dd")
        print("IsActive formating: true or false")
        print("")
        Id = input("id: ")
        UserId = input("UserId: ")
        #CreatedAt = input("CreatedAt: ")
        IsActive = input("IsActive: ")
        print("")

        insert_command = '''INSERT INTO SKAT_USER VALUES(?,?,?,?)'''

        db_cursor.execute(insert_command, (Id, UserId, datetime.now(), IsActive))
        db.commit()

        create_new_skat_year()

        return User_CRUD_menu()
    except:
        print("Error")


def read_skat_user():
    print("READ ALL USER")
    print("...")
    retrieve_command = '''SELECT * FROM SKAT_USER;'''
    db_cursor.execute(retrieve_command)
    try:
        record = db_cursor.fetchall()
        for x in record:
            print(x)
            print("____________________")
        return User_CRUD_menu()
    except:
        print("Error")


def update_skat_user():
    print("UPDATE A USER")
    qry = "UPDATE SKAT_USER SET CreatedAt=?, IsActive=? WHERE id=?;"
    try:
        print("")
        print("REMEMBER")
        print("CreatedAt formating: yyyy-mm-dd")
        print("IsActive formating: true or false")
        print("")
        CreatedAt = input("CreatedAt: ")
        IsActive = input("isActive: ")
        ID = input("Enter a USER id to change: ")
        db_cursor.execute(qry, (CreatedAt, IsActive, ID))
        db.commit()
        print("________________________________")
        print("record updated successfully")
        return User_CRUD_menu()
    except:
        print("error in operation")
        db.rollback()


def delte_skat_user():
    print("DELETE A USER")

    qry = "DELETE FROM SKAT_USER WHERE id=?;"
    try:
        print("Pick a user id")
        id = input("id: ")
        db_cursor.execute(qry, (id,))
        db.commit()
        print("________________________________")
        print("record deleted successfully")
        return User_CRUD_menu()
    except:
        print("error in operation")
        db.rollback()


# CRUD operations for skat year
def create_new_skat_year():
    try:
        print("")
        print("CREATE new YEAR")
        print("You are inserting new skat YEAR ")
        print("______________________________________________________________")
        print("Date needed: Label, CreatedAt, ModifiedAt,StartDate, EndDate.")
        print("All date formating: yyyy-mm-dd")
        print("")
        Id = input("Id: ")
        label = input("label: ")
        #createdAt = input("createdAt: ")
        #modifiedAt = input("modifiedAt: ")
        #startDate = input("startDate: ")
        enddate = input("enddate: ")
        print("")
        query = '''INSERT INTO SKAT_YEAR VALUES(?,?,?,?,?,?)'''

        db_cursor.execute(query, (Id, label, datetime.now(), datetime.now(), datetime.now(), enddate))
        db.commit()
        print("record inserted successfully")
        create_SKAT_USER_YEAR()
        return skat_Year_CRUD_menu()

    except:
        print("error in operation")

def retrive_SKAT_USER():
    retrieve_SkatUser = '''SELECT SKAT_USER.Id,SKAT_USER.UserId FROM SKAT_USER;'''
    db_cursor.execute(retrieve_SkatUser)
    record = db_cursor.fetchall()
    return record

def retrive_SKAT_YEAR():
    retrieve_SkatYear = '''SELECT SKAT_YEAR.Id FROM SKAT_YEAR;'''
    db_cursor.execute(retrieve_SkatYear)
    record = db_cursor.fetchall()
    return record

def create_SKAT_USER_YEAR():
    SkatUser = retrive_SKAT_USER()
    SkatYear = retrive_SKAT_YEAR()
    inser_qry = '''INSERT INTO SKAT_USER_YEAR VALUES(?,?,?,?,?,?);'''

    print(SkatUser)
    print(SkatYear)
    Id = 0
    try:
        print("CREATE new SKAT USER YEAR")
        for i in SkatUser:
            SkatUserId = i[0]
            userID = i[1]
            for j in SkatYear:
                SkatYearId = j[0]
                Id += 1
                #Id = input("Id: ")
                isPaid = int(0)
                amn = int(0)
                db_cursor.execute(inser_qry, (Id, SkatUserId, SkatYearId, userID, isPaid, amn))
                db.commit()
    except:
        print("Error in inserting new SKAT USER YEAR")


def read_skat_year():
    print("READ SKAT YEAR")
    print("...")
    retrieve_command = '''SELECT * FROM SKAT_YEAR;'''
    db_cursor.execute(retrieve_command)
    try:
        record = db_cursor.fetchall()
        for x in record:
            print(x)
            print("____________________")
        return skat_Year_CRUD_menu()
    except:
        print("Error")


def update_skat_year():
    print("UPDATE SKAT YEAR")
    qry = "UPDATE SKAT_YEAR SET label=?,modifiedAt=?,enddate=? WHERE id=?;"
    try:
        print("")
        print("REMEMBER")
        print("ALL DATE formating: yyyy-mm-dd")
        print("")
        label = input("label: ")
        enddate = input("enddate: ")
        ID = input("Enter a YEAR id to change: ")
        db_cursor.execute(qry, (label, datetime.now(), enddate, ID))
        db.commit()
        print("________________________________")
        print("record updated successfully")
        return skat_Year_CRUD_menu()
    except:
        print("error in operation")
        db.rollback()

def delte_skat_year():
    print("DELETE SKAT YEAR")

    qry = "DELETE FROM SKAT_YEAR WHERE id=?;"
    try:
        print("Pick a YEAR id")
        id = input("Enter YEAR id: ")
        db_cursor.execute(qry, (id,))
        db.commit()
        print("________________________________")
        print("record deleted successfully")
        return User_CRUD_menu()
    except:
        print("error in operation")
        db.rollback()
        return User_CRUD_menu()

# Implement a /pay-taxes endpoint (POST request):

def pay_taxes():
    param={"Amount":Amount,"UserId":UserId}
    try:
        r = requests.get(url='http://localhost:8000/Bank', params=param)
        data=r.json()
        #qry = '''SELECT SKAT_USER_YEAR.Amount, SKAT_USER_YEAR.IsPaid, SKAT_USER.UserId FROM SKAT_USER_YEAR,SKAT_USER WHERE SKAT_USER_YEAR.Id=SKAT_USER.UserId;'''
        qry = '''SELECT Account.Amount, Users.UserId ,SKAT_USER_YEAR.IsPaidFROM From Account, SKAT_USER_YEAR WHERE Users.UserId=Account.BankUserId, Users.UserId=SKAT_USER_YEAR.Id;'''
        newData= db_cursor.execute(qry, data['UserId'])
        new_Amount = newData['Amount']

        #initial check
        record = db_cursor.fetchall()
        for i in record:
            ispaid = i[2]
            user = i[1]
            amn = i[0]
            #print(ispaid)
            if int(ispaid) is 0:
                #print("___________________________")
                #print("This user has not paid yet!")
                if amn >= 0:
                    newAmount = tax(amn)
                    taxAmount = updateSKATInfo(ispaid,newAmount,user)
                    updateBankAmount(user,newAmount)
                    #result.append([user,ispaid,this])
                elif amn < 0:
                    pass
                    #print("........................")
                    #print(user)
                    text = "Error: value is negative"
                    #updateSKATInfo()
                    #result.append([user,text])
            elif int(ispaid) is 1:
                pass
                #print("___________________________")
                #print("This user has paid !")
            #   result = 1
            #   return result
    except:
        print("Error in pay taxes")

def updateBankAmount(user, amount):
    accountAmn = '''SELECT Account.Amount FROM Account where BankUserId=?;'''
    db_cursor.execute(accountAmn)

    qry = "UPDATE Account SET Amount=?, WHERE id=?;"
    taxAmn = amount

    # sending get request and saving the response as response object
    try:
        record = db_cursor.fetchall()
        for i in record:
            BankUserId = i[0]
            newAmn = BankUserId - taxAmn
            db_cursor.execute(qry, (newAmn, user))
            db.commit()
    except:
        print("Error in updating Account amount")
        db.rollback()

def updateSKATInfo(ispaidVal,amountVal,idVal):
    upd_SKAT = "UPDATE SKAT_USER_YEAR SET Amount=?, IsPaid=? WHERE id=?;"

    try:
        amount = int(amountVal)
        if ispaidVal == 0:
            ispaid = 1
        ID = int(idVal)

        db_cursor.execute(upd_SKAT,(amount,ispaid, ID))
        db.commit()

        print("record updated successfully")

    except:
        print("Error in updating ispaid and tax amount")
        db.rollback()

def tax(amount):
    value = (int(amount) / int(100)) * int(33)
    return value

menu_switch()
db.close()
