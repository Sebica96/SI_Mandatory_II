PRAGMA FOREIGN_KEYS = ON;

DROP TABLE IF EXISTS BorgerUser;
CREATE TABLE BorgerUser
(
    Id        INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId    INTEGER NOT NULL,
    CreatedAt DATE DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS Address;
CREATE TABLE Address
(
    Id           INTEGER PRIMARY KEY AUTOINCREMENT,
    BorgerUserId INTEGER NOT NULL,
    CreatedAt    DATE             DEFAULT CURRENT_TIMESTAMP,
    IsValid      INTEGER NOT NULL DEFAULT TRUE,
    FOREIGN KEY (BorgerUserId) REFERENCES BorgerUser (Id) ON DELETE CASCADE
);

INSERT INTO BorgerUser(UserId)
VALUES (0),
       (1),
       (2),
       (3),
       (4);

INSERT INTO Address(BorgerUserId)
VALUES (1),
       (1),
       (2),
       (2),
       (2),
       (3);
