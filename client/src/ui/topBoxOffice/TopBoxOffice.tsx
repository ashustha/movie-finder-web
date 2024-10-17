import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { faCrown } from '@fortawesome/free-solid-svg-icons';
import { baseUrl } from '../../../config';
import { Link } from 'react-router-dom';

interface Movie {
  movie_id: number;
  title: string;
  box_office_collection: string;
  budget: string;
  opening_week: string;
  poster: string;
}

const TopBoxOffice = () => {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchTopBoxOfficeMovies = async () => {
      try {
        const response = await axios.get(`${baseUrl}/top-box-office-movies`);
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching top box office movies:', error);
      }
    };

    fetchTopBoxOfficeMovies();
  }, []);

  return (
    <div className="topBoxOffice">
      <SectionTitle icon={faCrown} title="Top Box Office" />
      <div className="topBoxOffice--wrapper">
        <ul className="movieList">
          {movies.map((movie) => (
            <li key={movie.movie_id}>
              <Link to={`/movieDetail/${movie.movie_id}`}>
                <Card className="movie">
                  <figure>
                    <img src={movie.poster} alt={movie.movie_id.toString()} />
                  </figure>
                  <div className="card--text">
                    <h3>{movie.title}</h3>
                    <ul>
                      <li>
                        <span>Total Gross :</span> $
                        {movie.box_office_collection}
                      </li>
                      <li>
                        <span>Opening week :</span> ${movie.opening_week}
                      </li>
                      <li>
                        <span>Budget :</span> ${movie.budget}
                      </li>
                    </ul>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TopBoxOffice;
