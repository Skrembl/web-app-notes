const POSITION_CONFIG = {
    ".create-new__list": {
        open: "calc(50% + 250px)",
        closed: "50%",
    },
    "#notes-list": {
        open: "calc(7% + 250px)",
        closed: "10.5%",
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
        open: "0",
        closed: "1",
    },
};

const domCache = {};
let expandedNotes = [];

function getElement(selector) {
    if (!domCache[selector]) {
        domCache[selector] = document.querySelector(selector);
    }
    return domCache[selector];
}

function applyViewMode(mode) {
    const notesList = getElement("#notes-list");
    if (notesList) {
        notesList.classList.remove("grid-view", "list-view");
        notesList.classList.add(mode + "-view");

        const noteItems = notesList.querySelectorAll(".note-item");
        noteItems.forEach((item) => {
            item.classList.remove("grid-view", "list-view");
            item.classList.add(mode + "-view");
        });

        localStorage.setItem("viewMode", mode);
        updateWidthClass();
    }
}

function initAppListeners() {
    const path = window.location.hash.substring(1) || "/";
    initMenuHandlers();
    initSearchHandlers();
    initSearchActions();
    initRightIcons();

    if (path === "/notes") {
        initDynamicContent();
        initDateUpdater();
    }
}

//! Обработчики меню
function initMenuHandlers() {
    const menuLeft = getElement("#menu-left");
    const menuItems = getElement(".menu__left-items");
    const menuContainer = getElement(".menu-container");
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

            updateWidthClass();
        });
    }

    const menuLinks = document.querySelectorAll(".menu__left-items a");
    if (menuLinks.length) {
        menuLinks.forEach((link) => {
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
}

//! Корректировка позиции контента
function adjustContentPosition(isOpen) {
    const menuItems = getElement(".menu__left-items");
    if (!menuItems) return;

    const menuWidth = isOpen ? menuItems.offsetWidth : 0;

    Object.entries(POSITION_CONFIG).forEach(([selector, positions]) => {
        const element = getElement(selector);
        if (element) {
            if (selector === ".notes__days") {
                element.style.opacity = isOpen
                    ? positions.open
                    : positions.closed;
                element.style.pointerEvents = isOpen ? "none" : "auto";
                element.style.visibility = isOpen ? "hidden" : "visible";
            } else {
                element.style.left = isOpen
                    ? `calc(${positions.open.split("(")[1].split(")")[0]} + ${menuWidth}px)`
                    : positions.closed;
            }
        }
    });

    updateWidthClass();
}

//! Функция для обновления класса ширины
function updateWidthClass() {
    const isOpen = localStorage.getItem("menuOpen") === "true";
    const viewMode = localStorage.getItem("viewMode") || "grid";
    const body = document.body;

    if (isOpen && viewMode === "list") {
        body.classList.add("list-view-menu-open");
    } else {
        body.classList.remove("list-view-menu-open");
    }
}

function setActiveMenuItem(clickedLink) {
    const menuItems = document.querySelectorAll(".menu__left-items li");
    menuItems.forEach((li) => {
        li.classList.remove("active");
    });
    clickedLink.parentElement.classList.add("active");
}

//! Обработчики поиска
function initSearchHandlers() {
    const searchInput = getElement(".search__input");
    const searchBlock = getElement(".search");

    if (!searchInput || !searchBlock) return;

    searchInput.addEventListener("focus", function () {
        searchBlock.classList.add("search--active");
        searchBlock.style.boxShadow = "none";
        searchBlock.style.backgroundColor = "var(--bg-color-11)";
    });

    searchInput.addEventListener("blur", function () {
        searchBlock.classList.remove("search--active");
        searchBlock.style.boxShadow = "0px 0px 30px 10px var(--shadow-color-1)";
        searchBlock.style.backgroundColor = "transparent";
    });
}

//! Обработчики правых иконок
function initRightIcons() {
    const listIcon = getElement("#list");
    const gridIcon = getElement("#grid");

    if (!listIcon || !gridIcon) return;

    listIcon.classList.add("view-icon");
    gridIcon.classList.add("view-icon");

    updateViewIcons();

    listIcon.addEventListener("click", () => {
        applyViewMode("list");
        updateViewIcons();
    });

    gridIcon.addEventListener("click", () => {
        applyViewMode("grid");
        updateViewIcons();
    });
}

//! Обновление состояния иконок
function updateViewIcons() {
    const savedViewMode = localStorage.getItem("viewMode") || "grid";
    const listIcon = getElement("#list");
    const gridIcon = getElement("#grid");

    if (listIcon && gridIcon) {
        listIcon.classList.toggle("active", savedViewMode === "list");
        gridIcon.classList.toggle("active", savedViewMode === "grid");
    }
}

//! Инициализация динамического контента
function initDynamicContent() {
    const newNoteBtn = getElement(".create-new__list");
    if (newNoteBtn) {
        newNoteBtn.addEventListener("click", popup);
    }
}

//! Создание заметки
function popup() {
    const popupContainer = document.createElement("div");
    popupContainer.id = "popupContainer";
    popupContainer.innerHTML = `
        <input type="text" placeholder="Введите название" id="note-title">
        <textarea id="note-text" placeholder="Заметка..."></textarea>
        <div id="btn-container">
            <button id="submitBtn" onclick="createNote()">Создать</button>
            <button id="closeBtn" onclick="closePopup()">Закрыть</button>
        </div>
    `;
    document.body.appendChild(popupContainer);
    getElement("#note-title").focus();
}

//! Закрытие заметки
function closePopup() {
    const popupContainer = getElement("#popupContainer");
    if (popupContainer) popupContainer.remove();
}

//! Созданная заметка
function createNote() {
    const popupContainer = getElement("#popupContainer");
    const noteTitle = getElement("#note-title").value;
    const noteText = getElement("#note-text").value;

    if (noteText.trim() !== "" || noteTitle.trim() !== "") {
        const note = {
            id: Date.now(),
            title: noteTitle,
            text: noteText,
            pinned: false,
        };

        const existingNotes = JSON.parse(localStorage.getItem("notes")) || [];
        existingNotes.push(note);
        localStorage.setItem("notes", JSON.stringify(existingNotes));

        popupContainer.remove();
        if (window.location.hash === "#/notes" || window.location.hash === "") {
            displayNotes();
        }
    }
}

//! Закрепление заметок
function pinNote(noteId) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    const noteIndex = notes.findIndex((note) => note.id === noteId);

    if (noteIndex !== -1) {
        notes[noteIndex].pinned = !notes[noteIndex].pinned;
        localStorage.setItem("notes", JSON.stringify(notes));
        updateNoteElement(notes[noteIndex]);
    }
}

function updateNoteElement(note) {
    const noteElement = document.querySelector(
        `.note-item[data-note-id="${note.id}"]`
    );
    if (!noteElement) return;

    const pinBtn = noteElement.querySelector(".pinBtn");
    if (pinBtn) {
        pinBtn.classList.toggle("pinned", note.pinned);
        const pinIcon = pinBtn.querySelector("img");
        if (pinIcon) {
            pinIcon.src = note.pinned
                ? "/public/assets/icons/pin-note-filled.svg"
                : "/public/assets/icons/pin-note.svg";
        }
    }
}

//! Функция для сохранения состояния расширения заметки
function saveExpandedState(noteId) {
    if (!expandedNotes.includes(noteId)) {
        expandedNotes.push(noteId);
        localStorage.setItem("expandedNotes", JSON.stringify(expandedNotes));
    }
}

//! Функция для удаления состояния расширения
function removeExpandedState(noteId) {
    expandedNotes = expandedNotes.filter((id) => id !== noteId);
    localStorage.setItem("expandedNotes", JSON.stringify(expandedNotes));
}

//! Общая функция для расширения заметки
function expandNote(noteElement) {
    const overlay = getElement(".overlay");
    const resizeIcon = noteElement.querySelector(".note-resize__one");
    const expandedIcons = noteElement.querySelector(".expanded-icons");
    const noteBtns = noteElement.querySelector(".noteBtns-container");
    const addNoteMini = getElement("#addNoteMini");

    document.querySelectorAll(".note-item").forEach((item) => {
        if (item !== noteElement) item.style.display = "none";
    });

    noteElement.classList.add("expanded");
    if (resizeIcon) resizeIcon.style.display = "none";
    if (expandedIcons) expandedIcons.style.display = "flex";
    if (noteBtns) noteBtns.style.display = "none";

    noteElement.style.position = "absolute";
    noteElement.style.top = "0%";
    noteElement.style.left = "0%";
    noteElement.style.transform = "translate(15%, 50%)";
    noteElement.style.width = "1100px";
    noteElement.style.zIndex = "1000";

    if (addNoteMini) addNoteMini.style.display = "none";
    if (overlay) overlay.style.display = "block";

    saveExpandedState(noteElement.dataset.noteId);
}

//! Общая функция для сворачивания заметки
function collapseNote(noteElement) {
    const overlay = getElement(".overlay");
    const resizeIcon = noteElement.querySelector(".note-resize__one");
    const expandedIcons = noteElement.querySelector(".expanded-icons");
    const noteBtns = noteElement.querySelector(".noteBtns-container");
    const addNoteMini = getElement("#addNoteMini");

    document.querySelectorAll(".note-item").forEach((item) => {
        item.style.display = "flex";
    });

    noteElement.classList.remove("expanded");
    if (resizeIcon) resizeIcon.style.display = "block";
    if (expandedIcons) expandedIcons.style.display = "none";
    if (noteBtns) noteBtns.style.display = "flex";

    noteElement.style.position = "";
    noteElement.style.top = "";
    noteElement.style.left = "";
    noteElement.style.transform = "";
    noteElement.style.width = "";
    noteElement.style.zIndex = "";

    if (addNoteMini) addNoteMini.style.display = "grid";
    if (overlay) overlay.style.display = "none";

    removeExpandedState(noteElement.dataset.noteId);
}

//! Показ заметок
function displayNotes(notesArray = null) {
    const notesList = getElement("#notes-list");
    const addNoteMain = getElement("#addNoteDiv");
    if (!notesList) return;

    const fragment = document.createDocumentFragment();
    const notes = notesArray || JSON.parse(localStorage.getItem("notes")) || [];
    const isSearchResult = notesArray !== null;

    notesList.innerHTML = "";
    addNoteMain.style.display = notes.length ? "none" : "grid";

    if (!notes.length && isSearchResult) {
        const noResults = document.createElement("div");
        noResults.className = "no-results";
        noResults.textContent = "Ничего не найдено";
        fragment.appendChild(noResults);
    }

    const savedViewMode = localStorage.getItem("viewMode") || "grid";
    const sortedNotes = [...notes].sort(
        (a, b) => b.pinned - a.pinned || b.id - a.id
    );

    sortedNotes.forEach((note) => {
        const listItem = createNoteElement(note);
        fragment.appendChild(listItem);
    });

    if (notes.length) {
        const miniButton = document.createElement("div");
        miniButton.id = "addNoteMini";
        miniButton.className = "mini-create__nl";
        miniButton.innerHTML = `<span>+</span><p>Создать заметку</p>`;
        miniButton.onclick = popup;
        fragment.appendChild(miniButton);
    }

    notesList.appendChild(fragment);
    applyViewMode(savedViewMode);
    updateViewIcons();
    restoreExpandedNotes();
    initNoteEventDelegation();
}

function createNoteElement(note) {
    const listItem = document.createElement("li");
    listItem.classList.add("note-item");
    listItem.dataset.noteId = note.id;

    const pinIconPath = note.pinned
        ? "/public/assets/icons/pin-note-filled.svg"
        : "/public/assets/icons/pin-note.svg";

    const pinnedClass = note.pinned ? "pinned" : "";

    listItem.innerHTML = `
        <div class="note-title-container">
            <div class="note-title">${note.title || "Без названия"}</div>
            <div class="resize-controls">
                <img class="note-resize__one" src="/public/assets/icons/resize-more.svg" alt="img">
                <div class="expanded-icons" style="display: none; gap: 10px;">
                    <img src="/public/assets/icons/more-note.svg" alt="img">
                    <img class="resize-less" src="/public/assets/icons/resize-less.svg" alt="img">
                </div>
            </div>
        </div>
        <div class="note-text">${note.text}</div>
        <div class="noteBtns-container">
            <button class="editBtn"><img src="/public/assets/icons/edit-note.svg" alt="img"></button>
            <button class="deleteBtn"><img src="/public/assets/icons/delete-note.svg" alt="img"></button>
            <button class="pinBtn ${pinnedClass}">
                <img src="${pinIconPath}" alt="Закрепить">
            </button>
        </div>
    `;
    return listItem;
}

function initNoteEventDelegation() {
    const notesList = getElement("#notes-list");
    if (!notesList) return;

    notesList.addEventListener("click", (e) => {
        const target = e.target;
        const noteItem = target.closest(".note-item");
        if (!noteItem) return;

        const noteId = parseInt(noteItem.dataset.noteId);

        if (target.closest(".note-resize__one")) {
            expandNote(noteItem);
        } else if (target.closest(".resize-less")) {
            collapseNote(noteItem);
        } else if (target.closest(".pinBtn")) {
            pinNote(noteId);
        } else if (target.closest(".editBtn")) {
            editNote(noteId);
        } else if (target.closest(".deleteBtn")) {
            deleteNote(noteId);
        }
    });
}

//! Функция для восстановления расширенных заметок
function restoreExpandedNotes() {
    expandedNotes.forEach((noteId) => {
        const noteElement = document.querySelector(
            `.note-item[data-note-id="${noteId}"]`
        );
        if (noteElement) expandNote(noteElement);
    });
}

//! Редактирование заметок
function editNote(noteId) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const noteToEdit = notes.find((note) => note.id === noteId);
    if (!noteToEdit) return;

    const editingPopup = document.createElement("div");
    editingPopup.id = "editing-container";
    editingPopup.dataset.noteId = noteId;
    editingPopup.innerHTML = `
        <input type="text" id="edit-note-title" value="${noteToEdit.title || ""}" placeholder="Название">
        <textarea id="edit-note-text">${noteToEdit.text}</textarea>
        <div id="btn-container">
            <button id="submitBtn">Сохранить</button>
            <button id="closeBtn">Отмена</button>
        </div>
    `;

    document.body.appendChild(editingPopup);
    getElement("#submitBtn").addEventListener("click", updateNote);
    getElement("#closeBtn").addEventListener("click", closeEditPopup);
}

