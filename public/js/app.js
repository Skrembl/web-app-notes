//! Функция инициализации всех обработчиков событий
function initAppListeners() {
    //! 1. Создание новой заметки
    const list = document.querySelector(".create-new__list");
    const newPage = document.querySelector(".new__page");
    if (list && newPage) {
        list.addEventListener("click", () => {
            list.style.display = "none";
            newPage.style.display = "block";
        });
    }

    //! 2. Поиск
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

    //! 3. Иконки справа (Список, Настройки, Аккаунт)
    document.querySelectorAll(".nb__right img").forEach((icon) => {
        icon.addEventListener("click", function () {
            switch (this.alt) {
                case "Список":
                    console.log("Показать список заметок");
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

    //! 4. Плавное появление бокового меню
    const menuLeft = document.getElementById("menu-left");
    const leftItems = document.querySelector(".menu__left-items");
    const createNewList = document.querySelector(".create-new__list");
    if (menuLeft && leftItems && createNewList) {
        menuLeft.addEventListener("click", () => {
            const isOpen = leftItems.classList.toggle("slide");
            createNewList.style.left = isOpen ? "calc(50% + 250px)" : "50%";

            localStorage.setItem("menuOpen", isOpen ? "true" : "false");
        });

        const menuWasOpen = localStorage.getItem("menuOpen") === "true";
        if (menuWasOpen) {
            leftItems.classList.add("slide");
            createNewList.style.left = "calc(50% + 250px)";
        } else {
            leftItems.classList.remove("slide");
            createNewList.style.left = "50%";
        }
    }

    //! 5. Активный пункт меню слева
    document.querySelectorAll(".menu__left-items a").forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            document.querySelectorAll(".menu__left-items li").forEach((li) => {
                li.classList.remove("active");
            });
            this.parentElement.classList.add("active");
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initAppListeners();
});

//! Роутер для SPA
class Router {
    constructor(routes) {
        this.routes = routes;
        this.initRouter();
    }

    initRouter() {
        window.addEventListener("hashchange", () => this.handleRoute());
        window.addEventListener("load", () => this.handleRoute());

        document.addEventListener("click", (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                this.navigateTo(link.getAttribute("href"));
            }
        });
    }

    async handleRoute() {
        const path = window.location.hash.substring(1);

        if (!path || path === "/") {
            this.showInitialContent();
            initAppListeners();
            return;
        }

        const route = this.routes.find((r) => r.path === path);
        if (!route) {
            this.showError();
            return;
        }

        try {
            const content = await this.loadContent(route.template);
            this.updateAppContent(content);
            initAppListeners();
            this.initDynamicContent();
        } catch (e) {
            this.showError();
        }
    }

    // showInitialContent() {
    //     const app = document.getElementById("app");
    //     if (app) {
    //         app.innerHTML = `
    //             <header class="header">
    //                 <div class="container">
    //                     <a href="#/notes" class="start">Начать</a>
    //                 </div>
    //             </header>
    //         `;
    //     }
    // }

    async loadContent(template) {
        const response = await fetch(template);
        if (!response.ok) throw new Error("Failed to load template");
        return await response.text();
    }

    updateAppContent(content) {
        const appContainer = document.getElementById("app");
        if (appContainer) {
            appContainer.innerHTML = content;
        }
    }

    showError() {
        const appContainer = document.getElementById("app");
        if (appContainer) {
            appContainer.innerHTML = `
                <div class="error">
                    <h2>404</h2>
                    <p>Страница не найдена</p>
                </div>
            `;
        }
    }

    navigateTo(path) {
        window.location.hash = path;
    }

    initDynamicContent() {
        const menuLinks = document.querySelectorAll(".menu__left-items a");
        menuLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                this.navigateTo(link.getAttribute("href"));
                this.updateActiveMenu();
            });
        });

        this.updateActiveMenu();
    }

    updateActiveMenu() {
        const currentPath = window.location.hash.substring(1);
        document.querySelectorAll(".menu__left-items a").forEach((link) => {
            const linkPath = link.getAttribute("href").replace("#", "");
            link.parentElement.classList.toggle(
                "active",
                linkPath === currentPath
            );
        });
    }
}

const router = new Router([
    { path: "/notes", template: "/public/pages/notes.html" },
    { path: "/important", template: "/public/pages/important.html" },
    { path: "/planned", template: "/public/pages/planned.html" },
    { path: "/trash", template: "/public/pages/trash.html" },
]);
