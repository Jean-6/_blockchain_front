import logo from './logo.svg';
import './styles/App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Cards from "./components/Cards.js";
import Boutique from "./components/Boutique.js";

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Cards />} />
                    <Route path="/cards" element={<Cards />} />
                    <Route path="/boutique" element={<Boutique />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
