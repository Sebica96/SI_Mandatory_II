const sqlite3 = require('sqlite3').verbose();
const express = require("express");
const axios = require('axios');
const HOSTNAME = 'localhost';
const PORT = 5000;
let app = express();
app.use(express.json());

let db = new sqlite3.Database('bankdatabase.sqlite', (err) => {
    if(err) {
        return console.log(err.message);
    }
    console.log("Connected to database!")
});

db.get("PRAGMA foreign_keys = ON");

db.run(`CREATE TABLE IF NOT EXISTS BankUser(
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER NOT NULL,
    CreatedAt DATE DEFAULT (datetime('now','localtime')),
    ModifiedAt DATE DEFAULT (datetime('now','localtime')))`
);

db.run(`CREATE TABLE IF NOT EXISTS Account(
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    BankUserId INTEGER NOT NULL,
    AccountNo TEXT UNIQUE NOT NULL,
    IsStudent INTEGER,
    CreatedAt DATE DEFAULT (datetime('now','localtime')),
    ModifiedAt DATE DEFAULT (datetime('now','localtime')),
    InterestRate REAL NOT NULL,
    Amount REAL NOT NULL,
    FOREIGN KEY(BankUserId) REFERENCES BankUser(Id))`
);

db.run(`CREATE TABLE IF NOT EXISTS Deposit(
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    BankUserId INTEGER NOT NULL,
    CreatedAt DATE DEFAULT (datetime('now','localtime')),
    Amount REAL NOT NULL,
    FOREIGN KEY(BankUserId) REFERENCES BankUser(Id))`
);

db.run(`CREATE TABLE IF NOT EXISTS Loan(
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    BankUserId INTEGER NOT NULL,
    CreatedAt DATE DEFAULT (datetime('now','localtime')),
    ModifiedAt DATE DEFAULT (datetime('now','localtime')),
    Amount REAL NOT NULL,
    FOREIGN KEY(BankUserId) REFERENCES BankUser(Id))`
);

// CREATE 
app.post("/bank", (req, res) => {
    let bankUserId = req.body.bankUserId;
   
    db.run(`INSERT INTO BankUser(UserId) VALUES(?)`, [bankUserId], (err) => {
        if (err) {
            res.status(400).json({
                message: 'SERVICE UNAVAILABLE',
                error: err.message
            });
            console.log(err.message);
        } else {
            res.status(201).json({
                message: 'Bank user added.',
            });
        }
    });
});

// READ 
app.get("/bank", (req, res) => {
    db.all(`SELECT * FROM BankUser`, [], (err, bankUsers) => {
        if (err) {
            res.status(400).json({
                message: 'ERROR 400',
                error: err
            });
            console.log(err);
        } else {
            res.status(200).json({
                bankUsers
            });
        }
    });
});

// READ by id
app.get("/bank/:id", (req, res) => {
    let id = req.params.id
    db.all(`SELECT * FROM BankUser WHERE Id = ?`, [id], (err, bankUser) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(bankUser.length) {
                res.status(200).json({
                    bankUser
                });
            } else {
                res.status(404).json({
                    message: `No bank user found with the id ${id}!`
                });
            }
        }
    });
});

// UPDATE by id
app.put("/bank/:id", (req, res) => {

    let id =req.params.id
    let bankUserId = req.body.userId;
    
    db.all(`SELECT * FROM BankUser WHERE Id = ?`, [id], (err, bankUser) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!bankUser.length) {
                res.status(404).json({
                    message: `No bank user found with the id ${id}!`
                });
            } else {
                let date = new Date();
                let year = date.getFullYear();
                let month = ("0" + (date.getMonth() + 1)).slice(-2);
                let day = ("0" + date.getDate()).slice(-2);
                let hours = ("0" + date.getHours()).slice(-2);
                let minutes = ("0" + date.getMinutes()).slice(-2);
                let seconds = ("0" + date.getSeconds()).slice(-2);
                let modifiedAt = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                db.run(`UPDATE BankUser SET UserId = ?, ModifiedAt = ? WHERE Id = ?`, [bankUserId, modifiedAt, id], (err) => {
                    if (err) {
                        res.status(400).json({
                            message: 'The bank user could not be updated!',
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            message: 'Bank user successfully updated!',
                        });
                    }
                });
            }
        }
    });
});

