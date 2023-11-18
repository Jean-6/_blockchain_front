import './styles/App.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Cards from "./components/Cards.js";
import Boutique from "./components/Boutique.js";
import Duel from "./components/Duel.js";
import {createConfig, configureChains, WagmiConfig} from "wagmi";
import {publicProvider} from "wagmi/providers/public";
import {mainnet} from "wagmi/chains";
import SignIn from "./components/Signin.js";
import User from "./components/User.js";
import React from "react";

const {publicClient, webSocketPublicClient} = configureChains(
    [mainnet],
    [publicProvider()]
);

const config = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
});

const router = createBrowserRouter([
    {
        path: "/",
        element: <SignIn/>,
    },
    {
        path: "/signin",
        element: <SignIn/>,
    },
    {
        path: "/duel",
        element: <Duel/>,
    },
    {
        path: "/cards",
        element: <Cards/>,
    },
    {
        path: "/boutique",
        element: <Boutique/>,
    },
    {
        path: "/user",
        element: <User/>,
    },
]);


function App() {
    return (
        <WagmiConfig config={config}>
            <RouterProvider router={router}/>
        </WagmiConfig>
    );
}

export default App;
