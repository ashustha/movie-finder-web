import { Button, Col, Container, Figure, Form, Row } from "react-bootstrap";
import Layout from "../../layout";
import SectionTitle from "../../components/SectionTitle/SectionTitle";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { useMutation } from 'react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from "../../../config";

interface FormData {
    email: string;
    full_name: string;
    password: string;
  }

const Register = () => {  
    const navigate = useNavigate();

    const registerUser = async (formData: FormData) => {
        try {
          const response = await axios.post(`${baseUrl}/register`, formData);
          return response.data;
        } catch (error) {
          console.error('Error registering user:', error);
          throw error;
        }
      };
      
      const { isLoading, isError } = useMutation(registerUser);
      
      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
      
        const formData: FormData = {
          email: e.currentTarget.email.value.trim(),
          full_name: e.currentTarget.full_name.value.trim(),
          password: e.currentTarget.password.value,
        };
      
        // Check if any form field is null or undefined
        if (!formData.email || !formData.full_name || !formData.password) {
          alert('Please fill in all the required fields.');
          return;
        }
      
        // Check if passwords match
        const confirmPassword = e.currentTarget.confirmPassword.value;
        if (formData.password !== confirmPassword) {
          alert("Passwords don't match");
          return;
        }
      
        // Validate password criteria
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
        if (!passwordRegex.test(formData.password)) {
          alert('Password must be at least 6 characters long and contain at least one number and one special character.');
          return;
        }
      
        try {
          await registerUser(formData);
          alert('User registered successfully');
          (e.target as HTMLFormElement).reset();
          navigate('/login');
        } catch (error: unknown) {
            if (error instanceof Error && 'response' in error) {
              const response = error.response as { data?: { message?: string } }; 
              const errorMessage = response.data?.message || 'An unknown error occurred';
              alert(errorMessage);
            } else {
              alert('An unknown error occurred');
            }
          }     
      };

    return ( 
        <Layout>
            <Container>
                <Row className="d-flex justify-content-center">
                    <Col lg={8}>
                <SectionTitle title="Register" icon={faUserPlus} />
                        <div className="register">
                                <div className="flex-container">
                                    <div className="register-wrapper">
                                    <Form className="form" onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="email">Email</Form.Label>
                                            <Form.Control
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="full_name">Full Name</Form.Label>
                                            <Form.Control
                                            type="text"
                                            id="full_name"
                                            name="full_name"
                                            required
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="password">Password</Form.Label>
                                            <Form.Control
                                            type="password"
                                            id="password"
                                            name="password"
                                            required
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="confirmPassword">Re-enter Password</Form.Label>
                                            <Form.Control
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            required
                                            />
                                        </Form.Group>
                                        <Button type="submit" className="btn btn-primary" disabled={isLoading}>
                                            {isLoading ? 'Submitting...' : 'Submit'}
                                        </Button>
                                        {isError && <div>Error registering user</div>}
                                    </Form>
                                    </div>
                                    <div className="carousel-wrapper">
                                        <Figure>
                                            <img src="./assets/register.jpg" alt="Slide 1" />
                                        </Figure> 
                                    </div>
                                </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </Layout>
     );
}
 
export default Register;