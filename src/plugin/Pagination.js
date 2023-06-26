(function (e, d, a, f) {
    var b = e.fn.twbsPagination;
    var c = function (i, g) {
        this.$element = e(i);
        this.options = e.extend({}, e.fn.twbsPagination.defaults, g);
        if (this.options.startPage < 1 || this.options.startPage > this.options.totalPages) {
            throw new Error("Start page option is incorrect")
        }
        this.options.totalPages = parseInt(this.options.totalPages);
        if (isNaN(this.options.totalPages)) {
            throw new Error("Total pages option is not correct!")
        }
        this.options.visiblePages = parseInt(this.options.visiblePages);
        if (isNaN(this.options.visiblePages)) {
            throw new Error("Visible pages option is not correct!")
        }
        if (this.options.totalPages == 1) {
            return this
        }
        if (this.options.totalPages < this.options.visiblePages) {
            this.options.visiblePages = this.options.totalPages
        }
        if (this.options.onPageClick instanceof Function) {
            this.$element.first().on("page", this.options.onPageClick)
        }
        if (this.options.href) {
            this.options.startPage = this.getPageFromQueryString();
            if (!this.options.startPage) {
                this.options.startPage = 1
            }
        }
        var h = (typeof this.$element.prop === "function") ? this.$element.prop("tagName") : this.$element.attr("tagName");
        if (h === "UL") {
            this.$listContainer = this.$element
        } else {
            this.$listContainer = e("<ul></ul>")
        }
        this.$listContainer.addClass(this.options.paginationClass);
        if (h !== "UL") {
            this.$element.append(this.$listContainer)
        }
        if (this.options.initiateStartPageClick) {
            this.show(this.options.startPage)
        } else {
            this.render(this.getPages(this.options.startPage));
            this.setupEvents()
        }
        return this
    };
    c.prototype = {
        constructor: c,
        destroy: function () {
            this.$element.empty();
            this.$element.removeData("twbs-pagination");
            this.$element.off("page");
            return this
        },
        show: function (g) {
            if (g < 1 || g > this.options.totalPages) {
                throw new Error("Page is incorrect.")
            }
            this.currentPage = g;
            this.render(this.getPages(g));
            this.setupEvents();
            this.$element.trigger("page", g);
            return this
        },
        buildListItems: function (g) {
            var l = [];
            if (this.options.first) {
                l.push(this.buildItem("first", 1))
            }
            if (this.options.prev) {
                var k = g.currentPage > 1 ? g.currentPage - 1 : this.options.loop ? this.options.totalPages : 1;
                l.push(this.buildItem("prev", k))
            }
            for (var h = 0; h < g.numeric.length; h++) {
                l.push(this.buildItem("page", g.numeric[h]))
            }
            if (this.options.next) {
                var j = g.currentPage < this.options.totalPages ? g.currentPage + 1 : this.options.loop ? 1 : this.options.totalPages;
                l.push(this.buildItem("next", j))
            }
            if (this.options.last) {
                l.push(this.buildItem("last", this.options.totalPages))
            }
            return l
        },
        buildItem: function (i, j) {
            var k = e("<li></li>"),
                h = e("<a></a>"),
                g = this.options[i] ? this.makeText(this.options[i], j) : j;
            k.addClass(this.options[i + "Class"]);
            k.data("page", j);
            k.data("page-type", i);
            k.append(h.attr("href", this.makeHref(j)).addClass(this.options.anchorClass).html(g));
            return k
        },
        getPages: function (j) {
            var g = [];
            var k = Math.floor(this.options.visiblePages / 2);
            var l = j - k + 1 - this.options.visiblePages % 2;
            var h = j + k;
            if (l <= 0) {
                l = 1;
                h = this.options.visiblePages
            }
            if (h > this.options.totalPages) {
                l = this.options.totalPages - this.options.visiblePages + 1;
                h = this.options.totalPages
            }
            var i = l;
            while (i <= h) {
                g.push(i);
                i++
            }
            return {
                currentPage: j,
                numeric: g
            }
        },
        render: function (g) {
            var i = this;
            this.$listContainer.children().remove();
            var h = this.buildListItems(g);
            jQuery.each(h, function (j, k) {
                i.$listContainer.append(k)
            });
            this.$listContainer.children().each(function () {
                var k = e(this),
                    j = k.data("page-type");
                switch (j) {
                    case "page":
                        if (k.data("page") === g.currentPage) {
                            k.addClass(i.options.activeClass)
                        }
                        break;
                    case "first":
                        k.toggleClass(i.options.disabledClass, g.currentPage === 1);
                        break;
                    case "last":
                        k.toggleClass(i.options.disabledClass, g.currentPage === i.options.totalPages);
                        break;
                    case "prev":
                        k.toggleClass(i.options.disabledClass, !i.options.loop && g.currentPage === 1);
                        break;
                    case "next":
                        k.toggleClass(i.options.disabledClass, !i.options.loop && g.currentPage === i.options.totalPages);
                        break;
                    default:
                        break
                }
            })
        },
        setupEvents: function () {
            var g = this;
            this.$listContainer.off("click").on("click", "li", function (h) {
                var i = e(this);
                if (i.hasClass(g.options.disabledClass) || i.hasClass(g.options.activeClass)) {
                    return false
                } !g.options.href && h.preventDefault();
                g.show(parseInt(i.data("page")))
            })
        },
        makeHref: function (g) {
            return this.options.href ? this.generateQueryString(g) : "#"
        },
        makeText: function (h, g) {
            return h.replace(this.options.pageVariable, g).replace(this.options.totalPagesVariable, this.options.totalPages)
        },
        getPageFromQueryString: function (g) {
            var h = this.getSearchString(g),
                i = new RegExp(this.options.pageVariable + "(=([^&#]*)|&|#|$)"),
                j = i.exec(h);
            if (!j || !j[2]) {
                return null
            }
            j = decodeURIComponent(j[2]);
            j = parseInt(j);
            if (isNaN(j)) {
                return null
            }
            return j
        },
        generateQueryString: function (g, h) {
            var i = this.getSearchString(h),
                j = new RegExp(this.options.pageVariable + "=[^&#]");
            if (!i) {
                return ""
            }
            return "?" + i.replace(j, this.options.pageVariable + "=" + g)
        },
        getSearchString: function (g) {
            var h = g || d.location.search;
            if (h === "") {
                return null
            }
            if (h.indexOf("?") === 0) {
                h = h.substr(1)
            }
            return h
        }
    };
    e.fn.twbsPagination = function (i) {
        var h = Array.prototype.slice.call(arguments, 1);
        var k;
        var l = e(this);
        var j = l.data("twbs-pagination");
        var g = typeof i === "object" ? i : {};
        if (!j) {
            l.data("twbs-pagination", (j = new c(this, g)))
        }
        if (typeof i === "string") {
            k = j[i].apply(j, h)
        }
        return (k === f) ? l : k
    };
    e.fn.twbsPagination.defaults = {
        totalPages: 1,
        startPage: 1,
        visiblePages: 5,
        initiateStartPageClick: true,
        href: false,
        pageVariable: "{{page}}",
        totalPagesVariable: "{{total_pages}}",
        page: null,
        first: "First",
        prev: "Previous",
        next: "Next",
        last: "Last",
        loop: false,
        onPageClick: null,
        paginationClass: "pagination",
        nextClass: "page-item next",
        prevClass: "page-item prev",
        lastClass: "page-item last",
        firstClass: "page-item first",
        pageClass: "page-item",
        activeClass: "active",
        disabledClass: "disabled",
        anchorClass: "page-link"
    };
    e.fn.twbsPagination.Constructor = c;
    e.fn.twbsPagination.noConflict = function () {
        e.fn.twbsPagination = b;
        return this
    };
    e.fn.twbsPagination.version = "1.4"
})(window.jQuery, window, document);

