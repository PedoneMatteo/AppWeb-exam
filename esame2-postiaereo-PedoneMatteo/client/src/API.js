const SERVER_URL = 'http://localhost:3001/api/';


/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

          // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
          response.json()
            .then(json => resolve(json))
            .catch(err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj =>
              reject(obj)
            ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err =>
        reject({ error: "Cannot communicate" })
      ) // connection error
  });
}

async function logIn(credentials) {
  let response = await fetch(SERVER_URL + 'sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(SERVER_URL + 'sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
}

async function getUserInfo() {
  const response = await fetch(SERVER_URL + 'sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

/**
 * Getting from the server side and returning the list of airplanes.
 */
const getAirplanes = async () => {
  // film.watchDate could be null or a string in the format YYYY-MM-DD
  return getJson(
    fetch(SERVER_URL + 'airplanes', { credentials: 'include' })
  ).then(json => {
    return json.map((a) => {

      const airplane = {
        id: a.id,
        departure: a.departure,
        arrival: a.arrival,
        duration: a.duration,
        type: a.type,
        rows: a.rows,
        cols: a.cols,
      };
      return airplane;
    })
  })
}

const getUserBookings = async () => {
  return getJson(
    fetch(SERVER_URL + 'userBooking/', { credentials: 'include' })
  ).then(json => {
    return json.map((b) => {
      const booking = {
        id_airplane: b.id_airplane,
        id_user: b.id_user,
        departure: b.departure,
        arrival: b.arrival,
        num_posti: b.num_posti,
        posti: b.posti,
      };
      return booking;
    });
  })
}

const getAirplaneBookings = async (id_airplane) => {
  return getJson(
    fetch(SERVER_URL + 'airplaneBookings/' + id_airplane, { credentials: 'include' })
  ).then(json => {
    const bookings = {
      departure: json.departure,
      arrival: json.arrival,
      type: json.type,
      rows: json.rows,
      cols: json.cols,
      posti: json.posti,
    }
    return bookings;
  });
}

function deleteBooking(id_airplane) {
  return getJson(
    fetch(SERVER_URL + 'booking/' + id_airplane, {
      method: 'DELETE',
      credentials: 'include',
    })
  )
}

function addBookings(id_airplane, posti) {
  return getJson(
    fetch(SERVER_URL + "newBookings/" + id_airplane, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(posti)
    })
  )
}

const API = { getAirplanes, getUserBookings, getAirplaneBookings, deleteBooking, addBookings, logIn, logOut, getUserInfo };
export default API;
