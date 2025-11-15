import logo from './logo.svg';
import Welcomepage from './components/login/welcomepage';
import LoginPage from './components/login/login';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcomepage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
