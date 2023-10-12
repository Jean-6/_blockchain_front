import "../styles/SideNav.css";
import {Link} from "react-router-dom";

function SideNav() {
    return (
        <div className="side-nav">
            <div className="ul">
                <Link className="li" to="/cards">Duel</Link>
                <Link className="li" to="/cards">Cards</Link>
                <Link className="li" to="/cards">Boutique</Link>
            </div>
        </div>
    );
}

export default SideNav;