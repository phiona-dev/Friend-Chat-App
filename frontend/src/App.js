import logo from './logo.svg';
import Welcomepage from './components/login/welcomepage';
import LoginPage from './components/login/login';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VerificationPage from './components/login/verification';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcomepage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/verify" element={<VerificationPage/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
