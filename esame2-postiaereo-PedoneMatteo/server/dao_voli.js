'use strict';
/* Data Access Object (DAO) module for accessing films and users */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('./exam.db', (err) => {
  if (err) throw err;
});

// This function retrieves the whole list of airplanes from the database.
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

exports.getBooking = (id_airplane, userid, seat) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM booking WHERE id_airplane = ? and id_user = ? and seat = ?';
    db.get(sql, [id_airplane, userid, seat], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Booking not found.' });
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

exports.getCurrentBooking = (id_airplane, seat) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT COUNT(*) as num_bookings FROM booking WHERE id_airplane = ? and seat = ? GROUP BY id_airplane, seat';
    db.get(sql, [id_airplane, seat], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Booking not found.' });
      } else {
        const booking = {
          num_bookings: row.num_bookings,
        };
        resolve(booking);
      }
    });
});
};


  // This function retrieves a film given its id and the associated user id.
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
          resolve({ error: 'Bookings not found.' });
        } else {
          resolve(row);
        }
      });
    });
  };

  exports.getAirplaneBookings = (airplaneId) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT a.departure, a.arrival, a.type, a.rows, a.cols, GROUP_CONCAT(b.seat) as posti 
                   FROM booking as b, airplane as a
                   WHERE b.id_airplane = a.id and b.id_airplane = ?
                   GROUP BY b.id_airplane, a.departure, a.arrival, a.type, a.rows, a.cols`;
      db.get(sql, [airplaneId], (err, row) => {
        if (err) {
          reject(err);
        }
        if (row == undefined) {
          resolve({ error: 'Bookings not found.' });
        } else {
          resolve(row);
        }
      });
    });
  };

  // This function deletes an existing film given its id.
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

exports.createBooking = (booking) =>{
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO booking (id_airplane, id_user, seat) VALUES(?, ?, ?)';
    db.run(sql, [booking.id_airplane, booking.id_user, booking.seat], function (err) {
      if (err) {
        reject(err);
      }
      // Returning the newly created object with the DB additional properties to the client.
      resolve(exports.getBooking(booking.id_airplane, booking.id_user, booking.seat));
    });
  });
}
