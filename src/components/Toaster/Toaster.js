import "./Toaster.scss";

const ERROR_ICON = '<i class="fas fa-exclamation-triangle"></i>';
const SUCCESS_ICON = '<i class="fas fa-check"></i>';
const UPLOAD_ICON = '<i class="fas fa-upload"></i>';

class Toaster {
    constructor() {
        this.errorIcon = ERROR_ICON;
        this.successIcon = SUCCESS_ICON;
        this.uploadIcon = UPLOAD_ICON;
        this.timeout = null;
        this.timer = 0;
        this.toasterElement = null;
        this.contentElement = null;
    }

    #render() {
        const template = `
      <div class="toaster">
        <div class="content">
          <p></p>
        </div>
      </div>`;
        $('body').append(template);
        this.toasterElement = $('.toaster');
        this.contentElement = $('.toaster .content');
    }

    trigger(prop) {
        const { type, content, timeout } = prop;
        this.timeout = timeout;
        let icon = null;

        switch (type) {
            case 'error':
                icon = this.errorIcon;
                break;
            case 'success':
                icon = this.successIcon;
                break;
            case 'upload':
                icon = this.uploadIcon;
                break;
        }

        this.toasterElement?.remove();
        this.#render();

        const backgroundColor =
            type === 'success' ? '#a5e1ba' :
                type === 'error' ? '#ffbbbb' :
                    type === 'upload' ? '#f9c76b' : 'white';

        this.toasterElement.css({ background: backgroundColor });
        this.contentElement.prepend(icon);
        this.contentElement.find('p').empty().text(content);
        this.#show(type);
    }

    #show(type) {
        this.toasterElement.addClass('toaster-active');

        if (type !== 'upload') {
            this.timer = setTimeout(() => {
                this.#rest();
            }, this.timeout);
        }
    }

    #rest = () => {
        this.toasterElement.removeClass('toaster-active');
        this.contentElement.find('i').remove();
        this.contentElement.find('p').text('');
    };

    kill() {
        this.toasterElement.removeClass('toaster-active');
        this.contentElement.find('i').remove();
        this.contentElement.find('p').text('');
    }
}

export default Toaster;
