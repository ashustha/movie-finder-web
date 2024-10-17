import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import Layout from '../../layout';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useMutation } from 'react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { baseUrl } from '../../../config';

interface LoginFormData {
  email: string;
  password: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  wishlistMovies: any[];
  isPublic: boolean;
}

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const loginMutation = useMutation((formData: LoginFormData) =>
    axios.post(`${baseUrl}/login`, formData)
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (typeof email !== 'string' || typeof password !== 'string') {
        throw new Error('Invalid Email or Password');
      }
      const response = await loginMutation.mutateAsync({ email, password });
      const {
        id: mfs_id,
        full_name: fullName,
        email: user_email,
        wishlist_movies: wishlistMovies,
        is_public: isPublic,
      } = response.data.user;

      const userData: User = {
        id: mfs_id,
        fullName: fullName,
        email: user_email,
        wishlistMovies: wishlistMovies,
        isPublic: isPublic,
      };

      const userDataJSON = JSON.stringify(userData);
      localStorage.setItem('mfs-user', userDataJSON);
      console.log(response);

      Cookies.set('token', response.data.token, { path: '/' });
      navigate('/');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Invalid email or password');
      console.error('Login error:', error);
    }
  };

  return (
    <Layout>
      <Container>
        <Row className="d-flex justify-content-center my-5">
          <Col lg={4}>
            <SectionTitle title="Login" icon={faUser} />
            <div className="login">
              <div className="flex-container">
                <div className="login-wrapper">
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
                      <Form.Label htmlFor="password">Password</Form.Label>
                      <Form.Control
                        type="password"
                        id="password"
                        name="password"
                        required
                      />
                    </Form.Group>
                    {errorMessage && (
                      <div className="text-danger">{errorMessage}</div>
                    )}
                    <Button type="submit" className="btn btn-primary">
                      Submit
                    </Button>
                  </Form>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Login;
