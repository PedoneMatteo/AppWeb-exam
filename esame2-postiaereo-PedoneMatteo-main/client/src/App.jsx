import './App.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { React, useState, useEffect } from 'react'
import { BrowserRouter, Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Toast } from 'react-bootstrap'
import { LoginForm } from './components/AuthComponents';
import { Navigation } from './components/Navigation';
import { HomePage, DefaultLayout, NotFoundLayout} from './components/HomePage';
import { Airplane } from './components/Airplane';

import MessageContext from './messageCtx';
import API from './API';

function App() {
  // user e loggedIn sono usati per gestire il login
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState();
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false); // used to force refresh of data after login

  const [airplanes, setAirplanes] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const usr = await API.getUserInfo();
        setLoggedIn(true);
        setUser(usr);
      } catch (err) {
        setUser(null);
        setLoggedIn(false);
      }
    };
     
      checkAuth();
      API.getAirplanes().then(a => setAirplanes(a)).catch(err => {if(err.error) handleErrors(err.error); else handleErrors(err);});
      setDirty(true); //setto il dirty per la seconda useEffect nel caso in cui refresho la pagina e sono loggato. Se non lo faccio non carica le prenotazioni
  }, []);

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
  }


  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
    setDirty(true);  //carica l'ultima versione dei dati, se appropriato
  }
  //se avvine un errore viene mostrato un toast con il messaggio di errore
  const handleErrors = (err) => {
    let msg = '';
    if (err.error) msg = err.error;
    else if (String(err) === "string") msg = String(err);
    else msg = "Errore sconosciuto";
    setMessage(msg); 
  }

  return (
    <>
      <BrowserRouter>
        <MessageContext.Provider value={{ handleErrors }}>
          <Container fluid>
            <Navigation user={user} logout={doLogOut} />

            <Routes>
              <Route path='/' element={<DefaultLayout />} >
                <Route index element={<HomePage user={user} loggedIn={loggedIn} airplanes={airplanes} bookings={bookings} setBookings={setBookings} dirty={dirty} setDirty={setDirty} setMessage={setMessage} />} />
                <Route path='/airplane/:id_airplane' element={<Airplane user={user} loggedIn={loggedIn} setDirty={setDirty} setMessage={setMessage} />} />
                <Route path="*" element={ <NotFoundLayout />} />
              </Route>
              <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm loginSuccessful={loginSuccessful} />} />
            </Routes>

            <Toast show={message !== ''} onClose={() => setMessage('')} delay={5000} autohide style={{ position: 'fixed', bottom: '20px', right: '20px', width: '300px', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)' }} bg="warning">
              <Toast.Body>{message}</Toast.Body>
            </Toast>

          </Container>
        </MessageContext.Provider>
      </BrowserRouter>
    </>
  )
}

export default App