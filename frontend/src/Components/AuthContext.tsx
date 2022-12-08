import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { createContext, FC, useEffect, useState } from "react";
import { CLIENT_ID } from "./utils/config";

type Props = {
    children: JSX.Element[];
};

export const AuthContext = createContext({});

export const Auth: FC = ({ children }: Props) => {
    const [auth, setAuth] = useState(null);
    const [localAuth, setLa] = useState(
        JSON.parse(localStorage.getItem("cliff_auth") as string)
    );

    useEffect(() => {
        if (auth) {
            localStorage.setItem("cliff_auth", JSON.stringify(auth));
            setLa(JSON.parse(localStorage.getItem("cliff_auth") as string));
        }
    }, [auth]);

    return (
        <>
            {(localAuth && (
                <GoogleOAuthProvider clientId={CLIENT_ID}>
                    <AuthContext.Provider value={{ auth: localAuth, setAuth }}>
                        {children}
                    </AuthContext.Provider>
                </GoogleOAuthProvider>
            )) ?? (
                <GoogleOAuthProvider clientId={CLIENT_ID}>
                    <AuthContext.Provider value={{ auth, setAuth }}>
                        {children}
                    </AuthContext.Provider>
                </GoogleOAuthProvider>
            )}{" "}
        </>
    );
};
