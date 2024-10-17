import { Alert, Container } from 'react-bootstrap';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Layout from '../../layout';
import './UpdateMovies.scss';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

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

interface Genre {
  genre_id: number;
  genre_name: string;
}

const UpdateMovies = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    director_id: '',
    year: '',
    duration: '',
    budget: '',
    release_date: '',
    country_of_origin: '',
    opening_week: '',
    box_office_collection: '',
    description: '',
    poster: '',
    banner: '',
    trailer: '',
    writer_ids: [],
    star_ids: [],
    genre_ids: [],
  });

  const [directors, setDirectors] = useState<Director[]>([]);
  const [writers, setWriters] = useState<Writer[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [directorsRes, writersRes, starsRes, genresRes] =
          await Promise.all([
            fetch('http://localhost:3000/api/directors'),
            fetch('http://localhost:3000/api/writers'),
            fetch('http://localhost:3000/api/stars'),
            fetch('http://localhost:3000/api/genres'),
          ]);

        const [directorsData, writersData, starsData, genresData] =
          await Promise.all([
            directorsRes.json(),
            writersRes.json(),
            starsRes.json(),
            genresRes.json(),
          ]);

        setDirectors(directorsData);
        setWriters(writersData);
        setStars(starsData);
        setGenres(genresData);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0]; // Converts to YYYY-MM-DD
  };

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/movies/${id}`);
        const data = await response.json();
        console.log(data);

        if (response.ok) {
          const { movie, writers, stars, genres } = data;
          console.log(movie);
          setFormData({
            title: movie.title,
            director_id: movie.director_id,
            year: movie.year,
            duration: movie.duration,
            budget: movie.budget,
            release_date: formatDate(movie.release_date),
            country_of_origin: movie.country_of_origin,
            opening_week: movie.opening_week,
            box_office_collection: movie.box_office_collection,
            description: movie.description,
            poster: movie.poster,
            banner: movie.banner,
            trailer: movie.trailer,
            writer_ids: writers?.map((writer: Writer) => writer.writer_id),
            star_ids: stars?.map((star: Star) => star.star_id),
            genre_ids: genres?.map((genre: Genre) => genre.genre_id),
          });
        } else {
          console.error('Error fetching movie:', data.error);
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
      }
    };

    fetchMovie();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    type: 'writer_ids' | 'star_ids' | 'genre_ids'
  ) => {
    const { options } = e.target;
    const selectedValues = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    setFormData({ ...formData, [type]: selectedValues });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3000/api/movies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Movie updated successfully:', result);

        // Show success alert
        setAlertMessage('Movie updated successfully!');
        setShowAlert(true);

        // Hide alert after 5 seconds
        setTimeout(() => setShowAlert(false), 5000);
        navigate('/movies');
      } else {
        console.error('Error updating movie:', result.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const markForDeletion = async (movieId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/movies/mark-for-deletion/${movieId}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        alert('Movie marked for deletion!');
      } else {
        alert('Error marking movie for deletion');
      }
    } catch (error) {
      console.error('Error marking movie for deletion:', error);
    }
  };

  return (
    <>
      <Layout>
        <div className="updateMovie">
          <Container>
            <header>
              <h2>Update Movie</h2>
            </header>
            {showAlert && <Alert variant="success">{alertMessage}</Alert>}
            <div className="updateMovieBody">
              <button
                onClick={() => markForDeletion(id)}
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  cursor: 'pointer',
                }}
              >
                Mark for Deletion
              </button>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formTitle">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter Movie name"
                      required
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formDirector">
                    <Form.Label>Director</Form.Label>
                    <Form.Select
                      name="director_id"
                      value={formData.director_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Director</option>
                      {directors.map((director) => (
                        <option
                          key={director.director_id}
                          value={director.director_id}
                        >
                          {director.director_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formYear">
                    <Form.Label>Year</Form.Label>
                    <Form.Control
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      placeholder="Enter Movie release year"
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} controlId="formDuration">
                    <Form.Label>Duration</Form.Label>
                    <Form.Control
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="Enter Length of the Movie"
                      required
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formBudget">
                    <Form.Label>Budget</Form.Label>
                    <Form.Control
                      type="text"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="Enter Movie Budget"
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} controlId="formReleaseDate">
                    <Form.Label>Release Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="release_date"
                      value={formData.release_date}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formCountry">
                    <Form.Label>Country of Origin</Form.Label>
                    <Form.Control
                      type="text"
                      name="country_of_origin"
                      value={formData.country_of_origin}
                      onChange={handleInputChange}
                      placeholder="Enter Movie Country of origin"
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} controlId="formOpeningWeek">
                    <Form.Label>Opening Week</Form.Label>
                    <Form.Control
                      type="text"
                      name="opening_week"
                      value={formData.opening_week}
                      onChange={handleInputChange}
                      placeholder="Enter Movie's opening week collection"
                      required
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formBoxOfficeCollection">
                    <Form.Label>Box Office Collection</Form.Label>
                    <Form.Control
                      type="text"
                      name="box_office_collection"
                      value={formData.box_office_collection}
                      onChange={handleInputChange}
                      placeholder="Enter Movie's total box office collection"
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} controlId="formPoster">
                    <Form.Label>Poster</Form.Label>
                    <Form.Control
                      type="url"
                      name="poster"
                      value={formData.poster}
                      onChange={handleInputChange}
                      placeholder="Enter Movie's poster link"
                      required
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formBanner">
                    <Form.Label>Banner</Form.Label>
                    <Form.Control
                      type="url"
                      name="banner"
                      value={formData.banner}
                      onChange={handleInputChange}
                      placeholder="Enter Movie's banner link"
                      required
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formTrailer">
                    <Form.Label>Trailer</Form.Label>
                    <Form.Control
                      type="url"
                      name="trailer"
                      value={formData.trailer}
                      onChange={handleInputChange}
                      placeholder="Enter Movie's trailer link"
                      required
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Enter Movie's short Description"
                      required
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formWriters">
                    <Form.Label>Writers</Form.Label>
                    <Form.Select
                      multiple
                      name="writer_ids"
                      onChange={(e) => handleMultiSelectChange(e, 'writer_ids')}
                      value={formData.writer_ids}
                    >
                      {writers.map((writer) => (
                        <option key={writer.writer_id} value={writer.writer_id}>
                          {writer.writer_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group as={Col} controlId="formStars">
                    <Form.Label>Stars</Form.Label>
                    <Form.Select
                      multiple
                      name="star_ids"
                      onChange={(e) => handleMultiSelectChange(e, 'star_ids')}
                      value={formData.star_ids}
                    >
                      {stars.map((star) => (
                        <option key={star.star_id} value={star.star_id}>
                          {star.star_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group as={Col} controlId="formGenres">
                    <Form.Label>Genres</Form.Label>
                    <Form.Select
                      multiple
                      name="genre_ids"
                      onChange={(e) => handleMultiSelectChange(e, 'genre_ids')}
                      value={formData.genre_ids}
                    >
                      {genres.map((genre) => (
                        <option key={genre.genre_id} value={genre.genre_id}>
                          {genre.genre_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Row>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </div>
          </Container>
        </div>
      </Layout>
    </>
  );
};

export default UpdateMovies;
