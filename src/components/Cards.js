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
                    {/*               <ul>
                    {donnees.map((user) => (
                        <li key={user.description}>
                            {user.name}
                        </li>
                    ))}
                </ul>*/}
                    <div className="commune card-image">
                        <img src="http://51.38.190.134:1155/images/1.png" alt="card"/>
                        <div className="info-card">
                            <p>Zen</p>
                            <p>Zen</p>
                            <p>Zen</p>
                        </div>
                    </div>
                    <div className="epique">
                        <img src="http://51.38.190.134:1155/images/2.png" alt="card"/>
                    </div>
                    <div className="legendary">
                        <img src="http://51.38.190.134:1155/images/3.png" alt="card"/>
                    </div>
                    <div className="commune">
                        <img src="http://51.38.190.134:1155/images/4.png" alt="card"/>
                    </div>
                    <div className="epique">
                        <img src="http://51.38.190.134:1155/images/5.png" alt="card"/>
                    </div>
                    <div className="legendary">
                        <img src="http://51.38.190.134:1155/images/6.png" alt="card"/>
                    </div>
                    <div className="commune">
                        <img src="http://51.38.190.134:1155/images/7.png" alt="card"/>
                    </div>
                    <div className="epique">
                        <img src="http://51.38.190.134:1155/images/8.png" alt="card"/>
                    </div>
                    <div className="legendary">
                        <img src="http://51.38.190.134:1155/images/9.png" alt="card"/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cards;