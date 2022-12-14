const login = {
  user: {
    email: '',
    password: ''
  },
  dirty: false,
  errors: {},
  processing: false,
  validatePassword() {
    if (!this.dirty) {
      return true
    }
    this.errors.password = ''
    if (this.user.password === '') {
      this.errors.password = 'Password is required.'
      return false
    }
    return true
  },
  validateEmail() {
    if (!this.dirty) {
      return true
    }
    this.errors.email = ''
    if (this.user.email === '') {
      this.errors.email = 'Email is required'
      return false
    }
    if (!isValidEmail(this.user.email)) {
      this.errors.email = 'Email is invalid'
      return false
    }
    return true
  },
  validate() {
    this.dirty = true
    return this.validateEmail() && this.validatePassword()
  },
  auth() {
    this.processing = true
    this.errors.server = ''
    if (!this.validate()) {
      this.processing = false
      return
    }
    fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.user)
      })
      .then((response) => response.json())
      .then((data) => {
        console.log('code', data)
        if (data.status != 200 && data.status < 500) {
          this.errors.server = 'Invalid email or password!'
          return
        }
        if (data.error !== undefined && data.error !== '') {
          this.errors.server = 'Server Error: ' + data.error
          return
        }
        goTo(getQueryParam('redirect', '/'))
      })
      .catch((err) => {
        this.errors.server = 'Server Error: ' + err
      })
      .finally(() => {
        this.processing = false
      })
  }
}