import { Container } from "react-bootstrap";
import Layout from "../../layout";
import UserChart from "../../components/Charts/UserChart";
import './Dashboard.scss';

const Dashboard= () => {
    return ( 
        <>
            <Layout>
                <div className="dashboard">
                    <Container>
                        <header>
                            <h2>Dashboard</h2>
                        </header>
                        <h2>Registered Users</h2>
                        <UserChart />
                    </Container>
                </div>
            </Layout>
        </>
     );
}
 
export default Dashboard;
