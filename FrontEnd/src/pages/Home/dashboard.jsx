import Hero from '../../components/Home/heroSection.jsx';
import PopularSearches from '../../components/Home/popularSearches.jsx';
import Footer from '../../components/Footer/index.jsx';


export const Dashboard = () => {
  return (
    <div className=''>
      <Hero />
      <PopularSearches/>
      <Footer/>
    </div>
  );
}
