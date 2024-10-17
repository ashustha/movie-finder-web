import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import {
  faStar,
  faHeartCirclePlus,
  faHeartCircleCheck,
  faHeartCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { baseUrl } from '../../../config';

interface Movie {
  movie_id: number;
  duration: number;
  title: string;
  year: string;
  average_rating: string;
  custom_average_rating: string;
  poster: string;
}

interface Props {
  movie: Movie;
  refetchWishlist?: () => void;
}

const MovieCard = ({ movie, refetchWishlist }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [wishlistMovies, setWishlistMovies] = useState<number[]>([]);

  const getUserId = () => {
    const storedUserDataJSON = localStorage.getItem('mfs-user');
    if (storedUserDataJSON !== null) {
      const storedUserData = JSON.parse(storedUserDataJSON);
      return storedUserData.id;
    }
    return null;
  };

  const fetchWishlistFromServer = async () => {
    try {
      const user_id = getUserId();
      if (!user_id) {
        throw new Error('Please login before creating your wishlist');
      }

      const response = await fetch(`${baseUrl}/wishlist/${user_id}`);
      if (response.status === 404) {
        console.log('No wishlist items found.');
        setWishlistMovies([]); // Set wishlist to empty array
        return;
      }

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(
          `Failed to fetch wishlist from server: ${errorMessage}`
        );
      }

      const data = await response.json();

      // Handle the response data
      const serverWishlistMovies = Array.isArray(data.wishlist)
        ? data.wishlist.map((item: { movie_id: number }) => item.movie_id)
        : [];

      // Update localStorage with server data
      const storedUserDataJSON = localStorage.getItem('mfs-user');
      if (storedUserDataJSON) {
        const storedUserData = JSON.parse(storedUserDataJSON);
        storedUserData.wishlistMovies = data.wishlist;
        localStorage.setItem('mfs-user', JSON.stringify(storedUserData));
      }

      setWishlistMovies(serverWishlistMovies);
    } catch (error) {
      console.error('Error fetching wishlist from server:', error);
    }
  };

  useEffect(() => {
    fetchWishlistFromServer();
  }, []);

  const isMovieInWishlist = wishlistMovies.includes(movie.movie_id);

  const addToWishlist = async () => {
    setIsLoading(true);
    try {
      const user_id = getUserId();
      if (!user_id) {
        throw new Error('Please login before creating your wishlist');
      }

      const response = await fetch(`${baseUrl}/addToWishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          movie_id: movie.movie_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add movie to wishlist');
      }

      const updatedWishlistMovies = isMovieInWishlist
        ? wishlistMovies.filter((id) => id !== movie.movie_id)
        : [...wishlistMovies, movie.movie_id];

      setWishlistMovies(updatedWishlistMovies);

      const storedUserDataJSON = localStorage.getItem('mfs-user');
      if (storedUserDataJSON) {
        const storedUserData = JSON.parse(storedUserDataJSON);
        storedUserData.wishlistMovies = updatedWishlistMovies.map((id) => ({
          movie_id: id,
        }));
        localStorage.setItem('mfs-user', JSON.stringify(storedUserData));
      }

      setIsHovered(false);

      if (refetchWishlist) {
        refetchWishlist();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    if (isLoading) {
      return 'Loading...';
    }

    if (isMovieInWishlist) {
      return isHovered ? (
        <FontAwesomeIcon icon={faHeartCircleXmark} />
      ) : (
        <FontAwesomeIcon icon={faHeartCircleCheck} />
      );
    }

    return isHovered ? (
      <FontAwesomeIcon icon={faHeartCirclePlus} />
    ) : (
      <FontAwesomeIcon icon={faHeart} />
    );
  };

  return (
    <div className="card">
      <div className="card-wrapper">
        <div className="rating">
          <span>
            <FontAwesomeIcon icon={faStar} />
          </span>
          <p>{movie.custom_average_rating ?? movie.average_rating}</p>
        </div>
        <Link to={`/movieDetail/${movie.movie_id}`}>
          <figure>
            <img src={movie.poster} alt={movie.title} />
          </figure>
        </Link>
        <div className="card--text">
          <div className="card--text__name">
            <p>
              {movie.title} ({movie.year})
            </p>
          </div>
          <div className="card--text__right">
            <div
              className="wishlist-button"
              onClick={addToWishlist}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {getIcon()}
            </div>
          </div>
          <div className="card--text__duration">
            <p>{movie.duration} min</p>
          </div>
        </div>
        {error && <div>Error: {error}</div>}
      </div>
    </div>
  );
};

export default MovieCard;
