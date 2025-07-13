import './style.css';


const bannerEl = document.getElementById('banner');
const bannerUrl = 'https://source.unsplash.com/1600x400/?technology';
bannerEl.style.backgroundImage = `url('${bannerUrl}')`;


window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  bannerEl.style.backgroundPositionY = `${scrollY * 0.3}px`;
});


document.querySelectorAll("nav a").forEach(link => {
  if (link.textContent.trim().toLowerCase() === "ideas") {
    link.classList.add("border-b-2", "border-white");
  }
});


let lastScrollTop = 0;
const header = document.getElementById("main-header");

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;
  if (currentScroll > lastScrollTop) {
    header.classList.add("opacity-0", "-translate-y-full");
    header.classList.remove("backdrop-blur", "bg-opacity-80");
  } else {
    header.classList.remove("opacity-0", "-translate-y-full");
    header.classList.add("backdrop-blur", "bg-opacity-80");
  }
  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});


const postList = document.getElementById('post-list');
const sortSelect = document.getElementById('sort');
const perPageSelect = document.getElementById('perPage');
const paginationInfo = document.getElementById('pagination-info');
const paginationControls = document.getElementById('pagination-controls');
const paginationSummary = document.getElementById('pagination-summary');

let currentPage = Number(localStorage.getItem('page')) || 1;
let sort = localStorage.getItem('sort') || sortSelect.value;
let perPage = localStorage.getItem('perPage') || perPageSelect.value;

sortSelect.value = sort;
perPageSelect.value = perPage;

async function fetchPosts(page = 1) {
  const url = `/api/ideas?page[number]=${page}&page[size]=${perPage}&append[]=small_image&append[]=medium_image&sort=${sort}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const data = await res.json();
    const posts = data.data;
    const meta = data.meta;

    postList.innerHTML = '';

    posts.forEach(post => {
      const imageUrl = post?.medium_image?.url || 'https://via.placeholder.com/400x225?text=No+Image';
      const title = post.title;
      const date = new Date(post.published_at).toLocaleDateString();

      const card = `
        <div class="bg-white rounded-lg shadow p-4">
          <img loading="lazy" src="${imageUrl}" alt="${title}" class="w-full aspect-video object-cover rounded mb-2">
          <p class="text-sm text-gray-500">${date}</p>
          <h2 class="text-lg font-semibold mt-1 line-clamp-3">${title}</h2>
        </div>
      `;

      postList.innerHTML += card;
    });

    paginationInfo.innerText = `Page ${meta.current_page} of ${meta.last_page}`;
    paginationSummary.innerText = `Showing ${meta.from}–${meta.to} of ${meta.total}`;

    paginationControls.innerHTML = '';
    for (let i = 1; i <= meta.last_page; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = `px-3 py-1 rounded border text-sm font-medium ${i === meta.current_page ? 'bg-orange-500 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'}`;
      btn.addEventListener('click', () => {
        currentPage = i;
        localStorage.setItem('page', currentPage);
        fetchPosts(currentPage);
      });
      paginationControls.appendChild(btn);
    }

    localStorage.setItem('page', page);
    localStorage.setItem('sort', sort);
    localStorage.setItem('perPage', perPage);
  } catch (err) {
    console.error('Gagal fetch:', err);
    postList.innerHTML = '<p class="text-red-500">Gagal mengambil data.</p>';
  }
}


sortSelect.addEventListener('change', () => {
  sort = sortSelect.value;
  localStorage.setItem('sort', sort);
  fetchPosts(1);
});

perPageSelect.addEventListener('change', () => {
  perPage = perPageSelect.value;
  localStorage.setItem('perPage', perPage);
  fetchPosts(1);
});


window.addEventListener('DOMContentLoaded', () => {
  fetchPosts(currentPage);
});
