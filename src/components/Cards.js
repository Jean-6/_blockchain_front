import React, {useEffect, useRef, useState} from 'react';
import apiService from "../services/ApiService.js";
import "../styles/Cards.css";
import "../styles/ContextMenu.css";
import SideNav from "./SideNav.js";
import Loader from "./Loader.js";
import Select from 'react-select';
import {contractInstance, accountAddress, contractAddress} from "../config.js";

let cardsPlayer = [];
let listJsonCards = [];
let apiData = [];
const colourOptions = [
    {value: "Commune", label: "Commune"},
    {value: "Epique", label: "Épique"},
    {value: "Legendaire", label: "Légendaire"}
];

async function fetchDataFromApiAndContract(setDonnees, setLoading) {
    listJsonCards = [];
    try {
        setLoading(true);
        const address = await apiService.getAccount().then(result => {
            if (result === undefined) return window.location.href = "/signin";
            return result;
        });
        await contractInstance.methods.getAllBalance(address).call()
            .then(result => {
                cardsPlayer = result;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        for (let i = 0; i < cardsPlayer.length; i++) {
            if (cardsPlayer[i] !== "0") {
                apiData = await apiService.fetchData(i + 1);
                apiData.count = cardsPlayer[i];
                apiData.idCard = i + 1;
                listJsonCards.push(apiData);
            }
        }
        setDonnees(listJsonCards);
        setLoading(false);
    } catch (error) {
        setLoading(false);
        console.error('Error:', error);
    }
}

function Cards() {
    const style = {
        control: base => ({
            ...base,
            skipHoverCheck: true,
            border: "1px solid white",
            '&:hover': {
                border: "1px solid white", // Désactiver la bordure bleue au focus
            },
            // This line disable the blue border
            boxShadow: "none",
            marginTop: 30,
            background: "transparent",
        })

    };
    const [donnees, setDonnees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRarity, setSelectedRarity] = useState(colourOptions);
    const initialized = useRef(false);
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        try {
            if (!initialized.current) {
                initialized.current = true;
                await fetchDataFromApiAndContract(setDonnees, setLoading);
            }

        } catch (e) {
            window.location.href = "/signin";
        }
    };
    const filteredCards = selectedRarity.length > 0
        ? donnees.filter(card => selectedRarity.some(selectedRarity => selectedRarity.value.toLowerCase() === card.attributes.rarity))
        : donnees;

    function displayContextMenu(e, idCard) {
        let contextMenu = document.querySelector(".contextmenu");
        contextMenu.style.display = "block";
        contextMenu.style.position = "absolute";
        contextMenu.style.left = e.pageX + "px";
        contextMenu.style.top = e.pageY + "px";
        let linkOpenSea = document.querySelector("#linkOpenSea");
        linkOpenSea.href = "https://testnets.opensea.io/assets/sepolia/" + contractAddress + "/" + idCard;
        document.body.addEventListener('click', disableContextMenu, true);
        const queryParams = {
            idCard: idCard,
            fight: true
        };
        const queryString = new URLSearchParams(queryParams).toString();
        let duelId = document.querySelector("#duelId");
        duelId.href = "/duel?" + queryString;
    }

    function disableContextMenu() {
        if (document.querySelector(".contextmenu") === null) return;
        let contextMenu = document.querySelector(".contextmenu");
        contextMenu.style.display = "none";
    }

    return (
        <div className="row">
            <SideNav/>
            <div className="global-cards">
                <div className="contextmenu">
                    <div className="div-a" style={{marginTop: '10px'}}>
                        <a id="duelId">Duel</a>
                    </div>
                    <div className="div-a">
                        <a id="linkOpenSea" target="_blank">OpenSea</a>
                    </div>
                </div>
                <h1 className="title-cards">Mes cartes</h1>
                <div className="rarity-filter">
                    <Select
                        styles={style}
                        className="react-container"
                        defaultValue={selectedRarity}
                        value={selectedRarity}
                        onChange={setSelectedRarity}
                        options={colourOptions}
                        classNamePrefix="select"
                        isMulti
                    />
                </div>
                <div className="cards">
                    {loading ? (
                        <Loader/>
                    ) : (
                        filteredCards.length > 0 ? (
                            filteredCards.map((card, index) => (
                                <div key={index}
                                     className={`card-image ${card.attributes.rarity === 'commune' ? 'commune' :
                                         card.attributes.rarity === 'epique' ? 'epique' : 'legendaire'}`}>
                                    <img src={card.image} alt="card"/>
                                    <div className="info-card" onClick={event => {
                                        displayContextMenu(event, card.idCard)
                                    }}>
                                        <p>{card.attributes.name}</p>
                                        <p>{card.attributes.team}</p>
                                        <div style={{marginTop: 60}}>
                                            <div style={{display: "flex", justifyContent: "space-around"}}>
                                                <i className="fa-solid fa-gears"></i>
                                                <i className="fa-solid fa-eye"></i>
                                                <i className="fa-solid fa-handshake-simple"></i>
                                            </div>
                                            <div style={{display: "flex", justifyContent: "space-around"}}>
                                                <p>{card.attributes.stats.mechanique}</p>
                                                <p>{card.attributes.stats.vision_de_jeu}</p>
                                                <p>{card.attributes.stats.teamplay}</p>
                                            </div>
                                        </div>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-around",
                                        }}>
                                            <p style={{marginTop: 50}}>{card.attributes.rarity}</p>
                                            <p style={{marginTop: 47, fontSize: 20}}>x{card.count}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <h1 style={{color: "white"}}>Vous n'avez pas de cartes</h1>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default Cards;
