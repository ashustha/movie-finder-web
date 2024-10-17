import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../layout';
import { Col, Container, Row } from 'react-bootstrap';
import MovieCard from '../../components/MovieCard/movieCard';
import { baseUrl } from '../../../config';

interface Movie {
    movie_id:number;
    duration:number;
    title:string;
    year:string;
    average_rating:string;
    poster:string;
}

const SearchResult = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('query') || '';
  const filter = queryParams.get('filter') || 'Movie';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async (query: string, filter: string) => {
      const params = new URLSearchParams();
      if (query) params.append(filter.toLowerCase(), query);

      const response = await fetch(`${baseUrl}/movies?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    };

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const data = await fetchMovies(query, filter);
        setMovies(data);
        setLoading(false);
      } catch (error) {
        setError('An error occurred while fetching search results.');
        setLoading(false);
      }
    };

    if (query.trim() !== '') {
      fetchSearchResults();
    } else {
      setLoading(false);
    }
  }, [query, filter]);

  return (
    <Layout>
        <Container>
            <div className='searchResult'>
                <header>
                    <h1>Search Results {query && `for "${query}"`}</h1>
                </header>
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                {!loading && movies.length === 0 && <p>No data found.</p>}
                {!loading && !error && (
                    <Row>
                        {movies.map((movie: Movie) => (
                        <Col sm={6} md={4} key={movie.movie_id}>
                            <MovieCard movie={movie} />
                        </Col>
                        ))}
                    </Row>
                )}
            </div>
        </Container>
    </Layout>
  );
};

export default SearchResult;
