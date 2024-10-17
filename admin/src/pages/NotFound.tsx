

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';

const NotFound: React.FC = () => {
  
  const token = localStorage.getItem('token');


  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh', 
    textAlign: 'center',
  };

  const buttonStyle: React.CSSProperties = {
    marginTop: '20px', 
  };

  return (
    <Container style={containerStyle}>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      {token ? (
        <Link to="/dashboard" style={buttonStyle}>
          <Button variant="primary">Go to Dashboard</Button>
        </Link>
      ) : (
        <Link to="/" style={buttonStyle}>
          <Button variant="primary">Go to Login</Button>
        </Link>
      )}
    </Container>
  );
};

export default NotFound;
