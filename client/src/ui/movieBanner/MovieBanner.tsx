import { Container } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';
import { Link } from 'react-router-dom';
import MovieInfo from '../../components/MovieInfo/MovieInfo';

const MovieBanner = () => {
    return ( 
        <Container>
            <Link to="/movieDetail">
                <Carousel className="movieBanner">
                    <Carousel.Item interval={500000}>
                        <figure>
                            <img src='./assets/avengers.jpg' />
                        </figure>
                        <Carousel.Caption>
                        <h3 className="movieName">Avengers</h3>
                        <MovieInfo />
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item interval={500000}>
                        <figure>
                            <img src='./assets/theHobbit.jpg' />
                        </figure>
                        <Carousel.Caption>
                        <h3 className="movieName">Second slide label</h3>
                        <MovieInfo />
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item interval={500000}>
                        <figure>
                            <img src='./assets/inception.jpg' />
                        </figure>
                        <Carousel.Caption>
                        <h3 className="movieName">Third slide label</h3>
                        <MovieInfo />
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>
            </Link>
        </Container>
     );
}
 
export default MovieBanner;