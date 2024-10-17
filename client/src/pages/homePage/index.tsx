import Layout from "../../layout";
import './homepage.scss';
import Container from 'react-bootstrap/Container';
import Top10ThisMonth from "../../ui/topRatedMovies/TopRatedMovies";
import MovieBanner from "../../ui/movieBanner/MovieBanner";
import TopBoxOffice from "../../ui/topBoxOffice/TopBoxOffice";
import MoreToExplore from "../../ui/moreToExplore/MoreToExplore";
import { Col, Row } from "react-bootstrap";
import InTheaters from "../../ui/inTheaters/InTheaters";
import ComingSoon from "../../ui/comingSoon/ComingSoon";
import NewsList from "../../ui/newsList/NewsList";


const Homepage = () => {
    return ( 
        <Layout >
            <div className="body">
                <MovieBanner />
                <Top10ThisMonth />
                <Container>
                    <Row>
                        <Col md={6}>
                            <TopBoxOffice />
                        </Col>
                        <Col md={6}>
                            <MoreToExplore />
                        </Col>
                    </Row>
                </Container>
                <Container>
                    <Row>
                        <Col md={6}>
                            <InTheaters />
                        </Col>
                        <Col md={6}>
                            <ComingSoon />
                        </Col>
                    </Row>
                </Container>
                <NewsList />
                <Container>
                    {/* <Row>
                        <Col md={12}>
                        <Link to="/actorDetail">
                        <button>Actor Detail</button>
                        </Link>
                        <Link to="/movieDetail">
                        <button>Movie Detail</button>
                        </Link>
                        </Col>
                    </Row> */}
                </Container>
            </div>
        </Layout>
     );
}
 
export default Homepage;