function closeEditPopup() {
    const editingPopup = getElement("#editing-container");
    if (editingPopup) editingPopup.remove();
}

function updateNote() {
    const editingPopup = getElement("#editing-container");
    if (!editingPopup) return;

    const noteId = parseInt(editingPopup.dataset.noteId);
    const title = getElement("#edit-note-title").value;
    const noteText = getElement("#edit-note-text").value.trim();

    if (noteText !== "" || title.trim() !== "") {
        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        const noteIndex = notes.findIndex((note) => note.id === noteId);

        if (noteIndex !== -1) {
            notes[noteIndex].title = title;
            notes[noteIndex].text = noteText;
            localStorage.setItem("notes", JSON.stringify(notes));
            updateNoteElement(notes[noteIndex]);
        }

        editingPopup.remove();
    }
}

//! Удаление заметок
function deleteNote(noteId) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes = notes.filter((note) => note.id !== noteId);
    localStorage.setItem("notes", JSON.stringify(notes));

    const noteElement = document.querySelector(
        `.note-item[data-note-id="${noteId}"]`
    );
    if (noteElement) noteElement.remove();

    const notesList = getElement("#notes-list");
    if (notesList && !notesList.querySelector(".note-item")) {
        displayNotes();
    }
}

//! Роутер
class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentPath = window.location.hash.substring(1) || "/";
        this.appElement = getElement("#app");
        this.initRouter();
    }

    initRouter() {
        this.handleRoute();
        window.addEventListener("hashchange", () => this.handleRoute());
        document.addEventListener(
            "click",
            (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (link) {
                    e.preventDefault();
                    this.navigateTo(link.getAttribute("href"));
                }
            },
            true
        );
    }

    handleRoute() {
        const path = window.location.hash.substring(1) || "/";
        const route =
            this.routes.find((r) => r.path === path) || this.routes[0];
        const template = getElement(`#template-${route.id}`);

        if (!template) {
            this.showError();
            return;
        }

        const content = template.cloneNode(true);
        content.id = "";
        content.style.display = "block";
        this.appElement.innerHTML = "";
        this.appElement.appendChild(content);

        this.updateActiveMenu(path);
        initAppListeners();

        if (path === "/notes") {
            setTimeout(() => {
                displayNotes();
                initDateUpdater();
            }, 10);
        }
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

    showError() {
        const app = getElement("#app");
        if (app)
            app.innerHTML = `<div class="error"><h2>404</h2><p>Страница не найдена</p></div>`;
    }

    navigateTo(path) {
        window.location.hash = path;
        this.currentPath = path;
    }
}

