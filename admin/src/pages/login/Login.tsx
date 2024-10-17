import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Col, Form, Row, Spinner, Alert } from 'react-bootstrap';
import './Login.scss';
import { useNavigate } from 'react-router-dom';

interface Credentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  isAdmin: boolean;
}

const loginUser = async (credentials: Credentials): Promise<LoginResponse> => {
  const response = await fetch('http://localhost:3000/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const data = await response.json();
  return data;
};

const useFormValidation = (
  validateFn: (value: string) => string | undefined
) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setValue(value);
    setError(validateFn(value));
  };

  return {
    value,
    error,
    handleChange,
  };
};

const Login = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emailField = useFormValidation((value) => {
    if (!value) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Enter valid email';
    return undefined;
  });

  const passwordField = useFormValidation((value) => {
    if (!value) return 'Password is required';
    return undefined;
  });

  const mutation = useMutation<LoginResponse, Error, Credentials>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log('Login Successful:', data);
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setApiError(error.message);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!emailField.error && !passwordField.error) {
      setApiError(null);
      setIsLoading(true);
      mutation.mutate({
        email: emailField.value,
        password: passwordField.value,
      });
    }
  };

  return (
    <div className="login">
      <div className="container">
        <h2 className="mb-5 justify-content-center d-flex">MFS Admin Login</h2>
        <Row className="justify-content-center">
          <Col lg={5}>
            <Form className="loginForm" onSubmit={handleSubmit}>
              {apiError && <Alert variant="danger">{apiError}</Alert>}
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="name@example.com"
                  value={emailField.value}
                  onChange={emailField.handleChange}
                  isInvalid={!!emailField.error}
                />
                <Form.Control.Feedback type="invalid">
                  {emailField.error}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formPlaintextPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={passwordField.value}
                  onChange={passwordField.handleChange}
                  isInvalid={!!passwordField.error}
                />
                <Form.Control.Feedback type="invalid">
                  {passwordField.error}
                </Form.Control.Feedback>
              </Form.Group>
              <Button
                className="loginButton"
                variant="primary"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" /> Loading...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Login;
