// share.js - handles story submissions, image previews, and on-page display using localStorage

(function () {
  const form = document.getElementById('share-form');
  const photosInput = document.getElementById('photos');
  const preview = document.getElementById('photo-preview');
  const storiesList = document.getElementById('stories-list');
  const STORAGE_KEY = 'staffyStories:v1';

  function getStoredStories() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to parse stored stories', e);
      return [];
    }
  }

  function setStoredStories(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save stories (possibly storage quota)', e);
      alert('Could not save your story due to storage limits. Your story will still be shown for this session.');
    }
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderStories(items) {
    storiesList.innerHTML = '';
    if (!items || items.length === 0) {
      const empty = el('p', 'empty', 'No stories yet. Be the first to share!');
      storiesList.appendChild(empty);
      return;
    }

    // Newest first
    const sorted = [...items].sort((a, b) => b.createdAt - a.createdAt);

    for (const story of sorted) {
      const card = el('article', 'card');
      // Expose a stable anchor so links can target individual stories
      if (story.id) {
        card.id = `story-${story.id}`;
      }

      const header = el('div', 'card-header');
      const title = el('h3', null, `${story.dogName} (${story.breed}, ${story.age} yrs)`);
      const meta = el('p', 'meta', `By ${story.ownerName} • ${story.phone}`);
      header.appendChild(title);
      header.appendChild(meta);

      const body = el('div', 'card-body');
      const storyText = el('p');
      storyText.textContent = story.story; // prevent HTML injection
      body.appendChild(storyText);

      if (story.photos && story.photos.length) {
        const gallery = el('div', 'gallery');
        for (const src of story.photos) {
          const img = new Image();
          img.src = src;
          img.alt = `${story.dogName} photo`;
          img.loading = 'lazy';
          gallery.appendChild(img);
        }
        body.appendChild(gallery);
      }

      card.appendChild(header);
      card.appendChild(body);
      storiesList.appendChild(card);
    }
  }

  function clearPreview() {
    if (preview) preview.innerHTML = '';
  }

  async function filesToDataUrls(fileList, maxImages = 6) {
    const files = Array.from(fileList || []).slice(0, maxImages);
    const tasks = files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));
    return Promise.all(tasks);
  }

  function showPreview(fileList) {
    clearPreview();
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    for (const file of files) {
      const item = el('div', 'thumb');
      const img = el('img');
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
      item.appendChild(img);
      preview.appendChild(item);
    }
  }

  // Event: image preview
  if (photosInput) {
    photosInput.addEventListener('change', () => showPreview(photosInput.files));
  }

  // Event: submit form
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const ownerName = document.getElementById('ownerName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const dogName = document.getElementById('dogName').value.trim();
      const ageStr = document.getElementById('age').value.trim();
      const breed = document.getElementById('breed').value.trim();
      const story = document.getElementById('story').value.trim();

      if (!ownerName || !phone || !dogName || !ageStr || !breed || !story) {
        alert('Please complete all required fields.');
        return;
      }

      const age = Number(ageStr);
      if (Number.isNaN(age) || age < 0 || age > 30) {
        alert('Please enter a valid age between 0 and 30.');
        return;
      }

      // Convert selected images to Data URLs (limit to avoid storage issues)
      let photos = [];
      try {
        photos = await filesToDataUrls(photosInput.files, 6);
      } catch (err) {
        console.warn('Error reading images', err);
      }

      const entry = {
        id: Date.now() + ':' + Math.random().toString(36).slice(2, 8),
        createdAt: Date.now(),
        ownerName,
        phone,
        dogName,
        age,
        breed,
        story,
        photos,
      };

      const current = getStoredStories();
      current.push(entry);
      setStoredStories(current);
      renderStories(current);

      form.reset();
      clearPreview();
      window.scrollTo({ top: document.getElementById('stories-list-section').offsetTop - 20, behavior: 'smooth' });
    });
  }

  // Initial render
  function seedStoriesIfEmpty() {
    const existing = getStoredStories();
    if (existing && existing.length > 0) return;

    const now = Date.now();
    const days = (n) => now - n * 24 * 60 * 60 * 1000;

    const seeded = [
      {
        id: 'seed-1',
        createdAt: days(2),
        ownerName: 'Sophie T (Auckland)',
        phone: '+64 21 555 8219',
        dogName: 'Kahu',
        age: 3,
        breed: 'Staffordshire Bull Terrier',
        story: 'Kahu loves the Piha beach track early mornings when it’s quiet. We do lots of impulse control games (sit, stay, “leave it”) before off-lead. Staffies can get excited, so short, focused training bursts keep him calm around other dogs. Our vet in Titirangi suggested a puzzle feeder and it’s been magic on rainy days.',
        photos: []
      },
      {
        id: 'seed-2',
        createdAt: days(4),
        ownerName: 'Mere & Tai (Wellington)',
        phone: '+64 22 040 7331',
        dogName: 'Pounamu',
        age: 5,
        breed: 'Staffordshire Bull Terrier',
        story: 'We adopted Pounamu through the SPCA. She’s super people-focused, so we give her a “job” on walks—carrying a soft tug toy. It reduces pulling heaps. For windy Welly days, we practice indoor nosework: hide 10 pieces of kibble around the lounge—great mental workout and she sleeps like a log.',
        photos: []
      },
      {
        id: 'seed-3',
        createdAt: days(6),
        ownerName: 'Liam (Christchurch)',
        phone: '+64 27 680 1145',
        dogName: 'Milo',
        age: 2,
        breed: 'American Staffordshire Terrier mix',
        story: 'Milo struggled with excitement when visitors arrived. Our trainer had us do “mat training”—he goes to his bed for treats while people come in, then gets calm hellos. Also recommend a well-fitted Y-front harness for better control. Hagley Park at off-peak hours has been perfect for recall practice.',
        photos: []
      },
      {
        id: 'seed-4',
        createdAt: days(9),
        ownerName: 'Aroha (Rotorua)',
        phone: '+64 29 311 7620',
        dogName: 'Tohu',
        age: 7,
        breed: 'Staffordshire Bull Terrier',
        story: 'Tohu’s a senior now, so we focus on low-impact adventures—Waikite Valley bush paths in cooler parts of the day and plenty of water stops. Golden tip: a lightweight cooling vest for summer and regular joint checks. Staffies are brave but will push through discomfort—watch those subtle limps.',
        photos: []
      },
      {
        id: 'seed-5',
        createdAt: days(11),
        ownerName: 'Nate & Ari (Hamilton)',
        phone: '+64 21 770 4421',
        dogName: 'Roxy',
        age: 4,
        breed: 'Staffordshire Bull Terrier',
        story: 'Roxy’s favourite is the river path near Hamilton Gardens. A front-clip harness and a treat pouch made loose-lead walking click for us. We practice “look at me” when bikes go by—few seconds of focus and she sails past like a pro.',
        photos: []
      },
      {
        id: 'seed-6',
        createdAt: days(12),
        ownerName: 'Olivia (Tauranga)',
        phone: '+64 22 119 3048',
        dogName: 'Moana',
        age: 1,
        breed: 'Staffordshire Bull Terrier',
        story: 'Puppy classes were huge for Moana—short sessions with lots of play breaks. At the beach we work on “come” with a long line; she zooms back for dried fish treats every time. Sunscreen on the pink nose in summer is a must!',
        photos: []
      },
      {
        id: 'seed-7',
        createdAt: days(13),
        ownerName: 'Kai (Napier)',
        phone: '+64 27 418 6672',
        dogName: 'Tāne',
        age: 6,
        breed: 'Staffordshire Bull Terrier',
        story: 'Tāne used to bark at dogs on walks. Parallel walking with a calm mate and lots of distance helped heaps. We reward check-ins and keep sessions short. Now he passes dogs with a tail wag and a smile.',
        photos: []
      },
      {
        id: 'seed-8',
        createdAt: days(14),
        ownerName: 'Emily & Josh (Dunedin)',
        phone: '+64 22 725 9013',
        dogName: 'Poppy',
        age: 2,
        breed: 'Staffordshire Bull Terrier',
        story: 'Poppy’s a keen tramper—short alpine starts and lots of water breaks. We pack a compact first-aid kit and booties for scree. She curls up in the hut like a champ and snores the night away.',
        photos: []
      },
      {
        id: 'seed-9',
        createdAt: days(15),
        ownerName: 'Hemi (Gisborne)',
        phone: '+64 29 552 8804',
        dogName: 'Kōra',
        age: 8,
        breed: 'Staffordshire Bull Terrier',
        story: 'Kōra’s slowing down, so we mix gentle beach walks with puzzle toys at home. Dental chews and regular vet checks keep her happy. She loves a shallow river splash on hot days.',
        photos: []
      },
      {
        id: 'seed-10',
        createdAt: days(16),
        ownerName: 'Priya (Auckland)',
        phone: '+64 22 565 1190',
        dogName: 'Ziggy',
        age: 3,
        breed: 'Staffordshire Bull Terrier',
        story: 'Rainy-day sanity saver: snuffle mats and “find it” games with kibble. Ziggy also thrives on 10-minute trick sessions—spin, paw, bow—he beams with pride after each one.',
        photos: []
      },
      {
        id: 'seed-11',
        createdAt: days(17),
        ownerName: 'Ben (Nelson)',
        phone: '+64 27 904 2216',
        dogName: 'Skye',
        age: 5,
        breed: 'Staffordshire Bull Terrier',
        story: 'Car rides used to be stressful. We introduced a covered crate with a LickiMat and calm music, building up from driveway to short loops. Now Skye hops in and settles before we’ve buckled up.',
        photos: []
      },
      {
        id: 'seed-12',
        createdAt: days(18),
        ownerName: 'Mila (Queenstown)',
        phone: '+64 21 333 7429',
        dogName: 'Kiri',
        age: 2,
        breed: 'Staffordshire Bull Terrier',
        story: 'We hike early in summer. A cooling vest, collapsible bowl, and paw checks keep Kiri comfy. Booties helped on hot pavements—took a week of cookie training to love them!',
        photos: []
      },
      {
        id: 'seed-13',
        createdAt: days(19),
        ownerName: 'Aria (Palmerston North)',
        phone: '+64 22 880 6113',
        dogName: 'Tui',
        age: 7,
        breed: 'Staffordshire Bull Terrier',
        story: 'Weight crept up after winter. Slow-feeder bowl, green bean toppers, and steady evening walks trimmed it back. Tui’s zoomies returned—and the vet was stoked with the results.',
        photos: []
      },
      {
        id: 'seed-14',
        createdAt: days(20),
        ownerName: 'Jade & Mark (Christchurch)',
        phone: '+64 27 220 5140',
        dogName: 'Buster',
        age: 4,
        breed: 'Staffordshire Bull Terrier',
        story: 'Buster smashed his CGC test after we switched to short, upbeat sessions. A flirt pole in the backyard channels his power safely—2 minutes on, 2 minutes off keeps arousal in check.',
        photos: []
      }
    ];

    setStoredStories(seeded);
  }

  seedStoriesIfEmpty();
  renderStories(getStoredStories());
})();
