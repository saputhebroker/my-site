const state = {
    activeCategory: "All",
    portfolio: null,
    isSubmitting: false
};

function getApiUrl(path) {
    return new URL(path.replace(/^\//, ""), window.location.href).toString();
}

function isPlaceholderValue(value) {
    return /yourusername|example\.com/i.test(String(value || ""));
}

function isConfiguredUrl(url) {
    const value = String(url || "").trim();

    if (!value || value === "#") {
        return false;
    }

    if (value.startsWith("#")) {
        return true;
    }

    return !isPlaceholderValue(value);
}

function renderHero(profile) {
    document.getElementById("hero-availability").textContent = profile.availability;
    document.getElementById("hero-title").textContent = profile.name;
    document.getElementById("hero-headline").textContent = profile.headline;
    document.getElementById("hero-summary").textContent = profile.summary;
    document.getElementById("about-copy").textContent = profile.about;
    document.getElementById("hero-location").textContent = profile.location;
    document.getElementById("hero-degree").textContent = profile.degree;
    document.getElementById("contact-copy").textContent = profile.contactBlurb;

    const statsMarkup = profile.stats.map((item) => `
        <li>
            <span class="stat-value">${item.value}</span>
            <span class="stat-label">${item.label}</span>
        </li>
    `).join("");

    const notesMarkup = profile.notes.map((item) => `
        <span class="hero-note">${item}</span>
    `).join("");

    document.getElementById("hero-stats").innerHTML = statsMarkup;
    document.getElementById("hero-notes").innerHTML = notesMarkup;

    const contactEmail = state.portfolio.contact?.email || "";
    const contactLinks = profile.links.filter((item) => {
        if (item.label === "Email") {
            return isConfiguredEmail(contactEmail);
        }

        return isConfiguredUrl(item.href);
    }).map((item) => {
        const href = item.label === "Email" && contactEmail
            ? `mailto:${contactEmail}`
            : item.href;
        const externalAttrs = item.external ? 'target="_blank" rel="noreferrer"' : "";

        return `
        <a class="contact-link" href="${href}" ${externalAttrs}>
            ${item.label}
        </a>
    `;
    }).join("");

    document.getElementById("contact-links").innerHTML = contactLinks;
}

function renderFilters(projects) {
    const categories = ["All", ...new Set(projects.map((project) => project.category))];
    const filters = categories.map((category) => `
        <button
            class="filter-chip"
            type="button"
            data-category="${category}"
            aria-pressed="${category === state.activeCategory}"
        >
            ${category}
        </button>
    `).join("");

    const filterRoot = document.getElementById("project-filters");
    filterRoot.innerHTML = filters;

    filterRoot.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
            state.activeCategory = button.dataset.category;
            renderFilters(state.portfolio.projects);
            renderProjects();
        });
    });
}

function renderProjects() {
    const projects = state.portfolio.projects.filter((project) => {
        return state.activeCategory === "All" || project.category === state.activeCategory;
    });

    const markup = projects.map((project, index) => `
        <article class="project-card" style="animation-delay: ${index * 90}ms;">
            <div class="project-topline">
                <span class="project-category">${project.category}</span>
                <span class="project-level">${project.level}</span>
            </div>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="stack-list" aria-label="Technology stack">
                ${project.techStack.map((item) => `<span class="stack-item">${item}</span>`).join("")}
            </div>
            <div class="project-meta">
                <span class="timeline-meta">${project.highlight}</span>
                <div class="project-links">
                    ${isConfiguredUrl(project.liveUrl) ? `<a class="project-link" href="${project.liveUrl}" target="_blank" rel="noreferrer">Live site</a>` : ""}
                    ${isConfiguredUrl(project.githubUrl)
                        ? `<a class="project-link" href="${project.githubUrl}" target="_blank" rel="noreferrer">View repo</a>`
                        : `<span class="project-link project-link-muted">Repository link coming soon</span>`}
                </div>
            </div>
        </article>
    `).join("");

    document.getElementById("project-grid").innerHTML = markup;
}

function renderFocusAreas(focusAreas) {
    const markup = focusAreas.map((area) => `
        <article class="focus-panel">
            <p class="section-kicker">${area.label}</p>
            <h3>${area.title}</h3>
            <p>${area.description}</p>
            <div class="focus-tags">
                ${area.items.map((item) => `<span class="focus-tag">${item}</span>`).join("")}
            </div>
        </article>
    `).join("");

    document.getElementById("focus-grid").innerHTML = markup;
}

