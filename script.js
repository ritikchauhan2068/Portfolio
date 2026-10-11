/**
 * Ritik Chauhan — Engineering Portfolio Interactive Architecture
 * Vanilla JavaScript (Zero Dependencies, Ultra Fast, Accessible)
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initProjectFilters();
    initCaseStudyModal();
    initContactForm();
    initCopyButtons();
});

/**
 * 1. Mobile Navigation & Active Scroll Spy
 */
function initNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
    const sections = document.querySelectorAll('main > section');

    // Toggle mobile drawer
    if (mobileToggle && mobileDrawer) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.toggle('open');
            mobileToggle.classList.toggle('active', isOpen);
            mobileToggle.setAttribute('aria-expanded', isOpen);
            mobileDrawer.setAttribute('aria-hidden', !isOpen);
        });

        // Close drawer on link click
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileDrawer.setAttribute('aria-hidden', 'true');
            });
        });

        // Close drawer on outside click
        document.addEventListener('click', (e) => {
            if (!mobileToggle.contains(e.target) && !mobileDrawer.contains(e.target)) {
                mobileDrawer.classList.remove('open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileDrawer.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Scroll spy for active navigation item
    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        desktopLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });
}

/**
 * 2. Project Filtering Engine
 */
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (!filterButtons.length || !projectCards.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category') || '';
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    card.style.display = 'flex';
                    // Re-trigger layout smoothly
                    card.style.opacity = '1';
                } else {
                    card.style.display = 'none';
                    card.style.opacity = '0';
                }
            });
        });
    });
}

/**
 * 3. Deep Dive Case Study Data & Modal Management
 */
