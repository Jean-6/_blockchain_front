import {useNavigate} from "react-router-dom";

import {useAccount, useConnect, useSignMessage, useDisconnect} from "wagmi";
import {InjectedConnector} from "wagmi/connectors/injected";
import axios from "axios";

export default function SignIn() {
    const navigate = useNavigate();

    const {connectAsync} = useConnect();
    const {disconnectAsync} = useDisconnect();
    const {isConnected} = useAccount();
    const {signMessageAsync} = useSignMessage();

    const handleAuth = async () => {
        //disconnects the web3 provider if it's already active
        if (isConnected) {
            await disconnectAsync();
        }
        // enabling the web3 provider metamask
        const {account} = await connectAsync({
            connector: new InjectedConnector(),
        });

        const userData = {address: account, chain: 1};
        // making a post request to our 'request-message' endpoint
        const {data} = await axios.post(
            `${process.env.REACT_APP_SERVER_URL}/request-message`,
            userData,
            {
                headers: {
                    "content-type": "application/json",
                },
            }
        );
        const message = data.message;
        // signing the received message via metamask
        const signature = await signMessageAsync({message});

        await axios.post(
            `${process.env.REACT_APP_SERVER_URL}/verify`,
            {
                message,
                signature,
            },
            {withCredentials: true} // set cookie from Express server
        );

        // redirect to /user
        navigate("/cards");
    };

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <button
                style={{
                    backgroundColor: '#4CAF50', /* Green */
                    border: 'none',
                    color: 'white',
                    padding: '15px 32px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'inline-block',
                    fontSize: '16px',
                    margin: '4px 2px',
                    cursor: 'pointer'
                }}
                onClick={() => handleAuth()}
            >
                Authenticate via MetaMask
            </button>
        </div>
    );
}