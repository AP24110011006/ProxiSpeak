import OfficeCanvas from "./components/OfficeCanvas";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>ProxiSpeak</h1>
        <span>Virtual Office</span>
      </header>

      <main className="workspace">
        <OfficeCanvas />
        <Sidebar />
      </main>

      <footer className="footer">
        Move your avatar using the arrow keys or WASD.
      </footer>
    </div>
  );
}

export default App;