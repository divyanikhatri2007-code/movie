const API_URL = "http://localhost:3000/movies";

const movieListDiv = document.getElementById("movie-list");
const searchInput = document.getElementById("search-input");
const form = document.getElementById("add-movie-form");

let allMovies = [];

fetchMovies();
async function fetchMovies() {
  try {
    const res = await fetch(API_URL);
    allMovies = await res.json();
    renderMovies(allMovies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    movieListDiv.innerHTML = "<p class='no-movies'>Error loading movies. Please check if json-server is running.</p>";
  }
}

function renderMovies(moviesToDisplay) {
  movieListDiv.innerHTML = "";

  if (moviesToDisplay.length === 0) {
    movieListDiv.innerHTML = "<p class='no-movies'>No movies found. Try a different search or add a new movie.</p>";
    return;
  }

  moviesToDisplay.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("movie-item"); 
    div.dataset.id = movie.id;

    div.innerHTML = `
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p><strong>Genre:</strong> ${movie.genre}</p>
        <p><strong>Year:</strong> ${movie.year}</p>
      </div>
      <div class="movie-actions">
        <button class="edit-btn" data-id="${movie.id}">Edit</button>
        <button class="delete-btn" data-id="${movie.id}">Delete</button>
      </div>
    `;

    movieListDiv.appendChild(div);
  });
}
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const genre = document.getElementById("genre").value.trim();
  const year = document.getElementById("year").value.trim();

  if (!title || !year) {
    alert("Title and Year are required!");
    return;
  }
  const yearNum = parseInt(year);
  if (yearNum < 1900 || yearNum > 2025) {
    alert("Please enter a valid year between 1900 and 2025");
    return;
  }

  const newMovie = { 
    title, 
    genre: genre || "Not specified", 
    year: yearNum.toString() 
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMovie),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    form.reset();
    fetchMovies();
  } catch (error) {
    console.error("Error adding movie:", error);
    alert("Failed to add movie. Please try again.");
  }
});
movieListDiv.addEventListener("click", async (e) => {
  const target = e.target;
  const id = target.dataset.id;
  
  if (!id) return;

  if (target.classList.contains("delete-btn")) {
    if (!confirm("Are you sure you want to delete this movie?")) {
      return;
    }
    
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      fetchMovies();
    } catch (error) {
      console.error("Error deleting movie:", error);
      alert("Failed to delete movie.");
    }
  }
  
  if (target.classList.contains("edit-btn")) {
    const movie = allMovies.find((m) => m.id.toString() === id.toString());
    
    if (!movie) {
      alert("Movie not found!");
      return;
    }

    const updatedTitle = prompt("Edit movie title:", movie.title);
    if (updatedTitle === null) return;
    
    const updatedGenre = prompt("Edit genre:", movie.genre);
    if (updatedGenre === null) return;
    
    const updatedYear = prompt("Edit year:", movie.year);
    if (updatedYear === null) return;

    if (updatedTitle && updatedGenre && updatedYear) {
      const yearNum = parseInt(updatedYear);
      if (yearNum < 1900 || yearNum > 2025) {
        alert("Please enter a valid year between 1900 and 2025");
        return;
      }

      try {
        await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: updatedTitle,
            genre: updatedGenre,
            year: updatedYear.toString()
          }),
        });
        fetchMovies();
      } catch (error) {
        console.error("Error updating movie:", error);
        alert("Failed to update movie.");
      }
    }
  }
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();

  const filteredMovies = allMovies.filter((movie) =>
    movie.title.toLowerCase().includes(query) ||
    movie.genre.toLowerCase().includes(query)
  );

  renderMovies(filteredMovies);
});