function initAppListeners() {
    initMenuHandlers();
    initSearchHandlers();
    initRightIcons();
    initDynamicContent();
    initDateUpdater();
}

//! Обработчики меню
function initMenuHandlers() {
    const menuLeft = document.getElementById("menu-left");
    const menuItems = document.querySelector(".menu__left-items");
    const menuContainer = document.querySelector(".menu-container");
    const menuState = localStorage.getItem("menuOpen") === "true";

    if (menuLeft && menuItems) {
        menuItems.classList.toggle("slide", menuState);
        adjustContentPosition(menuState);

        if (menuContainer) {
            menuContainer.classList.toggle("active", menuState);
        }

        menuLeft.addEventListener("click", () => {
            const isOpen = !menuItems.classList.contains("slide");

            menuItems.classList.toggle("slide", isOpen);
            localStorage.setItem("menuOpen", isOpen);
            adjustContentPosition(isOpen);

            if (menuContainer) {
                menuContainer.classList.toggle("active", isOpen);
            }
        });
    }

    document.querySelectorAll(".menu__left-items a").forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            setActiveMenuItem(this);
            if (
                typeof router !== "undefined" &&
                typeof router.navigateTo === "function"
            ) {
                router.navigateTo(this.getAttribute("href"));
            } else {
                window.location.hash = this.getAttribute("href");
                console.warn(
                    "router не определён, переход по hash выполнен вручную."
                );
            }
        });
    });
}

//! Корректировка позиции контента
const POSITION_CONFIG = {
    ".create-new__list": {
        open: "calc(50% + 250px)",
        closed: "50%",
    },
    ".important-page__info": {
        open: "calc(50% + 250px)",
        closed: "50%",
    },
    ".planned-page__info": {
        open: "calc(50% + 250px)",
        closed: "50%",
    },
    ".trash-page__info": {
        open: "calc(50% + 250px)",
        closed: "50%",
    },
    ".notes__days": {
        open: "calc(20% + 150px)",
        closed: "0%",
    },
};

function adjustContentPosition(isOpen) {
    Object.entries(POSITION_CONFIG).forEach(([selector, positions]) => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.left = isOpen ? positions.open : positions.closed;
        }
    });
}

function setActiveMenuItem(clickedLink) {
    document.querySelectorAll(".menu__left-items li").forEach((li) => {
        li.classList.remove("active");
    });
    clickedLink.parentElement.classList.add("active");
}

//! Обработчики поиска
function initSearchHandlers() {
    const searchInput = document.querySelector(".search__input");
    const searchBlock = document.querySelector(".search");

    if (searchInput && searchBlock) {
        searchInput.addEventListener("input", (e) => {
            console.log("Поиск:", e.target.value.toLowerCase());
        });

        searchInput.addEventListener("focus", () => {
            searchBlock.classList.add("search--active");
            searchBlock.style.boxShadow =
                "0px 0px 0px 0px var(--shadow-color-1)";
        });

        searchInput.addEventListener("blur", () => {
            searchBlock.classList.remove("search--active");
            searchBlock.style.boxShadow =
                "0px 0px 30px 10px var(--shadow-color-1)";
        });
    }
}

//! Обработчики правых иконок
function initRightIcons() {
    const Grid = document.getElementById("grid");
    const List = document.getElementById("list");
    const Account = document.getElementById("account");
    const Settings = document.getElementById("settings");
    document.querySelectorAll(".nb__right img").forEach((icon) => {
        icon.addEventListener("click", function () {
            switch (this.alt) {
                case "Список":
                    Grid.style.display = "block";
                    List.style.display = "none";
                    break;
                case "Сетка":
                    List.style.display = "block";
                    Grid.style.display = "none";
                    break;
                case "Настройки":
                    console.log("Открыть настройки");
                    break;
                case "Аккаунт":
                    console.log("Аккаунт");
                    break;
            }
        });
    });
}

//! Инициализация динамического контента
function initDynamicContent() {
    const newNoteBtn = document.querySelector(".create-new__list");
    const newNotePage = document.querySelector(".new__page");

    if (newNoteBtn) {
        newNoteBtn.addEventListener("click", () => {
            // newNoteBtn.style.display = "none";
            newNotePage.style.display = "block";
        });
    }
}

//! Создание заметки
function popup() {
    const popupContainer = document.createElement("div");

    popupContainer.innerHTML = `
    <div id="popupContainer">
        <h1>Новая заметка</h1>
        <textarea id="note-text" placeholder="Введите свой текст..."></textarea>
        <div id="btn-container">
            <button id="submitBtn" onclick="createNote()">Создать</button>
            <button id="closeBtn" onclick="closePopup()">Закрыть</button>
        </div>
    </div>
    `;
    document.body.appendChild(popupContainer);
}

//! Закрытие заметки
function closePopup() {
    const popupContainer = document.getElementById("popupContainer");
    if (popupContainer) {
        popupContainer.remove();
    }
}

//! Созданная заметка
function createNote() {
    const popupContainer = document.getElementById("popupContainer");
    const noteText = document.getElementById("note-text").value;
    if (noteText.trim() !== "") {
        const note = {
            id: new Date().getTime(),
            text: noteText,
        };

        const existingNotes = JSON.parse(localStorage.getItem("notes")) || [];
        existingNotes.push(note);

        localStorage.setItem("notes", JSON.stringify(existingNotes));

        document.getElementById("note-text").value = "";

        popupContainer.remove();
        displayNotes();

        if (window.location.hash === "#/notes") {
            displayNotes();
        }
    }
}

