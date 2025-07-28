document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .logo');
    const mainContentArea = document.getElementById('main-content-area');

    // --- Mobile Menu Functionality ---
    const toggleMobileMenu = () => {
        mobileMenuOverlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll'); // Prevent scrolling
    };

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    } else {
        console.warn("Mobile menu toggle button not found.");
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', toggleMobileMenu);
    } else {
        console.warn("Mobile menu close button not found.");
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) {
                toggleMobileMenu();
            }
        });
    } else {
        console.warn("Mobile menu overlay not found.");
    }

    // --- Data for Dynamic Pages (Slideshow Content) ---
    let data = {}; // Initialize as empty object, will be filled by fetch

    let currentPage = 'home'; // Keep track of the current page
    let currentDestinationIndex = 0;
    let currentCrewIndex = 0;
    let currentTechnologyIndex = 0;

    // --- Feature Detection: Check for WebP support ---
    const supportsWebP = () => {
        const elem = document.createElement('canvas');
        if (elem.getContext && elem.getContext('2d')) {
            return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    };
    const webpSupported = supportsWebP();
    console.log('WebP Supported:', webpSupported); // For debugging

    // Helper function to get the correct image path (webp, png, or jpg) for content images
    const getOptimizedImagePath = (imageObject) => {
        if (!imageObject) {
            console.error("getOptimizedImagePath received undefined or null imageObject.");
            return '';
        }
        // Prioritize webp if supported and available (for destinations/crew)
        if (imageObject.webp && webpSupported) {
            return imageObject.webp;
        }
        // Fallback to png if available (for destinations/crew)
        else if (imageObject.png) {
            return imageObject.png;
        }
        // Fallback to jpg if available (primarily for technology)
        else if (imageObject.jpg) {
            return imageObject.jpg;
        }
        console.warn("No suitable image format found for:", imageObject);
        return ''; // Fallback for missing paths
    };

    // Function to get the appropriate background image based on screen width and page
    // This function now assumes background images are in assets/{pageName}/
    const getBackgroundImagePath = (pageName) => {
        let breakpoint = '';
        if (window.innerWidth >= 1024) { // Desktop breakpoint
            breakpoint = 'desktop';
        } else if (window.innerWidth >= 768) { // Tablet breakpoint
            breakpoint = 'tablet';
        } else { // Mobile breakpoint
            breakpoint = 'mobile';
        }
        // Construct the path based on your specified structure: assets/{pageName}/background-{pageName}-{breakpoint}.jpg
        return `./assets/${pageName}/background-${pageName}-${breakpoint}.jpg`;
    };

    // Function to get the appropriate technology image based on screen width
    const getTechnologyImagePath = (techItem) => {
        // Accessing 'images' (plural) property for technology
        // Then selecting 'portrait' or 'landscape' based on screen width
        if (window.innerWidth >= 1024) { // Desktop (portrait)
            return getOptimizedImagePath(techItem.images.portrait);
        } else { // Tablet/Mobile (landscape)
            return getOptimizedImagePath(techItem.images.landscape);
        }
    };

    // --- Page Content Definitions (Dynamic HTML Generation) ---
    const getHomePageContent = () => `
        <section class="home-page main-content-section flow" style="--flow-space: 1.5rem;">
            <div class="text-content">
                <p class="subtitle text-accent letter-spacing-1">So, you want to travel to</p>
                <h1 class="title text-white ff-bellefair fs-800">Space</h1>
                <p class="description text-accent ff-barlow">
                    Let’s face it; if you want to go to space, you might as well genuinely go to
                    outer space and not hover kind of on the edge of it. Well sit back, and relax
                    because we’ll give you a truly out of this world experience!
                </p>
            </div>
            <button class="explore-button ff-bellefair text-dark fs-700" data-page="destination">Explore</button>
        </section>
    `;

    const getDestinationPageContent = (index = 0) => {
        const destination = data.destinations[index];
        if (!destination) return `<section class="destination-page main-content-section"><p>Destination not found.</p></section>`;

        // Generate tab buttons
        const tabButtonsHtml = data.destinations.map((dest, idx) => `
            <li>
                <button class="tab-button ff-barlow-condensed fs-400 uppercase letter-spacing-2 ${idx === index ? 'active' : ''}" data-destination-index="${idx}">
                    ${dest.name}
                </button>
            </li>
        `).join('');

        // Use getOptimizedImagePath for destination image, accessing 'images' property
        const imageUrl = getOptimizedImagePath(destination.images);

        return `
            <section class="destination-page main-content-section flow" style="--flow-space: 1rem;">
                <h2 class="page-title uppercase letter-spacing-2"><span>01</span> Pick your destination</h2>
                <div class="destination-image-container">
                    <img src="${imageUrl}" alt="${destination.name}" class="destination-image" onerror="this.onerror=null; this.src='https://placehold.co/600x400/FF0000/FFFFFF?text=Image+Load+Error'; console.error('Failed to load image: ${imageUrl}');">
                </div>
                <div class="content-wrapper">
                    <ul class="tab-list">
                        ${tabButtonsHtml}
                    </ul>
                    <h3 class="destination-name ff-bellefair uppercase fs-800">${destination.name}</h3>
                    <p class="destination-description ff-barlow">${destination.description}</p>
                    <div class="destination-meta flex">
                        <div class="meta-item">
                            <h3 class="ff-barlow-condensed uppercase letter-spacing-3">Avg. distance</h3>
                            <p class="ff-bellefair uppercase fs-600">${destination.distance}</p>
                        </div>
                        <div class="meta-item">
                            <h3 class="ff-barlow-condensed uppercase letter-spacing-3">Est. travel time</h3>
                            <p class="ff-bellefair uppercase fs-600">${destination.travel}</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    };

    const getCrewPageContent = (index = 0) => {
        const crewMember = data.crew[index];
        if (!crewMember) return `<section class="crew-page main-content-section"><p>Crew member not found.</p></section>`;

        // Generate dot indicators
        const dotIndicatorsHtml = data.crew.map((_, idx) => `
            <button class="dot ${idx === index ? 'active' : ''}" data-crew-index="${idx}"></button>
        `).join('');

        // Use getOptimizedImagePath for crew image, accessing 'images' property
        const imageUrl = getOptimizedImagePath(crewMember.images);

        return `
            <section class="crew-page main-content-section flow" style="--flow-space: 1rem;">
                <h2 class="page-title uppercase letter-spacing-2"><span>02</span> Meet your crew</h2>
                <div class="crew-image-container">
                    <img src="${imageUrl}" alt="${crewMember.name}" class="crew-image" onerror="this.onerror=null; this.src='https://placehold.co/600x400/FF0000/FFFFFF?text=Image+Load+Error'; console.error('Failed to load image: ${imageUrl}');">
                </div>
                <div class="crew-content">
                    <h3 class="crew-role ff-bellefair uppercase fs-500">${crewMember.role}</h3>
                    <h4 class="crew-name ff-bellefair uppercase fs-700">${crewMember.name}</h4>
                    <p class="crew-bio ff-barlow">${crewMember.bio}</p>
                </div>
                <div class="dot-indicators">
                    ${dotIndicatorsHtml}
                </div>
            </section>
        `;
    };

    const getTechnologyPageContent = (index = 0) => {
        const technology = data.technology[index];
        if (!technology) return `<section class="technology-page main-content-section"><p>Technology not found.</p></section>`;

        // Generate dot indicators (numbered circles)
        const dotIndicatorsHtml = data.technology.map((_, idx) => `
            <button class="dot ff-bellefair fs-500 ${idx === index ? 'active' : ''}" data-tech-index="${idx}">${idx + 1}</button>
        `).join('');

        // Dynamically select image based on screen width and optimized format
        const imageUrl = getTechnologyImagePath(technology);

        return `
            <section class="technology-page main-content-section flow" style="--flow-space: 1rem;">
                <h2 class="page-title uppercase letter-spacing-2"><span>03</span> Space launch 101</h2>
                <div class="tech-image-container">
                    <img src="${imageUrl}" alt="${technology.name}" class="tech-image" onerror="this.onerror=null; this.src='https://placehold.co/600x400/FF0000/FFFFFF?text=Image+Load+Error'; console.error('Failed to load image: ${imageUrl}');">
                </div>
                <div class="dot-indicators">
                    ${dotIndicatorsHtml}
                </div>
                <div class="tech-text-content">
                    <p class="tech-subtitle ff-barlow-condensed uppercase letter-spacing-3">The terminology...</p>
                    <h3 class="tech-name ff-bellefair uppercase fs-700">${technology.name}</h3>
                    <p class="tech-description ff-barlow">${technology.description}</p>
                </div>
            </section>
        `;
    };


    // --- Dynamic Page Rendering Function ---
    const renderPage = (pageName, index = 0) => {
        console.log(`Rendering page: ${pageName} with index: ${index}`); // Debugging log

        // Clear previous content
        if (mainContentArea) {
            mainContentArea.innerHTML = '';
        } else {
            console.error("mainContentArea not found!");
            return; // Exit if main content area is missing
        }


        // Remove active class from all nav links
        navLinks.forEach(link => link.classList.remove('active'));

        // Add active class to the current page's nav link
        const currentPageLink = document.querySelector(`.nav-link[data-page="${pageName}"], .mobile-nav-link[data-page="${pageName}"]`);
        if (currentPageLink) {
            currentPageLink.classList.add('active');
        } else if (pageName === 'home') { // Special case for logo
             const logoLink = document.querySelector('.logo[data-page="home"]');
             if (logoLink) logoLink.classList.add('active');
        }

        // Set background image based on page and screen size
        // This is where the responsive background image is applied to the body
        document.body.style.backgroundImage = `url('${getBackgroundImagePath(pageName)}')`;

        // Render content based on pageName
        let contentHtml = '';
        switch (pageName) {
            case 'home':
                contentHtml = getHomePageContent();
                break;
            case 'destination':
                currentDestinationIndex = index;
                contentHtml = getDestinationPageContent(currentDestinationIndex);
                break;
            case 'crew':
                currentCrewIndex = index;
                contentHtml = getCrewPageContent(currentCrewIndex);
                break;
            case 'technology':
                currentTechnologyIndex = index;
                contentHtml = getTechnologyPageContent(currentTechnologyIndex);
                break;
            default:
                contentHtml = getHomePageContent(); // Fallback to home
                break;
        }
        mainContentArea.innerHTML = contentHtml;
        currentPage = pageName; // Update current page state

        // --- Attach Event Listeners for Dynamic Content ---
        if (pageName === 'home') {
            const exploreButton = document.querySelector('.explore-button');
            if (exploreButton) {
                exploreButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    renderPage('destination');
                });
            } else {
                console.warn("Explore button not found on home page.");
            }
        } else if (pageName === 'destination') {
            document.querySelectorAll('.tab-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    renderPage('destination', parseInt(e.target.dataset.destinationIndex));
                });
            });
        } else if (pageName === 'crew') {
            document.querySelectorAll('.crew-page .dot').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    renderPage('crew', parseInt(e.target.dataset.crewIndex));
                });
            });
        } else if (pageName === 'technology') {
            document.querySelectorAll('.technology-page .dot').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    renderPage('technology', parseInt(e.target.dataset.techIndex));
                });
            });
        }

        // Close mobile menu if clicked from there
        if (mobileMenuOverlay && mobileMenuOverlay.classList.contains('active')) {
            toggleMobileMenu();
        }
    };

    // --- Navigation Event Listeners ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            renderPage(page);
        });
    });

    // --- Handle window resize for background and technology images ---
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Re-render the current page to update background and technology images
            // This ensures the correct image (mobile/tablet/desktop or landscape/portrait) is loaded
            if (currentPage === 'destination') {
                renderPage(currentPage, currentDestinationIndex);
            } else if (currentPage === 'crew') {
                renderPage(currentPage, currentCrewIndex);
            } else if (currentPage === 'technology') {
                renderPage(currentPage, currentTechnologyIndex);
            } else { // Home page
                renderPage(currentPage);
            }
        }, 200); // Debounce resize event
    });


   // --- Fetch Data and Initialize ---
    fetch('data.json') // Correct path for fetching data.json
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
             }
            return response.json();
        })
        .then(jsonData => {
            data = jsonData; // Assign fetched data to the 'data' variable
            renderPage('home'); // Load the homepage content initially after data is ready
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // Fallback or error message to user if data fails to load
            if (mainContentArea) {
                mainContentArea.innerHTML = '<p style="color: red; text-align: center;">Failed to load content. Please ensure assets/data.json exists and is valid.</p>';
            }
        });
});
