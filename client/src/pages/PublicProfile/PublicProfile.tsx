import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import Layout from '../../layout';
import { baseUrl } from '../../../config';
import MovieCard from '../../components/MovieCard/movieCard';
import styles from './Public.module.scss';

interface Movie {
  movie_id: number;
  title: string;
  // Add other movie properties if needed
}

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { userName } = useParams<{ userName: string }>();
  const [wishlist, setWishlist] = useState<Movie[]>([]);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`${baseUrl}/wishlist/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }
        const data = await response.json();
        console.log(data);
        setWishlist(data.wishlist);
        setIsPublic(data.is_public);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <Layout>
      <Container>
        <div className={styles.publicProfile}>
          <header>
            <h2>{userName}</h2>
          </header>
          <h3>Wishlist</h3>
          {isPublic ? (
            wishlist.length > 0 ? (
              <Row>
                {wishlist.map((movie: Movie) => (
                  <Col xs={6} md={4} lg={3} key={movie.movie_id}>
                    <MovieCard movie={movie} />
                  </Col>
                ))}
              </Row>
            ) : (
              <p>No movies in wishlist</p>
            )
          ) : (
            <p>This user has kept their wishlist private</p>
          )}
        </div>
      </Container>
    </Layout>
  );
};

export default PublicProfile;
