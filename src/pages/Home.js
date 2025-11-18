import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleViewDetails } from '../utils/handleViewDetails';

const Home = () => {
  const [seasonalAnime, setSeasonalAnime] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('https://api.jikan.moe/v4/seasons/now')
      .then(res => setSeasonalAnime(res.data.data.slice(0, 6)))
      .catch(err => console.error('Failed to fetch seasonal anime:', err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#DEB8B8] font-semibold">
      {/* Main content - flex-grow to take up remaining space */}
      <main className="flex-grow flex flex-col items-center gap-8 p-8 text-center">
        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Plat-Imee</h1>
          <p className="text-lg text-[#36454F]">Your personal anime discovery and recommendation platform.</p>
        </div>

        {/* Navigation buttons */}
        <div
          className="
            flex flex-wrap justify-center gap-8
            [&>button]:px-8 [&>button]:py-4
            [&>button]:bg-[#333] [&>button]:text-white
            [&>button]:text-lg [&>button]:rounded-lg
            [&>button]:min-w-[180px]
            [&>button:hover]:bg-[#444]
            [&>button]:transition-colors [&>button]:duration-300
          "
        >
          <button onClick={() => navigate('/top')}>Top Anime</button>
          <button onClick={() => navigate('/genre-picker')}>Browse by Genre</button>
          <button onClick={() => navigate('/all-anime')}>All Anime</button>
          <button onClick={() => navigate('/upcoming')}>Upcoming Anime</button>
        </div>

        {/* Trending Section */}
        <div className="max-w-[1200px] my-8 px-2 w-full">
          <h2 className="text-xl text-left mb-4">
            <span
              onClick={() => navigate('/seasonal')}
              className="cursor-pointer hover:underline hover:text-[#36454F] transition-colors duration-200"
            >
              Trending This Season
            </span>
          </h2>

          <div className="flex flex-wrap justify-start gap-6">
            {seasonalAnime.map((anime) => (
              <div
                key={anime.mal_id}
                className="
                  w-44 flex flex-col items-center
                  transform transition-transform duration-200
                  hover:scale-105 hover:z-10
                "
              >
                <div className="w-full aspect-[2/3] overflow-hidden rounded-lg shadow-md">
                  <img
                    src={anime.images?.jpg?.image_url}
                    alt={anime.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleViewDetails(anime, navigate)}
                  />
                </div>
                <p
                  className="mt-2 text-sm text-center cursor-pointer text-black hover:text-[#36454F] transition-colors duration-200"
                  onClick={() => handleViewDetails(anime, navigate)}
                >
                  {anime.title_english || anime.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Info Section */}
      <footer className="relative w-full bg-[#36454F] text-white py-12 px-8 md:px-16">
        {/* Faded line */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-[#00000040] to-transparent" />
        <div className="flex flex-col md:flex-row justify-between gap-8 max-w-full mx-auto">
          <div className="flex-1 bg-[#516977] p-6 rounded-lg shadow-md text-center md:text-left">
            <h3 className="text-xl font-bold mb-2 underline">About Plat-Imee</h3>
            <p>Plat-Imee is a full-stack anime tracking and recommendation platform designed to offer a cleaner and more focused alternative to existing services.
              It uses a Spring Boot Kotlin backend alongside a React frontend to provide users with a reliable space to manage profiles, maintain watch lists,
              and browse titles without the visual clutter that tends to dominate similar platforms.
              The overall aim was straightforward: build something that feels organised, responsive, and genuinely usable.</p>
          </div>
          <div className="flex-1 bg-[#516977] p-6 rounded-lg shadow-md text-center md:text-left">
            <h3 className="text-xl font-bold mb-2 underline">Recommendations</h3>
            <p>At the centre of the recommendation microservice is a shallow neural network built in PyTorch implementing a matrix factorisation model.
              It learns by running inputs through a forward pass to produce rating predictions, then using backpropagation to measure the error and update its parameters before its next attempt. <br/><br/>
              
              The model stays deliberately simple. It uses embedding layers to map user IDs and anime IDs into dense vectors that capture latent factors,
              plus bias terms for both users and anime to account for consistent rating tendencies. A final prediction is the dot product of the two embeddings with their biases added. <br/><br/>
              
              Recommendations in Plat-Imee are based entirely on the user’s anime list. Rather than retraining the model every time a new user appears,
              the system generates temporary embeddings for all users by averaging the embeddings of the anime they have rated, weighted by their scores.
              This gives quick, on-the-fly user representations without any additional training.
              The trade-off is that users cannot receive recommendations based on anime the model was never trained on given that the temporary embedding can only be built from known item vectors.
              As a result, each user must have at least one rated anime that exists in the training dataset for recommendations to work. <br/><br/>
              
              Cold-start performance was measured through an evaluation script that withholds each user’s highest-rated anime (rating ≥ 7) and checks whether it appears in the top-10 recommendations. <br/><br/>
              
              Hyperparameters such as embedding size, learning rate, weight decay, and epoch count were tuned separately using an Optuna optimisation script with a clear train/validation split.
              The best-performing configuration was then used to retrain the final model deployed in Plat-Imee, replacing earlier guesswork with a setup grounded in actual validation performance.</p>
          </div>
          <div className="flex-1 bg-[#516977] p-6 rounded-lg shadow-md text-center md:text-left">
            <h3 className="text-xl font-bold mb-2 underline">Developer notes</h3>
            <p>This project was an opportunity to improve my skills in several areas:</p> <br/>
            <ul>
              <li><strong>Frontend:</strong> React, JavaScript, HTML, CSS, and Tailwind CSS – creating responsive, interactive, and user-friendly interfaces.</li><br/>
              <li><strong>Backend:</strong> Kotlin, Spring Boot, and Gradle – developing RESTful APIs with a focus on reliability and scalability, supported by Test-Driven Development (TDD) for robust and maintainable code I can have confidence in.</li><br/>
              <li><strong>Recommendation Microservice:</strong> Python and PyTorch – building machine learning models to deliver personalised recommendations efficiently.</li><br/>
              <li><strong>Deployment & DevOps:</strong> Docker and Git – containerizing applications for consistent environments, simplifying deployment, and managing version control effectively.</li><br/>
            </ul>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
