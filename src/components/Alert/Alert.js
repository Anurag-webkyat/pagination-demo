import "./Alert.scss";
import Shimmer from "../shimmer/shimmer";
class Alert {
  constructor(prop) {
    const { title, hint, cta, icon, callback, id, action } = prop || {};
    this.title = title;
    this.hint = hint;
    this.ctaContent = cta.content,
      this.ctaColor = cta.color;
    this.icon = icon.ico;
    this.iconColor = icon.color;
    $('main').prepend(this.#create());
    this.#setup();
    this.shimmer = new Shimmer();
    this.callback = callback;
    this.id = id;
    this.action = action;
  }
  #create() {
    let template =
      `<div class="alert ">
        <div class="icon">
          <div style="background:${this.iconColor}">
         ${this.icon}
        </div>
        </div>
        <div class="content">
          <div class="title">
            ${this.title}
          </div>
          <div class="hint">
            ${this.hint}
          </div>
          <div class="button-holder">
            <button style="color : #363636;" class="alert-cancel">Cancel</button>
            <button class="alert-confirm" style="background : ${this.ctaColor}">${this.ctaContent}</button>
          </div>
        </div>
      </div>`;
    return template;
  }
  show() {
    this.shimmer.show();
    $('.alert').addClass('alert-active');
  }
  hide() {
    this.shimmer.hide();
    $('.alert').removeClass('alert-active');

    $('.alert').remove();

  }
  #setup() {
    $('.alert-cancel').click(() => {
      this.hide();
    });
    $('.alert-confirm').click(() => {
      this.callback(this.id).then(() => {
        this.hide();
        this.action();
      })
    });

  }
}
export default Alert;