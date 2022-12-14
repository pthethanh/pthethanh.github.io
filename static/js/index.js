function isValidEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

function goTo(path) {
  window.location.href = path
}

function getQueryParam(k, def) {
  var url = new URL(window.location.href)
  let v = url.searchParams.get(k)
  if (v === null) {
    return def
  }
  return v
}

function getQueryParams() {
  var url = new URL(window.location.href)
  return url.searchParams
}

const app = {
  openTopMenu: false,
  toggleTopMenu() {
    this.openTopMenu = !this.openTopMenu;
  },
  closeTopMenu() {
    this.openTopMenu = false;
  },
  logout() {
    fetch('/auth/logout', {
        method: 'POST'
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.error !== undefined && data.error !== '') {
          alert(data.error)
          return
        }
        goTo('/')
      })
      .catch((err) => {
        alert(err)
      })
      .finally(() => {
        console.log('done')
      })
  }
};

function LoadingParagraph(props) {
  return {
    $template: '#loading-paragraph',
    count: props.count,
    inc() {
      this.count++
    }
  }
}

window.onload = (event) => {
  PetiteVue.createApp({
    app,
    LoadingParagraph
  }).mount();

  // show & hide top menu on scroll.
  var prevPos = window.pageYOffset;
  window.onscroll = function() {
    var curPos = window.pageYOffset;
    if (prevPos > curPos) {
      var el = document.getElementById("header")
      if (el) {
        el.style.top = "0";
      }
    } else {
      var el = document.getElementById("header")
      if (el) {
        el.style.top = "-56px";
      }
    }
    prevPos = curPos;
  }
};
