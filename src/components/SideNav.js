import "../styles/SideNav.css";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";

function SideNav() {

    return (
        <div className="side-nav">
            <div className="ul">
                <Link className="li" to="/duel">Duel</Link>
                <Link className="li" to="/cards">Mes cartes</Link>
                <Link className="li" to="/boutique">Boutique</Link>
                <Link className="li" onClick={signOut} to={"/signin"}>Deconnexion</Link>
            </div>
        </div>
    );
}

async function signOut() {
    await axios(`${process.env.REACT_APP_SERVER_URL}/logout`, {
        withCredentials: true,
    });
}

export default SideNav;