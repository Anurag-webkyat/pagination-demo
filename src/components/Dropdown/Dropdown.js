class Dropdown {
    constructor(selectBoxRef) {
        this.init = false;
        this.dropdownElement = null;
        this.selectItem = null;
        this.searchInput = null;
        this.emptyStateElement = null;
        this.contentContainer = null;

        const data = this.getDataFromSelect(selectBoxRef);
        if (data.length) {
            this.createDropdown(data);
            this.init = true;
            this.enableSearch();
            this.replaceSelectBox(selectBoxRef);
            this.addClickListeners();
            this.hideContentContainer();
        } else {
            this.createEmptyDropdown();
            console.warn("No options found in the select box");
        }
    }

    createDropdown(data) {
        this.dropdownElement = document.createElement("div");
        this.dropdownElement.classList.add("w-drop-down");

        this.selectItem = this.createDivElement("Select", "w-selected");
        this.dropdownElement.appendChild(this.selectItem);

        this.contentContainer = document.createElement("div");
        this.contentContainer.classList.add("contentContainer");

        this.searchInput = this.createInputElement("text", "Search", "search-input");
        this.contentContainer.appendChild(this.searchInput);

        const dropdownList = this.createListElement("dropdown-list", data);
        this.contentContainer.appendChild(dropdownList);

        this.dropdownElement.appendChild(this.contentContainer);
    }

    createEmptyDropdown() {
        this.dropdownElement = document.createElement("div");
        this.dropdownElement.classList.add("w-drop-down");

        this.emptyStateElement = this.createSpanElement("No options available");
        this.emptyStateElement.style.display = "none";
        this.dropdownElement.appendChild(this.emptyStateElement);
    }

    createDivElement(textContent, className) {
        const divElement = document.createElement("div");
        divElement.textContent = textContent;
        divElement.classList.add(className);
        return divElement;
    }

    createInputElement(type, placeholder, className) {
        const inputElement = document.createElement("input");
        inputElement.type = type;
        inputElement.placeholder = placeholder;
        inputElement.classList.add(className);
        return inputElement;
    }

    createListElement(className, data) {
        const listElement = document.createElement("ul");
        listElement.classList.add(className);
        data.forEach((option) => {
            const listItem = document.createElement("li");
            listItem.textContent = option;
            listElement.appendChild(listItem);

            // Add event listener to close the dropdown when a list item is clicked
            listItem.addEventListener("click", () => {
                this.hideContentContainer();
            });
        });
        return listElement;
    }

    createSpanElement(textContent) {
        const spanElement = document.createElement("span");
        spanElement.textContent = textContent;
        return spanElement;
    }

    show = () => {
        if (this.init) {
            this.dropdownElement.style.display = "block";
        }
    };

    hide = () => {
        if (this.init) {
            this.dropdownElement.style.display = "none";
        }
    };

    enableSearch = () => {
        if (this.init) {
            const dropdownList = this.contentContainer.querySelector(".dropdown-list");
            const listItemElements = Array.from(dropdownList.children);

            this.searchInput.addEventListener("input", () => {
                const searchTerm = this.searchInput.value.toLowerCase().trim();
                let foundMatch = false;

                listItemElements.forEach((listItem) => {
                    const listItemText = listItem.textContent.toLowerCase();
                    const isMatch = listItemText.includes(searchTerm);
                    listItem.style.display = isMatch ? "block" : "none";

                    if (isMatch) {
                        foundMatch = true;
                    }
                });

                this.showEmptyState(!foundMatch);
            });
        }
    };

    updateData(selectedOption) {
        const dropdownList = this.contentContainer.querySelector(".dropdown-list");
        const listItemElements = Array.from(dropdownList.children);

        listItemElements.forEach((listItem) => {
            listItem.classList.remove("selected");

            if (listItem.textContent === selectedOption) {
                this.selectItem.textContent = selectedOption;
                listItem.classList.add("selected");
            }
        });
    }

    showEmptyState(show) {
        if (show) {
            if (this.emptyStateElement) {
                this.emptyStateElement.style.display = "block";
            } else {
                this.emptyStateElement = this.createSpanElement("No options available");
                this.dropdownElement.appendChild(this.emptyStateElement);
            }
        } else {
            if (this.emptyStateElement) {
                this.emptyStateElement.style.display = "none";
            }
        }
    }

    getSelectedValue() {
        return this.selectItem.textContent;
    }

    getDataFromSelect(selectBoxRef) {
        const selectElement = document.querySelector(selectBoxRef);
        if (!selectElement) {
            console.error("Select element not found");
            return [];
        }

        return Array.from(selectElement.options, (option) => option.textContent);
    }

    replaceSelectBox(selectBoxRef) {
        const selectElement = document.querySelector(selectBoxRef);
        if (!selectElement) {
            console.error("Select element not found");
            return;
        }

        const dropdownParent = selectElement.parentElement;
        dropdownParent.replaceChild(this.dropdownElement, selectElement);
    }

    addClickListeners() {
        const dropdownList = this.contentContainer.querySelector(".dropdown-list");
        const listItemElements = Array.from(dropdownList.children);

        listItemElements.forEach((listItem) => {
            listItem.addEventListener("click", () => {
                listItemElements.forEach((item) => item.classList.remove("selected"));
                listItem.classList.add("selected");
                this.selectItem.textContent = listItem.textContent;
            });
        });

        this.selectItem.addEventListener("click", () => {
            if (this.contentContainer.style.display === "none") {
                this.showContentContainer();
            } else {
                this.hideContentContainer();
            }
        });

        document.addEventListener("click", (event) => {
            if (!this.dropdownElement.contains(event.target)) {
                this.hideContentContainer();
            }
        });
    }

    showContentContainer() {
        this.contentContainer.style.display = "block";
    }

    hideContentContainer() {
        this.contentContainer.style.display = "none";
    }
}

export default Dropdown;
