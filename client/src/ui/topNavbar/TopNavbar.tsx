import { Container, Figure, Image, NavDropdown } from "react-bootstrap";
import { Link, useNavigate   } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { baseUrl } from "../../../config";
const TopNavbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [fullName, setFullName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthentication = async () => {
          try {
            // Make a request to the server to check the authentication status
            const response = await axios.get(`${baseUrl}/check-authentication`, {
              withCredentials: true // Include credentials (cookies) with the request
            });
            const storedUserDataJSON  = localStorage.getItem('mfs-user');
            if (storedUserDataJSON  !== null) {
              const storedUserData = JSON.parse(storedUserDataJSON);
              const capitalizedFullName = storedUserData.fullName.charAt(0).toUpperCase() + storedUserData.fullName.slice(1);
              setFullName(capitalizedFullName);
            }
            // Check if the response contains a valid authentication status
            if (response.data && response.data.isLoggedIn !== undefined) {
              setIsLoggedIn(response.data.isLoggedIn);
            }
          } catch (error) {
            console.error('Error checking authentication:', error);
          }
        };
      
        checkAuthentication();
      }, []);

      const handleLogout = async () => {
        try {
            Cookies.remove('token', { path: '/' });
            localStorage.removeItem('mfs-user');
            setIsLoggedIn(false);
            navigate('/');
        } catch (error) {
          console.error('Logout error:', error);
        }
      };
      
      

    return (
            <Container>
                <div className="topNavbar">
                    <Link to='/'>
                        <Figure>
                            <img src="/assets/logo.png"></img>
                        </Figure>
                    </Link>
                        <div className="auth">
                        <ul>
                          {isLoggedIn ? (
                              <>
                              <NavDropdown title={fullName} id="basic-nav-dropdown">
                                <NavDropdown.Item><Link to='/profile'>Profile</Link> </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                  Logout
                                </NavDropdown.Item>
                              </NavDropdown>
                              </>
                              ) : (
                              <>
                                  <li>
                                  <Link to="/login">Login</Link>
                                  </li>
                                  <li>
                                  <Link to="/register">Register</Link>
                                  </li>
                              </>
                              )}
                        </ul>
                      </div>
                </div> 
            </Container>
     );
}
 
export default TopNavbar;