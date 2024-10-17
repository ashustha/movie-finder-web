import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  ListGroup,
  Row,
} from 'react-bootstrap';
import Layout from '../../layout';
import MovieInfo from '../../components/MovieInfo/MovieInfo';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Link, useParams } from 'react-router-dom';
import { baseUrl } from '../../../config';
import MovieCard from '../../components/MovieCard/movieCard';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { faFilm } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useMemo } from 'react';
import ReactStars from 'react-rating-stars-component';
import { useState } from 'react';
import { faComment } from '@fortawesome/free-regular-svg-icons';
import ReviewSummary from '../../components/ReviewSummary/ReviewSummary';

type MovieIdParams = {
  movieId: string;
};

interface Star {
  id: number;
  name: string;
}

interface Review {
  review_id: number;
  rating: string;
  written_review: string;
  user_id: number;
  full_name: string;
}

const getUserId = () => {
  const storedUserDataJSON = localStorage.getItem('mfs-user');
  if (storedUserDataJSON !== null) {
    const storedUserData = JSON.parse(storedUserDataJSON);
    return storedUserData.id;
  }
  return null;
};

const fetchMovieDetails = async (movieId: string) => {
  const userId = getUserId();

  // Adding userId to the request
  const response = await fetch(
    `${baseUrl}/movies/${movieId}/details?userId=${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const fetchSimilarMovies = async (movieId: string) => {
  const response = await fetch(`${baseUrl}/movies/${movieId}/similar`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const fetchReviews = async (movieId: string) => {
  const response = await fetch(`${baseUrl}/movies/${movieId}/reviews`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const useUserBanStatus = (userId: number, bannedUserId: number) => {
  return useQuery(['banStatus', userId, bannedUserId], async () => {
    const response = await fetch(
      `${baseUrl}/users/${userId}/isBanned/${bannedUserId}`
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.isBanned;
  });
};

const MovieDetail = () => {
  const { movieId } = useParams<MovieIdParams>();
  const userId = getUserId();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [ratingKey, setRatingKey] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewUpdated, setReviewUpdated] = useState(false);

  const {
    data: movieData,
    isLoading: isMovieLoading,
    isError: isMovieError,
    error: movieError,
  } = useQuery(
    ['movieDetails', movieId],
    () => fetchMovieDetails(movieId as string),
    { enabled: !!movieId }
  );

  const {
    data: similarMovies,
    isLoading: isSimilarLoading,
    isError: isSimilarError,
    error: similarError,
  } = useQuery(
    ['similarMovies', movieId],
    () => fetchSimilarMovies(movieId as string),
    { enabled: !!movieId }
  );

  const {
    data: reviews,
    isLoading: isReviewsLoading,
    isError: isReviewsError,
    error: reviewsError,
  } = useQuery(
    ['movieReviews', movieId],
    () => fetchReviews(movieId as string),
    { enabled: !!movieId }
  );

  const banMutation = useMutation(
    async (bannedUserId: number) => {
      const response = await fetch(`${baseUrl}/ban-writer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: getUserId(), bannedUserId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to ban writer');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['movieReviews', movieId]);
        alert('Writer banned');
        setReviewUpdated((prev) => !prev);
      },
      onError: (error: Error) => {
        alert(error.message || 'Failed to ban writer. Please try again later.');
      },
    }
  );

  const unbanMutation = useMutation(
    async (bannedUserId: number) => {
      const response = await fetch(`${baseUrl}/unban-writer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: getUserId(), bannedUserId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unban writer');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['movieReviews', movieId]);
        alert('Writer unbanned and ratings updated');
        setReviewUpdated((prev) => !prev);
      },
      onError: (error: Error) => {
        alert(
          error.message || 'Failed to unban writer. Please try again later.'
        );
      },
    }
  );

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleCommentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setComment(event.target.value);
  };

  const handleSubmit = async () => {
    const user_id = getUserId();

    try {
      // Check if either rating or comment is missing
      if (!comment) {
        alert('Please atlest provide a comment.');
        return;
      }

      const response = await fetch(`${baseUrl}/movies/${movieId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, rating, comment }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error) {
          setErrorMessage(data.error);
        } else {
          throw new Error('Failed to submit your rating.');
        }
        return;
      }

      // Clear form fields and reset the state
      setRating(0);
      setComment('');
      setSubmitted(false);
      setRatingKey((prevKey) => prevKey + 1);

      alert('Thank you for your feedback!');
      setReviewUpdated((prev) => !prev);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const stars = movieData ? JSON.parse(movieData.stars) : [];
  const writers = movieData ? JSON.parse(movieData.writers) : [];
  const genres = movieData ? JSON.parse(movieData.genres) : [];
  const marked_for_deletion = movieData
    ? JSON.parse(movieData.marked_for_deletion)
    : '';

  const renderError = (error: unknown) => {
    if (error instanceof Error) {
      return <div>Error: {error.message}</div>;
    }
    return <div>An unknown error occurred</div>;
  };

  const BanToggleButton = ({ reviewUserId }: { reviewUserId: number }) => {
    const { data: isBanned, isLoading } = useUserBanStatus(
      userId as number,
      reviewUserId
    );

    const buttonToShow = useMemo(() => {
      if (isLoading && userId) {
        return <Button disabled>Loading...</Button>;
      }
      if (isBanned && userId) {
        return (
          <Button
            variant="warning"
            onClick={() => unbanMutation.mutate(reviewUserId)}
            disabled={unbanMutation.isLoading}
          >
            {unbanMutation.isLoading ? 'Unbanning...' : 'Un-Ban Writer'}
          </Button>
        );
      }
      if (userId && userId != reviewUserId) {
        return (
          <Button
            variant="primary"
            onClick={() => banMutation.mutate(reviewUserId)}
            disabled={banMutation.isLoading}
          >
            {banMutation.isLoading ? 'Banning...' : 'Ban User'}
          </Button>
        );
      }
    }, [isBanned, isLoading, reviewUserId]);

    return buttonToShow;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (reviews) {
      console.log(reviews);
    }
    if (movieData) {
      console.log(movieData);
      movieData.marked_for_deletion;
    }
  }, [movieId, reviews, movieData]);

  return (
    <Layout>
      <Container>
        <div className="movie">
          <header className="movie-name">
            {isMovieLoading ? (
              <h2>Loading...</h2>
            ) : isMovieError ? (
              <h2>{renderError(movieError)}</h2>
            ) : (
              <div className="d-flex justify-content-between align-items-end">
                <h2>{movieData.movie_title}</h2>
                <ReviewSummary
                  movieId={Number(movieId)}
                  userId={userId}
                  reviewUpdated={reviewUpdated}
                />
              </div>
            )}
          </header>
          <div className="movie-visual">
            {marked_for_deletion === 1 ? (
              <Alert key="warning" variant="warning">
                The movie will be soon deleted form our database.
              </Alert>
            ) : null}

            <Row>
              <Col md={4}>
                <div className="movie-poster">
                  <figure className="image-container">
                    {isMovieLoading ? (
                      <div>Loading...</div>
                    ) : isMovieError ? (
                      renderError(movieError)
                    ) : (
                      <img src={movieData.poster} alt={movieData.movie_title} />
                    )}
                  </figure>
                </div>
              </Col>
              <Col md={8}>
                <div className="video-container">
                  {isMovieLoading ? (
                    <div>Loading...</div>
                  ) : isMovieError ? (
                    renderError(movieError)
                  ) : (
                    <iframe
                      width="100%"
                      height="auto"
                      src={movieData.trailer}
                      title={movieData.movie_title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
              </Col>
            </Row>
          </div>
          {isMovieLoading ? (
            <div>Loading movie info...</div>
          ) : isMovieError ? (
            <div>{renderError(movieError)}</div>
          ) : (
            <MovieInfo
              avg_rating={movieData.custom_rating ?? movieData.average_rating}
              year={movieData.year}
              duration={movieData.duration}
              genres={genres}
            />
          )}
          <div className="description">
            {isMovieLoading ? (
              <div>Loading description...</div>
            ) : isMovieError ? (
              <div>{renderError(movieError)}</div>
            ) : (
              <p>{movieData.description}</p>
            )}
            <Row>
              <Col md={6}>
                <ul className="detail">
                  {isMovieLoading ? (
                    <div>Loading details...</div>
                  ) : isMovieError ? (
                    <div>{renderError(movieError)}</div>
                  ) : (
                    <>
                      <li>
                        <strong>Director:</strong> {movieData.director_name}
                      </li>
                      <li>
                        <strong>Writers: </strong>
                        <ul className="writers">
                          {writers.map((writer: Star) => (
                            <li key={writer.id}>{writer.name}</li>
                          ))}
                        </ul>
                      </li>
                      <li>
                        <strong>Stars: </strong>
                        <ul className="stars">
                          {stars.map((star: Star) => (
                            <li key={star.id}>{star.name}</li>
                          ))}
                        </ul>
                      </li>
                      <li>
                        <strong>Box office collection: </strong>$
                        {movieData.box_office_collection}
                      </li>
                      <li>
                        <strong>Budget: </strong>${movieData.budget}
                      </li>
                      <li>
                        <strong>Opening week: </strong>${movieData.opening_week}
                      </li>
                      <li>
                        <strong>Release Date: </strong>
                        {movieData.release_date}
                      </li>
                      <li>
                        <strong>Country of Origin: </strong>
                        {movieData.country_of_origin}
                      </li>
                    </>
                  )}
                </ul>
              </Col>
              <Col md={6}>
                <div className="rate">
                  <h4>Rate this movie:</h4>
                  <ReactStars
                    key={ratingKey}
                    count={5}
                    onChange={handleRatingChange}
                    size={50}
                    activeColor="#ffd700"
                    value={rating}
                    isHalf={true}
                  />
                  <Form>
                    <Form.Control
                      className="comment"
                      as="textarea"
                      rows={6}
                      value={comment}
                      onChange={handleCommentChange}
                      placeholder="Write your comment here..."
                    />
                  </Form>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitted}
                  >
                    {submitted ? 'Submitted' : 'Submit'}
                  </Button>
                  {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
          <div className="reviews">
            <SectionTitle icon={faComment} title="Reviews" />
            <Container>
              <Row>
                {isReviewsLoading ? (
                  <div>Loading reviews...</div>
                ) : isReviewsError ? (
                  <div>{renderError(reviewsError)}</div>
                ) : (
                  <ListGroup variant="flush">
                    {reviews.length > 0
                      ? reviews.map((review: Review) => (
                          <ListGroup.Item
                            key={review.review_id}
                            className="d-flex align-items-center justify-content-between"
                          >
                            <div className="review_body">
                              <h3>
                                <Link
                                  to={`/userprofile/${review.user_id}/${review.full_name}`}
                                >
                                  {review.full_name}
                                </Link>
                              </h3>
                              <div className="stars">
                                <ReactStars
                                  key={ratingKey}
                                  count={5}
                                  value={review.rating}
                                  size={24}
                                  activeColor="#ffd700"
                                  edit={false}
                                  isHalf={true}
                                />
                              </div>
                              <p>{review.written_review}</p>
                            </div>
                            <BanToggleButton
                              reviewUserId={review.user_id}
                              userId={userId}
                            />
                          </ListGroup.Item>
                        ))
                      : 'No reviews available'}
                  </ListGroup>
                )}
              </Row>
            </Container>
          </div>
          <div className="similarMovies">
            <SectionTitle icon={faFilm} title="Similar Movies" />
            <Row>
              {isSimilarLoading ? (
                <div>Loading similar movies...</div>
              ) : isSimilarError ? (
                <div>{renderError(similarError)}</div>
              ) : (
                similarMovies.map((movie: any) => (
                  <Col sm={6} md={3} key={movie.movie_id}>
                    <MovieCard movie={movie} />
                  </Col>
                ))
              )}
            </Row>
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default MovieDetail;
