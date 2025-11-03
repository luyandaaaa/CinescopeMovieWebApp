import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandPage from './pages/index.js';
import ActionMovies from './components/categories/action.jsx';
import ComedyMovies from './components/categories/comedy.jsx';
import AnimationMovies from './components/categories/anime.jsx';
import HorrorMovies from './components/categories/horror.jsx';
import RomanceMovies from './components/categories/romance.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import SignupForm from './components/auth/SignupForm.jsx';
import UserHome from './pages/userHome.jsx';
import UserActionMovies from './components/categories/userAction.jsx';
import UserComedyMovies from './components/categories/userComedy.jsx';
import UserAnimationMovies from './components/categories/userAnime.jsx';
import UserHorrorMovies from './components/categories/userHorror.jsx';
import UserRomanceMovies from './components/categories/userRomance.jsx';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandPage />} />
          <Route path="/categories/action" element={<ActionMovies />} />
          <Route path="/categories/comedy" element={<ComedyMovies />} />
          <Route path="/categories/animation" element={<AnimationMovies />} />
          <Route path="/categories/horror" element={<HorrorMovies />} />
          <Route path="/categories/romance" element={<RomanceMovies />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<SignupForm />} />
          <Route path="/userHome" element={
            <ProtectedRoute>
              <UserHome />
            </ProtectedRoute>
          } />
          <Route path="/user/categories/action" element={
            <ProtectedRoute>
              <UserActionMovies />
            </ProtectedRoute>
          } />
          <Route path="/user/categories/comedy" element={
            <ProtectedRoute>
              <UserComedyMovies />
            </ProtectedRoute>
          } />
          <Route path="/user/categories/animation" element={
            <ProtectedRoute>
              <UserAnimationMovies />
            </ProtectedRoute>
          } />
          <Route path="/user/categories/horror" element={
            <ProtectedRoute>
              <UserHorrorMovies />
            </ProtectedRoute>
          } />
          <Route path="/user/categories/romance" element={
            <ProtectedRoute>
              <UserRomanceMovies />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;