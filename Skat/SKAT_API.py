# Imports
import sqlite3

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
        create_SKAT_USER_YEAR()
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
        print("CreatedAt formating: yyyy-mm-dd")
        print("IsActive formating: true or false")
        print("")
        Id = input("id: ")
        UserId = input("UserId: ")
        CreatedAt = input("CreatedAt: ")
        IsActive = input("IsActive: ")
        print("")

        insert_command = '''INSERT INTO SKAT_USER VALUES(?,?,?,?)'''

        db_cursor.execute(insert_command, (Id, UserId, CreatedAt, IsActive))
        db.commit()
        return User_CRUD_menu()
    except:
        print("Error")


def read_skat_user():
    print("READ ALL USER")
    print("...")
    retrieve_command = '''SELECT * FROM SKAT_USER;'''
    db_cursor.execute(retrieve_command)
    try:
        record=db_cursor.fetchall()
        for x in record:
            print(x)
            print("____________________")
        return User_CRUD_menu()
    except:
        print("Error")


def update_skat_user():
    print("UPDATE A USER")
    qry="UPDATE SKAT_USER SET CreatedAt=?, IsActive=? WHERE id=?;"
    try:
        print("")
        print("REMEMBER")
        print("CreatedAt formating: yyyy-mm-dd")
        print("IsActive formating: true or false")
        print("")
        CreatedAt = input("CreatedAt: ")
        IsActive = input("isActive: ")
        ID = input("Enter a USER id to change: ")
        db_cursor.execute(qry, (CreatedAt,IsActive,ID))
        db.commit()
        print("________________________________")
        print("record updated successfully")
        return User_CRUD_menu()
    except:
        print("error in operation")
        db.rollback()

def delte_skat_user():
    print("DELETE A USER")

    qry="DELETE FROM SKAT_USER WHERE id=?;"
    try:
        print("Pick a user id")
        id=input("id: ")
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
        createdAt = input("createdAt: ")
        modifiedAt = input("modifiedAt: ")
        startDate = input("startDate: ")
        enddate = input("enddate: ")
        print("")
        query = '''INSERT INTO SKAT_YEAR VALUES(?,?,?,?,?,?)'''

        db_cursor.execute(query, (Id,label, createdAt, modifiedAt, startDate,enddate))
        db.commit()
        print("record inserted successfully")
        #create_SKAT_USER_YEAR()
        return skat_Year_CRUD_menu()

    except:
        print("error in operation")

def read_skat_year():
    print("READ SKAT YEAR")
    print("...")
    retrieve_command = '''SELECT * FROM SKAT_YEAR;'''
    db_cursor.execute(retrieve_command)
    try:
        record=db_cursor.fetchall()
        for x in record:
            print(x)
            print("____________________")
        return skat_Year_CRUD_menu()
    except:
        print("Error")

def update_skat_year():
    print("UPDATE SKAT YEAR")
    qry="UPDATE SKAT_YEAR SET label=?, createdAt=?,modifiedAt=?,startDate=?,enddate=? WHERE id=?;"
    try:
        print("")
        print("REMEMBER")
        print("ALL DATE formating: yyyy-mm-dd")
        print("")
        label = input("label: ")
        modifiedAt = input("modifiedAt: ")
        enddate = input("enddate: ")
        ID = input("Enter a YEAR id to change: ")
        db_cursor.execute(qry, (label,modifiedAt,enddate,ID))
        db.commit()
        print("________________________________")
        print("record updated successfully")
        return skat_Year_CRUD_menu()
    except:
        print("error in operation")
        db.rollback()

def delte_skat_year():
    print("DELETE SKAT YEAR")

    qry="DELETE FROM SKAT_YEAR WHERE id=?;"
    try:
        print("Pick a YEAR id")
        id=input("Enter YEAR id: ")
        db_cursor.execute(qry, (id,))
        db.commit()
        print("________________________________")
        print("record deleted successfully")
        return User_CRUD_menu()
    except:
        print("error in operation")
        db.rollback()

# SKAT USER YEAR functions
# need to be re-done
def create_SKAT_USER_YEAR():
    SUY_query = '''SELECT SKAT_USER.Id,SKAT_YEAR.Id, SKAT_USER.UserId
                FROM SKAT_YEAR, SKAT_USER
                ON SKAT_YEAR.id=SKAT_USER.Id;'''

    db_cursor.execute(SUY_query)
    try:
        record=db_cursor.fetchall()
        print(record)
    except:
        print("error in operation")



# Tax Calculator Function
def pay_taxes():
    return


menu_switch()

db.close()
