import '../App.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { React, useState, useEffect, useContext } from 'react'
import { useNavigate, useParams, Link } from "react-router-dom";
import { Row, Col, Form } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import API from '../API';
import MessageContext from '../messageCtx';
import { Table } from 'react-bootstrap';

function Airplane(props) {
    const { loggedIn, user, setDirty, setMessage } = props;
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
    const [tickets, setTickets] = useState(0);  //form value

    useEffect(() => {
        if (dirty2) {
            API.getOneAirplane(id_airplane).then(a => {

                API.getAirplaneBookings(id_airplane).then(b => {
                    setDeparture(b.departure);
                    setArrival(b.arrival);
                    setTipo(b.tipo); setRow(b.rows); setCols(b.cols);

                    if (b.posti == null)
                        b.posti = "";

                    setTakenSeats(b.posti.split(","));

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
                    setDirty2(false);
                    setDisable(false);
                }).catch(e => {
                    if (e.error)
                        handleErrors(e.error);
                    else
                        handleErrors(e);
                    //navigate('/')});
                });

            }).catch(e => {
                if (e.error)
                    handleErrors(e.error);
                else
                    handleErrors(e);
                navigate('/Errore');
            });
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
                    handleErrors(e.error);
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
            } else if (loggedIn && bitmapSeats[index] === 2) {
                const newSeats = selectedSeats.filter((s) => s !== from_Index_to_Seat(index));
                setSelectedSeats(newSeats);
                setBitmapSeats(bitmapSeats.map((s, i) => i === index ? 0 : s));
            }
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (tickets > 0) {
            setSelectedSeats([]);
            let cont = 0;
            const newSeats = [...selectedSeats];
            setBitmapSeats(bitmapSeats.map((s, i) => {
                if (s === 0 && cont < tickets) {
                    newSeats.push(from_Index_to_Seat(i));
                    cont++;
                    return 2;
                } else
                    return s;
            }));
            setSelectedSeats(newSeats);
            setTickets(0);
        }else{
            setMessage("Inserire un numero di posti valido!");
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
                                {disable ? <i className="bi bi-clipboard-heart-fill fontIcon text-warning" ></i>
                                    : <i className="bi bi-clipboard-heart-fill fontIcon text-warning" onClick={changeStateSeat(index)}></i>}
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

    let viewSeats = "";
    selectedSeats.map((s) => {
        viewSeats = viewSeats + " " + s + " ";
    });

    return (
        <div>
            <h1>Benvenuto nel volo {departure} - {arrival}</h1>
            <Row>
                <Col md={5}>
                    <div><h5 className='blu-color'>Clicca su un posto per prenotare!</h5></div>
                    <Table className=" border fontTable border-primary">
                        <tbody>
                            {renderTable()}
                        </tbody>
                    </Table>
                </Col>

                <Col md={7}>
                    <h3>Posti totali: {rows * cols}</h3>
                    <h3>Posti disponibili: {takenSeats == "" ? rows * cols - 0 - selectedSeats.length : rows * cols - takenSeats.length - selectedSeats.length}</h3>
                    <h3>Posti occupati: {takenSeats == "" ? (rows * cols) - (rows * cols - 0) : (rows * cols) - (rows * cols - takenSeats.length)}</h3>
                    {selectedSeats.length !== 0 ? (<h3>Posti selezionati: {selectedSeats.length}</h3>) : (<></>)}
                    <Button className="space-button" variant="secondary" onClick={() => navigate('/')}>Torna alla Home Page</Button>
                    &nbsp;
                    {loggedIn ? (
                        <>
                            <Button variant="secondary" onClick={() => { setDirty2(true); setSelectedSeats([]); }}>Aggiorna lo stato dell'aereo</Button>

                            <Form className="block-example border border-primary rounded mb-0 form-padding" onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="blu-color"><h5>Prenota scegliendo il numero di posti</h5></Form.Label>
                                    <Form.Control type="number" min={0} max={takenSeats == "" ? rows * cols - 0 - selectedSeats.length : rows * cols - takenSeats.length - selectedSeats.length} step={1}
                                        value={isNaN(tickets) ? "" : tickets} onChange={event => { setTickets(parseInt(event.target.value)); }} />
                                </Form.Group>

                                <Button className="mb-3" variant="info" type="submit">Seleziona</Button>
                                &nbsp;
                                <Button className="btn btn-danger mb-3" onClick={() => {
                                    setBitmapSeats(bitmapSeats.map((s) => {
                                        if (s === 2) {
                                            return 0;
                                        } else
                                            return s;
                                    }));
                                    setSelectedSeats([]);
                                    setTickets(0);
                                }}> Cancella </Button>
                            </Form>

                            <br></br>
                            {
                                selectedSeats.length !== 0 ? (
                                    <div className="blu-color border border-danger"><br></br>
                                        <h2>Hai selezionato:</h2>
                                        <h5>{viewSeats}</h5>
                                        <div><Button className="big-button " variant="primary" onClick={() => addBookings(id_airplane, selectedSeats)}>Conferma prenotazione</Button></div><br></br>

                                    </div>) : (<></>)
                            }

                        </>
                    ) : (<h2 className="text-primary">Fai login per poter prenotare!</h2>)}


                </Col>

            </Row>

        </div>
    )
}
export { Airplane };