import { LanguageProvider } from "./contexts/LanguageContext";
import { CommandPalette } from "./components/CommandPalette";
import "./styles/components.css";

function App() {
  return (
    <LanguageProvider>
      <div className="app">
        <CommandPalette />
      </div>
    </LanguageProvider>
  );
}

export default App;
