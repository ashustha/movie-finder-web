import {
  Alert,
  Button,
  Col,
  Container,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap';
import Layout from '../../layout';
import { AgGridReact } from 'ag-grid-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './News.scss';

interface News {
  id: number;
  image: string;
  title: string;
  paragraph: string;
}

const fetchNews = async (): Promise<News[]> => {
  const response = await fetch('http://localhost:3000/api/news');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch news');
  }
  return response.json();
};

const deleteNews = async (news_id: number): Promise<void> => {
  const response = await fetch(`http://localhost:3000/api/news/${news_id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete news');
  }
};

const News = () => {
  const [selectedNews, setSelectedNews] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const {
    data: news,
    error,
    isLoading,
    refetch,
  }: UseQueryResult<News[], Error> = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const {
    mutate: handleDelete,
    status,
  }: UseMutationResult<void, Error, number> = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      // Refetch the news list after a successful delete
      refetch();
      setShowConfirmModal(false); // Hide modal on success
    },
    onError: (error) => {
      console.error('Error deleting news:', error);
    },
  });

  // Define column definitions for AG Grid
  const columnDefs: ColDef<News>[] = [
    {
      headerName: '#',
      field: 'image',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => (
        <img
          src={`http://localhost:3000${params.value}`}
          alt="News"
          style={{ width: '50px', height: '50px' }}
        />
      ), // Show image
    },
    {
      headerName: 'Title',
      field: 'title',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'News',
      field: 'paragraph',
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      headerName: 'Action',
      cellRenderer: (params: any) => (
        <>
          {/* <Link to={`/updateNews/${params.data.id}`}>
            <Button variant="link" className="mr-2">
              Edit
            </Button>
          </Link> */}
          <Button
            variant="danger"
            onClick={() => {
              setSelectedNews(params.data.id);
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
      <div className="news">
        <Container>
          <header>
            <h2>News</h2>
            <Button variant="outline-primary">
              <Link to="/addNews">Add new News</Link> {/* Fixed route */}
            </Button>
          </header>
          {isLoading ? (
            <div className="text-center my-4">
              <Spinner animation="border" variant="primary" />
              <p>Loading news...</p> {/* Fixed typo */}
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
                    rowData={news}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={10}
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
            Are you sure you want to delete this news item?
            <br />
            <br /> You won't be able to undo this.
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
                if (selectedNews !== null) {
                  handleDelete(selectedNews);
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

export default News;
