import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Game } from "@/pages/Game";
import { Home } from "@/pages/Home";
import { Infinity } from "@/pages/Infinity";

function getRouterBasename() {
  const base = import.meta.env.BASE_URL;
  if (base === "/") return undefined;
  return base.replace(/\/$/, "");
}

function App() {
  return (
    <BrowserRouter basename={getRouterBasename()}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:levelId" element={<Game />} />
        <Route path="/infinity" element={<Infinity />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
