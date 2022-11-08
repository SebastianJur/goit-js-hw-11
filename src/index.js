import axios, { isCancel, AxiosError, Axios } from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('form');
const gallery = document.querySelector('.gallery');
const photoCard = document.querySelector('.photo-card');
const loadMoreBtn = document.querySelector('.load-more');
const buttonContainer = document.querySelector('.button-container');

let search_term;
let per_page = 10;
let page = 1;
let numberOfSubmits = 0;
let totalPages;

form.addEventListener('submit', () => {
  numberOfSubmits += 1;
});

form.addEventListener('submit', handlesubmit);

function handlesubmit(event) {
  event.preventDefault();
  gallery.innerHTML = '';
  search_term = form.elements.searchQuery.value;

  fetchPictures().then(function (response) {
    totalPages = response.data.totalHits / per_page;

    if (page < totalPages) {
      buttonContainer.classList.remove('is-hidden');
      console.log(`page:${page}`);
      console.log(`totalPages:${totalPages}`);
    }

    if ((response.data.totalHits > 0) & (numberOfSubmits === 1)) {
      renderImages(response);
      return Notify.success(`totalHits: ${response.data.totalHits}`);
    }
    if ((response.data.totalHits > 0) & (numberOfSubmits > 1)) {
      renderImages(response);
      Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    } else Notify.info('Sorry, there are no images matching your search query. Please try again.');
  });

  loadMoreBtn.addEventListener('click', () => {
    // Check the end of the collection to display an alert
    page += 1;
    console.log(`page:${page}`);
    if (page > totalPages) {
      buttonContainer.classList.add('is-hidden');
      return Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }

    fetchPictures()
      .then(function (response) {
        renderImages(response);
        //Scroll function
        const { height: cardHeight } = document
          .querySelector('.gallery')
          .firstElementChild.getBoundingClientRect();

        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });
      })
      .catch(error => console.log(error));
  });
}

function renderImages(response) {
  let markup = '';
  const hits = response.data.hits;
  hits.forEach(hit => {
    markup += `<div class="photo-card" style="border:gainsboro;border-width:1px;border-style:solid;border-radius:5px"><a class="lightbox" href="${hit.largeImageURL}"><img style="object-fit:cover;" src="${hit.webformatURL}" alt=${hit.tags} loading="lazy" width=263px height="176px" 
          /></a>
             <div class="info"><p class="info-item"><b>Likes</b>${hit.likes}
             </p><p class="info-item"><b>Views</b>${hit.views}</p><p class="info-item">
             <b>Comments</b>${hit.comments}</p><p class="info-item"><b>Downloads</b>${hit.downloads}</p>
             </div></div>`;
  });

  gallery.insertAdjacentHTML('beforeend', markup);

  let LightboxGallery = new SimpleLightbox('.gallery a');
  LightboxGallery.on('show.simplelightbox');
  LightboxGallery.defaultOptions.captionsData = 'alt';
  LightboxGallery.refresh();

  LightboxGallery.defaultOptions.captionDelay = 250;
  document.addEventListener('keyup', event => {
    if (event.code === 'Escape') {
      LightboxGallery.close;
    }
  });
}

async function fetchPictures() {
  let params = new URLSearchParams({
    key: '30974723-e837a19c04863567111943fb7',
    q: search_term,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: per_page,
    page: page,
  });
  const URL = `https://pixabay.com/api/?${params}`;
  try {
    const response = await axios.get(`${URL}`);
    return response;
  } catch (error) {
    console.error(error);
  }
}