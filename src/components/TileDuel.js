import "../styles/TileDuel.css";

import {accountAddress, contractAddress, contractInstance, privateKey, web3} from "../config.js";
import apiService from "../services/ApiService.js";
import React, {useEffect, useState} from "react";
import Modal from "react-modal";
import Loader from "./Loader.js";

let apiData = [];

async function fetchDataFromApiAndContract(setDonnees, idCard) {
    try {
        return await apiService.fetchData(idCard);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchAllCardsFromPlayer() {
    await contractInstance.methods.getAllBalance(accountAddress).call()
        .then(async result => {
            apiData = [];
            for (let i = 0; i < result.length; i++) {
                if (result[i] !== "0") {
                    let fetchData = await apiService.fetchData(i + 1);
                    fetchData.cardIdPlayer2 = i + 1;
                    apiData.push(fetchData);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    return apiData;
}

function TileDuel({duel}) {
    console.log(duel)
    Modal.setAppElement('#root');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalIsOpenChooseCard, setModalIsOpenChooseCard] = useState(false);
    const [donnees, setDonnees] = useState({attributes: {stats: {}}});
    const [donneesPlayer2, setDonneesPlayer2] = useState({attributes: {stats: {}}});
    const [donneesChoseCardPlayer2, setDonneesChoseCardPlayer2] = useState({attributes: {rariry: ""}});
    const [loadingAddPlayer2, setLoadingAddPlayer2] = useState(false);
    const [allCardsFromPlayer, setAllCardsFromPlayer] = useState([]);
    const [points, setPoints] = useState(0);
    const [stats, setStats] = useState({
        mecanique: 0,
        vision_de_jeu: 0,
        teamplay: 0
    });
    useEffect(() => {
        fetchDataFromApiAndContract(setDonnees, duel.cardIdPlayer1).then(result => {
            setDonnees(result);
        });
        if (duel.cardIdPlayer2 !== "0") {
            fetchDataFromApiAndContract(setDonneesPlayer2, duel.cardIdPlayer2).then(result => {
                setDonneesPlayer2(result);
            });
        }
    }, []);
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
        setStats({
            mecanique: 0,
            vision_de_jeu: 0,
            teamplay: 0
        });
        setDonneesChoseCardPlayer2({attributes: {rariry: ""}})
        setModalIsOpenChooseCard(false)
        setModalIsOpen(false);
    };
    const openModal = async () => {
        setModalIsOpen(true);
    };

    const closeModalChooseCard = async () => {
        setStats({
            mecanique: 0,
            vision_de_jeu: 0,
            teamplay: 0
        });
        setModalIsOpenChooseCard(false);
    };
    const openModalChooseCard = async () => {
        await fetchAllCardsFromPlayer(setAllCardsFromPlayer).then(result => {
            setAllCardsFromPlayer(result);
        });
        setModalIsOpenChooseCard(true);
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

    const handleAddPlayer2 = async (card) => {
        setDonneesChoseCardPlayer2(card);
    }

    const handleValidatePlayer2 = async (card) => {
        try {
            setLoadingAddPlayer2(true);
            /*TODO change amount by the algo for define amount of player2*/
            let amountPlayer2 = duel.amountPlayer1;
            let idCard = card.cardIdPlayer2;
            let battleId = parseInt(duel.battleId);
            /*stats array of int*/
            let statsArray = [card.attributes.stats.mechanique + stats.mecanique,
                card.attributes.stats.vision_de_jeu + stats.vision_de_jeu,
                card.attributes.stats.teamplay + stats.teamplay];
            const functionCallData = contractInstance.methods.selectBattle(idCard, battleId, statsArray).encodeABI();
            const transactionObject = {
                to: contractAddress,
                data: functionCallData,
                value: web3.utils.toWei('0.000001', 'ether'),
                gas: web3.utils.toHex(5_000_000),
                from: accountAddress,
            };
            const signedTx = await web3.eth.accounts.signTransaction(transactionObject, privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            const events = await contractInstance.getPastEvents('BattleSelected', {
                fromBlock: receipt.blockNumber,
                toBlock: receipt.blockNumber
            });
            setLoadingAddPlayer2(false);
            if (events[0].returnValues._res) {
                closeModal();
            }
        } catch (error) {
            setLoadingAddPlayer2(false);
            console.error('Error:', error);
        }
    }
    return (
        <div className="tile-global">
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
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
                <button className="btn-modal-close" onClick={closeModal}>X</button>
                <div className="card-modal-tile-global">
                    <div className="card-modal-tile">
                        <img className="modal-img-tile" src={donnees.image} alt="card"/>
                        <div style={{color: "white", marginTop: 20}}>
                            <div style={{display: "flex", justifyContent: "space-around"}}>
                                <i className="fa-solid fa-gears"></i>
                                <i className="fa-solid fa-eye"></i>
                                <i className="fa-solid fa-handshake-simple"></i>
                            </div>
                            <div style={{display: "flex", justifyContent: "space-around"}}>
                                <p>{donnees.attributes.stats.mechanique} + ?</p>
                                <p>{donnees.attributes.stats.vision_de_jeu}+ ?</p>
                                <p>{donnees.attributes.stats.teamplay}+ ?</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-modal-tile">
                        {donneesChoseCardPlayer2.image ? (
                            <div style={{textAlign: "center"}}>
                                <img className="modal-img-tile" src={donneesChoseCardPlayer2.image} alt="card"/>
                                <i style={{fontSize: 13, color: "white", textAlign: "center"}}>Ajouter {points} points
                                    secondaire</i>
                                <br></br>
                                <div style={{color: "white", marginTop: 20}}>
                                    <div style={{display: "flex", justifyContent: "space-around"}}>
                                        <i className="fa-solid fa-gears"></i>
                                        <i className="fa-solid fa-eye"></i>
                                        <i className="fa-solid fa-handshake-simple"></i>
                                    </div>
                                    <div style={{display: "flex", justifyContent: "space-around"}}>
                                        <p>{donneesChoseCardPlayer2.attributes.stats.mechanique} + {stats.mecanique}</p>
                                        <p>{donneesChoseCardPlayer2.attributes.stats.vision_de_jeu} + {stats.vision_de_jeu}</p>
                                        <p>{donneesChoseCardPlayer2.attributes.stats.teamplay} + {stats.teamplay}</p>
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
                        ) : (
                            <div style={{textAlign: "center"}}>
                                <div className="modal-choose-card" onClick={openModalChooseCard}>
                                    <i className="fa-solid fa-circle-plus" style={{color: "white", fontSize: 40}}></i>
                                </div>
                                <div style={{color: "white", marginTop: 20}}>
                                    <div style={{display: "flex", justifyContent: "space-around"}}>
                                        <i className="fa-solid fa-gears"></i>
                                        <i className="fa-solid fa-eye"></i>
                                        <i className="fa-solid fa-handshake-simple"></i>
                                    </div>
                                    <div style={{display: "flex", justifyContent: "space-around"}}>
                                        <p>?</p>
                                        <p>?</p>
                                        <p>?</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <br></br><br></br>
                <div style={{textAlign: "center"}}>
                    {/*TODO changer la value par algo de definition du price*/}
                    <p style={{
                        color: "white",
                        textAlign: "center"
                    }}>${web3.utils.fromWei(duel.amountPlayer1)} eth</p>
                    {loadingAddPlayer2 ? (
                        <Loader/>
                    ) : (
                        <input type="button" value="Valider" className="btn-modal-valider-tile" style={{width: 200}}
                               onClick={() => {
                                   handleValidatePlayer2(donneesChoseCardPlayer2);
                               }}/>
                    )}
                </div>
            </Modal>
            <Modal
                isOpen={modalIsOpenChooseCard}
                onRequestClose={closeModalChooseCard}
                contentLabel="Exemple de Modale"
                className="modal-style-choose-card"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)'
                    },
                    content: {
                        position: 'absolute',
                        top: '11.5%',
                        left: '40%',
                        backgroundColor: 'rgba(1,6,27)',
                        boxShadow: '0 0 10px white',
                        border: 'none',
                        padding: '20px',
                        borderRadius: '20px',
                        width: '300px',
                        height: '600px',
                        overflow: 'auto',
                    }
                }}>

                {allCardsFromPlayer.length > 0 ? (
                    allCardsFromPlayer.map((card, index) => (
                        <div key={index} className="card-modal-tile" onClick={
                            async () => {
                                await handleAddPlayer2(card).then(async () => {
                                    await modifyPoints(card);
                                    await closeModalChooseCard();
                                });
                            }
                        }>
                            <img className="modal-img-tile" src={card.image} alt="card"/>
                        </div>
                    ))
                ) : (
                    <h1 style={{color: "white"}}>Vous n'avez pas de cartes</h1>
                )}
            </Modal>
            <div className="tile-local" style={{margin: 10}}>
                {duel.mine ? (
                    <div className="tile-local">
                        <img
                            className={`${duel.status !== "done" ? "tile-image" : duel.draw ? "tile-image tile-image-draw" :
                                duel.player1 === duel.winner ? "tile-image tile-image-win" : "tile-image tile-image-lose"
                            }
                            `}
                            src={donnees.image} alt="Card"/>
                        <p className="text-tile">{web3.utils.fromWei(duel.amountPlayer1) + ' eth'}</p>
                    </div>
                ) : (
                    <div className="tile-local">
                        <img className="tile-image" src={donnees.image} alt="Card"/>
                        <p>{donnees.description}</p>
                        <p>{web3.utils.fromWei(duel.amountPlayer1) + ' eth'}</p>
                    </div>
                )}

            </div>
            <hr/>
            {
                duel.cardIdPlayer2 !== "0" ? (
                    <div className="tile-local reversed-div">
                        <img
                            className={`${duel.status !== "done" ? "tile-image" : duel.draw ? "tile-image tile-image-draw" :
                                duel.player2 === duel.winner ? "tile-image tile-image-win" : "tile-image tile-image-lose"
                            }
                            `} src={donneesPlayer2.image} alt="Card"/>
                        <p className="text-tile">{web3.utils.fromWei(duel.amountPlayer2) + ' eth'}</p>
                    </div>
                ) : (
                    <div className="tile-local">
                        {
                            duel.mine ? (
                                <i className="fa-regular fa-clock"
                                   style={{color: "white", fontSize: 25}}></i>
                            ) : (
                                <i className="fa-solid fa-circle-plus"
                                   style={{color: "white", fontSize: 29}} onClick={openModal}></i>
                            )
                        }
                    </div>
                )
            }
        </div>
    );
}

export default TileDuel;