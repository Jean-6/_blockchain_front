import "../styles/Cards.css";

function Cards() {
    return (
        <div>
            <h1 className="title-cards">Mes Cartes</h1>
            <div className="cards">
                <div className="card">
                    <div className="card-image">
                        <img src="https://via.placeholder.com/150" alt="card"/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cards;