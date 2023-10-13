import "../styles/SideNav.css";
import "../styles/RevealCards.css";
import "../styles/Boutique.css";
import React, { useState } from 'react';

function RevealCards() {
    const [revealed, setRevealed] = useState(false); // État pour suivre si la carte est révélée ou non
    const [clickable, setClickable] = useState(true); // État pour rendre l'image cliquable ou non

    let rarity = "epique"; // La rareté initiale de la carte

    // Fonction pour basculer l'état de révélation lors du clic sur l'image
    const handleCardClick = () => {
        if (clickable) {
            setRevealed(!revealed);
            setClickable(false); // Désactive le clic après le premier clic
        }
    };

    return (
        <div className="global-cards">
            <h1 className="title-boutique">Boutique</h1>
            <div className="shop-all">
                <div className={`reveal-div ${revealed ? 'revealed' : ''}`} onClick={handleCardClick}>
                    <img
                        src={revealed ? 'commune-1.png' : 'crad-verso.png'}
                        alt="cartes"
                        className={`image-cartes-verso ${rarity === 'commune' ? 'commune-verso' :
                            rarity === 'epique' ? 'epique-verso' : 'legendaire-verso'}`}
                        style={{ pointerEvents: clickable ? 'auto' : 'none' }} // Désactive le clic si !clickable
                    />
                </div>
            </div>
        </div>
    );
}

export default RevealCards;