//! Показ заметок
function displayNotes() {
    const notesList = document.getElementById("notes-list");
    if (!notesList) return;

    notesList.innerHTML = "";

    const notes = JSON.parse(localStorage.getItem("notes")) || [];

    notes.forEach((note) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
        <span>${note.text}</span>
        <div id="noteBtns-container">
            <button id="editBtn" onclick="editNote(${note.id})"><i class="fa-solid fa-pen"></i></button>
            <button id="deleteBtn" onclick="deleteNote(${note.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
        `;
        notesList.appendChild(listItem);
    });
}

//! Редактирование заметок
function editNote(noteId) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const noteToEdit = notes.find((note) => note.id == noteId);
    const noteText = noteToEdit ? noteToEdit.text : "";
    const editingPopup = document.createElement("div");

    editingPopup.innerHTML = `
    <div id="editing-container" data-note-id="${noteId}">
        <h1>Edit Note</h1>
        <textarea id="note-text">${noteText}</textarea>
        <div id="btn-container">
            <button id="submitBtn" onclick="updateNote()">Готово</button>
            <button id="closeBtn" onclick="closeEditPopup()">Отмена</button>
        </div>
    </div>
    `;

    document.body.appendChild(editingPopup);
}

function closeEditPopup() {
    const editingPopup = document.getElementById("editing-container");

    if (editingPopup) {
        editingPopup.remove();
    }
}

function updateNote() {
    const noteText = document.getElementById("note-text").value.trim();
    const editingPopup = document.getElementById("editing-container");

    if (noteText !== "") {
        const noteId = editingPopup.getAttribute("data-note-id");
        let notes = JSON.parse(localStorage.getItem("notes")) || [];

        const updatedNotes = notes.map((note) => {
            if (note.id == noteId) {
                return { id: note.id, text: noteText };
            }
            return note;
        });

        localStorage.setItem("notes", JSON.stringify(updatedNotes));

        editingPopup.remove();

        displayNotes();

        if (window.location.hash === "#/notes") {
            displayNotes();
        }
    }
}

//! Удаление заметок
function deleteNote(noteId) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes = notes.filter((note) => note.id !== noteId);

    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();

    if (window.location.hash === "#/notes") {
        displayNotes();
    }
}

displayNotes();

class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentPath = window.location.hash.substring(1) || "/";
        this.initRouter();
    }

    initRouter() {
        window.addEventListener("hashchange", () => this.handleRoute());
        window.addEventListener("load", () => this.handleRoute());
        document.addEventListener(
            "click",
            (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (link) {
                    e.preventDefault();
                    this.navigateTo(link.getAttribute("href"));
                }
            },
            { capture: true }
        );
    }

    async handleRoute() {
        const path = window.location.hash.substring(1) || "/";
        const route = this.routes.find((r) => r.path === path);
        if (!route) {
            this.showError();
            return;
        }

        try {
            const content = await this.loadContent(route.template);
            this.updateAppContent(content);
            initAppListeners();
            this.updateActiveMenu(path);

            setTimeout(() => initDateUpdater(), 10);
        } catch (e) {
            this.showError();
        }

        if (path === "/notes") {
            displayNotes();
        }
    }

    async loadContent(template) {
        const response = await fetch(template);
        if (!response.ok) throw new Error("Ошибка загрузки");
        return await response.text();
    }

    updateAppContent(content) {
        const app = document.getElementById("app");
        if (app) app.innerHTML = content;
    }

    showError() {
        const app = document.getElementById("app");
        if (app)
            app.innerHTML = `
            <div class="error">
                <h2>404</h2>
                <p>Страница не найдена</p>
            </div>
        `;
    }

    navigateTo(path) {
        window.location.hash = path;
        this.currentPath = path;
    }

    updateActiveMenu(currentPath) {
        document.querySelectorAll(".menu__left-items a").forEach((link) => {
            const linkPath = link.getAttribute("href").replace("#", "");
            link.parentElement.classList.toggle(
                "active",
                linkPath === currentPath
            );
        });
    }
}

//! Инициализация приложения
let router;

document.addEventListener("DOMContentLoaded", () => {
    router = new Router([
        { path: "/", template: "/public/index.html" },
        { path: "/notes", template: "/public/pages/notes.html" },
        { path: "/important", template: "/public/pages/important.html" },
        { path: "/planned", template: "/public/pages/planned.html" },
        { path: "/trash", template: "/public/pages/trash.html" },
    ]);

    initAppListeners();
});

//! Установка текующей даты для страницы заметок
function initDateUpdater() {
    const MAX_RETRIES = 3;
    let retries = 0;

    const updateDate = () => {
        const dateElement = document.querySelector(".notes__days span");

        if (!dateElement) {
            if (retries < MAX_RETRIES) {
                retries++;
                setTimeout(updateDate, 100);
                return;
            }
            console.warn("Элемент даты не найден");
            return;
        }

        const currentDate = new Date();
        const days = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
        dateElement.textContent =
            `${days[currentDate.getDay()]}, ` +
            `${String(currentDate.getDate()).padStart(2, "0")}.` +
            `${String(currentDate.getMonth() + 1).padStart(2, "0")}.` +
            `${currentDate.getFullYear()}`;
    };

    updateDate();
}
