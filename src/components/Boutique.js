import React, {useState} from "react";
import "../styles/Boutique.css";
import SideNav from "./SideNav.js";
import RevealCards from "./RevealCards.js";
import Loader from "./Loader.js";

import {contractInstance, accountAddress, contractAddress, web3} from "../config.js";

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
            const functionCallData = contractInstance.methods.openPack().encodeABI();
            const transactionObject = {
                to: contractAddress,
                data: functionCallData,
                value: web3.utils.toWei('0.000001', 'ether'),
                gas: web3.utils.toHex(5000000),
                gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
                from: accountAddress,
            };
            const signedTx = await web3.eth.accounts.signTransaction(transactionObject, '947727c5c4f19411fbaae0bbe96ea0811d3d2729175cfa9a8287e92ad9686c06');
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            const events = await contractInstance.getPastEvents('TransferSingle', {
                fromBlock: receipt.blockNumber,
                toBlock: receipt.blockNumber
            });
            idCard = events[0].returnValues.id;
            setLoading(false);
            setdisplayShop(!displayShop);
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
