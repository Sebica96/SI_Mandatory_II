const sqlite3 = require('sqlite3').verbose();
const express = require("express");
const axios = require('axios');
let app = express();
app.use(express.json());

const HOSTNAME = 'localhost';
const PORT = 4000;

let db = new sqlite3.Database('borgerdatabase.sqlite', (err) => {
    if(err) {
        return console.log(err.message);
    }
    console.log("Connected to database!")
});

db.get("PRAGMA foreign_keys = ON");

db.run(`CREATE TABLE IF NOT EXISTS BorgerUser(
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER NOT NULL,
    CreatedAt DATE DEFAULT (datetime('now','localtime')))`
);

db.run(`CREATE TABLE IF NOT EXISTS Address(
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    BorgerUserId INTEGER NOT NULL,
    Address TEXT NOT NULL,
    CreatedAt DATE DEFAULT (datetime('now','localtime')),
    IsValid INTEGER DEFAULT 1,
    FOREIGN KEY(BorgerUserId) REFERENCES BorgerUser(Id) ON DELETE CASCADE)`
);


// BORGER CRUD

// CREATE
app.post("/borger", (req, res) => {
    let borgerUserId = req.body.userId;
    let sql = `INSERT INTO BorgerUser(UserId) VALUES(?)`;

    db.run(sql, [borgerUserId], (err) => {
        if (err) {
            res.status(400).json({
                message: 'A new borger user could not be added to the table!',
                error: err.message
            });
            console.log(err.message);
        } else {
            console.log(`A new borger user was added to the table!`);
            res.status(201).json({
                message: 'A new borger user was added to the table!'
            });
        }
    });
});

// READ
app.get("/borger", (req, res) => {
    db.all(`SELECT * FROM BorgerUser`, [], (err, borgerUsers) => {
        if (err) {
            res.status(400).json({
                message: 'Service unavailable!',
                error: err
            });
            console.log(err);
        } else {
            res.status(200).json({
                borgerUsers
            });
        }
    });
});

// READ Borger User by Id
app.get("/borger/:id", (req, res) => {
    console.log("the id is ", req.params.id);

    db.all(`SELECT * FROM BorgerUser WHERE Id = ?`, [req.params.id], (err, borgerUser) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(borgerUser.length) {
                res.status(200).json({
                    borgerUser
                });
            } else {
                res.status(404).json({
                    message: `No borger user found with the id ${req.params.id}!`
                });
            }
        }
    });
});

//UPDATE
app.put("/borger/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let borgerUserId = req.body.userId;
    db.all(`SELECT * FROM BorgerUser WHERE Id = ?`, [req.params.id], (err, borgerUser) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!borgerUser.length) {
                res.status(404).json({
                    message: `No borger user found with the id ${req.params.id}!`
                });
            } else {
                db.run(`UPDATE BorgerUser SET UserId = ? WHERE Id = ?`, [borgerUserId, req.params.id], (err) => {
                    if (err) {
                        res.status(400).json({
                            message: 'The borger user could not be updated!',
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            message: 'Borger user successfully updated!'
                        });
                    }
                });
            }
        }
    });
});

// DELETE by Id
app.delete("/borger/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    db.all(`SELECT * FROM BorgerUser WHERE Id = ?`, [req.params.id], (err, borgerUser) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!borgerUser.length) {
                res.status(404).json({
                    message: `No borger user found with the id ${req.params.id}!`
                });
            } else {
                db.run(`DELETE FROM BorgerUser WHERE Id = ?`, req.params.id, (err) => {
                    if (err) {
                        res.status(400).json({
                            message: 'The borger user could not be deleted!',
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            message: 'Borger user successfully deleted!'
                        });
                    }
                });
            }
        }
    });
});

//Address CRUD

