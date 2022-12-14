const register = {
  gender: '1',
  user: {
    first_name: '',
    last_name: '',
    gender: 1,
    email: '',
    password: '',
    password_confirm: ''
  },
  errors: {},
  dirty: false,
  processing: false,
  validateFirstName() {
    if (!this.dirty) {
      return true
    }
    this.errors.first_name = ''
    if (this.user.first_name.trim() === '') {
      this.errors.first_name = 'First Name is required.'
      return false
    }
    return true
  },
  validateLastName() {
    if (!this.dirty) {
      return true
    }
    this.errors.last_name = ''
    if (this.user.last_name.trim() === '') {
      this.errors.last_name = 'Last Name is required.'
      return false
    }
    return true
  },
  validatePassword() {
    if (!this.dirty) {
      return true
    }
    this.errors.password = ''
    if (this.user.password === '') {
      this.errors.password = 'Password is required.'
      return false
    }
    if (this.user.password.length < 3) {
      this.errors.password = 'Password is too short.'
      return false
    }
    return true
  },
  validatePasswordConfirm() {
    if (!this.dirty) {
      return true
    }
    if (this.user.password !== this.user.password_confirm) {
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
    return (
      this.validateFirstName() &&
      this.validateLastName() &&
      this.validateEmail() &&
      this.validatePassword() &&
      this.validatePasswordConfirm()
    )
  },
  register() {
    this.errors.server = ''
    this.processing = true
    if (!this.validate()) {
      this.processing = false
      return
    }
    this.user.gender = parseInt(this.gender)
    fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: this.user.first_name,
          last_name: this.user.last_name,
          gender: this.user.gender,
          email: this.user.email,
          password: this.user.password
        })
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.code === 409) {
          this.errors.email = 'Email is being used.'
          return
        }
        if (data.error !== undefined && data.error !== '') {
          this.errors.server = 'Server Error: ' + data.error
          return
        }
        // login right away, email verification will be displayed as notification.
        this.login()
      })
      .catch((err) => {
        this.errors.server = 'Server Error: ' + err
      })
      .finally(() => {
        this.processing = false
      })
  },
  login() {
    this.processing = true
    fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.user.email,
          password: this.user.password
        })
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.error !== undefined && data.error !== '') {
          // login failed, go to login page.
          goTo('/users/login')
          return
        }
        goTo('/')
      })
      .catch((err) => {
        goTo('/users/login')
      })
      .finally(() => {
        this.processing = false
      })
  }
}