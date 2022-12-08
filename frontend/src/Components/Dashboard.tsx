import { googleLogout } from "@react-oauth/google";

import axios from "axios";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AsyncCascadingDropDowns } from "./AsyncCascadingDropdown";
import { AuthContext } from "./AuthContext";
import { CLIENT_ID, CLIENT_SECRET } from "./utils/config";
import { getUserByEmail } from "./utils/functions";

type Props = {};

export default function Dashboard({}: Props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { localAuth, auth, setAuth }: any = useContext(AuthContext);

    // the main data structure for the component,
    // swt is is set once on initial render (from localStorage if possible)
    // memoized fed to localStorage
    const [swt, setSwt] = useState([]);

    //watched tab list, also memoized and fed to localStorage
    //for frictionless access later
    const [watch, setWatch] = useState([]);
    const [watchLocal, setWatchLocal] = useState(
        JSON.parse(localStorage.getItem("cliff_watch") as string)
    );

    const goto = useNavigate();

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [token, setToken] = useState(null);

    const email = searchParams.get("email");

    //route protection
    useEffect(() => {
        if (!localAuth && !auth) {
            goto("/login");
        }

        if (!swt.length) {
            //we get the subscribing email from  seach params from the URL
            //then, get the appropriate user from db
            //use refreshtoken for a new access token
            //get/set sheets/tabs/ configureSwt
            getAccessToken();
        }

        if (!watchLocal) {
            return;
        }

        console.log(watchLocal, watch);
        setWatch(watchLocal[email as string]);
    }, []);

    useEffect(() => {
        if (token) {
            configureSwt();
        }
    }, [token]);

    //update localstorage when watched changes
    useEffect(() => {
        if (watch && watch.length) {
            let lw = {};
            lw[email] = watch;
            localStorage.setItem("cliff_watch", JSON.stringify(lw));
        }

        setWatchLocal(
            JSON.parse(localStorage.getItem("cliff_watch") as string)
        );
    }, [watch]);

    const getRefreshToken = async () => {
        //get refresh token from db

        const subUser = await getUserByEmail(email as string);
        const data = await JSON.parse(subUser.user.userdata);
        return data.refresh_token;
    };

    const getAccessToken = async () => {
        //get access token from rt
        const rt = await getRefreshToken();
        const res = await axios.post(
            "https://www.googleapis.com/oauth2/v4/token ",
            {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                refresh_token: rt,
                grant_type: "refresh_token"
            }
        );

        const { access_token, expires_in } = res.data;
        setToken({ token: access_token, expires: expires_in });
    };

    const getSheets = async (access_token: string) => {
        try {
            let res = await axios.get(
                "https://www.googleapis.com/drive/v3/files",
                {
                    params: {
                        q: "mimeType='application/vnd.google-apps.spreadsheet'",

                        pageSize: 1000,
                        fields: "files(id,name)"
                    },
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                }
            );
            return res.data.files;
        } catch (err) {
            setError(err.message);
            return;
        }
    };

    const getTabs = async (sheetId: any) => {
        if (sheetId) {
            try {
                let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;
                let tabs = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token.token}`
                    }
                });
                return tabs;
            } catch (err) {
                console.log(err);
                return -1;
            }
        }
    };

    const configureSwt = async () => {
        let sheets = getSheets(token.token).then((res) => {
            let sheetsWithTabs = res;

            if (!sheetsWithTabs) {
                setLoading(false);
                return;
            }

            sheetsWithTabs.reduce(
                (accumulatorPromise: any, nextSheet: any, index: number) => {
                    return accumulatorPromise.then(async () => {
                        setLoading(true);
                        let tabs = await getTabs(nextSheet.id);
                        let newSheet = nextSheet;
                        newSheet.tabs = tabs?.data?.sheets;
                        sheetsWithTabs[index] = newSheet;
                        setLoading(false);
                    });
                },
                Promise.resolve()
            );
            setSwt(sheetsWithTabs);
        });
    };

    const logOut = () => {
        googleLogout();
        setAuth(null);
        localStorage.removeItem("cliff_auth");
        goto("/login");
    };

    const DashboardStats = () => {
        // const user = JSON.parse(auth.userdata);
        return (
            <>
                Dashboard for<b> {searchParams.get("email")}</b>
                <br />
                <button onClick={logOut}>logout</button>
                <button onClick={() => goto("/subscriptions")}>
                    {"subscriptions"}
                </button>
                <br />
                <hr />
            </>
        );
    };

    return (
        <>
            {loading ? (
                <p className="center">loading sheets and tabs...</p>
            ) : (
                <>
                    <DashboardStats />
                    <div className="watched-table">
                        {watch && watchLocal ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sheet</th>
                                        <th>Tab</th>
                                        <th>Columns</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {watchLocal &&
                                        watch.map((e, i) => (
                                            <tr key={i}>
                                                <td>{e.sheet}</td>
                                                <td>{e.tab}</td>
                                                <td>{e.cols}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        ) : (
                            <>
                                {!swt.length && (
                                    <p className="center">No Sheets Found </p>
                                )}
                                {!watchLocal && (
                                    <p className="center">No Watched Sheets </p>
                                )}
                            </>
                        )}
                        {swt.length ? (
                            <AsyncCascadingDropDowns
                                swt={swt}
                                setSwt={setSwt}
                                watch={watch}
                                setWatch={setWatch}
                            />
                        ) : null}
                    </div>
                </>
            )}
        </>
    );
}
