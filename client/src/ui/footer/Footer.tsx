import { faFacebook, faInstagram, faTiktok, faTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Row, Col, InputGroup, Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';

const Footer = () => {
    return ( 
        <Container>
            <Row>
                <Col>
                    <Form className="footer">
                        <div className="social-links">
                            <ul>
                                <li><a href="#"><FontAwesomeIcon icon={faFacebook} /></a></li>
                                <li><a href="#"><FontAwesomeIcon icon={faTwitter} /></a></li>
                                <li><a href="#"><FontAwesomeIcon icon={faYoutube} /></a></li>
                                <li><a href="#"><FontAwesomeIcon icon={faTiktok} /></a></li>
                                <li><a href="#"><FontAwesomeIcon icon={faInstagram} /></a></li>
                            </ul>
                        </div>
                        <div className="subscription-form">
                            <InputGroup className="mb-3">
                                <Form.Control
                                placeholder="Enter your email address"
                                aria-describedby="basic-addon2"
                                />
                                <Button variant="outline-secondary" id="button-addon2">
                                Subscribe
                                </Button>
                            </InputGroup>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
     );
}
 
export default Footer;