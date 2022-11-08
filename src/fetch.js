import axios, { isCancel, AxiosError } from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('form');
const gallery = document.querySelector('.gallery');
const photoCard = document.querySelector('.photo-card');
const loadMoreBtn = document.querySelector('.load-more');
const buttonContainer = document.querySelector('.button-container');

let q;
let per_page = 40;
let page = 1;

form.addEventListener('submit', handlesubmit);

function handlesubmit(event) {
  event.preventDefault();
  q = form.elements.searchQuery.value;

  fetchPictures().then(pictures => {
    console.log(pictures);
    console.log(pictures.totalHits);
    const totalPages = pictures.totalHits / per_page;
    console.log(totalPages);

    if (pictures.totalHits > 0) {
      renderImages(pictures);
      Notify.success(`totalHits: ${pictures.totalHits}`);
    } else
      Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );

    if (page < totalPages) {
      buttonContainer.classList.remove('is-hidden');
      console.log(`${page}`);
    }

    loadMoreBtn.addEventListener('click', () => {
      // Check the end of the collection to display an alert
      page += 1;
      console.log(page);
      if (page > totalPages) {
        buttonContainer.classList.add('is-hidden');
        return Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }

      fetchPictures()
        .then(pictures => {
          renderImages(pictures);
        })
        .catch(error => console.log(error));
    });
  });
}

function renderImages(pictures) {
  let markup = '';
  gallery.innerHTML = '';
  const hits = pictures.hits;
  hits.forEach(hit => {
    markup += `<div class="photo-card" style="border:gainsboro;border-width:1px;border-style:solid;border-radius:5px"><a class="lightbox" href="${hit.largeImageURL}"><img style="object-fit:cover;" src="${hit.webformatURL}" alt=${hit.tags} loading="lazy" width=263px height="176px" 
          /></a>
             <div class="info"><p class="info-item"><b>Likes</b>${hit.likes}
             </p><p class="info-item"><b>Views</b>${hit.views}</p><p class="info-item">
             <b>Comments</b>${hit.comments}</p><p class="info-item"><b>Downloads</b>${hit.downloads}</p>
             </div></div>`;
  });
  gallery.innerHTML = markup;

  let LightboxGallery = new SimpleLightbox('.gallery a');
  LightboxGallery.on('show.simplelightbox');
  LightboxGallery.defaultOptions.captionsData = 'alt';

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
    q: q,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: per_page,
    page: page,
  });
  const URL = `https://pixabay.com/api/?${params}`;
  const response = await fetch(`${URL}`);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const pictures = await response.json();
  return pictures;
}