// DELETE by id 
app.delete("/bank/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let sqlGet = `SELECT * FROM BankUser WHERE Id = ?`;
    let sqlDelete = `DELETE FROM BankUser WHERE Id = ?`;
    db.all(sqlGet, [req.params.id], (err, bankUser) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!bankUser.length) {
                res.status(404).json({
                    message: `No bank user found with the id ${req.params.id}!`
                });
            } else {
                db.run(sqlDelete, req.params.id, (err) => {
                    if (err) {
                        res.status(400).json({
                            message: 'The bank user could not be deleted!',
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            message: 'Bank user successfully deleted!'
                        });
                    }
                });
            }
        }
    });
});

// -------------------
// |   Account API   |
// -------------------

// CREATE Account
app.post("/account", (req, res) => {
    let bankUserId = req.body.bankUserId;
    let accountNo = req.body.accountNo;
    let isStudent = req.body.isStudent;
    let interestRate = req.body.interestRate;
    let amount = req.body.amount;
    let sqlGetBankUser = `SELECT * FROM BankUser WHERE Id = ?`;
    let sqlGetAccount = `SELECT * FROM Account WHERE BankUserId = ?`;
    let sqlAccount = `INSERT INTO Account(BankUserId, AccountNo, IsStudent, InterestRate, Amount) VALUES(?, ?, ?, ?, ?)`;

    // Check if the bankUserId exists in the BankUser table
    db.all(sqlGetBankUser, [bankUserId], (err, bankUser) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!bankUser.length) {
                res.status(404).json({
                    message: `No Bank User found with the id ${bankUserId}!`
                });
            } else {
                // Check if the bankUserId already has an Account
                db.all(sqlGetAccount, [bankUserId], (err, account) => {
                    if (err) {
                        res.status(400).json({
                            error: err
                        });
                        console.log(err);
                    } else {
                        if(account.length) {
                            res.status(404).json({
                                message: `The Bank User with id ${bankUserId} already has an Account!`
                            });
                        } else { // create an Account
                            db.run(sqlAccount, [bankUserId, accountNo, isStudent, interestRate, amount], (err) => {
                                if (err) {
                                    if(err.message === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: Account.AccountNo') {
                                        res.status(400).json({
                                            message: 'The Account Number already exists!',
                                            error: err.message
                                        });
                                    } else {
                                        res.status(400).json({
                                            message: 'The Account could not be created!',
                                            error: err.message
                                        });
                                        console.log(err.message);
                                    }
                                } else {
                                    console.log(`A new row has been inserted!`);
                                    res.status(201).json({
                                        message: 'Account successfully created!',
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});

// READ Accounts
app.get("/account", (req, res) => {
    let sql = `SELECT * FROM Account`;
    db.all(sql, [], (err, accounts) => {
        if (err) {
            res.status(400).json({
                message: 'The Accounts could not be showed!',
                error: err
            });
            console.log(err);
        } else {
            res.status(200).json({
                accounts
            });
        }
    });
});

// READ Account by Id
app.get("/account/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let sql = `SELECT * FROM Account WHERE Id = ?`;

    db.all(sql, [req.params.id], (err, account) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(account.length) {
                res.status(200).json({
                    account
                });
            } else {
                res.status(404).json({
                    message: `No Account was found with the id ${req.params.id}!`
                });
            }
        }
    });
});

// UPDATE Account by Id
app.put("/account/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let bankUserId = req.body.bankUserId;
    let accountNo = req.body.accountNo;
    let isStudent = req.body.isStudent;
    let interestRate = req.body.interestRate;
    let amount = req.body.amount;
    let sqlGet = `SELECT * FROM Account WHERE Id = ?`;
    let sqlUpdate = `UPDATE Account SET BankUserId = ?, AccountNo = ?, IsStudent = ?, 
                                        InterestRate = ?, Amount = ?, ModifiedAt = ? 
                                        WHERE Id = ?`;

    // Check if the bankUserId exists in the BankUser table
    db.all(sqlGet, [req.params.id], (err, account) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!account.length) {
                res.status(404).json({
                    message: `No Account was found with the id ${req.params.id}!`
                });
            } else {
                let date = new Date();
                let year = date.getFullYear();
                let month = ("0" + (date.getMonth() + 1)).slice(-2);
                let day = ("0" + date.getDate()).slice(-2);
                let hours = ("0" + date.getHours()).slice(-2);
                let minutes = ("0" + date.getMinutes()).slice(-2);
                let seconds = ("0" + date.getSeconds()).slice(-2);
                let modifiedAt = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

                db.run(sqlUpdate, [bankUserId, accountNo, isStudent, interestRate, amount, modifiedAt, req.params.id], (err) => {
                    if (err) {
                        if(err.message === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: Account.AccountNo') {
                            res.status(400).json({
                                message: 'The Account Number already exists!',
                                error: err.message
                            });
                        } else {
                            res.status(400).json({
                                message: 'The Account could not be updated!',
                                error: err.message
                            });
                            console.log(err.message);
                        }
                    } else {
                        res.status(201).json({
                            message: 'Account successfully updated!',
                        });
                    }
                });
            }
        }
    });
});

// DELETE Account by Id
app.delete("/account/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let sqlGet = `SELECT * FROM Account WHERE Id = ?`;
    let sqlDelete = `DELETE FROM Account WHERE Id = ?`;
    db.all(sqlGet, [req.params.id], (err, account) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!account.length) {
                res.status(404).json({
                    message: `No Account was found with the id ${req.params.id}!`
                });
            } else {
                db.run(sqlDelete, req.params.id, (err) => {
                    if (err) {
                        res.status(400).json({
                            message: 'The Account could not be deleted!',
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(200).json({
                            message: 'Account successfully deleted!'
                        });
                    }
                });
            }
        }
    });
});

// ---------------------------
// |   Other functionality   |
// ---------------------------

// Add Deposit
app.post("/add-deposit", (req, res) => {
    let amount = req.body.amount;
    let bankUserId = req.body.bankUserId;
    let sqlGetBankUser = `SELECT * FROM BankUser WHERE Id = ?`;
    let sqlAddDeposit = `INSERT INTO Deposit(BankUserId, Amount) VALUES(?, ?)`;
    let sqlUpdateAccount = `UPDATE Account SET InterestRate = ?, ModifiedAt = ? WHERE BankUserId = ?`;
    db.all(sqlGetBankUser, [bankUserId], (err, bankUser) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!bankUser.length) {
                res.status(404).json({
                    message: `No Bank User found with the id ${bankUserId}!`
                });
            } else {
                if (amount <= 0 || amount === null) {
                    res.status(404).json({
                        message: 'The amount deposited cannot be null or negative!',
                    });
                } else {

                    // Call the Bank_Interest_Rate Function
                    axios.post('http://localhost:7071/api/Interest_Rate', {depositAmount: amount}).then(response =>{
                        let result = response.data;
                        let date = new Date();
                        let year = date.getFullYear();
                        let month = ("0" + (date.getMonth() + 1)).slice(-2);
                        let day = ("0" + date.getDate()).slice(-2);
                        let hours = ("0" + date.getHours()).slice(-2);
                        let minutes = ("0" + date.getMinutes()).slice(-2);
                        let seconds = ("0" + date.getSeconds()).slice(-2);
                        let modifiedAt = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                        db.run(sqlUpdateAccount, [result, modifiedAt, bankUserId], (err) => {
                            if (err) {
                                res.status(400).json({
                                    message: 'The Account could not be updated!',
                                    error: err.message
                                });
                                console.log(err.message);
                            }
                        });
                        db.run(sqlAddDeposit, [bankUserId, result], (err) => {
                            if (err) {
                                res.status(400).json({
                                    message: 'The Deposit could not be created!',
                                    error: err.message
                                });
                                console.log(err.message);
                            } else {
                                console.log(`A new row has been inserted!`);
                                res.status(201).json({
                                    message: 'Deposit successfully created!',
                                });
                            }
                        });
                    }).catch(err =>{
                        if(err){
                            console.log(err);
                            res.status(403).json({
                                message: err
                            });
                        }
                    });
                }
            }
        }
    });
});

