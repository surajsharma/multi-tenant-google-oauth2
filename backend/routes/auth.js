const { OAuth2Client, UserRefreshClient } = require("google-auth-library");
const { v4: uuidv4 } = require("uuid");
const { dbClient } = require("../db");

let express = require("express");
let router = express.Router();

const nodeParseJwt = (token) => {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
};

router.post("/google", async function (req, res, next) {
    console.log("/auth/google");
    const oAuth2Client = new OAuth2Client(
        process.env.G_CID,
        process.env.G_CSEC,
        "postmessage"
    );

    const { tokens } = await oAuth2Client.getToken(req.body.code);
    // exchange code for tokens

    // decode jwt
    const { name, email, email_verified, picture, exp } = nodeParseJwt(
        tokens.id_token
    );

    /* on signup/login and the user model:
      1. for simplicity's sake i have added the above destructured user props into 
      the schema itself.
      2. 'subscriptions' column on a user will have as an array, user `id`s 
      created with uuid. 
      3. so essentially, you login and signup with goAuth2.0 in a single click
      4. in doing so, you also become your own first subscription
      5. the new user added by you to create a new subscription also becomes a user 
      through this route/controller, albeit with no subscriptions of her own
      6. then the thus created user's id to your `subscriptions` field.
   */

    let userdata = {
        userid: uuidv4(),
        name,
        email,
        email_verified,
        picture,
        expiry: exp,
        ...tokens,
        scope: process.env.SCOPE
    };

    const subscriptions = [userdata.userid];

    userdata = await JSON.stringify(userdata);

    let user_exists = await dbClient.query(
        `SELECT * from users where EMAIL = $1`,
        [email]
    );

    if (!user_exists.rowCount) {
        // new user
        let new_user = await dbClient.query(
            `INSERT into users (USERDATA, SUBSCRIPTIONS, EMAIL) VALUES ($1, $2, $3)`,
            [userdata, subscriptions, email]
        );

        if (new_user.rowCount) {
            res.status(201).send({
                status: "new user created",
                userdata,
                subscriptions,
                tokens
            });
        }
    } else {
        //returning user, get all existing data, replace tokens
        userdata = JSON.parse(user_exists.rows[0].userdata);
        userdata = { ...userdata, ...tokens };
        // console.log(userdata.tokens, user_exists.rows[0].userdata);

        const updated_user = await dbClient.query(
            `UPDATE users set userdata = $1 where email = $2`,
            [userdata, email]
        );

        if (updated_user.rowCount) {
            //get the updated user each time as the update query does not return the updated object

            const returning = await dbClient.query(
                `SELECT * from users where email = $1`,
                [email]
            );

            if (returning.rowCount) {
                res.status(200).send({
                    status: "returning updated user",
                    userdata: returning.rows[0].userdata,
                    subscriptions: returning.rows[0].subscriptions,
                    tokens
                });
            }
        }
    }
});

router.post("/google/addsub", async function (req, res, next) {
    // This route gets called by existing logged in user
    // First, we create a new user the usual way

    const oAuth2Client = new OAuth2Client(
        process.env.G_CID,
        process.env.G_CSEC,
        "postmessage"
    );

    // exchange code for tokens
    const { tokens } = await oAuth2Client.getToken(req.body.code);

    // decode jwt
    const { name, email, email_verified, picture, exp } = nodeParseJwt(
        tokens.id_token
    );

    try {
        //get logged in user
        const loggedUser = await dbClient
            .query(
                `SELECT * from users where EMAIL like '${req.body.user.email}'`
            )
            .then((data) => data.rows[0]);

        //get user to subscribe
        const userSubscribed = await dbClient
            .query(`SELECT * from users where EMAIL like '${email}'`)
            .then((data) => data.rows[0]);

        //user to subscribe exists in db
        if (userSubscribed) {
            const userSubscribedData = await JSON.parse(
                userSubscribed.userdata
            );

            if (loggedUser.subscriptions.includes(userSubscribedData.userid)) {
                //already subscribed
                return res.status(200).send({
                    status: "subscription exists"
                });
            }

            const added_sub = await dbClient.query(
                `UPDATE users set subscriptions = $1  where email = $2`,
                [
                    [...loggedUser.subscriptions, userSubscribedData.userid],
                    loggedUser.email
                ]
            );
            if (added_sub.rowCount) {
                //get the logged-in user
                let addedUser = await dbClient.query(
                    `select * from users where email = $1 `,
                    [email]
                );

                //new user added, update logged user
                if (addedUser.rowCount) {
                    const addedUserData = await JSON.parse(
                        addedUser.rows[0].userdata
                    );

                    let updatedUser = await dbClient.query(
                        `UPDATE users set subscriptions = $1  where email = $2`,
                        [
                            [...loggedUser.subscriptions, addedUserData.userid],
                            loggedUser.email
                        ]
                    );

                    if (updatedUser.rowCount) {
                        updatedUser = await dbClient.query(
                            `SELECT * from users where email = $1`,
                            [loggedUser.email]
                        );

                        if (updatedUser.rowCount) {
                            return res.status(201).send({
                                status: "subscription added",
                                subscriptions: updatedUser.rows[0].subscriptions
                            });
                        }
                    }
                }
            }
        }
        // new user
        if (!userSubscribed) {
            const userid = uuidv4();
            const subscriptions = [userid];

            const userdata = JSON.stringify({
                userid,
                name,
                email,
                email_verified,
                picture,
                expiry: exp,
                ...tokens
            });
            //create the subbed user in db
            let newUser = await dbClient
                .query(
                    `INSERT into users (USERDATA, SUBSCRIPTIONS, EMAIL) VALUES ($1, $2, $3)`,
                    [userdata, subscriptions, email]
                )
                .then(async (user) => {
                    if (user.rowCount) {
                        //get the logged-in user
                        let addedUser = await dbClient.query(
                            `select * from users where email = $1 `,
                            [email]
                        );

                        //new user added, update logged user
                        if (addedUser.rowCount) {
                            const addedUserData = await JSON.parse(
                                addedUser.rows[0].userdata
                            );

                            let updatedUser = await dbClient.query(
                                `UPDATE users set subscriptions = $1  where email = $2`,
                                [
                                    [
                                        ...loggedUser.subscriptions,
                                        addedUserData.userid
                                    ],
                                    loggedUser.email
                                ]
                            );

                            if (updatedUser.rowCount) {
                                updatedUser = await dbClient.query(
                                    `SELECT * from users where email = $1`,
                                    [loggedUser.email]
                                );

                                if (updatedUser.rowCount) {
                                    return res.status(201).send({
                                        status: "subscription added",
                                        subscriptions:
                                            updatedUser.rows[0].subscriptions
                                    });
                                }
                            }
                        }
                    }
                });
        }
    } catch (error) {
        console.log(error, "error in /auth/google.addsub");
    }
});

router.post("/google/refresh-token", async (req, res) => {
    const user = new UserRefreshClient(
        process.env.G_CID,
        process.env.G_CSEC,
        req.body.refreshToken
    );

    const { credentials } = await user.refreshAccessToken(); // optain new tokens
    res.json(credentials);
});

module.exports = router;