const caseStudyData = {
    'order-automation': {
        tag: 'Flagship System • Real-World Client Project',
        title: 'Wholesale Order Automation Pipeline',
        subtitle: 'Vision-LLM OCR Extraction & Idempotent Google Sheets Synchronization',
        problem: 'Wholesalers in Indian markets receive shopkeeper replenishment orders as WhatsApp photos of messy handwritten notes ("parchis"), audio transcripts, and PDF bills. Staff spent 2+ hours every afternoon manually deciphering handwriting and entering rows into accounting ledgers, causing error-prone shipments and operational delays.',
        architecture: `[WhatsApp Message: Inbound Webhook]
                    │
                    ▼
     [FastAPI Async Inbound Handler]
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
 [Printed PDF/Word Doc]     [Handwritten Image / Parchi]
 (pdfplumber text layer)    (Vision LLM: Gemini / GPT-4o-mini)
       │                         │ (Confidence scoring per line item)
       └────────────┬────────────┘
                    ▼
  [Draft Order State Machine in PostgreSQL]
  - Idempotency Constraint: UNIQUE(whatsapp_message_id)
                    │
                    ▼
  [WhatsApp Confirmation & Cheap Regex Edit Loop]
  - "change qty of X to 10" (Regex first; LLM only on ambiguity)
                    │ (Customer confirms "ok")
                    ▼
  [Sync to Google Sheets API (Exactly Once Guarantee)]
  - Flag: orders.synced_to_sheet = TRUE`,
        decisions: [
            'Vision LLM over Traditional OCR: Standard Tesseract OCR failed on non-standard Indian handwritten scripts. Switched to vision-capable multimodal LLMs with strict confidence scores per line-item.',
            'Idempotency at Data Layer: Guaranteed that redelivered webhooks never create duplicate orders or duplicate rows in Google Sheets via unique WhatsApp message ID constraints.',
            'Two-Tier Command Processing: 90% of user corrections ("remove item", "change qty") are handled instantly by deterministic regex parsers without making expensive LLM API calls.',
            'Swappable Provider Interfaces: Abstracted OrderExtractor and WhatsAppClient behind protocol interfaces for zero-code-change vendor switching.'
        ],
        results: [
            'Achieved 90%+ field-extraction accuracy across diverse handwritten slips and image qualities.',
            'Eliminated 2+ hours of manual data-entry overhead every business day.',
            'Passed 29 unit and integration tests covering the state machine, regex commands, and Hinglish confirmation detection.'
        ],
        github: 'https://github.com/ritikchauhan2068/OCR-For-Business'
    },

    'auyrco': {
        tag: 'Commercial Client Platform',
        title: 'Auyrco Pharma — Ayurvedic E-Commerce Architecture',
        subtitle: 'Production REST API Engineering & 35% Page Load Latency Optimization',
        problem: 'The client needed a responsive, reliable digital platform to showcase Ayurvedic pharmaceutical products, capture wholesale distributor inquiries, and process catalog searches without paying heavy recurring marketplace commissions.',
        architecture: `[Customer Mobile/Desktop Browser]
                    │
                    ▼ (HTTPS via Render Cloud SSL)
      [FastAPI REST API Server]
                    │
     ┌──────────────┴──────────────┐
     ▼                             ▼
[Relational Database]      [Static Catalog Cache]
- Indexed SKU & Category   - Compressed WebP Imagery
- Optimized Join Queries   - Lightweight JSON Payloads`,
        decisions: [
            'API Response Profiling: Analyzed slow mobile load times and identified bulky, unindexed catalog endpoints as the bottleneck.',
            'Payload Pruning: Restructured JSON serialization with Pydantic response models, eliminating unneeded metadata on list views.',
            'Database Query Optimization: Added selective indexing on category filters and streamlined relational joins.',
            'Zero-Downtime Deployment: Managed continuous deployment on Render with automated health-check endpoints and SSL certification.'
        ],
        results: [
            'Reduced average initial page load time by 35% on mobile 4G networks.',
            'Maintained reliable zero-downtime operation serving live business inquiries.',
            'Delivered full milestone requirements within agreed scope and timeline.'
        ],
        live: 'https://auyrcopharma-5.onrender.com'
    },

    'heritage': {
        tag: 'Commercial Hospitality Platform',
        title: 'Heritage Almora — Production Web Platform',
        subtitle: 'End-to-End Cloud Deployment & Business Inquiry Pipeline',
        problem: 'A heritage hotel in the Almora hills required an authoritative, high-performance web presence to capture direct guest bookings, present immersive room experiences, and eliminate high third-party travel aggregator commissions.',
        architecture: `[Direct Travelers / Search Visitors]
                    │
                    ▼ (Custom Domain & SSL DNS Routing)
     [FastAPI Web Service on DigitalOcean/Render]
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
 [Inquiry Router Engine]   [Optimized Static Asset Delivery]
 - Form Validation         - Compressed Responsive Media
 - Direct Notification     - Structured Local SEO Metadata`,
        decisions: [
            'Requirement Translation: Worked directly with non-technical resort proprietors to define user journeys, reservation enquiry forms, and amenity showcases.',
            'Infrastructure & DNS: Configured custom DNS routing, SSL certificates, and high-availability hosting across DigitalOcean and Render.',
            'Local SEO Engineering: Implemented semantic schema markup and Google Business profile technical optimizations to drive organic search discoverability.'
        ],
        results: [
            'Successfully deployed to production and active online: https://www.heritagealmora.com',
            'Empowered the hotel to capture direct customer inquiries with zero commission leakage.',
            'Fully delivered on schedule with comprehensive client hand-off.'
        ],
        live: 'https://www.heritagealmora.com'
    },

    'flat-recommendation': {
        tag: 'Applied Machine Learning & Data Engineering',
        title: 'Real Estate Content-Based Recommendation Engine',
        subtitle: 'Scraped 10,000+ Listings with TF-IDF and Locality Vector Ranking',
        problem: 'Property buyers waste hours filtering through real estate portals that rely on rigid keyword filters that miss semantically relevant or similarly priced flats in adjoining localities.',
        architecture: `[99acres Web Scraping Pipeline (BeautifulSoup)]
                    │ (10,000+ Unstructured Property Records)
                    ▼
     [Data Normalization & Cleaning]
     - Price outlier removal, missing-value imputation
                    │
                    ▼
     [Feature Engineering Layer]
     - Price-per-sqft vectorization
     - Locality tier categorizations
     - Weighted amenity score embeddings
                    │
                    ▼
     [Content-Based Similarity Modeling]
     - TF-IDF Vectorizer + Cosine Similarity Matrix
                    │
                    ▼
     [FastAPI Top-N Recommendation API]`,
        decisions: [
            'Robust Data Hygiene: Cleaned noisy unstructured scraping outputs, normalized currency formats (Lakhs vs Crores), and handled ambiguous listing descriptions.',
            'Hybrid Similarity Score: Combined amenity text similarity (TF-IDF) with numerical features (price-per-sqft, area ratio) to avoid nonsensical recommendations.',
            'FastAPI Service Layer: Wrapped model inference into a lightweight REST endpoint capable of returning Top-N recommendations in milliseconds.'
        ],
        results: [
            'Achieved an 18% improvement in ranking relevance over standard keyword search on a 500-listing evaluation set.',
            'Processed and normalized a comprehensive 10,000+ listing dataset.',
            'Packaged with interactive Streamlit exploration UI and FastAPI backend.'
        ],
        github: 'https://github.com/ritikchauhan2068/Flat-recommdation-system'
    },

    'ipl-prediction': {
        tag: 'Data Science & Predictive Modeling Internship',
        title: 'IPL Match Outcome Classification & REST API',
        subtitle: 'GridSearchCV Hyperparameter Optimization across 5 Classifiers',
        problem: 'Predicting second-innings cricket match outcomes requires modeling non-linear, multi-variable situational data including run rates, wickets in hand, batting strike rates, and venue pitch dynamics.',
        architecture: `[Historical Ball-by-Ball Match Dataset]
                    │
                    ▼
     [Exploratory Data Analysis & Feature Selection]
     - Engineered: Runs Left, Balls Remaining, CRR, RRR, Wickets in Hand
                    │
                    ▼
     [GridSearchCV Model Benchmarking]
     - Evaluated: Logistic Regression, Random Forest, SVM, Decision Tree, Gradient Boosting
                    │ (20% Prediction Error Reduction)
                    ▼
     [Serialized Model Deployment via FastAPI]
     - POST /predict endpoint returning win probability distributions`,
        decisions: [
            'Situational Feature Engineering: Transformed raw match events into dynamic in-game signals (Current Run Rate vs Required Run Rate) that significantly improved model predictive power.',
            'Systematic Grid Search: Evaluated estimator depths, learning rates, and regularization penalties systematically using cross-validation.',
            'API Packaging: Built a RESTful interface using FastAPI so client applications can query probabilities in real-time.'
        ],
        results: [
            'Reduced prediction log-loss error by 20% compared to baseline classifier.',
            'Successfully completed internship requirements at InternPe with verified certificate of completion.',
            'Demonstrated end-to-end data lifecycle from raw tabular data to production REST endpoint.'
        ],
        certificate: 'assets/Internpe.pdf'
    }
};

