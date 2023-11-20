import React from 'react';
import {MetaMaskButton} from "@metamask/sdk-react-ui";
import Cards from "./Cards.js";


function SignIn() {
    return (
        <div>
            <MetaMaskButton theme={"light"} color="white"
                            connectComponent={Cards()}></MetaMaskButton>
        </div>
    );
}

export default SignIn;