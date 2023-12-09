'use strict';
/* Data Access Object (DAO) module for accessing films and users */

const sqlite = require('sqlite3');

// apri il database
const db = new sqlite.Database('./exam.db', (err) => {
  if (err) throw err;
});

//questa funzione restituisce tutti gli aerei
exports.listAirplanes = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM airplane';
    db.all(sql, [], (err, rows) => {
      if (err)
        reject(err);
      else
        resolve(rows);
    });
  });
};

//questa funzione restituisce un aereo dato il suo id
exports.getOneAirplane = (id_airplane) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM airplane WHERE id = ?';
    db.get(sql, [id_airplane], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Aereo non trovato' });
      } else {
        resolve(row);
      }
    });
  });
};

//questa funzione restituisce una prenotazione dato l'id dell'aereo, l'id dell'utente e il posto
exports.getBooking = (id_airplane, userid, seat) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM booking WHERE id_airplane = ? and id_user = ? and seat = ?';
    db.get(sql, [id_airplane, userid, seat], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Prenotazione non trovata' });
      } else {
        const booking = {
          id_airplane: row.id_airplane,
          id_user: row.id_user,
          seat: row.seat,
        };
        resolve(booking);
      }
    });
  });
};

//questa funzione restituisce il numero di prenotazioni dato l'id dell'aereo e l'id dell'utente: serve per controllare se l'utente ha già prenotato
exports.checkBookOnPlane = (id_airplane, userid) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT COUNT(*) as num_bookings FROM booking WHERE id_airplane = ? and id_user = ? GROUP BY id_airplane, id_user';
    db.get(sql, [id_airplane, userid], (err, row) => {
      if (err) {
        reject(err);
      }
      if(row == undefined || row.num_bookings == 0)
        resolve({ count: 0 });
      else
        resolve({ count: row.num_bookings, error: 'Prenotazione già effettuata su questo volo' });
    });
  });
};

//questa funzione restituisce il numero di prenotazioni dato l'id dell'aereo e il posto: serve per controllare se il posto è già prenotato
exports.getCurrentBooking = (id_airplane, seat) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT COUNT(*) as num_bookings FROM booking WHERE id_airplane = ? and seat = ? GROUP BY id_airplane, seat';
    db.get(sql, [id_airplane, seat], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Prenotazione non trovata' });
      } else {
        const booking = {
          num_bookings: row.num_bookings,
        };
        resolve(booking);
      }
    });
  });
};

//questa funzione restituisce tutte le prenotazioni di un utente dato il suo id
exports.getUserBookings = (userid) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT b.id_airplane, b.id_user, a.departure, a.arrival, COUNT(*) as num_posti, GROUP_CONCAT(b.seat) as posti 
                   FROM booking as b, airplane as a 
                   WHERE b.id_airplane = a.id and b.id_user=? 
                   GROUP BY b.id_airplane, b.id_user, a.departure, a.arrival`;
    db.all(sql, [userid], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Prenotazione non trovata' });
      } else {
        resolve(row);
      }
    });
  });
};

//questa funzione restituisce tutte le prenotazioni di un aereo dato il suo id
exports.getAirplaneBookings = (airplaneId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT a.departure, a.arrival, a.type, a.rows, a.cols, GROUP_CONCAT(b.seat) as posti
                   FROM airplane as a
                   LEFT OUTER JOIN booking as b on b.id_airplane = a.id
                   WHERE a.id = ?
                   GROUP BY b.id_airplane, a.departure, a.arrival, a.type, a.rows, a.cols`;
    db.get(sql, [airplaneId], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Prenotazione non trovata' });
      } else {
        resolve(row);
      }
    });
  });
};

//questa funzione cancella una prenotazione dato l'id dell'aereo e l'id dell'utente
exports.deleteBooking = (id_airplane, userid) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM booking WHERE id_airplane = ? and id_user = ?';
    db.run(sql, [id_airplane, userid], (err) => {
      if (err) {
        reject(err);
      } else
        resolve(null);
    });
  });
}

//questa funzione crea una prenotazione dato l'id dell'aereo, l'id dell'utente e il posto
exports.createBooking = (booking) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO booking (id_airplane, id_user, seat) VALUES(?, ?, ?)';
    db.run(sql, [booking.id_airplane, booking.id_user, booking.seat], function (err) {
      if (err) {
        reject(err);
      }
      //ritorna la prenotazione appena creata
      resolve(exports.getBooking(booking.id_airplane, booking.id_user, booking.seat));
    });
  });
}
