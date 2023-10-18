import "../styles/SideNav.css";
import {Link} from "react-router-dom";

function SideNav() {
    return (
        <div className="side-nav">
            <div className="ul">
                <Link className="li" to="/duel">Duel</Link>
                <Link className="li" to="/cards">Mes cartes</Link>
                <Link className="li" to="/boutique">Boutique</Link>
            </div>
        </div>
    );
}

export default SideNav;