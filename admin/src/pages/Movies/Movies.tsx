import React, { useState } from 'react';
import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import {
  Button,
  Container,
  Spinner,
  Alert,
  Col,
  Row,
  Modal,
} from 'react-bootstrap';
import Layout from '../../layout';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './Movies.scss';

interface Movie {
  movie_id: number;
  title: string;
  average_rating: number;
  genre_name: string;
  year: number;
  director_name: string;
}

const fetchMovies = async (): Promise<Movie[]> => {
  const response = await fetch('http://localhost:3000/api/movies');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch movies');
  }
  return response.json();
};

const deleteMovie = async (movie_id: number): Promise<void> => {
  const response = await fetch(`http://localhost:3000/api/movies/${movie_id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete movie');
  }
};

const Movies: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const {
    data: movies,
    error,
    isLoading,
    refetch,
  }: UseQueryResult<Movie[], Error> = useQuery({
    queryKey: ['movies'],
    queryFn: fetchMovies,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const {
    mutate: handleDelete,
    status,
  }: UseMutationResult<void, Error, number> = useMutation({
    mutationFn: deleteMovie,
    onSuccess: () => {
      // Refetch the movies list after a successful delete
      refetch();
      setShowConfirmModal(false); // Hide modal on success
    },
    onError: (error) => {
      console.error('Error deleting movie:', error);
    },
  });

  // Define column definitions for AG Grid
  const columnDefs: ColDef<Movie>[] = [
    {
      headerName: '#',
      field: 'movie_id',
      sortable: true,
      filter: true,
      width: 100, // Small width for the ID
    },
    {
      headerName: 'Name',
      field: 'title',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Average Rating',
      field: 'average_rating',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Year',
      field: 'year',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Action',
      cellRenderer: (params: any) => (
        <>
          <Link to={`/updateMovie/${params.data.movie_id}`}>
            <Button variant="link" className="mr-2">
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            onClick={() => {
              setSelectedMovie(params.data.movie_id);
              setShowConfirmModal(true);
            }}
            disabled={status === 'pending'} // Disable button while deleting
          >
            {status === 'pending' ? 'Deleting...' : 'Delete'}
          </Button>
        </>
      ),
    },
  ];

  return (
    <Layout>
      <div className="movies">
        <Container>
          <header>
            <h2>Movies</h2>
            <Button variant="outline-primary">
              <Link to="/addMovie">Add new Movie</Link>
            </Button>
          </header>
          {isLoading ? (
            <div className="text-center my-4">
              <Spinner animation="border" variant="primary" />
              <p>Loading movies...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error.message}</Alert>
          ) : (
            <Row>
              <Col className="col-10">
                <div
                  className="ag-theme-alpine"
                  style={{ height: '600px', width: '100%' }}
                >
                  <AgGridReact
                    rowData={movies}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={10} // Adjust page size as needed
                    domLayout="autoHeight"
                  />
                </div>
              </Col>
            </Row>
          )}
        </Container>
        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this movie?
            <br />
            <br /> You wont be able to undo this.
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (selectedMovie !== null) {
                  handleDelete(selectedMovie);
                }
              }}
              disabled={status === 'pending'}
            >
              {status === 'pending' ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Layout>
  );
};

export default Movies;
