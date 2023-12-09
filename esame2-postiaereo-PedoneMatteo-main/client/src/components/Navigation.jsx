import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';


import { Navbar, Nav, Form, Button} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

const Navigation = (props) => {

  const navigate = useNavigate();
  const name = props.user && props.user.name;

  return (
    <Navbar expand="sm" variant="dark" fixed="top" className="navbar-padding navbar-colour">
      <Link to="/">
        <Navbar.Brand>
        <i className="bi bi-airplane-fill icon-margin-dx"></i> Home Page
        </Navbar.Brand>
      </Link>
      

      <Navbar.Collapse className="justify-content-end">
        {name ? <>
          <Navbar.Text className='fs-5'>
            {"Registrato come: " + name}
          </Navbar.Text>
          <Button className='mx-2' variant='danger' onClick={()=>{props.logout(); navigate('/');}}>Logout</Button>
        </> :
          <Button className='mx-2' variant='warning' onClick={() => {navigate('/login');}}>Login</Button>}
      </Navbar.Collapse>

      <Nav className="ml-md-auto">
        <Nav.Item>
          <Nav.Link href="#">
            <i className="bi bi-person-circle icon-size" />
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </Navbar>
  );
}

export { Navigation }; 