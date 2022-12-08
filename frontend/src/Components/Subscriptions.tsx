import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";

import { AuthContext } from "./AuthContext";
import { getUserEmailbyId } from "./utils/functions";

type Props = {};
export default function Subscriptions({}: Props) {
    const { localAuth, auth, setAuth }: any = useContext(AuthContext);

    const [user, setUser]: any = useState(null);
    const [subs, setSubs]: any = useState([]);

    const [loading, setlLoading] = useState(false);
    const goto = useNavigate();

    // route protection
    useEffect(() => {
        if (!localAuth && !auth) {
            goto("/login");
        }

        // app-user, not to be confused with
        // currently viewed subscription
        if (localAuth) {
            setUser(JSON.parse(localAuth.userdata));
        }
        if (auth.tokens) {
            setUser(JSON.parse(auth.userdata));
        }
    }, []);

    useEffect(() => {
        if (!auth && !localAuth) {
            return;
        }

        // get user emails for each subscription

        const subscriptions = auth.subscriptions ?? localAuth.subscriptions;

        subscriptions &&
            subscriptions.reduce(
                async (accumulatorPromise: any, nextID: string) => {
                    return accumulatorPromise.then(async () => {
                        setlLoading(true);
                        let { email } = await getUserEmailbyId(nextID);

                        if (!subs.includes(email)) {
                            setSubs((prevState: any) => [...prevState, email]);
                        }

                        setlLoading(false);
                    });
                },
                Promise.resolve()
            );
    }, [auth]);

    const addSubFlow = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            const res = await axios.post("/api/auth/google/addsub", {
                code: codeResponse.code,
                user
            });

            if (res.status === 201) {
                console.log(res.data);
                setAuth((prevAuth: any) => ({
                    ...prevAuth,
                    subscriptions: res.data.subscriptions
                }));
            }

            if (res.status === 200) {
                //subscription exists
                alert(res.data.status);
            }
        },
        flow: "auth-code"
    });

    const logOut = () => {
        googleLogout();
        setAuth(null);
        localStorage.removeItem("cliff_auth");
        goto("/login");
    };

    return (
        <>
            {subs.length ? (
                <div>
                    Subscriptions for<b> {user?.email}</b>
                    <br />
                    <button onClick={logOut}>logout</button>
                    <button
                        onClick={() =>
                            user ? addSubFlow() : alert("unauthorised")
                        }
                    >
                        add subscription
                    </button>
                    <hr />
                    {
                        <ol>
                            {subs.length ? (
                                subs.map((s: string) => {
                                    return (
                                        <li key={s}>
                                            <a
                                                onClick={async () => {
                                                    goto(
                                                        `/dashboard?email=${s}`
                                                    );
                                                }}
                                            >
                                                {s}
                                            </a>
                                        </li>
                                    );
                                })
                            ) : (
                                <p className="center">
                                    loading subscriptions...
                                </p>
                            )}
                        </ol>
                    }
                </div>
            ) : (
                <></>
            )}
        </>
    );
}
