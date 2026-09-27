import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Decks from './pages/Decks';
import Study from './pages/Study';
import Exercise from './pages/Exercise';
import Quizzes from './pages/Quizzes';
import QuizCreate from './pages/QuizCreate';
import QuizStudy from './pages/QuizStudy';
import QuizEdit from './pages/QuizEdit';
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
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="quizzes/create" element={<QuizCreate />} />
          <Route path="quizzes/edit/:id" element={<QuizEdit />} />
          <Route path="quizzes/study/:id" element={<QuizStudy />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
