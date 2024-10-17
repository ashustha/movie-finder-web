import React, { useState } from 'react';
import { Button, Form, Container, Alert, Spinner } from 'react-bootstrap';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '../../layout';
import './AddNews.scss';

const AddNews = () => {
  const [title, setTitle] = useState<string>('');
  const [image, setImage] = useState<File | null>(null); // Store the uploaded file
  const [paragraph, setParagraph] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const addNews = async (formData: FormData) => {
    const response = await fetch('http://localhost:3000/api/news', {
      method: 'POST',
      body: formData, // Send FormData directly
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add news');
    }

    return response.json();
  };

  const mutation = useMutation({
    mutationFn: addNews,
    onSuccess: () => {
      // Navigate to the news list after successful addition
      navigate('/news');
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Reset error state
    setIsLoading(true);

    // Create FormData to handle file and text submission
    const formData = new FormData();
    formData.append('title', title);
    formData.append('paragraph', paragraph);
    if (image) {
      formData.append('image', image); // Append the file
    }

    // Call the mutation to add news
    mutation.mutate(formData);
    setIsLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]); // Get the uploaded file
    }
  };

  return (
    <Layout>
      <Container className="news">
        <header>
          <h2>Add News</h2>
        </header>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group className="mb-4" controlId="formTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter news title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="formImage">
            <Form.Label>Upload Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="formParagraph">
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter news content"
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
              required
            />
          </Form.Group>
          {error && <Alert variant="danger">{error}</Alert>}
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : 'Add News'}
          </Button>
        </Form>
      </Container>
    </Layout>
  );
};

export default AddNews;
