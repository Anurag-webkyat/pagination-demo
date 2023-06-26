import "./Shimmer.scss";
class Shimmer {
    constructor() {
        this.rendered = false;
    }
    render() {
        const shimmer = `<div class="shimmer"></div>`;
        if (!this.rendered)
            $('body').prepend(shimmer);
    }
    show() {
        return $('.shimmer').fadeIn();
    }
    hide() {
        return $('.shimmer').fadeOut();
    }
}

export default Shimmer;