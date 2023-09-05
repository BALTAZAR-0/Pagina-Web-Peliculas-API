const API_KEY = '29f0b439d5bc8454a555dba16acc0533';
let currentPage = 1;
let totalPages = 0;

async function getGenres(language) {
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=${language}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.genres; 
}

async function getPopularMovies(filters, language, page) {
  let url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=${language}&page=${page}`;
  
  if (filters.with_genres) {
    url += `&with_genres=${filters.with_genres}`;
  }

  const response = await fetch(url);
  const data = await response.json();
  totalPages = data.total_pages; // Actualizamos el número total de páginas
  return data.results;
}

async function showGenres() {
  const languageSelect = document.getElementById('language');
  const genres = await getGenres(languageSelect.value);

  let output = '';
  genres.forEach(genre => {
    output += `<option value="${genre.id}">${genre.name}</option>`;
  });

  document.getElementById('genres').innerHTML = output;
}

async function showMovies(filters = {}) {
  const languageSelect = document.getElementById('language');
  const movies = await getPopularMovies(filters, languageSelect.value, currentPage);

  let output = '';
  movies.forEach(movie => {
    output += `
      <div class="movie">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" />
        <h3>${movie.title}</h3>
        <p>${movie.overview}</p>  
      </div>
    `;
  });

  document.getElementById('movies').innerHTML = output;
}

function updatePagination() {
  const pagination = document.getElementById('pagination');
  const pages = document.getElementById('pages');

  pages.innerHTML = '';

  const maxVisiblePages = 10;
  let startPage = currentPage - Math.floor(maxVisiblePages / 2);
  if (startPage < 1) {
    startPage = 1;
  }
  let endPage = startPage + maxVisiblePages - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = endPage - maxVisiblePages + 1;
    if (startPage < 1) {
      startPage = 1;
    }
  }

  // Eliminar botones de página existentes
  const buttons = document.querySelectorAll('#pages button');
  buttons.forEach(button => button.remove());

  // Crear botón "Anterior"
  const prevButton = document.createElement('button');
  prevButton.innerHTML = '&#9664; Anterior';
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      showMovies();
      updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazarse al inicio de las películas
    }
  });
  prevButton.disabled = currentPage === 1; // Deshabilitar botón si estamos en la página 1
  pages.appendChild(prevButton);

// Crear botones de páginas
for (let i = startPage; i <= endPage; i++) {
  const pageButton = document.createElement('button');
  pageButton.innerText = i;
  pageButton.className = i === currentPage ? 'current-page-button' : 'pagination-button'; // Establecer clase según sea la página actual
  pageButton.addEventListener('click', () => {
    currentPage = i;
    showMovies();
    updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazarse al inicio de las películas
  });
  pages.appendChild(pageButton);
}

  // Crear botón "Siguiente"
  const nextButton = document.createElement('button');
  nextButton.innerHTML = 'Siguiente &#9654;';
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      showMovies();
      updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazarse al inicio de las películas
    }
  });
  pages.appendChild(nextButton);
}

document.getElementById('genres').addEventListener('change', async () => {
  currentPage = 1; // Reinicia la página a 1 al cambiar el género
  await showMovies({ with_genres: document.getElementById('genres').value });
  updatePagination();
});

document.getElementById('language').addEventListener('change', async () => {
  await showGenres();
  await showMovies();
  updatePagination();
});

// Llamar a showGenres y showMovies al cargar la página inicialmente
showGenres();
showMovies();
updatePagination();
