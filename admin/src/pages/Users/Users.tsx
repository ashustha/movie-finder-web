import React from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Button, Container, Spinner, Alert, Col, Row } from 'react-bootstrap';
import Layout from '../../layout';
import './Users.scss';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface User {
  user_id: number;
  full_name: string;
  email: string;
  joined_date: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('http://localhost:3000/api/users');
  console.log(response);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch users');
  }
  return response.json();
};

const Users: React.FC = () => {
  const {
    data: users,
    error,
    isLoading,
    refetch,
  }: UseQueryResult<User[], Error> = useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Prevent refetching on window focus
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="users">
          <Container>
            <div className="text-center my-4">
              <Spinner animation="border" variant="primary" />
              <p>Loading users...</p>
            </div>
          </Container>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="users">
          <Container>
            <Alert variant="danger">
              {error.message}
              <Button onClick={() => refetch()} className="ms-2">
                Retry
              </Button>
            </Alert>
          </Container>
        </div>
      </Layout>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Layout>
        <div className="users">
          <Container>
            <Alert variant="info">No users found.</Alert>
          </Container>
        </div>
      </Layout>
    );
  }

  // Define column definitions for AG Grid
  const columnDefs: ColDef<User>[] = [
    {
      headerName: '#',
      field: 'user_id',
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: 'Name',
      field: 'full_name',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Email',
      field: 'email',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: 'Joined Since',
      field: 'joined_date',
      sortable: true,
      filter: true,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
      flex: 1,
    },
    {
      headerName: 'Action',
      cellRenderer: (params) => (
        <Link to={`/userDetail/${params.data.user_id}`}>
          <Button variant="link">View Profile</Button>
        </Link>
      ),
      flex: 1,
    },
  ];

  return (
    <Layout>
      <div className="users">
        <Container>
          <header>
            <h2>Users</h2>
          </header>
          <Row>
            <Col className="col-10">
              <div
                className="ag-theme-alpine"
                style={{ height: 600, width: '100%' }}
              >
                <AgGridReact<User>
                  rowData={users}
                  columnDefs={columnDefs}
                  pagination={true}
                  paginationPageSize={10}
                  domLayout="autoHeight"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </Layout>
  );
};

export default Users;
