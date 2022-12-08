/* user journey
********************************************
    login oauth2.0 google
    dashboard
        list sheets with column count

    store user in pg
        refresh token
        access token

    gapi https://gist.github.com/liondancer/d0d519dd27b0f44cc6b02068d3b3742a
        drive: get excel sheets
        upsert sheet-ids in user/pg

*/

import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { OAuth2Client } from "google-auth-library";

import axios from "axios";
import * as dotenv from "dotenv";

const API_KEY = import.meta.env.VITE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

const DISCOVERY_DOC = import.meta.env.VITE_DISCOVERY_DOC;
const SCOPES = import.meta.env.VITE_SCOPES;
const CLIENT_SECRET = import.meta.env.VITE_SECRET;

/**
 * This the search function we need to fetch data from the API using axios
 * Also we need to set the value of isLoading to indicate to the user that the results are being fetched
 * and once the fetching is done we need to set the response data as our search results so they can be consumed by the component
 * @param {*} queryParam the search string
 * @param setResults a function to set update the state of the component with search result
 * @param setIsloading a function to control the loading state
 */

const axiosConfig = {
    headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
    }
};

const AutoComplete: FC = () => {
    const [gapiready, gapiReady] = useState(false);
    const [gsiready, gsiReady] = useState(false);
    const [oauth2client, setOauth2Client] = useState(null);

    const [tokenClient, setTc] = useState(null);
    // const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, "");

    useEffect(() => {
        loadGapi();
        loadGsi();
    }, []);

    const handleOauth = () => {
        let x = oauth2client.requestCode();
        console.log(x);
    };
    const handleLogin = () => {
        if (gapiready && gsiready) {
            console.log("auth ready?");

            if (tokenClient) {
                tokenClient.callback = async (resp) => {
                    console.log(
                        "🚀 ~ file: AutoComplete.tsx:67 ~ tokenClient.callback= ~ resp",
                        resp
                    );
                    if (resp.error !== undefined) {
                        throw resp;
                    }
                    // // document.getElementById('signout_button').style.visibility = 'visible';
                    // // document.getElementById('authorize_button').innerText = 'Refresh';
                    // // await listSheets();
                    // const authorizeUrl = oAuth2Client.generateAuthUrl({
                    //     // To get a refresh token, you MUST set access_type to `offline`.
                    //     access_type: "offline",
                    //     // set the appropriate scopes
                    //     scope: "https://www.googleapis.com/auth/userinfo.profile",
                    //     // A refresh token is only returned the first time the user
                    //     // consents to providing access.  For illustration purposes,
                    //     // setting the prompt to 'consent' will force this consent
                    //     // every time, forcing a refresh_token to be returned.
                    //     prompt: "consent"
                    // });
                    // console.log(resp); // <--- access token, expires in 3599 seconds
                };

                if (gapi.client.getToken() === null) {
                    // Prompt the user to select a Google Account and ask for consent to share their data
                    // when establishing a new session.
                    tokenClient.requestAccessToken({ prompt: "consent" });
                } else {
                    // Skip display of account chooser and consent dialog for an existing session.
                    tokenClient.requestAccessToken({ prompt: "" });
                }
            }
        }
    };

    const loadGsi = () => {
        const script = document.createElement("script");
        script.src = "/gsi.js";
        script.async = true;

        document.body.appendChild(script);

        script.onload = async () => {
            //auth flow for refresh token
            let client = await google.accounts.oauth2.initCodeClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                ux_mode: "redirect",
                redirect_uri: "http://localhost:5173"
            });

            setOauth2Client(client);

            // for implicit flow
            let tc = await google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (res) => {
                    console.log(res);
                }
            });
            setTc(tc);
            gsiReady(true);
        };
    };

    const loadGapi = () => {
        const script = document.createElement("script");
        script.src = "/gapi.js";
        script.async = true;

        document.body.appendChild(script);

        script.onload = () => {
            gapi.load("client", async () => {
                await gapi.client
                    .init({
                        apiKey: API_KEY,
                        clientId: CLIENT_ID,
                        scopes: SCOPES,
                        discoveryDocs: [DISCOVERY_DOC]
                    })
                    .then(async (res) => {
                        gapiReady(true);
                    });
            });
        };
    };

    return (
        <>
            {oauth2client && (
                <>
                    <button onClick={handleOauth}>oauth2.0</button>
                </>
            )}
            {gapiready && gsiready ? (
                <button onClick={handleLogin}>add google account</button>
            ) : (
                <>loading...</>
            )}
        </>
    );
};

export default AutoComplete;
