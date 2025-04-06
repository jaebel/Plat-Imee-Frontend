import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import AnimeList from './pages/AnimeList';
import AnimeDetails from './pages/AnimeDetails';
import MyAnimeList from './pages/MyAnimeList';
import SearchAnime from './pages/SearchAnime';
import TopAnime from './pages/TopAnime';
import BrowseByGenre from './pages/BrowseByGenre';
import EditProfile from './pages/EditProfile';
import Recommendations from './pages/Recommendations';
import AllAnime from './pages/AllAnime';
import UpcomingAnime from './pages/UpcomingAnime'; // ✅ Import added

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<SearchAnime />} />
          <Route path="/top" element={<TopAnime />} />
          <Route path="/upcoming" element={<UpcomingAnime />} />
          <Route path="/browse-genre" element={<BrowseByGenre />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/anime" element={<AnimeList />} />
          <Route path="/all-anime" element={<AllAnime />} />
          
          {/* Protected routes */}
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/my-anime" 
            element={
              <PrivateRoute>
                <MyAnimeList />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <PrivateRoute>
                <Recommendations />
              </PrivateRoute>
            }
          />
          
          <Route path="/anime/:id" element={<AnimeDetails />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
