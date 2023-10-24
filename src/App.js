
import './App.css';
import MetaMask from "./MetaMask";
import {DynamicContextProvider, DynamicWidget, SortWallets,defaultNumberOfWalletsToShow} from "@dynamic-labs/sdk-react";

const App = () =>{
    return (
        <MetaMask/>
        //<p>Hello World </p>
    );
}

/*const App = () => (
    <DynamicContextProvider
        settings={{
            environmentId: '66db0f15-5b01-4d09-b394-a89a3d11490d',
            walletsFilter: SortWallets(['coinbase', 'metamask', 'walletconnect', 'zengo']),
            defaultNumberOfWalletsToShow: 4,
        }}
    >
        <DynamicWidget />
    </DynamicContextProvider>
);*/


export default App;
