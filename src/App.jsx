import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const PatternsOfPlacePage = lazy(
  () => import("./pages/PatternsOfPlacePage.jsx"),
);

function App() {
  const patternsElement = (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>Loading Patterns of Place...</div>}>
      <PatternsOfPlacePage />
    </Suspense>
  );

  return (
    <Routes>
      <Route path="/" element={patternsElement} />
      <Route path="/patterns-of-place" element={patternsElement} />
    </Routes>
  );
}

export default App;
