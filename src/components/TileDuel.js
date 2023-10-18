import "../styles/TileDuel.css";
import {web3} from "../config.js";

let urlImage = "http://51.38.190.134:1155/images/";


function TileDuel({duel}) {
    return (
        <div className="tile-global">
            <div className="tile-local">
                <img className="tile-image" src={urlImage + duel.cardIdPlayer1 + ".png"} alt="Card"/>
                <p className="text-tile">{web3.utils.fromWei(duel.amountPlayer1) + ' eth'}</p>
            </div>
            <hr/>
            {
                duel.cardIdPlayer2 !== "0" ? (
                    <div className="tile-local reversed-div">
                        <img className="tile-image" src={urlImage + duel.cardIdPlayer1 + ".png"} alt="Card"/>
                        <p className="text-tile">{web3.utils.fromWei(duel.amountPlayer1) + ' ethh'}</p>
                    </div>
                ) : (
                    <div className="tile-local">
                        {
                            duel.mine ? (
                                <i className="fa-regular fa-clock"
                                   style={{color: "white", fontSize: 25, marginTop: 12}}></i>
                            ) : (
                                <i className="fa-solid fa-circle-plus"
                                   style={{color: "white", fontSize: 29, marginTop: 12}}></i>
                            )
                        }


                    </div>
                )
            }
        </div>
    );
}

export default TileDuel;