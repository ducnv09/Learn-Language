import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Decks from './pages/Decks';
import Study from './pages/Study';
import Exercise from './pages/Exercise';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="decks" element={<Decks />} />
          <Route path="study/:deckId" element={<Study />} />
          <Route path="exercise/:deckId" element={<Exercise />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
