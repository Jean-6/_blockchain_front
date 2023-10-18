import React, {useEffect, useState} from "react";
import SideNav from "./SideNav.js";
import {useLocation} from "react-router-dom";
import apiService from "../services/ApiService.js";
import Loader from "./Loader.js";
import Modal from "react-modal";

import "../styles/Cards.css";
import "../styles/Duel.css";
import {contractInstance, accountAddress, contractAddress, web3, privateKey} from "../config.js";

let cardsPlayer = [];
let jsonCards;
let apiData = [];

async function fetchDataFromApiAndContract(setDonnees, setLoading, idCard) {
    jsonCards = null;
    try {
        setLoading(true);
        await contractInstance.methods.getAllBalance(accountAddress).call()
            .then(result => {
                cardsPlayer = result;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        for (let i = 0; i < cardsPlayer.length; i++) {
            if (cardsPlayer[i] !== "0" && idCard === (i + 1).toString()) {
                apiData = await apiService.fetchData(idCard);
                apiData.count = cardsPlayer[i];
                apiData.idCard = i + 1;
                jsonCards = apiData;
            }
        }
        setDonnees(jsonCards);
        setLoading(false);
    } catch (error) {
        setLoading(false);
        console.error('Error:', error);
    }
}

async function validateDuelPlayer1(idCard, setLoading) {
    try {
        setLoading(true);
        const functionCallData = contractInstance.methods.initBattle(idCard).encodeABI();
        const transactionObject = {
            to: contractAddress,
            data: functionCallData,
            value: web3.utils.toWei('0.000001', 'ether'),
            gas: web3.utils.toHex(700000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
            from: accountAddress,
        };
        const signedTx = await web3.eth.accounts.signTransaction(transactionObject, privateKey);
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        setLoading(false);
    } catch (error) {
        console.error('Error:', error);
        setLoading(false);
    }
}


function Duel() {
    Modal.setAppElement('#root');
    const [modalIsOpen, setModalIsOpen] = useState(true);
    const closeModal = () => {
        setModalIsOpen(false);
        setDonnees(null);
        window.history.replaceState({}, document.title, "/" + "duel");
    };

    const location = useLocation();
    const [donnees, setDonnees] = useState({});
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const fight = queryParams.get("fight");
        const idCard = queryParams.get("idCard");
        if (fight === "true") {
            fetchDataFromApiAndContract(setDonnees, setLoading, idCard);
        } else {
            setDonnees(null);
            setLoading(false)
        }
    }, [location.search]);

    return (
        <div className="row">
            <SideNav/>
            {donnees ? (
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Exemple de Modale"
                    style={{
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)'
                        },
                        content: {
                            backgroundColor: 'rgba(1,6,27,0.63)',
                            boxShadow: '0 0 10px white',
                            border: 'none',
                            padding: '20px',
                            borderRadius: '20px',
                            width: '300px',
                            height: '500px',
                            margin: 'auto',
                            overflow: 'hidden'
                        }
                    }}
                >
                    <button className="btn-modal-close" onClick={closeModal}>X</button>
                    <div className="card-modal">
                        <img src={donnees.image} alt="card"/>
                        <br></br>
                        <input type="number" placeholder="Montant..."
                               style={{background: "transparent", border: "1px solid white"}}/>

                        {loading ? (
                            <Loader/>
                        ) : (
                            <input type="button" value="Valider" className="btn-modal-valider"
                                   onClick={() => validateDuelPlayer1(donnees.idCard, setLoading)}/>
                        )}
                    </div>
                </Modal>
            ) : (
                <div className="div-title">
                    <h1 className="title-boutique">Duel</h1>
                    <br></br>
                    <div className="state-div">
                        <div className="border-div">
                            <h3>En attente</h3>
                        </div>
                        <div className="border-div">
                            <h3>En cours</h3>
                        </div>
                        <div className="border-div">
                            <h3>Terminée</h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Duel;