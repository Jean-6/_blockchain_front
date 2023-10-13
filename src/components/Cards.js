import React, {useEffect, useState} from 'react';
import apiService from "../services/ApiService.js";
import "../styles/Cards.css";
import SideNav from "./SideNav.js";

function Cards() {
    const [donnees, setDonnees] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchDataFromApi = async () => {
            try {
                const data = await apiService.fetchData();
                setDonnees(data);
            } catch (error) {
                setError(error);
                console.log("error", error)
            }
        };

        fetchDataFromApi().then(r => console.log(r));
    }, []);

    return (
        <div className="row">
            <SideNav/>
            <div className="global-cards">
                <h1 className="title-cards">Mes cartes</h1>
                <div className="cards">

                    {donnees.map((card) => (
                        <div className={`card-image ${card.attributes.rarity === 'commune' ? 'commune' :
                            card.attributes.rarity === 'epique' ? 'epique' : 'legendaire'}`}>
                            <img src={"http://" + card.image} alt="card"/>
                            <div className="info-card">
                                <p>{card.attributes.name}</p>
                                <p>{card.attributes.team}</p>
                                <div style={{marginTop: 60}}>
                                    <div style={{display: "flex", justifyContent: "space-around"}}>
                                        <i className="fa-solid fa-gears"></i>
                                        <i className="fa-solid fa-eye"></i>
                                        <i className="fa-solid fa-handshake-simple"></i></div>
                                    <div style={{display: "flex", justifyContent: "space-around"}}>
                                        <p>{card.attributes.stats.mechanique}</p>
                                        <p>{card.attributes.stats.vision_de_jeu}</p>
                                        <p>{card.attributes.stats.teamplay}</p>
                                    </div>
                                </div>
                                <p  style={{marginTop: 50}}>{card.attributes.rarity}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Cards;