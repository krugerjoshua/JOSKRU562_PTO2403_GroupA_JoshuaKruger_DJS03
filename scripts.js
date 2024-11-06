import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

// Created a function for book preview elements
const createBookPreview = ({ author, id, image, title }) => {
    const element = document.createElement("button");
    element.classList = "preview";
    element.setAttribute("data-preview", id);

    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    return element;
};

const starting = document.createDocumentFragment();
for (const book of matches.slice(0, BOOKS_PER_PAGE)) {
    starting.appendChild(createBookPreview(book));
}

document.querySelector("[data-list-items]").appendChild(starting);

// Genre and Author dropdowns where replaced by a single function so code don't have  to be repeated.
const populateDropdown = (dropdown, options, defaultOptionText) => {
    const fragment = document.createDocumentFragment();
    const defaultOption = document.createElement("option");
    defaultOption.value = "any";
    defaultOption.innerText = defaultOptionText;
    fragment.appendChild(defaultOption);

    for (const [id, name] of Object.entries(options)) {
        const element = document.createElement("option");
        element.value = id;
        element.innerText = name;
        fragment.appendChild(element);
    }
    dropdown.appendChild(fragment);
};
populateDropdown(
    document.querySelector("[data-search-genres]"),
    genres,
    "All Genres"
);
populateDropdown(
    document.querySelector("[data-search-authors]"),
    authors,
    "All Authors"
);

// Created a function to check if 'day' or 'night' theme selected.
const applyTheme = (theme) => {
    if (theme === "night") {
        document.documentElement.style.setProperty(
            "--color-dark",
            "255, 255, 255"
        );
        document.documentElement.style.setProperty(
            "--color-light",
            "10, 10, 20"
        );
    } else {
        document.documentElement.style.setProperty(
            "--color-dark",
            "10, 10, 20"
        );
        document.documentElement.style.setProperty(
            "--color-light",
            "255, 255, 255"
        );
    }
};

applyTheme(document.querySelector(`[data-settings-theme]`));

// Created a function for displaying the remaining books.
function updateListButton() {
    const remaining = matches.length - page * BOOKS_PER_PAGE;
    document.querySelector("[data-list-button]").innerHTML = `
      <span>Show more</span>
      <span class="list__remaining"> (${remaining > 0 ? remaining : 0})</span>
    `;
    document.querySelector("[data-list-button]").disabled = remaining <= 0;
}

// Function to open or close the overlay.
function toggleOverlay(selector, open) {
    document.querySelector(selector).open = open;
}

// Event listeners for different buttons. Formatted with prettier extension for better readability.
document
    .querySelector("[data-search-cancel]")
    .addEventListener("click", () =>
        toggleOverlay("[data-search-overlay]", false)
    );
document
    .querySelector("[data-settings-cancel]")
    .addEventListener("click", () =>
        toggleOverlay("[data-settings-overlay]", false)
    );
document.querySelector("[data-header-search]").addEventListener("click", () => {
    toggleOverlay("[data-search-overlay]", true);
    document.querySelector("[data-search-title]").focus();
});
document
    .querySelector("[data-header-settings]")
    .addEventListener("click", () =>
        toggleOverlay("[data-settings-overlay]", true)
    );
document
    .querySelector("[data-list-close]")
    .addEventListener("click", () =>
        toggleOverlay("[data-list-active]", false)
    );

document
    .querySelector("[data-settings-form]")
    .addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const { theme } = Object.fromEntries(formData);
        applyTheme(theme);
        toggleOverlay("[data-settings-overlay]", false);
    });

document
    .querySelector("[data-search-form]")
    .addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);
        const result = [];

        for (const book of books) {
            const genreMatch =
                filters.genre === "any" || book.genres.includes(filters.genre);
            const titleMatch =
                filters.title.trim() === "" ||
                book.title.toLowerCase().includes(filters.title.toLowerCase());
            const authorMatch =
                filters.author === "any" || book.author === filters.author;

            if (genreMatch && titleMatch && authorMatch) {
                result.push(book);
            }
        }

        page = 1;
        matches = result;

        const listMessage = document.querySelector("[data-list-message]");
        listMessage.classList.toggle("list__message_show", result.length < 1);

        const listItems = document.querySelector("[data-list-items]");
        listItems.innerHTML = "";

        const newItems = document.createDocumentFragment();
        for (const book of result.slice(0, BOOKS_PER_PAGE)) {
            newItems.appendChild(createBookPreview(book));
        }
        document.querySelector("[data-list-items]").appendChild(newItems);
        updateListButton();
        window.scrollTo({ top: 0, behavior: "smooth" });
        toggleOverlay("[data-search-overlay]", false);
    });

document
    .querySelector("[data-list-items]")
    .addEventListener("click", (event) => {
        console.log("Click event fired");
        const pathArray = Array.from(event.path || event.composedPath());
        let active = null;
        for (const node of pathArray) {
            if (node?.dataset?.preview) {
                active = books.find((book) => book.id === node.dataset.preview);
                break;
            }
        }
        console.log("Active book:", active);
        if (active) {
            toggleOverlay("[data-list-active]", true);
            document.querySelector("[data-list-blur]").src = active.image;
            document.querySelector("[data-list-image]").src = active.image;
            document.querySelector("[data-list-title]").innerText =
                active.title;
            document.querySelector("[data-list-subtitle]").innerText =
                `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
            document.querySelector("[data-list-description]").innerText =
                active.description;
        }
    });
