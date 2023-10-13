import React, {useState} from 'react';
import {ethers} from 'ethers';


const metaMask = () =>{

    const [errorMessage, setErrorMessage] = new useState(null);
    const [defaultAccount, setDefaultAccount] = new useState(null);
    const [userBalnce, setUserBalance] = new useState(null);

    const connectWallet = () =>{
        if(window.ethereum){
            window.ethereum.request({method: 'eth_requestAccounts'})
                .then(result =>{
                    accountChanged([result[0]])
                })
        }else{
            setErrorMessage('Install metamask extension please');
        }
    }
    const accountChanged = (accountName) => {
        setDefaultAccount(accountName);
    }
    return (
        <div>
            <p>Metamask wallet connexion </p>
            <button onClick={connectWallet}>Connect wallet button</button>
            <h3>Address : {defaultAccount}</h3>
            <h3>Balance : </h3>
            {errorMessage}
        </div>
    )

}
export default metaMask;