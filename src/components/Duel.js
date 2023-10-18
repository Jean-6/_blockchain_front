import React, {useEffect, useState} from "react";
import SideNav from "./SideNav.js";
import {useLocation} from "react-router-dom";
import apiService from "../services/ApiService.js";
import Loader from "./Loader.js";
import Modal from "react-modal";

import "../styles/Cards.css";
import "../styles/Duel.css";
import {contractInstance, accountAddress, contractAddress, web3, privateKey} from "../config.js";
import TileDuel from "./TileDuel.js";

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

async function getAllBattle(setListAllDuelsWaiting, setListDuelsWaiting, setListDuelsInProgress, setListDuelsFinished, setListDuels, listDuels) {
    try {
        const results = await contractInstance.methods.getAllBattle().call();
        setListDuels([]);
        setListAllDuelsWaiting([]);
        setListDuelsWaiting([]);
        setListDuelsInProgress([]);
        setListDuelsFinished([]);
        results.forEach(result => {
            const duelData = {
                amountPlayer1: result.amountPlayer1,
                amountPlayer2: result.amountPlayer2,
                cardIdPlayer1: result.cardIdPlayer1,
                cardIdPlayer2: result.cardIdPlayer2,
                draw: result.draw,
                loser: result.loser,
                player1: result.player1,
                player2: result.player2,
                statsPlayer1: result.statsPlayer1,
                statsPlayer2: result.statsPlayer2,
                status: result.status,
                winner: result.winner,
                mine: true
            };
            setListDuels(listDuels => [...listDuels, duelData]);
        })
    } catch (error) {
        console.error('Error:', error);
    }
}


function Duel() {
    Modal.setAppElement('#root');
    const [modalIsOpen, setModalIsOpen] = useState(true);
    const [listDuels, setListDuels] = useState([]);
    const [listAllDuelsWaiting, setListAllDuelsWaiting] = useState([]);
    const [listDuelsWaiting, setListDuelsWaiting] = useState([]);
    const [listDuelsInProgress, setListDuelsInProgress] = useState([]);
    const [listDuelsFinished, setListDuelsFinished] = useState([]);
    const location = useLocation();
    const [donnees, setDonnees] = useState({});
    const [loading, setLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const fight = queryParams.get("fight");
        const idCard = queryParams.get("idCard");

        async function fetchData() {
            if (fight === "true") {
                fetchDataFromApiAndContract(setDonnees, setLoading, idCard);
            } else {
                setDonnees(null);
                await getAllBattle(
                    setListAllDuelsWaiting,
                    setListDuelsWaiting,
                    setListDuelsInProgress,
                    setListDuelsFinished,
                    setListDuels,
                    listDuels
                );
                setDataLoaded(true);
                setLoading(false);
            }
        }

        fetchData();
    }, [location.search]);

    useEffect(() => {
        if (dataLoaded) {
            const updatedDuels = listDuels.map(duel => {
                let updatedDuel = {...duel}; // Créez un nouvel objet en copiant les propriétés de duel
                if (duel.player1 !== accountAddress && duel.player2 !== accountAddress) {
                    updatedDuel.mine = false;
                }
                return updatedDuel;
            });
            updatedDuels.forEach(duel => {
                if (duel.player1 === accountAddress || duel.player2 === accountAddress) {
                    if (duel.player1 === accountAddress) {
                        if (duel.status === "waitP2") {
                            setListDuelsWaiting(listDuelsWaiting => [...listDuelsWaiting, duel]);
                        } else if (duel.status === "waitP1") {
                            setListDuelsInProgress(listDuelsInProgress => [...listDuelsInProgress, duel]);
                        } else {
                            setListDuelsFinished(listDuelsFinished => [...listDuelsFinished, duel]);
                        }
                    } else {
                        if (duel.status === "waitP1") {
                            setListDuelsWaiting(listDuelsWaiting => [...listDuelsWaiting, duel]);
                        } else if (duel.status === "waitP2") {
                            setListDuelsInProgress(listDuelsInProgress => [...listDuelsInProgress, duel]);
                        } else {
                            setListDuelsFinished(listDuelsFinished => [...listDuelsFinished, duel]);
                        }
                    }
                } else {
                    if (duel.status === "waitP2") {
                        setListAllDuelsWaiting(listAllDuelsWaiting => [...listAllDuelsWaiting, duel]);
                    }
                }
            });
        }
    }, [dataLoaded]);
    const closeModal = async () => {
        setDonnees(null);
        await getAllBattle(
            setListAllDuelsWaiting,
            setListDuelsWaiting,
            setListDuelsInProgress,
            setListDuelsFinished,
            setListDuels,
            listDuels
        );
        setDataLoaded(true); // Indiquer que les données sont chargées
        setLoading(false);
        setModalIsOpen(false);
        setDonnees(null);
        window.history.replaceState({}, document.title, "/" + "duel");
    };
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
                            {listDuelsWaiting.length === 0 ? (
                                <p style={{fontSize: 12, fontStyle: "italic", color: "grey"}}>rien pour le moment</p>
                            ) : (
                                listDuelsWaiting.map((duel, index) => (
                                    <div key={index}>
                                        <TileDuel duel={duel}/>
                                        <br/>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="border-div">
                            <h3>A vous de jouer !</h3>
                            {listDuelsInProgress.length === 0 ? (
                                <p style={{fontSize: 12, fontStyle: "italic", color: "grey"}}>rien pour le moment</p>
                            ) : (
                                listDuelsInProgress.map((duel, index) => (
                                    <div key={index}>
                                        <TileDuel duel={duel}/>
                                        <br/>
                                    </div>
                                ))
                            )}

                        </div>
                        <div className="border-div">
                            <h3>Historique</h3>
                            {listDuelsFinished.length === 0 ? (
                                <p style={{fontSize: 12, fontStyle: "italic", color: "grey"}}>rien pour le moment</p>
                            ) : (
                                listDuelsFinished.map((duel, index) => (
                                    <div key={index}>
                                        <TileDuel duel={duel}/>
                                        <br/>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="allDuel-global">
                        <br></br>
                        {listAllDuelsWaiting.length === 0 ? (
                            <p style={{fontSize: 12, fontStyle: "italic", color: "grey"}}>rien pour le moment</p>
                        ) : (
                            listAllDuelsWaiting.map((duel, index) => (
                                <div key={index}>
                                    <TileDuel duel={duel}/>
                                    <br/>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Duel;