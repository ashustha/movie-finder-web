import { faStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface MovieInfoProps {
  avg_rating: number;
  year: number;
  duration: string;
  genres: MovieGenre[];
}

interface MovieGenre {
  id: number;
  name: string;
}

const MovieInfo: React.FC<MovieInfoProps> = ({
  avg_rating,
  year,
  duration,
  genres,
}) => {
  return (
    <>
      <div className="movieInfo">
        <div className="detail">
          <div className="avgRating">
            <p>
              <span>
                <FontAwesomeIcon icon={faStar} /> &nbsp;
              </span>
              {avg_rating}
            </p>
          </div>
          <div className="releasedYear">
            <p>{year}</p>
          </div>
          <div className="duration">
            <p>{duration} min</p>
          </div>
        </div>
        <div className="genre">
          <ul>
            {genres &&
              genres.map((genre) => <li key={genre.id}>{genre.name}</li>)}
          </ul>
        </div>
      </div>
    </>
  );
};

export default MovieInfo;
