import React, {useState} from "react";
import "../styles/Boutique.css";
import SideNav from "./SideNav.js";
import RevealCards from "./RevealCards.js";
import Loader from "./Loader.js";

import {contractInstance, contractAddress, web3} from "../config.js";

let idCard;

function RenderBoutique({handleBuyClick, loading}) {

    return (
        <div className="global-cards">
            <h1 className="title-boutique">Boutique</h1>
            <div className="shop-all">
                <div className="shop">
                    <img src="cartes.png" alt="cartes" className="image-cartes"/>
                    {loading ? (
                        <Loader/>
                    ) : (
                        <input type="button" value="Acheter" onClick={handleBuyClick}/>
                    )}
                </div>
            </div>
        </div>
    );
}

function Boutique() {
    const [displayShop, setdisplayShop] = useState(true);
    const [loading, setLoading] = useState(false);
    const handleBuyClick = async () => {
        try {
            setLoading(true);

            // Check if MetaMask is available
            if (!window.ethereum) {
                throw new Error('MetaMask not detected. Please install MetaMask extension.');
            }

            // Request account access
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});

            // Get the selected account
            const address = accounts[0];

            const functionCallData = contractInstance.methods.openPack().encodeABI();
            const transactionObject = {
                to: contractAddress,
                data: functionCallData,
                value: web3.utils.toHex(web3.utils.toWei('0.000001', 'ether')),
                gas: web3.utils.toHex(1_000_000),
                gasPrice: web3.utils.toHex(web3.utils.toWei('300', 'gwei')),
                from: address,
                gasLimit: '0x5028',

            };

            const result = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionObject],
            });

            let receipt;
            while (!receipt) {
                receipt = await web3.eth.getTransactionReceipt(result.toString(), (err, _) => {
                    if (err) {
                        console.error('Error:', err);
                    }
                });
                if (!receipt) {
                    // Wait for a short duration before checking again
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            // Continue with your logic
            const events = await contractInstance.getPastEvents('TransferSingle', {
                fromBlock: receipt.blockNumber,
                toBlock: receipt.blockNumber,
            });

            // Check if events array is not empty
            if (events.length > 0) {
                idCard = events[0].returnValues.id;
                setLoading(false);
                setdisplayShop(!displayShop);
            } else {
                // Handle the case where no events are found
                console.error('No events found for TransferSingle');
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error('Error:', error);
        }
    };


    return (
        <div className="row">
            <SideNav/>
            {displayShop ? <RenderBoutique handleBuyClick={handleBuyClick} loading={loading}/> :
                <RevealCards idCard={idCard}/>}
        </div>
    );
}

export default Boutique;
