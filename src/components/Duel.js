import React, {useEffect, useState} from "react";
import SideNav from "./SideNav.js";
import {useLocation} from "react-router-dom";
import apiService from "../services/ApiService.js";
import Loader from "./Loader.js";
import Modal from "react-modal";

import "../styles/Cards.css";
import "../styles/Duel.css";
import "../styles/TileDuel.css";
import {contractInstance, contractAddress, web3} from "../config.js";
import TileDuel from "./TileDuel.js";

let cardsPlayer = [];
let jsonCards;
let apiData = [];

async function fetchDataFromApiAndContract(setDonnees, setLoading, idCard, address) {
    jsonCards = null;
    try {
        setLoading(true);
        await contractInstance.methods.getAllBalance(address).call()
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

async function validateDuelPlayer1(idCard, setLoading, address) {
    try {
        setLoading(true);
        const functionCallData = contractInstance.methods.initBattle(idCard).encodeABI();
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
                battleId: result.battleId,
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
    const [modalIsOpenAVousDeJouer, setModalIsOpenAVousDeJouer] = useState(false);
    const [listDuels, setListDuels] = useState([]);
    const [listAllDuelsWaiting, setListAllDuelsWaiting] = useState([]);
    const [listDuelsWaiting, setListDuelsWaiting] = useState([]);
    const [listDuelsInProgress, setListDuelsInProgress] = useState([]);
    const [listDuelsFinished, setListDuelsFinished] = useState([]);
    const location = useLocation();
    const [donnees, setDonnees] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingAddPlayer1, setLoadingAddPlayer1] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [dataPlayer1, setDataPlayer1] = useState({attributes: {stats: {}}});
    const [dataPlayer2, setDataPlayer2] = useState({attributes: {stats: {}}});
    const [points, setPoints] = useState(0);
    const [stats, setStats] = useState({
        mecanique: 0,
        vision_de_jeu: 0,
        teamplay: 0
    });
    const [address, setAccountAddress] = useState("");

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const fight = queryParams.get("fight");
        const idCard = queryParams.get("idCard");

        async function fetchData() {
            const address = await apiService.getAccount().then(result => {
                if (result === undefined) return window.location.href = "/signin";
                return result;
            });
            setAccountAddress(address);
            if (fight === "true") {
                await fetchDataFromApiAndContract(setDonnees, setLoading, idCard, address);
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
                if (duel.player1.toLowerCase() !== address.toLowerCase() && duel.player2.toLowerCase() !== address.toLowerCase()) {
                    updatedDuel.mine = false;
                }
                return updatedDuel;
            });
            updatedDuels.forEach(duel => {
                if (duel.player1.toLowerCase() === address.toLowerCase() || duel.player2.toLowerCase() === address.toLowerCase()) {
                    if (duel.player1.toLowerCase() === address.toLowerCase()) {
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
    const modifyPoints = async (card) => {
        if (card.attributes.rarity === "commune") {
            setPoints(10);
        } else if (card.attributes.rarity === "epique") {
            setPoints(15);
        } else if (card.attributes.rarity === "legendaire") {
            setPoints(20);
        }
    }
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
        window.history.replaceState({}, document.title, "/duel");
    };
    const closeModalAVousDeJouer = async () => {
        setStats({
            mecanique: 0,
            vision_de_jeu: 0,
            teamplay: 0
        });
        setModalIsOpenAVousDeJouer(false);
    };
    const openModalAVousDeJouer = async (duel) => {
        setDataPlayer1({attributes: {stats: {}}});
        setDataPlayer2({attributes: {stats: {}}});
        const idCardPlayer1 = duel.cardIdPlayer1;
        const idCardPlayer2 = duel.cardIdPlayer2;
        const statsPlayer2 = duel.statsPlayer2;
        const idBattle = duel.battleId;

        try {
            const [apiDataPlayer1, apiDataPlayer2] = await Promise.all([
                apiService.fetchData(idCardPlayer1),
                apiService.fetchData(idCardPlayer2)
            ]);
            apiDataPlayer2.statsPlayer2 = statsPlayer2;
            apiDataPlayer1.idCard = idCardPlayer1;
            apiDataPlayer1.idBattle = idBattle;
            apiDataPlayer2.idCard = idCardPlayer2;
            apiDataPlayer2.idBattle = idBattle;
            apiDataPlayer1.amountPlayer1 = duel.amountPlayer1;
            apiDataPlayer2.amountPlayer2 = duel.amountPlayer2;
            setDataPlayer1(apiDataPlayer1);
            setDataPlayer2(apiDataPlayer2);
            await modifyPoints(apiDataPlayer1);
            setModalIsOpenAVousDeJouer(true);
        } catch (error) {
            console.error("Erreur lors de la récupération des données de l'API :", error);
        }
    };
    const handleStatIncrease = (stat) => {
        if (points > 0) {
            setStats({
                ...stats,
                [stat]: stats[stat] + 1
            });
            setPoints(points - 1);
        }
    };
    const handleValidatePlayer1 = async () => {
        setLoadingAddPlayer1(true);
        const idBattle = dataPlayer1.idBattle;
        let statsArray = [dataPlayer1.attributes.stats.mechanique + stats.mecanique,
            dataPlayer1.attributes.stats.vision_de_jeu + stats.vision_de_jeu,
            dataPlayer1.attributes.stats.teamplay + stats.teamplay];
        try {

            // Check if MetaMask is available
            if (!window.ethereum) {
                throw new Error('MetaMask not detected. Please install MetaMask extension.');
            }


            const functionCallData = contractInstance.methods.confirmBattle(idBattle, statsArray).encodeABI();

            const transactionObject = {
                to: contractAddress,
                data: functionCallData,
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
            setLoadingAddPlayer1(false);
            await closeModalAVousDeJouer();
        } catch (error) {
            console.error('Error:', error);
        }
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
                                   onClick={() => validateDuelPlayer1(donnees.idCard, setLoading, address).then(() =>
                                       closeModal()
                                   )}/>
                        )}
                    </div>
                </Modal>
            ) : (
                <div className="div-title">
                    <Modal
                        isOpen={modalIsOpenAVousDeJouer}
                        onRequestClose={closeModalAVousDeJouer}
                        contentLabel="Exemple de Modale"
                        style={{
                            overlay: {
                                backgroundColor: 'rgba(0, 0, 0, 0.7)'
                            },
                            content: {
                                backgroundColor: 'rgba(1,6,27)',
                                boxShadow: '0 0 10px white',
                                border: 'none',
                                padding: '20px',
                                borderRadius: '20px',
                                width: '600px',
                                height: '600px',
                                margin: 'auto',
                                overflow: 'hidden'
                            }
                        }}
                    >
                        <button className="btn-modal-close" onClick={closeModalAVousDeJouer}>X</button>
                        <div className="card-modal-tile-global">
                            <div className="card-modal-tile">
                                <img className="modal-img-tile" src={dataPlayer1.image} alt="card"/>
                                <i style={{fontSize: 13, color: "white", textAlign: "center"}}>Ajouter {points} points
                                    secondaire</i>
                                <div style={{color: "white", marginTop: 20}}>
                                    <div style={{display: "flex", justifyContent: "space-around"}}>
                                        <i className="fa-solid fa-gears"></i>
                                        <i className="fa-solid fa-eye"></i>
                                        <i className="fa-solid fa-handshake-simple"></i>
                                    </div>
                                    <div style={{display: "flex", justifyContent: "space-around"}}>
                                        <p>{dataPlayer1.attributes.stats.mechanique} + {stats.mecanique}</p>
                                        <p>{dataPlayer1.attributes.stats.vision_de_jeu} + {stats.vision_de_jeu}</p>
                                        <p>{dataPlayer1.attributes.stats.teamplay} + {stats.teamplay}</p>
                                    </div>
                                    <div style={{display: "flex", justifyContent: "space-around"}}>
                                        <i className="fa-solid fa-circle-plus" style={{color: "white", fontSize: 20}}
                                           onClick={() => handleStatIncrease('mecanique')}></i>
                                        <i className="fa-solid fa-circle-plus" style={{color: "white", fontSize: 20}}
                                           onClick={() => handleStatIncrease('vision_de_jeu')}></i>
                                        <i className="fa-solid fa-circle-plus" style={{color: "white", fontSize: 20}}
                                           onClick={() => handleStatIncrease('teamplay')}></i>
                                    </div>
                                </div>
                            </div>
                            <div className="card-modal-tile">
                                <img className="modal-img-tile" src={dataPlayer2.image} alt="card"/>
                                <div style={{color: "white", marginTop: 20}}>
                                    <div style={{display: "flex", justifyContent: "space-around"}}>
                                        <i className="fa-solid fa-gears"></i>
                                        <i className="fa-solid fa-eye"></i>
                                        <i className="fa-solid fa-handshake-simple"></i>
                                    </div>
                                    <div style={{display: "flex", justifyContent: "space-around"}}>
                                        <p>{dataPlayer2.attributes.stats.mechanique} + ?</p>
                                        <p>{dataPlayer2.attributes.stats.teamplay} + ?</p>
                                        <p>{dataPlayer2.attributes.stats.vision_de_jeu} + ?</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <br></br><br></br>
                        <div style={{textAlign: "center"}}>
                            {dataPlayer1 && dataPlayer1.amountPlayer1 && (
                                <p style={{
                                    color: "white",
                                    textAlign: "center"
                                }}>
                                    {web3.utils.fromWei(dataPlayer1.amountPlayer1, 'ether')} eth
                                </p>
                            )}
                            {loadingAddPlayer1 ? (
                                <Loader/>
                            ) : (
                                <input type="button" value="Valider" className="btn-modal-valider-tile"
                                       style={{width: 200}}
                                       onClick={() => {
                                           handleValidatePlayer1();
                                       }}/>
                            )}
                        </div>
                    </Modal>
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
                                    <div key={index} onClick={() => openModalAVousDeJouer(duel)}>
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