function renderCertificates(certificates) {
    const markup = certificates.map((certificate) => {
        const credential = certificate.credentialUrl && certificate.credentialUrl !== "#"
            ? `<a class="certificate-link" href="${certificate.credentialUrl}" target="_blank" rel="noreferrer">${certificate.ctaLabel || "View certificate"}</a>`
            : `<span class="certificate-placeholder">${certificate.ctaLabel || "Add certificate link"}</span>`;

        return `
            <article class="certificate-card">
                <div class="certificate-meta">
                    <span>${certificate.issuer}</span>
                    <span>${certificate.year}</span>
                </div>
                <h3>${certificate.title}</h3>
                <p>${certificate.description}</p>
                ${credential}
            </article>
        `;
    }).join("");

    document.getElementById("certificate-grid").innerHTML = markup;
}

function renderTimeline(timeline) {
    const markup = timeline.map((item) => `
        <li class="timeline-item">
            <span class="timeline-year">${item.year}</span>
            <div>
                <h3>${item.title}</h3>
                <p class="timeline-copy">${item.description}</p>
            </div>
        </li>
    `).join("");

    document.getElementById("timeline").innerHTML = markup;
}

function renderContactSection(contact) {
    const deliveryNote = isConfiguredEmail(contact.email)
        ? contact.deliveryNote
        : `${contact.deliveryNote} Replace the sample email in portfolio.json before publishing.`;

    document.getElementById("contact-note").textContent = deliveryNote;
}

function isConfiguredEmail(email) {
    return Boolean(email) && !/example\.com/i.test(email);
}

function buildMailtoUrl(payload, contactEmail) {
    const body = [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        "",
        payload.message
    ].join("\n");

    return `mailto:${contactEmail}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(body)}`;
}

async function sendContactMessage(payload, contact) {
    const contactEmail = contact?.email || "";
    const formEndpoint = String(contact?.formEndpoint || "").trim();

    if (isConfiguredUrl(formEndpoint) && !formEndpoint.startsWith("#")) {
        const response = await fetch(formEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || "The hosted contact form did not accept the message.");
        }

        return {
            message: result.message || "Message sent."
        };
    }

    if (window.location.protocol !== "file:") {
        try {
            const response = await fetch(getApiUrl("/api/contact"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));

            if (response.ok) {
                return result;
            }

            if (result.fallback === "mailto" && isConfiguredEmail(contactEmail)) {
                window.location.href = buildMailtoUrl(payload, contactEmail);
                return { message: "The site is live, but this host cannot store messages yet. Your email app is opening instead." };
            }

            if (isConfiguredEmail(contactEmail)) {
                window.location.href = buildMailtoUrl(payload, contactEmail);
                return { message: "This host does not support the built-in backend, so your email app is opening instead." };
            }

            throw new Error(result.message || "Unable to send the message right now.");
        } catch (error) {
            if (isConfiguredEmail(contactEmail)) {
                window.location.href = buildMailtoUrl(payload, contactEmail);
                return { message: "This host does not support the built-in backend, so your email app is opening instead." };
            }

            throw error;
        }
    }

    if (!isConfiguredEmail(contactEmail)) {
        throw new Error("No real contact email is configured yet.");
    }

    window.location.href = buildMailtoUrl(payload, contactEmail);
    return { message: "Your email app is opening so the message can be sent directly." };
}

function setupContactForm(contact) {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (state.isSubmitting) {
            return;
        }

        const formData = new FormData(form);
        const payload = {
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            subject: String(formData.get("subject") || "").trim(),
            message: String(formData.get("message") || "").trim()
        };

        status.dataset.state = "pending";
        status.textContent = "Sending message...";
        state.isSubmitting = true;
        submitButton.disabled = true;

        try {
            const result = await sendContactMessage(payload, contact);
            form.reset();
            status.dataset.state = "success";
            status.textContent = result.message || "Message sent.";
        } catch (error) {
            console.error(error);
            status.dataset.state = "error";
            status.textContent = error.message || "I could not send the message yet. Add your real email or run the local server.";
        } finally {
            state.isSubmitting = false;
            submitButton.disabled = false;
        }
    });
}

async function init() {
    try {
        let portfolio = window.PORTFOLIO_DATA;

        if (!portfolio) {
            const response = await fetch(getApiUrl("/api/portfolio"));
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            portfolio = await response.json();
        }
        state.portfolio = portfolio;

        renderHero(portfolio.profile);
        renderFilters(portfolio.projects);
        renderProjects();
        renderFocusAreas(portfolio.focusAreas);
        renderCertificates(portfolio.certificates);
        renderTimeline(portfolio.timeline);
        renderContactSection(portfolio.contact);
        setupContactForm(portfolio.contact);
    } catch (error) {
        document.getElementById("hero-title").textContent = "Portfolio content could not be loaded.";
        document.getElementById("hero-headline").textContent = "";
        document.getElementById("hero-summary").textContent = "Check the local server and portfolio data file, then refresh the page.";
        console.error(error);
    }
}

init();
