import { useState, useEffect } from "react";
import { Button, Container, Form, InputGroup, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../config";
import Modal from 'react-bootstrap/Modal';
import Tabs from 'react-bootstrap/Tabs';

interface Director {
  director_id: number;
  director_name: string;
}

interface Genre {
  genre_id: number;
  genre_name: string;
}

const Search = () => {
  const [query, setQuery] = useState('');
  const [directors, setDirectors] = useState<Director[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const navigate = useNavigate();

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    // Fetch directors when the component mounts
    const fetchDirectors = async () => {
      try {
        const response = await axios.get(`${baseUrl}/directors`);
        setDirectors(response.data);
      } catch (error) {
        console.error('Error fetching directors:', error);
      }
    };

    // Fetch genres when the component mounts
    const fetchGenres = async () => {
      try {
        const response = await axios.get(`${baseUrl}/genres`);
        setGenres(response.data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchDirectors();
    fetchGenres();
  }, []);

  const handleSearch = (queryParam: string, filterParam: string) => {
    navigate(`/searchresult?query=${queryParam}&filter=${filterParam}`);
    handleClose();
  };

  const filter = 'Movie';

  const isQueryEmpty = query.trim() === '';

  return (
    <div className="search">
      <Container>
        <div className="search-wrapper">
          <InputGroup>
            <Form.Control
              aria-label="Text input with dropdown button"
              placeholder="Search movie by its name."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button
              variant="outline-secondary"
              id="button-addon2"
              className="searchButton"
              onClick={() => handleSearch(query, filter)}
              disabled={isQueryEmpty}
            >
              Search
            </Button>
          </InputGroup>

          <a className="advanceSearch" onClick={handleShow}>
            Advance search
          </a>

          <Modal  aria-labelledby="contained-modal-title-vcenter"
      centered show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Search movie by its Genre or Director</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Tabs
                defaultActiveKey="genre"
                id="uncontrolled-tab-example"
                className="mb-3"
              >
                <Tab eventKey="genre" title="Genres">
                  <ul>
                    {genres.map((genre) => (
                      <li key={genre.genre_id} onClick={() => handleSearch(genre.genre_name, 'Genre')}>{genre.genre_name}</li>
                    ))}
                  </ul>
                </Tab>
                <Tab eventKey="director" title="Directors">
                  <ul>
                    {directors.map((director) => (
                      <li key={director.director_id} onClick={() => handleSearch(director.director_name, 'Director')}>{director.director_name}</li>
                    ))}
                  </ul>
                </Tab>
                
              </Tabs>
            </Modal.Body>
          </Modal>
        </div>
      </Container>
    </div>
  );
}

export default Search;
