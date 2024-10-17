import React, { useEffect, useState } from 'react';
import {
  Container,
  Tab,
  Tabs,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Modal,
} from 'react-bootstrap';
import Layout from '../../layout';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './Dws.scss';

interface Director {
  director_id: number;
  director_name: string;
}

interface Writer {
  writer_id: number;
  writer_name: string;
}

interface Star {
  star_id: number;
  star_name: string;
}

const Dws: React.FC = () => {
  const [directors, setDirectors] = useState<Director[]>([]);
  const [writers, setWriters] = useState<Writer[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [activeTab, setActiveTab] = useState<string>('directors');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = async (
    endpoint: string,
    setter: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    try {
      const response = await fetch(`http://localhost:3000/api/${endpoint}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setter(data);
    } catch (error) {
      setError(`Failed to fetch ${endpoint}`);
      console.error(`Error fetching ${endpoint}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData('directors', setDirectors);
    fetchData('writers', setWriters);
    fetchData('stars', setStars);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/${activeTab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const newItem = await response.json();
      if (activeTab === 'directors') setDirectors([...directors, newItem]);
      if (activeTab === 'writers') setWriters([...writers, newItem]);
      if (activeTab === 'stars') setStars([...stars, newItem]);
      setFormData({ name: '' });
    } catch (error) {
      setError(`Failed to add ${activeTab.slice(0, -1)}`);
      console.error(`Error adding ${activeTab.slice(0, -1)}:`, error);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/${activeTab}/${deleteId}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.message) {
          setDeleteError(errorData.message);
          setTimeout(() => setDeleteError(null), 10000); // Dismiss after 10 seconds
        } else {
          throw new Error('Network response was not ok');
        }
      } else {
        setDeleteError(null);
        if (activeTab === 'directors')
          setDirectors(
            directors.filter((director) => director.director_id !== deleteId)
          );
        if (activeTab === 'writers')
          setWriters(writers.filter((writer) => writer.writer_id !== deleteId));
        if (activeTab === 'stars')
          setStars(stars.filter((star) => star.star_id !== deleteId));
      }
    } catch (error) {
      setError(`Failed to delete ${activeTab.slice(0, -1)}`);
      console.error(`Error deleting ${activeTab.slice(0, -1)}:`, error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const openConfirmModal = (id: number) => {
    setDeleteId(id);
    setShowConfirmModal(true);
  };

  const columnDefs: ColDef[] = [
    {
      headerName: '#',
      field: `${activeTab.slice(0, -1)}_id`,
      sortable: true,
      filter: true,
      width: 70,
    },
    {
      headerName: 'Name',
      field: `${activeTab.slice(0, -1)}_name`,
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Action',
      cellRenderer: (params: any) => (
        <Button
          variant="link"
          onClick={() =>
            openConfirmModal(params.data[`${activeTab.slice(0, -1)}_id`])
          }
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="dws">
        <Container>
          <header>
            <h2>Directors / Writers / Cast</h2>
          </header>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k!)}
            className="mb-3"
          >
            <Tab eventKey="directors" title="Directors">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>{error}</p>
              ) : (
                <>
                  {deleteError && (
                    <Alert
                      variant="danger"
                      dismissible
                      onClose={() => setDeleteError(null)}
                    >
                      {deleteError}
                    </Alert>
                  )}
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                      <Form.Group as={Col} controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter name"
                          required
                        />
                      </Form.Group>
                    </Row>
                    <Button variant="primary" type="submit">
                      Add Director
                    </Button>
                  </Form>
                  <div
                    className="ag-theme-alpine mt-3"
                    style={{ height: '400px', width: '100%' }}
                  >
                    <AgGridReact
                      rowData={directors}
                      columnDefs={columnDefs}
                      pagination={true}
                      paginationPageSize={10}
                      domLayout="autoHeight"
                    />
                  </div>
                </>
              )}
            </Tab>
            <Tab eventKey="writers" title="Writers">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>{error}</p>
              ) : (
                <>
                  {deleteError && (
                    <Alert
                      variant="danger"
                      dismissible
                      onClose={() => setDeleteError(null)}
                    >
                      {deleteError}
                    </Alert>
                  )}
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                      <Form.Group as={Col} controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter name"
                          required
                        />
                      </Form.Group>
                    </Row>
                    <Button variant="primary" type="submit">
                      Add Writer
                    </Button>
                  </Form>
                  <div
                    className="ag-theme-alpine mt-3"
                    style={{ height: '400px', width: '100%' }}
                  >
                    <AgGridReact
                      rowData={writers}
                      columnDefs={columnDefs}
                      pagination={true}
                      paginationPageSize={10}
                      domLayout="autoHeight"
                    />
                  </div>
                </>
              )}
            </Tab>
            <Tab eventKey="stars" title="Stars">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>{error}</p>
              ) : (
                <>
                  {deleteError && (
                    <Alert
                      variant="danger"
                      dismissible
                      onClose={() => setDeleteError(null)}
                    >
                      {deleteError}
                    </Alert>
                  )}
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                      <Form.Group as={Col} controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter name"
                          required
                        />
                      </Form.Group>
                    </Row>
                    <Button variant="primary" type="submit">
                      Add Cast/Crew
                    </Button>
                  </Form>
                  <div
                    className="ag-theme-alpine mt-3"
                    style={{ height: '400px', width: '100%' }}
                  >
                    <AgGridReact
                      rowData={stars}
                      columnDefs={columnDefs}
                      pagination={true}
                      paginationPageSize={10}
                      domLayout="autoHeight"
                    />
                  </div>
                </>
              )}
            </Tab>
          </Tabs>
        </Container>
      </div>
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this {activeTab.slice(0, -1)}?
          <br />
          <br />
          You wont be able to revert this.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default Dws;
