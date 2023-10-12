import logo from './logo.svg';
import './styles/App.css';
import SideNav from "./components/SideNav";
import Cards from "./components/Cards";

function App() {
    return (
        <div className="App">
            <SideNav/>
            <Cards/>
        </div>
    );
}

export default App;
