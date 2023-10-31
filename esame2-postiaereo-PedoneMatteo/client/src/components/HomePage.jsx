import { React, useState, useEffect, useContext } from 'react'
import { Outlet, useNavigate, Link } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import API from '../API';
import MessageContext from '../messageCtx';
import '../App.css';
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';

function DefaultLayout() {
  return (
    <div className="row below-nav">
      <div className="col">
        <Outlet />
      </div>
    </div>

  );
}

function HomePage(props) {

  const { loggedIn, user, airplanes, bookings, setBookings, dirty, setDirty, setMessage } = props;
  const { handleErrors } = useContext(MessageContext);


  useEffect(() => {

    if (loggedIn) { //se loggedIn cambia da true a false non devo caricare le prenotazioni perchè user è undefined
      if (dirty) {
        API.getUserBookings(user.id).then(b => setBookings(b)).catch(e => handleErrors(e));
        setDirty(false);
      }
    }
  }, [loggedIn, dirty]);

  const deleteBooking = (id_airplane) => {
    API.deleteBooking(id_airplane)
      .then(() => { setDirty(true); setMessage("Prenotazione cancellata") })
      .catch(e => handleErrors(e));
  }

  return (
    <div >
      <h1>Prenota il tuo volo</h1> <br></br>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>{
        loggedIn ? airplanes.map((a) => <FlightCard key={a.id} airplane={a} loggedIn={loggedIn} bookings={bookings} userid={user.id} />) :
          airplanes.map((a) => <FlightCard key={a.id} airplane={a} loggedIn={loggedIn} bookings={bookings} />)
      }
      </div>
      <br></br>
      {loggedIn ? <div>
        <h2>Ecco le tue prenotazioni ! </h2><br></br>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {bookings.map((b) => <BookingCard key={b.id_airplane.toString() + b.id_user.toString()} booking={b} deleteBooking={deleteBooking} />)}
        </div>
      </div> : <div><h2>Non farti scappare i tuoi posti! Fai login :-) </h2></div>}
    </div>
  );
}


function FlightCard(props) {
  const { airplane, loggedIn, bookings, userid } = props;
  const navigate = useNavigate();
  const count = bookings.reduce((acc, b) => {
    if (b.id_airplane === airplane.id && b.id_user === userid)
      return acc + 1;
    else
      return acc;
  }, 0);

  return (
    <Card style={{ width: '20rem' }}>
      <Image variant="top" /> {/*src="https://picsum.photos/200/300" />*/}
      <Card.Body>
        <Card.Title className="text-center"> {airplane.departure} - {airplane.arrival} </Card.Title>
        <Card.Subtitle>{airplane.duration}</Card.Subtitle>
        <Card.Text>
          Il tipo di aereo è {airplane.type} con posti {airplane.rows * airplane.cols}
        </Card.Text>

        {loggedIn ? (
          <>
            {count ? (
              <Button variant="primary" disabled>Posto già prenotato su questo volo</Button>
            ) : (
              <Button variant="primary" onClick={() => navigate("/airplane/" + airplane.id)}>Prenota il tuo posto!</Button>
            )}
          </>
        ) : (
          <Button variant="primary" onClick={() => navigate("/airplane/" + airplane.id)}>Visualizza i posti!</Button>
        )}


      </Card.Body>
    </Card>
  );
}


function BookingCard(props) {
  const { booking, deleteBooking } = props;
  let posto;
  booking.numposti ? posto = "posto" : posto = "posti";

  return (<>
    <div className="card" style={{ width: '30rem' }}>
      <div className="card-header">
        Prenotazione
      </div>
      <div className="card-body">
        <h5 className="card-title"> {booking.departure} - {booking.arrival} </h5>
        <p className="card-text">Prenotazione del tuo volo da {booking.departure} a {booking.arrival}. Hai prenotato {booking.num_posti} {posto} : {booking.posti}</p>
        <Button variant="danger" onClick={() => deleteBooking(booking.id_airplane)}> Cancella prenotazione</Button>
      </div>
    </div>
  </>);
}

function NotFoundLayout() {
  return (
    <>
      <h2>Questa non è la route che stai cercando!</h2>
      <Link to="/">
        <Button variant="primary">vai alla Home Page!</Button>
      </Link>
    </>
  );
}

/**
* This layout shuld be rendered while we are waiting a response from the server.
*/
function LoadingLayout(props) {
  return (
    <Row className="vh-100">
      <Col md={1} bg="light" className="below-nav" id="left-sidebar">
      </Col>
      <Col md={10} className="below-nav">
        <div><h1>Caricamento</h1></div>
        <div>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner></div>
      </Col>
      <Col md={1} bg="light" className="below-nav" id="left-sidebar">
      </Col>
    </Row>
  )
}


export { HomePage, DefaultLayout, NotFoundLayout, LoadingLayout };