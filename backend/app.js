require("dotenv").config();

let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");

var app = express();

const { baseClient, dbClient } = require("./db");
const { user } = require("./schemas");

// middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// routes
app.use("/api", indexRouter);
app.use("/api/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send({ error: "error" });
});

//connect to db
async function initDB() {
    console.log("🔫 db init in 5 seconds, env: " + process.env.PGDB);
    await sleep(5000);
    try {
        await baseClient.connect();
        console.log("✅ basic connection to db");

        const dbQuery = await baseClient.query(
            `SELECT FROM pg_database WHERE datname = $1`,
            [`${process.env.PGDB}`]
        );

        if (dbQuery.rows.length === 0) {
            // database does not exist, make it:
            console.log("no db found, creating one");
            await baseClient.query(`CREATE DATABASE ${process.env.PGDB}`);
        }
        await baseClient.end();
    } catch (error) {
        console.log("💣", error);
        // throw error;
    }
    try {
        await dbClient.connect();

        console.log(`✅ connection to db ${process.env.PGDB}`);

        const companyQuery = await dbClient.query(
            `CREATE TABLE IF NOT EXISTS ${process.env.PGTABLE} (${user});`
        );

        if (companyQuery.rowCount >= 0) {
            console.log(
                `✅ ready to transact at ${process.env.PGDB}/${process.env.PGTABLE}`
            );
        }
    } catch (error) {
        console.log("💣💣", error);
    }
}

initDB();
module.exports = app;