// CREATE Address
app.post("/address", (req, res) => {
    let borgerUserId = req.body.borgerUserId;
    let address = req.body.address;

    console.log(borgerUserId);
    console.log(address);

    // check if the borger user id exists
    axios.get(`http://localhost:4000/borger/${borgerUserId}`).then(response =>{

        // get all the existing addresses
        axios.get(`http://localhost:4000/address`).then(response => {
            let addresses = response.data.addresses;
            //console.log(addresses);
            // check if the borger user id from the address table already exists
            // if it exists, set the isValid field false for the old addresses
            for (i = 0; i < addresses.length; i++) {
                if (borgerUserId === addresses[i].BorgerUserId) {
                    db.run(`UPDATE Address SET IsValid = ? WHERE BorgerUserId = ? AND IsValid = 1`, [0, borgerUserId], (err) => {
                        if (err) {
                            res.status(400).json({
                                error: err
                            });
                            console.log(err.message);
                        }
                    });
                    break;
                }
            }
            // create new address
            db.run(`INSERT INTO Address(BorgerUserId, Address) VALUES(?, ?)`, [borgerUserId, address], (err) => {
                if (err) {
                    res.status(400).json({
                        message: 'The address could not be created!',
                        error: err.message
                    });
                    console.log(err.message);
                } else {
                    console.log(`A new row has been inserted!`);
                    res.status(201).json({
                        message: 'Address successfully created!',
                    });
                }
            });
        }).catch(err =>{
            if(err){
                res.status(400).json({
                    message: err
                });
                console.log(err);
            }
        });
    }).catch(err =>{
        if(err){
            console.log(err);
        }
        res.status(400).json({
            message: `There is no borger user with the id ${borgerUserId}`
        });
    });
});

// READ Address
app.get("/address", (req, res) => {
    db.all(`SELECT * FROM Address`, [], (err, addresses) => {
        if (err) {
            res.status(400).json({
                message: 'Unavailable service!',
                error: err
            });
            console.log(err);
        } else {
            console.log("Addresses:", addresses);
            res.status(200).json({
                addresses
            });
        }
    });
});

// READ by Id
app.get("/address/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);

    db.all(`SELECT * FROM Address WHERE Id = ?`, [req.params.id], (err, address) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(address.length) {
                res.status(200).json({
                    address
                });
            } else {
                res.status(404).json({
                    message: `No address found with the id ${req.params.id}!`
                });
            }
        }
    });
});

// UPDATE Address by Id
app.put("/address/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let borgerUserId = req.body.borgerUserId;
    let address = req.body.address;

    db.all(`SELECT * FROM Address WHERE Id = ?`, [req.params.id], (err, addressDB) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!addressDB.length) {
                res.status(404).json({
                    message: `No address found with the id ${req.params.id}!`
                });
            } else {
                db.run(`UPDATE Address SET BorgerUserId = ?, Address = ? WHERE Id = ?`, [borgerUserId, address, req.params.id], (err) => {
                    if (err) {
                        res.status(400).json({
                            message: 'The address could not be updated!',
                            error: err.message
                        });
                        console.log(err.message);
                    }
                    res.status(201).json({
                        message: 'Address successfully updated!',
                    });
                });
            }
        }
    });
});

// DELETE Address by Id
app.delete("/address/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);

    db.all(`SELECT * FROM Address WHERE Id = ?`, [req.params.id], (err, address) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!address.length) {
                res.status(404).json({
                    message: `No address found with the id ${req.params.id}!`
                });
            } else {
                db.run(`DELETE FROM Address WHERE Id = ?`, req.params.id, (err) => {
                    if (err) {
                        res.status(400).json({
                            message: 'The address could not be deleted!',
                            error: err.message
                        });
                        console.log(err.message);
                    }
                    res.status(201).json({
                        message: 'Address successfully deleted!'
                    });
                });
            }
        }
    });
});

app.listen(PORT, HOSTNAME, (err) => {
    if(err){
        console.log(err);
    }
    else{
        console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
    }
});