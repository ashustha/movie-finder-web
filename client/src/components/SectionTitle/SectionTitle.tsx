
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
interface Props {
    title: string; 
    icon : IconDefinition;
  }

const SectionTitle: React.FC<Props> = (props) => {

    const {title,icon} = props
    return ( 
        <header className="sectionTitle">
            <h2><span><FontAwesomeIcon icon={icon} /></span>{title}</h2>
        </header>
     );
}
 
export default SectionTitle;