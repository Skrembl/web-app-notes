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
                case "Перезагрузка":
                    location.reload();
                    break;
                case "Список":
                    console.log("Показать список заметок");
                    break;
                case "Настройки":
                    console.log("Открыть настройки");
                    break;
            }
        });
    });

    //! Обработчик для меню (прототип)
    document
        .querySelector('.nb__left img[alt="Меню"]')
        .addEventListener("click", function () {
            console.log("Открытие бокового меню");
        });
});

// ! Эффект печатающегося текста
class TypeWriter {
    constructor(elementId, texts, speed = 100, pause = 2000) {
        this.element = document.getElementById(elementId);
        this.texts = texts;
        this.speed = speed;
        this.pause = pause;
        this.index = 0;
        this.text = "";
        this.isDeleting = false;
        this.type();
    }

    type() {
        const currentText = this.texts[this.index];

        if (this.isDeleting) {
            this.text = currentText.substring(0, this.text.length - 1);
        } else {
            this.text = currentText.substring(0, this.text.length + 1);
        }

        this.element.innerHTML = this.text + '<span class="cursor">|</span>';

        let typeSpeed = this.speed;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.text === currentText) {
            typeSpeed = this.pause;
            this.isDeleting = true;
        } else if (this.isDeleting && this.text === "") {
            this.isDeleting = false;
            this.index = (this.index + 1) % this.texts.length;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

new TypeWriter(
    "typing-effect",
    ["Эта страница в разработке!", "Приносим свои извинения"],
    100,
    1500
);
