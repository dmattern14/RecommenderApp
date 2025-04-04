import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecommendationPage from './components/RecommendationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/recommendations" element={<RecommendationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
