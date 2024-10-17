import React, { useEffect, useState } from 'react';
import { Col, Container, Row, Spinner, Alert } from 'react-bootstrap';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

type NewsItem = {
  id: number;
  title: string;
  image: string;
  paragraph: string;
};

const serverUrl = 'http://localhost:3000';

const NewsList = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch news data from the API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data); // Assuming the API returns an array of news items
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="newsList">
      <Container>
        <SectionTitle title="Top News" icon={faGlobe} />

        {/* Loading state */}
        {isLoading && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        )}

        {/* Error state */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Display the list of news when data is loaded */}
        {!isLoading && !error && (
          <ul className="news-items">
            {news.map((newsItem) => (
              <li key={newsItem.id} className="news-item">
                <Link to={`/news/${newsItem.id}`}>
                  <Row>
                    <Col md={3}>
                      <figure>
                        <img
                          src={`${serverUrl}${newsItem.image}`}
                          alt={newsItem.title}
                        />
                      </figure>
                    </Col>
                    <Col md={9}>
                      <div className="news-body">
                        <h3>{newsItem.title}</h3>
                        <p>{newsItem.paragraph}</p>
                      </div>
                    </Col>
                  </Row>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
};

export default NewsList;
