import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Game } from "@/pages/Game";
import { Home } from "@/pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:levelId" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
