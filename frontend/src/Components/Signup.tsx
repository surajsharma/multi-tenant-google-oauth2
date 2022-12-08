import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import React, { FC, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const SignUp: FC = () => {
    const { localAuth, setAuth, auth }: any = useContext(AuthContext);
    const [logging, setLogging] = useState(false);
    let goto = useNavigate();

    useEffect(() => {
        //someone is already logged in
        if (localAuth) {
            goto("/subscriptions");
        }
    }, []);

    const login = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            const res = await axios.post("/api/auth/google", {
                code: codeResponse.code
            });

            if (res.status === 201 || res.status === 200) {
                setAuth({
                    tokens: res.data.tokens,
                    userdata: res.data.userdata,
                    subscriptions: res.data.subscriptions
                });

                goto("/subscriptions");
            }
        },
        flow: "auth-code"
    });

    const loginWithGoogleOauth = () => {
        setLogging(true);
        login();
    };

    return (
        <div className={"center"}>
            {logging ? (
                <p>Logging you in..</p>
            ) : (
                <button onClick={() => loginWithGoogleOauth()}>
                    Login/Sign-up (Google OAuth2.0)
                </button>
            )}
        </div>
    );
};

export default SignUp;
