import "./App.css";
import reactLogo from "./assets/react.svg";
import Map from "./components/Map";
import viteLogo from "/vite.svg";

function App() {


    return (
        <>
            <div>
                <a href='https://vite.dev' target='_blank'>
                    <img src={viteLogo} className='logo' alt='Vite logo' />
                </a>
                <a href='https://react.dev' target='_blank'>
                    <img
                        src={reactLogo}
                        className='logo react'
                        alt='React logo'
                    />
                </a>
            </div>
            <Map />
        </>
    );
}

export default App;
