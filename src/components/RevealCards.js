import "../styles/SideNav.css";
import "../styles/RevealCards.css";
import "../styles/Boutique.css";
import React, {useEffect, useState} from 'react';
import apiService from "../services/ApiService.js";

function RevealCards({idCard}) {
    const [revealed, setRevealed] = useState(false);
    const [clickable, setClickable] = useState(true);

    const [donnees, setDonnees] = useState({attributes: '', image: ''});
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchDataFromApi = async () => {
            try {
                const data = await apiService.fetchData(idCard);
                setDonnees(data);
            } catch (error) {
                setError(error);
                console.log("error", error)
            }
        };

        fetchDataFromApi();
    }, []);

    const handleCardClick = () => {
        if (clickable) {
            setRevealed(!revealed);
            setClickable(false);
        }
    };

    return (
        <div className="global-cards">
            <h1 className="title-boutique">Boutique</h1>
            <div className="shop-all">
                <div key={1} className={`reveal-div ${revealed ? 'revealed' : ''}`} onClick={handleCardClick}>
                    <img
                        src={revealed ? donnees.image : 'crad-verso.png'}
                        alt="cartes"
                        className={`image-cartes-verso ${donnees.attributes.rarity === 'commune' ? 'commune-verso' :
                            donnees.attributes.rarity === 'epique' ? 'epique-verso' : 'legendaire-verso'}`}
                        style={{pointerEvents: clickable ? 'auto' : 'none'}} // Désactive le clic si !clickable
                    />
                </div>

            </div>
        </div>
    );
}

export default RevealCards;
