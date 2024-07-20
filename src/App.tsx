import './App.css';
import { useEffect, useState } from 'react';
import { authOnStateChanged } from './firebase';
import Login from './Login';
import { User } from 'firebase/auth';
import Home from './Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authOnStateChanged((val) => {
      if(val !== null) {
        setUser(val)
      }
    })
  }, [])

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home user={user} setUser={setUser}/>} />
          <Route path='/login' element={<Login user={user} setUser={setUser}/>} />
        </Routes>
      </BrowserRouter> 
    </div>
  );
}

export default App;