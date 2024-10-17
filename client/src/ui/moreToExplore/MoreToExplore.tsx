import { faChevronRight, faCrown } from "@fortawesome/free-solid-svg-icons";
import SectionTitle from "../../components/SectionTitle/SectionTitle";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MoreToExplore = () => {
    return ( 
        <div className="moreToExplore">
            <SectionTitle title="More to Explore" icon={faCrown} />
            <div className="moreToExplore--wrapper">
                <ul>
                    <li>
                        <h3><Link to='/'>Most popular Movies <FontAwesomeIcon className="arrow-icon" icon={faChevronRight} /></Link> </h3>
                        <p>As determined by average rating</p>
                    </li>
                    <li>
                        <h3><Link to='/'>Most popular Celebraties <FontAwesomeIcon className="arrow-icon" icon={faChevronRight} /></Link> </h3>
                        <p>As determined by average rating</p>
                    </li>
                    <li>
                        <h3><Link to='/'>Hot news <FontAwesomeIcon className="arrow-icon" icon={faChevronRight} /></Link></h3>
                        <p>As determined by average rating</p>
                    </li>
                    <li>
                        <h3><Link to='/'>Lowest Rated Movies <FontAwesomeIcon className="arrow-icon" icon={faChevronRight} /></Link></h3>
                        <p>As determined by average rating</p>
                    </li>
                </ul>
            </div>
        </div>
     );
}
 
export default MoreToExplore;