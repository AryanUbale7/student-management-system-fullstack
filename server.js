const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Aryan@113",
    database: "student_db"
});

// connect
db.connect(err => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL");
    }
});

// test route
app.get("/", (req, res) => {
    res.send("Server is running");
});

// start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
app.post("/students", (req, res) => {
    const { name, email, phone, course, gender, dob, address, enrollment_date } = req.body;

    const sql = `
        INSERT INTO students 
        (name, email, phone, course, gender, dob, address, enrollment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, email, phone, course, gender, dob, address, enrollment_date], 
    (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({ message: "Student added successfully" });
    });
});
app.get("/students", (req, res) => {
    const sql = "SELECT * FROM students";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});
app.delete("/students/:id", (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM students WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json({ message: "Student deleted successfully" });
    });
});
app.put("/students/:id", (req, res) => {
    const id = req.params.id;
    const { name, email, phone, course, gender, dob, address, enrollment_date } = req.body;

    const sql = `
        UPDATE students 
        SET name=?, email=?, phone=?, course=?, gender=?, dob=?, address=?, enrollment_date=?
        WHERE id=?
    `;

    db.query(sql, [name, email, phone, course, gender, dob, address, enrollment_date, id],
    (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Student updated successfully" });
    });
});
app.post("/students", (req, res) => {
    const { email } = req.body;

    const checkSql = "SELECT * FROM students WHERE email = ?";
    
    db.query(checkSql, [email], (err, result) => {
        if (result.length > 0) {
            return res.json({ message: "Student already exists" });
        }

        const sql = "INSERT INTO students SET ?";
        db.query(sql, req.body, (err, result) => {
            res.json({ message: "Student added" });
        });
    });
});