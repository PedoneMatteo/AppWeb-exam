import '../App.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { React, useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import API from '../API';
import MessageContext from '../messageCtx';
import { Table } from 'react-bootstrap';

function Airplane(props) {
    const { loggedIn, user, airplanes, bookings, setBookings, dirty, setDirty, setMessage } = props;
    const { id_airplane } = useParams();
    const [departure, setDeparture] = useState('');
    const [arrival, setArrival] = useState('');
    const [tipo, setTipo] = useState('');
    const [rows, setRow] = useState(0);
    const [cols, setCols] = useState(0);
    const [bitmapSeats, setBitmapSeats] = useState([0]);    //array di 0,1,2 che indica se il posto è libero, occupato o selezionato
    const [takenSeats, setTakenSeats] = useState([]);       //array di posti occupati

    const [selectedSeats, setSelectedSeats] = useState([]); //array di indici dei posti selezionati
    const { handleErrors } = useContext(MessageContext);
    const navigate = useNavigate();
    const [dirty2, setDirty2] = useState(true);
    const [disable, setDisable] = useState(false);

    useEffect(() => {
        if (dirty2) {
            API.getAirplaneBookings(id_airplane).then(b => {
                setDeparture(b.departure);
                setArrival(b.arrival);
                setTipo(b.tipo); setRow(b.rows); setCols(b.cols); setTakenSeats(b.posti.split(','));

                const updateBitmapSeats = () => {
                    const length = b.rows * b.cols;
                    let bitmap = new Array(length).fill(0);

                    b.posti.split(',').forEach((s) => {
                        let riga = parseInt(s) - 1; // Converte la parte numerica in un numero
                        let carattere = s.substring(s.length - 1);
                        let colonna;
                        switch (carattere) {
                            case "A": colonna = 0; break;
                            case "B": colonna = 1; break;
                            case "C": colonna = 2; break;
                            case "D": colonna = 3; break;
                            case "E": colonna = 4; break;
                            case "F": colonna = 5; break;
                        }
                        bitmap[riga * b.cols + colonna] = 1;   //riga * (num colonne) + colonna
                    });
                    return bitmap;
                };
                setBitmapSeats(updateBitmapSeats());
            }).catch(e => handleErrors(e));

            setDirty2(false);
            setDisable(false);
        }

    }, [dirty2]);

    const addBookings = (id_airplane, selectedSeats) => {
        API.addBookings(id_airplane, selectedSeats)
            .then(() => {
                let newBitMap = [...bitmapSeats];
                selectedSeats.forEach((s) => {
                    newBitMap[from_Seat_to_Index(s)] = 1;
                })
                setBitmapSeats(newBitMap);
                setSelectedSeats([]);
                setDirty(true);
                setDirty2(true);
                setMessage('Prenotazione effettuata con successo!');
                navigate('/');
            })
            .catch(e => {
                if (e.error)
                    handleErrors(e);
                else {
                    let newBitMap = [...bitmapSeats];
                    selectedSeats.forEach((s) => {
                        if (e.takenSeats.includes(s))
                            newBitMap[from_Seat_to_Index(s)] = 3;
                        else
                            newBitMap[from_Seat_to_Index(s)] = 0;
                    });
                    setBitmapSeats(newBitMap);
                    setSelectedSeats([]);
                    setDirty(true);
                    setDisable(true);
                    setTimeout(setDirty2, 5000, true);
                    setMessage(`Prenotazione non effettuata: i posti ${e.takenSeats} sono stati appena prenotati!`);
                }
            });
    }

    const from_Seat_to_Index = (s) => {
        let riga = parseInt(s) - 1; // Converte la parte numerica in un numero
        let carattere = s.substring(s.length - 1);
        let colonna;
        switch (carattere) {
            case "A": colonna = 0; break;
            case "B": colonna = 1; break;
            case "C": colonna = 2; break;
            case "D": colonna = 3; break;
            case "E": colonna = 4; break;
            case "F": colonna = 5; break;
        }
        return (riga * cols + colonna);
    }

    const from_Index_to_Seat = (index) => {
        let riga = Math.floor(index / cols);
        let colonna = index % cols;
        switch (colonna) {
            case 0: colonna = "A"; break;
            case 1: colonna = "B"; break;
            case 2: colonna = "C"; break;
            case 3: colonna = "D"; break;
            case 4: colonna = "E"; break;
            case 5: colonna = "F"; break;
        }
        return ((riga + 1) + colonna);
    }

    const changeStateSeat = (index) => {
        return () => {
            if (loggedIn && bitmapSeats[index] === 0) {
                const newSeats = [...selectedSeats, from_Index_to_Seat(index)];
                setSelectedSeats(newSeats);
                setBitmapSeats(bitmapSeats.map((s, i) => i === index ? 2 : s));
            } else {
                const newSeats = selectedSeats.filter((s) => s !== from_Index_to_Seat(index));
                setSelectedSeats(newSeats);
                setBitmapSeats(bitmapSeats.map((s, i) => i === index ? 0 : s));
            }
        }
    }

    const renderTable = () => {
        const table = [];
        let index = 0;

        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                if (bitmapSeats[index] == 1) {  //taken seats
                    row.push(
                        <td key={index} className="table-cell align-items-center ">
                            <div className="d-flex flex-column align-items-center">
                                <i className="bi bi-clipboard-x-fill fontIcon text-danger"></i>
                                <span className="text-danger">{from_Index_to_Seat(index)}</span>
                            </div>
                        </td>
                    );
                }
                else if (bitmapSeats[index] == 0) { //untaken seats
                    row.push(
                        <td key={index} className="table-cell align-items-center">
                            <div className="d-flex flex-column align-items-center" >
                                {disable ? <i className="bi bi-clipboard-plus-fill fontIcon text-success" ></i>
                                    : <i className="bi bi-clipboard-plus-fill fontIcon text-success" onClick={changeStateSeat(index)}></i>}
                                <span className="text-success">{from_Index_to_Seat(index)}</span>
                            </div>
                        </td>

                    );
                } else if (bitmapSeats[index] == 2) {   //selected seats
                    row.push(
                        <td key={index} className=" table-cell align-items-center">
                            <div className="d-flex flex-column align-items-center">
                                {disable ? <i className="bi bi-clipboard-heart-fill fontIcon text-warning" onClick={changeStateSeat(index)}></i>
                                    : <i className="bi bi-clipboard-heart-fill fontIcon text-warning" ></i>}
                                <span className="text-warning">{from_Index_to_Seat(index)}</span>
                            </div>
                        </td>
                    );
                } else { //selected but just booked from another user
                    row.push(
                        <td key={index} className=" table-cell align-items-center">
                            <div className="d-flex flex-column align-items-center">
                                <i className="bi bi-clipboard-x-fill fontIcon text-info" ></i>
                                <span className="text-info">{from_Index_to_Seat(index)}</span>
                            </div>
                        </td>
                    );
                }
                index++;
            }

            table.push(<tr key={i}>{row}</tr>);
        }
        return table;
    };

    return (
        <div>
            <h1>Benvenuto nel volo {departure} - {arrival}</h1>
            <Row>
                <Col md={5}>
                    <Table className=" border fontTable">
                        <tbody>
                            {renderTable()}
                        </tbody>
                    </Table>
                </Col>

                <Col md={7}>
                    {loggedIn ? (
                        <>
                            <div><Button variant="secondary" onClick={() => navigate('/')}>Torna alla Home Page</Button></div><br></br>
                            <div><Button variant="secondary" onClick={() => {setDirty2(true); setSelectedSeats([]);}}>Ricarica la pagina</Button></div><br></br>
                            {
                                selectedSeats.length !== 0 ? (
                                    <div><br></br>
                                        <div><Button variant="primary" onClick={() => addBookings(id_airplane, selectedSeats)}>Conferma prenotazione</Button></div><br></br>
                                        <h2>Hai selezionato:</h2>
                                        {selectedSeats.map((s) => <h4 key={s}>{s}</h4>)}
                                    </div>

                                ) : (
                                    <h2>Clicca su un posto per prenotare!</h2>
                                )
                            }
                        </>
                    ) : (<h2>Fai login per poter prenotare!</h2>)}


                </Col>

            </Row>

        </div>
    )
}
export { Airplane };