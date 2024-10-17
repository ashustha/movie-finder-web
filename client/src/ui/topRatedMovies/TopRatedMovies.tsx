import { Col, Container, Row } from 'react-bootstrap';
import MovieCard from '../../components/MovieCard/movieCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from 'react-query';
import { baseUrl } from '../../../config';

interface Movie {
  movie_id: number;
  duration: number;
  title: string;
  year: string;
  average_rating: string;
  poster: string;
}

const Top10ThisMonth = () => {
  const { isLoading, isError, data, error } = useQuery('movies', async () => {
    const userId = getUserId(); // Get the userId from localStorage

    // Construct the URL with userId as a query param (if userId exists)
    const url = userId
      ? `${baseUrl}/movie?userId=${userId}`
      : `${baseUrl}/movie`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch movie details');
    }
    return response.json();
  });

  const getUserId = () => {
    const storedUserDataJSON = localStorage.getItem('mfs-user');
    if (storedUserDataJSON !== null) {
      const storedUserData = JSON.parse(storedUserDataJSON);
      return storedUserData.id;
    }
    return null;
  };

  if (isLoading) return <Container>Loading...</Container>;
  if (isError) return <div>Error: {error.message}</div>;

  const movies = data as Movie[];

  return (
    <>
      <Container>
        <div className="topRatedMovies">
          <header className="header">
            <h2>
              <span>
                <FontAwesomeIcon icon={faCrown} />
              </span>{' '}
              Movies
            </h2>
            {/* <Link to='/'>View all</Link> */}
          </header>
          <Row>
            {movies.map((movie: Movie) => (
              <Col sm={6} md={4} key={movie.movie_id}>
                <MovieCard movie={movie} />
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </>
  );
};

export default Top10ThisMonth;
