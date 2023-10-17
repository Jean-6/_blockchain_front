import React, {useEffect, useState} from "react";
import SideNav from "./SideNav.js";
import {useLocation} from "react-router-dom";
import {accountAddress, contractInstance} from "../config.js";
import apiService from "../services/ApiService.js";
import Loader from "./Loader.js";
import Modal from "react-modal";
import "../styles/Cards.css";
import "../styles/Duel.css";

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

function Duel() {
    const [modalIsOpen, setModalIsOpen] = useState(true);
    const closeModal = () => {
        setModalIsOpen(false);
        setDonnees(null);
        window.history.replaceState({}, document.title, "/" + "duel");
    };
    const openModal = () => {
        setModalIsOpen(true);
    };
    const location = useLocation();
    const [donnees, setDonnees] = useState({});
    const [loading, setLoading] = useState(true);
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
                loading ? (
                    <Loader/>
                ) : (
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
                            <input type="button" value="Valider" className="btn-modal-valider" onClick={closeModal}/>
                        </div>
                    </Modal>
                )
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