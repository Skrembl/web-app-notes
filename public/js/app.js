document.addEventListener("DOMContentLoaded", function () {
    //! Создание заметки (прототип)
    const list = document.querySelector(".create-new__list");
    const newPage = document.querySelector(".new__page");
    list.addEventListener("click", function () {
        if (list) {
            list.style.display = "none";
            newPage.style.display = "block";
        }
        // else {
        //     list.style.display = "block";
        //     newPage.style.display = "none";
        // }
    });

    //! Обработчик поиска
    const searchInput = document.querySelector(".search__input");
    searchInput.addEventListener("input", function (e) {
        const searchTerm = e.target.value.toLowerCase();
        console.log("Поиск:", searchTerm);
    });
    const searchBlock = document.querySelector(".search");

    searchInput.addEventListener("focus", () => {
        searchBlock.classList.add("search--active");
        searchBlock.style.boxShadow = "0px 0px 0px 0px var(--shadow-color-1)";
    });
    searchInput.addEventListener("blur", () => {
        searchBlock.classList.remove("search--active");
        searchBlock.style.boxShadow = "0px 0px 30px 10px var(--shadow-color-1)";
    });

    //! Обработчики для правой части навигации
    const navRightIcons = document.querySelectorAll(".nb__right img");
    navRightIcons.forEach((icon) => {
        icon.addEventListener("click", function () {
            const altText = this.alt;
            switch (altText) {
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

    //! Плавное появление элементов при клике на меню
    const menuLeft = document.getElementById("menu-left");
    const leftItems = document.querySelector(".menu__left-items");

    menuLeft.addEventListener("click", () => {
        leftItems.classList.toggle("slide");
    });
});
