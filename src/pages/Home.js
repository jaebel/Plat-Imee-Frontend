import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{
      padding: '2em',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2em'
    }}>
      <div>
        <h1>Welcome to Plat-Imee</h1>
        <p>Your personal anime discovery and recommendation platform.</p>
      </div>

      <div style={{
        display: 'flex',
        gap: '2em',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Link to="/top" style={{
          padding: '1em 2em',
          backgroundColor: '#333',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '1.1em',
          borderRadius: '8px',
          minWidth: '180px',
          textAlign: 'center'
        }}>
          Top Anime
        </Link>

        <Link to="/browse-genre" style={{
          padding: '1em 2em',
          backgroundColor: '#333',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '1.1em',
          borderRadius: '8px',
          minWidth: '180px',
          textAlign: 'center'
        }}>
          Browse by Genre
        </Link>

        <Link to="/all-anime" style={{
          padding: '1em 2em',
          backgroundColor: '#333',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '1.1em',
          borderRadius: '8px',
          minWidth: '180px',
          textAlign: 'center'
        }}>
          All Anime
        </Link>
      </div>
    </div>
  );
};

export default Home;
