import React from 'react';
import {
  Container,
  Spinner,
  Alert,
  Card,
  ListGroup,
  Badge,
  Row,
  Col,
} from 'react-bootstrap';
import Layout from '../../layout';
import { useParams } from 'react-router-dom';
import {
  useQuery,
  UseQueryResult,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import './UserDetail.scss';

// Create a QueryClient instance
const queryClient = new QueryClient();

interface User {
  user_id: number;
  full_name: string;
  email: string;
  joined_date: string;
}

interface WishlistMovie {
  movie_id: number;
  title: string;
  average_rating: number;
  genre_name: string;
  year: number;
  director_name: string;
}

const fetchUserDetail = async (id: string): Promise<User> => {
  const response = await fetch(`http://localhost:3000/api/users/${id}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user details');
  }
  return response.json();
};

const fetchUserWishlist = async (
  id: string
): Promise<{ is_public: boolean; wishlist: WishlistMovie[] }> => {
  const response = await fetch(`http://localhost:3000/api/wishlist/${id}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user wishlist');
  }
  return response.json();
};

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: user,
    error: userError,
    isLoading: userLoading,
  }: UseQueryResult<User, Error> = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserDetail(id!),
    enabled: !!id, // Only fetch if id exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
  });

  const {
    data: wishlistData,
    error: wishlistError,
    isLoading: wishlistLoading,
  }: UseQueryResult<
    { is_public: boolean; wishlist: WishlistMovie[] },
    Error
  > = useQuery({
    queryKey: ['wishlist', id],
    queryFn: () => fetchUserWishlist(id!),
    enabled: !!id, // Only fetch if id exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Container className="my-5">
          <Row>
            <Col className="col-6">
              {userLoading || wishlistLoading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading user details...</p>
                </div>
              ) : userError || wishlistError ? (
                <Alert variant="danger">
                  {userError?.message || wishlistError?.message}
                </Alert>
              ) : user ? (
                <Card>
                  <Card.Header as="h5" className="bg-primary text-white">
                    User Profile
                  </Card.Header>
                  <Card.Body>
                    <Card.Title className="mb-2">
                      <h2 className="username">{user.full_name}</h2>
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Joined: {new Date(user.joined_date).toLocaleDateString()}
                    </Card.Subtitle>
                    <Card.Text>
                      <strong>Email:</strong> {user.email}
                    </Card.Text>
                    <Card.Title className="mt-4">
                      <h3 className="mb-2 wishlist">Wishlist</h3>
                    </Card.Title>
                    {wishlistData?.wishlist.length ? (
                      <ListGroup variant="flush">
                        {wishlistData.wishlist.map((movie) => (
                          <ListGroup.Item
                            key={movie.movie_id}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <h6 className="mb-1">
                                {movie.title} | {movie.year}{' '}
                              </h6>
                            </div>
                            <Badge bg="info" text="dark">
                              Rating: {movie.average_rating}
                            </Badge>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <p className="mt-2">No movies in wishlist.</p>
                    )}
                    <div className="mt-3">
                      <strong>Wishlist Public:</strong>{' '}
                      <Badge
                        bg={wishlistData?.is_public ? 'success' : 'secondary'}
                      >
                        {wishlistData?.is_public ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <p>No user details found.</p>
              )}
            </Col>
          </Row>
        </Container>
      </Layout>
    </QueryClientProvider>
  );
};

export default UserDetail;
