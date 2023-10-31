'use strict';

const express = require('express');
const morgan = require('morgan');                                  // logging middleware
const cors = require('cors');

const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const { check, validationResult, } = require('express-validator'); // validation middleware

const daoVoli = require('./dao_voli');
const daoUser = require('./dao_user');

// init express
const app = new express();
const port = 3001;

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    daoUser.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  daoUser.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

/*** init express and set-up the middlewares ***/
app.use(morgan('dev'));
app.use(express.json());

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'wge8d239bwd93rkskb',   //personalize this random string, should be a secret value
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};



/*** Voli APIs ***/

// 1. Retrieve the list of all the available airplanes.
// GET /api/airplane
app.get('/api/airplanes',
  async (req, res) => {
    try {
      const result = await daoVoli.listAirplanes();

      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);

    } catch (err) {
      res.status(500).json({ error: `Errato il get '/api/airplanes': ${err}` });
    }
  }
);

// 2. Retrieve a booking, given the “id_user”.
// GET /api/bookings/<id_user>
// Given a user id, this route returns the associated booking
app.get('/api/userBooking/', isLoggedIn,
  async (req, res) => {
    try {
      const result = await daoVoli.getUserBookings(req.user.id);

      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);
    } catch (err) {
      res.status(500).json({ error: `Errato il get userBooking '/api/booking/:id_user': ${err} ` });
    }
  }
);

app.get('/api/airplaneBookings/:id_airplane',
  [check('id_airplane').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const result = await daoVoli.getAirplaneBookings(req.params.id_airplane);
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);
    } catch (err) {
      res.status(500).json({ error: `Errato il get airplaneBooking '/api/bookings/:id_airplane': ${err} ` });
    }
  }
);

app.delete('/api/booking/:id_airplane', isLoggedIn,
[ check('id_airplane').isInt({min: 1}) ],
  async (req, res) => {
    try {
      await daoVoli.deleteBooking(req.params.id_airplane, req.user.id);
      res.status(200).json({});
    } catch (err) {
      res.status(503).json({ error: `Errore del database durante la cancellazione di una booking sull'aereo ${req.params.id_airplane}: ${err} ` });
    }
  }
);

app.post('/api/newBookings/:id_airplane', isLoggedIn,
[ check('id_airplane').isInt({min: 1}) ],
//[ body().isArray({min: 1})],
  async (req, res) => {// Is there any validation error?
    const vec_posti_occupati = [];
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }
    const posti = req.body;
    try {
      for (let i = 0; i < posti.length; i++) {
        await daoVoli.getCurrentBooking(req.params.id_airplane, posti[i]).then((result) => {
          if (result.num_bookings >= 1) {
            vec_posti_occupati.push(posti[i]);
          }
        });
      }
      if (vec_posti_occupati.length > 0)
        return res.status(409).json({ takenSeats: vec_posti_occupati });

      for (let i = 0; i < posti.length; i++) {
        const booking = {
          id_airplane: req.params.id_airplane,
          id_user: req.user.id,
          seat: posti[i]
        };
        await daoVoli.createBooking(booking);
      }
      return res.status(200).json({});
    }
    catch (err) {
      res.status(503).json({ error: `Errore del database durante la creazione di una booking sull'aereo ${req.params.id_airplane}: ${err} ` });
    }
  }
);


/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from daoUser.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// ALTERNATIVE: if we are not interested in sending error messages...
/*
app.post('/api/sessions', passport.authenticate('local'), (req,res) => {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  res.json(req.user);
});
*/

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'User non autenticato!' });;
});
