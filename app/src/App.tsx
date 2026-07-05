import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { DemoPage } from "./pages/DemoPage";
import { HomePage } from "./pages/HomePage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo" element={<DemoPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