//! Миграция старых заметок
function migrateNotes() {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    let updated = false;

    const migratedNotes = notes.map((note) => {
        if (note.pinned === undefined) {
            note.pinned = false;
            updated = true;
        }
        return note;
    });

    if (updated) localStorage.setItem("notes", JSON.stringify(migratedNotes));
}

//! Инициализация приложения
document.addEventListener("DOMContentLoaded", () => {
    migrateNotes();
    document.body.classList.add("app-ready");

    const savedExpanded = localStorage.getItem("expandedNotes");
    if (savedExpanded) expandedNotes = JSON.parse(savedExpanded);

    router = new Router([
        { id: "home", path: "/", template: null },
        { id: "notes", path: "/notes", template: null },
        { id: "important", path: "/important", template: null },
        { id: "planned", path: "/planned", template: null },
        { id: "trash", path: "/trash", template: null },
    ]);

    initMenuHandlers();
    initSearchActions();
    initRightIcons();
    updateWidthClass();
});

//! Установка текующей даты для страницы заметок
function initDateUpdater() {
    const dateElement = getElement(".notes__days span");
    if (!dateElement) return;

    const currentDate = new Date();
    const days = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
    dateElement.textContent =
        `${days[currentDate.getDay()]}, ` +
        `${String(currentDate.getDate()).padStart(2, "0")}.` +
        `${String(currentDate.getMonth() + 1).padStart(2, "0")}.` +
        `${currentDate.getFullYear()}`;
}

//! Поиск заметок
function initSearchActions() {
    const searchInput = getElement(".search__input");
    const searchIcon = getElement(".search-icon");
    if (!searchInput || !searchIcon) return;

    let searchTimer;
    const performSearch = () => {
        const searchText = searchInput.value.trim();
        if (!searchText) {
            displayNotes();
            return;
        }

        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        const searchLower = searchText.toLowerCase();

        const filteredNotes = notes.filter((note) => {
            const searchString =
                `${note.title || ""} ${note.text || ""}`.toLowerCase();
            return searchLower
                .split(/\s+/)
                .every((word) => word && searchString.includes(word));
        });

        displayNotes(filteredNotes);
    };

    searchIcon.addEventListener("click", performSearch);
    searchInput.addEventListener(
        "keydown",
        (e) => e.key === "Enter" && performSearch()
    );
    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimer);
        if (!searchInput.value.trim()) displayNotes();
        else searchTimer = setTimeout(performSearch, 300);
    });
}