// List Deposits
app.get("/list-deposits/:bankUserId", (req, res) => {
    console.log("req.params.bankUserId: ", req.params.bankUserId);
    let sql = `SELECT * FROM Deposit WHERE BankUserId = ?`;
    db.all(sql, [req.params.bankUserId], (err, deposits) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(deposits.length) {
                res.status(200).json({
                    deposits
                });
            } else {
                res.status(404).json({
                    message: `No deposits found for the bank user with the id ${req.params.bankUserId}!`
                });
            }
        }
    });
});

// Create Loan
app.post("/create-loan", (req, res) => {
    let bankUserId = req.body.bankUserId;
    let loanAmount = req.body.loanAmount;
    let sqlGetBankUser = `SELECT * FROM BankUser WHERE Id = ?`;
    let sqlLoan = `INSERT INTO Loan(BankUserId, Amount) VALUES(?, ?)`;

    // Check if the bankUserId exists in the BankUser table
    db.all(sqlGetBankUser, [bankUserId], (err, bankUser) => {
        if (err) {
            res.status(400).json({
                error: err
            });
        } else {
            if(!bankUser.length) {
                res.status(404).json({
                    message: `No Bank User found with the id ${bankUserId}!`
                });
            } else {

                // Get the sum of all accounts from a certain User
                axios.get(`http://localhost:5000/account`).then(response => {
                    let accounts = response.data.accounts;
                    console.log(accounts);
                    let accamount = 0;
                    for (i = 0; i < accounts.length; i++) {
                        if (bankUserId === accounts[i].BankUserId) {
                            accamount = accounts[i].Amount;
                        }
                    }

                    // Check if the Loan is Valid
                    axios.post(`http://localhost:7071/api/Loan_Function`, {
                        "loan": loanAmount,
                        "totalAccountAmount": accamount
                    }).then((response) => {
                        db.run(sqlLoan, [bankUserId, loanAmount], (err) => {
                            if (err) {
                                res.status(400).json({
                                    message: 'The Loan could not be created!',
                                    error: err.message
                                });
                            } else {
                                let totalAmount = accamount + loanAmount;
                                let date = new Date();
                                let year = date.getFullYear();
                                let month = ("0" + (date.getMonth() + 1)).slice(-2);
                                let day = ("0" + date.getDate()).slice(-2);
                                let hours = ("0" + date.getHours()).slice(-2);
                                let minutes = ("0" + date.getMinutes()).slice(-2);
                                let seconds = ("0" + date.getSeconds()).slice(-2);
                                let modifiedAt = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                                db.run(`UPDATE Account SET Amount = ?, ModifiedAt = ? 
                                WHERE bankUserId = ? `, [totalAmount, modifiedAt, bankUserId], (err)=>{
                                    if (err) {
                                        res.status(400).json({
                                            message: 'The new amount in the account could not be updated',
                                            error: err.message
                                        });
                                    } else {
                                        res.status(201).json({
                                            message: 'The new amount in the account was updated',
                                        });
                            }

                        });
                            }
                        });
                        
                    }, (error) => {
                        res.status(403).json({
                            message: 'The Loan could not be created! Loan amount is too big!',
                        });
                    });
                }).catch(err =>{
                    if(err){
                        res.status(400).json({
                            message: 'Can not get the ammount'
                        });
                    }
                });
            }
        }
    });
});