function initCaseStudyModal() {
    const modal = document.getElementById('case-study-modal');
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const triggerButtons = document.querySelectorAll('.open-case-study');

    if (!modal || !modalContent) return;

    function openModal(projectId) {
        const data = caseStudyData[projectId];
        if (!data) return;

        let linksHtml = '';
        if (data.github) {
            linksHtml += `<a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline"><i class="fa-brands fa-github"></i> View GitHub Repo</a>`;
        }
        if (data.live) {
            linksHtml += `<a href="${data.live}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary"><i class="fa-solid fa-arrow-up-right-from-square"></i> Visit Live App</a>`;
        }
        if (data.certificate) {
            linksHtml += `<a href="${data.certificate}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline"><i class="fa-solid fa-certificate"></i> View Certificate (PDF)</a>`;
        }

        modalContent.innerHTML = `
            <div class="modal-header">
                <span class="modal-tag">${data.tag}</span>
                <h3 class="modal-title">${data.title}</h3>
                <p class="modal-subtitle">${data.subtitle}</p>
            </div>

            <div class="modal-section">
                <h4><i class="fa-solid fa-circle-question"></i> The Problem & Context</h4>
                <p>${data.problem}</p>
            </div>

            <div class="modal-section">
                <h4><i class="fa-solid fa-sitemap"></i> System Architecture & Pipeline</h4>
                <pre class="modal-arch-diagram">${data.architecture}</pre>
            </div>

            <div class="modal-section">
                <h4><i class="fa-solid fa-gears"></i> Key Engineering Decisions & Trade-Offs</h4>
                <ul class="modal-bullets">
                    ${data.decisions.map(d => `<li>${d}</li>`).join('')}
                </ul>
            </div>

            <div class="modal-section">
                <h4><i class="fa-solid fa-square-poll-vertical"></i> Verified Outcomes & Impact</h4>
                <ul class="modal-bullets">
                    ${data.results.map(r => `<li><strong>${r}</strong></li>`).join('')}
                </ul>
            </div>

            <div class="modal-footer">
                ${linksHtml}
                <button class="btn btn-sm btn-secondary" onclick="closeCaseStudyModal()">Close</button>
            </div>
        `;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    window.closeCaseStudyModal = function() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    triggerButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = btn.getAttribute('data-project');
            openModal(projectId);
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeCaseStudyModal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCaseStudyModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeCaseStudyModal();
        }
    });
}

/**
 * 4. Contact Form Handling
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');

    if (!contactForm || !feedback) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const subject = document.getElementById('contact-subject').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        if (!name || !email || !subject || !message) {
            feedback.className = 'form-feedback error';
            feedback.textContent = 'Please fill out all required fields.';
            return;
        }

        // Generate direct mailto link to open in user's default email client
        const mailtoUrl = `mailto:ritikchauhan2068@gmail.com?subject=${encodeURIComponent(`[Portfolio Inquiry] ${subject} - from ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

        feedback.className = 'form-feedback success';
        feedback.innerHTML = `
            <strong>Opening your email client...</strong><br>
            If your mail client didn't open automatically, you can email me directly at: 
            <a href="mailto:ritikchauhan2068@gmail.com" style="color: #60a5fa; text-decoration: underline;">ritikchauhan2068@gmail.com</a>
        `;

        // Trigger mail client
        window.location.href = mailtoUrl;

        // Reset form after short delay
        setTimeout(() => {
            contactForm.reset();
        }, 3000);
    });
}

/**
 * 5. Copy-to-Clipboard Helpers
 */
function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const textToCopy = btn.getAttribute('data-copy');
            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check" style="color: #34d399;"></i>';
                btn.setAttribute('title', 'Copied to clipboard!');

                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.setAttribute('title', 'Copy to clipboard');
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const tempInput = document.createElement('input');
                tempInput.value = textToCopy;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);

                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check" style="color: #34d399;"></i>';
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                }, 2000);
            });
        });
    });
}
