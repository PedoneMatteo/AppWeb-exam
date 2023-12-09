import { React, useState, useEffect, useContext } from 'react'
import { Outlet, useNavigate, Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import API from '../API';
import MessageContext from '../messageCtx';
import '../App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      .catch(e => handleErrors(e.error));
  }

  return (
    <div >
      <h1 className="blu-color">Prenota il tuo volo</h1> <br></br>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>{
        loggedIn ? airplanes.map((a) => <FlightCard key={a.id} airplane={a} loggedIn={loggedIn} bookings={bookings} userid={user.id} />) :
          airplanes.map((a) => <FlightCard key={a.id} airplane={a} loggedIn={loggedIn} bookings={bookings} />)
      }
      </div>
      <br></br>
      {loggedIn ?
        (
          <>
            {!bookings.length ? (
              <h2 className="blu-color"> Non sono ancora presenti prenotazioni! </h2>
            ) : (
              <div>
                <h2 className="blu-color">Ecco le tue prenotazioni ! </h2><br></br>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {bookings.map((b) => <BookingCard key={b.id_airplane.toString() + b.id_user.toString()} booking={b} deleteBooking={deleteBooking} />)}
                </div>
              </div>
            )}
          </>
        )
        : <div><h2 className="blu-color">Prenota e goditi il tuo viaggio. Fai login!</h2></div>}
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

  const image = airplane.arrival + ".png";

  return (
    <Card className={"card-margin"} style={{ width: '20rem' }} >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Card.Img variant="top" src={image} style={{ width: '300px', height: '230px', objectFit: 'cover' }} />
      </div>
      <Card.Body>
        <Card.Title className="text-center"> {airplane.departure} <i className="bi bi-arrow-right"></i> {airplane.arrival} </Card.Title>
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
        <h5 className="card-title"> {booking.departure} <i className="bi bi-arrow-right"></i> {booking.arrival} </h5>
        <p className="card-text">Prenotazione del tuo volo da {booking.departure} a {booking.arrival}. Hai prenotato {booking.num_posti} {posto} : {booking.posti}</p>
        <Button variant="danger" onClick={() => deleteBooking(booking.id_airplane)}> Cancella prenotazione</Button>
      </div>
    </div>
  </>);
}

function NotFoundLayout() {
  return (
    <>
      <h2>Non si può accedere a questa pagina!</h2>
      <Link to="/">
        <Button variant="primary">Torna alla Home Page!</Button>
      </Link>
    </>
  );
}

export { HomePage, DefaultLayout, NotFoundLayout };