// Pay Loan - UPDATE Loan and Account
app.put("/pay-loan", (req, res) => {
    let bankUserId = req.body.bankUserId;
    let loanId = req.body.loanId;
    let accountAmount;
    let loanAmount;
    let sqlGetLoan = `SELECT * FROM Loan WHERE Id = ?`;
    let sqlGetAccount = `SELECT * FROM Account WHERE BankUserId = ?`;
    let sqlUpdateLoan = `UPDATE Loan SET Amount = ?, ModifiedAt = ? WHERE Id = ?`;
    let sqlUpdateAccount = `UPDATE Account SET Amount = ?, ModifiedAt = ? WHERE Id = ?`;

    db.all(sqlGetAccount, [bankUserId], (err, account) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!account.length) {
                res.status(404).json({
                    message: `No Account was found with the id ${req.params.id}!`
                });
            } else {
                let date = new Date();
                let year = date.getFullYear();
                let month = ("0" + (date.getMonth() + 1)).slice(-2);
                let day = ("0" + date.getDate()).slice(-2);
                let hours = ("0" + date.getHours()).slice(-2);
                let minutes = ("0" + date.getMinutes()).slice(-2);
                let seconds = ("0" + date.getSeconds()).slice(-2);
                let modifiedAt = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

                // Get the Loan Amount
                db.all(sqlGetLoan, [loanId], (err, loan) => {
                    if (err) {
                        res.status(400).json({
                            error: err
                        });
                    } else {
                        if(!loan.length) {
                            res.status(404).json({
                                message: `No Loan was found with the id ${loanId}!`
                            });
                        } else {
                            loanAmount = loan[0].Amount;
                            accountAmount = account[0].Amount;

                            // Obtain new Account Amount after loan substraction
                            let amount = accountAmount - loanAmount;
                            if (loanAmount > accountAmount) {
                                res.status(400).json({
                                    message: 'Not enough money in the Account to pay the Loan!',
                                });
                            } else {

                                // Substract Amount from Account
                                db.run(sqlUpdateAccount, [amount, modifiedAt, account[0].Id], (err) => {
                                    if (err) {
                                        res.status(400).json({
                                            message: 'The Account could not be updated!',
                                            error: err.message
                                        });
                                    } else {

                                        // Set Loan Amount to 0
                                        db.run(sqlUpdateLoan, [0, modifiedAt, loanId], (err) => {
                                            if (err) {
                                                res.status(400).json({
                                                    message: 'The Loan could not be updated!',
                                                    error: err.message
                                                });
                                            } else {
                                                res.status(201).json({
                                                    message: 'Loan and Account successfully updated!',
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                });
            }
        }
    });
});

// READ list of Unpaid Loans
app.get("/list-loans/:bankUserId", (req, res) => {
    let bankUserId = req.params.bankUserId;
    let sql = `SELECT * FROM Loan WHERE BankUserId = ? AND Amount != 0`;
    db.all(sql, [bankUserId], (err, loans) => {
        if (err) {
            res.status(400).json({
                message: 'The Loans could not be showed!',
                error: err
            });
        } else {
            if (!loans.length) {
                res.status(400).json({
                    message: 'No Unpaid Loans are available for this User!'
                });
            } else {
                res.status(200).json({
                    loans
                });
            }
        }
    });
});

// Withdraw money
app.post("/withdraw-money", (req, res) => {
    let amount = req.body.amount;
    let userId = req.body.userId;
    let sqlGetBankUser = `SELECT * FROM BankUser WHERE UserId = ?`;
    let sqlGetAccount = `SELECT * FROM Account WHERE BankUserId = ?`;
    let sqlUpdateAccount = `UPDATE Account SET Amount = ?, ModifiedAt = ? WHERE Id = ?`;

    if (amount <= 0 || amount === null) {
        res.status(404).json({
            message: 'The amount deposited cannot be null or negative!',
        });
    } else {
        db.all(sqlGetBankUser, [userId], (err, bankUser) => {
            if (err) {
                res.status(400).json({
                    error: err
                });
                console.log(err);
            } else {
                if(bankUser.length) {
                    db.all(sqlGetAccount, [bankUser[0].Id], (err, account) => {
                        if (err) {
                            res.status(400).json({
                                error: err
                            });
                            console.log(err);
                        } else {
                            if(account.length) {
                                let withdraw = false;
                                let id = "";
                                let amountBeforeWithdraw = "";

                                if (account[0].Amount - amount >= 0) {
                                    withdraw = true;
                                    id = account[0].Id;
                                    amountBeforeWithdraw = account[0].Amount;
                                }

                                if (withdraw) {
                                    let date = new Date();
                                    let year = date.getFullYear();
                                    let month = ("0" + (date.getMonth() + 1)).slice(-2);
                                    let day = ("0" + date.getDate()).slice(-2);
                                    let hours = ("0" + date.getHours()).slice(-2);
                                    let minutes = ("0" + date.getMinutes()).slice(-2);
                                    let seconds = ("0" + date.getSeconds()).slice(-2);
                                    let modifiedAt = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                                    let amountAfterWithdraw = amountBeforeWithdraw - amount;
                                    db.run(sqlUpdateAccount, [amountAfterWithdraw, modifiedAt, id], (err) => {
                                        if (err) {
                                            res.status(400).json({
                                                message: 'The Account could not be updated!',
                                                error: err.message
                                            });
                                            console.log(err.message);
                                        } else {
                                            res.status(201).json({
                                                message: 'Withdraw successfully completed!',
                                            });
                                        }
                                    });
                                } else {
                                    res.status(404).json({
                                        message: 'You do not have enough money in your account!',
                                    });
                                }
                            } else {
                                res.status(404).json({
                                    message: `No account found for the bank user with the id ${bankUser.Id}!`
                                });
                            }
                        }
                    });
                } else {
                    res.status(404).json({
                        message: `No bank user found for the user with the id ${userId}!`
                    });
                }
            }
        });
    }
});

app.listen(PORT, HOSTNAME, (err) => {
    if(err){
        console.log(err);
    }
    else{
        console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
    }
});
