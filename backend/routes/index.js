let express = require("express");
let router = express.Router();

const { dbClient } = require("../db");

router.get("/", async function (req, res, next) {
    res.status(200).send({
        status: "ok"
    });
});

router.get("/user", async (req, res) => {
    //returns a user's email given a userid
    if (req.query.userid) {
        const email = await dbClient.query(
            `SELECT email from users where POSITION($1 IN userdata)>0`,
            [req.query.userid]
        );

        if (email.rowCount) {
            return res.status(200).send({ email: email.rows[0].email });
        }
    }

    //returns a user given an email
    if (req.query.email) {
        console.log(req.query.email);

        const user = await dbClient.query(
            `SELECT * from users where email = $1`,
            [req.query.email]
        );

        if (user.rowCount) {
            return res.status(200).send({ user: user?.rows[0] });
        }
    }

    return res.status(404).send({ status: "user not found" });
});

module.exports = router;
