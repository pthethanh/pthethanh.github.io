const forgot_password = {
  email: '',
  dirty: false,
  errors: {},
  processing: false,
  sent: false,
  validateEmail() {
    if (!this.dirty) {
      return true
    }
    this.errors.email = ''
    if (this.email === '') {
      this.errors.email = 'Email is required'
      return false
    }
    if (!isValidEmail(this.email)) {
      this.errors.email = 'Email is invalid'
      return false
    }
    return true
  },
  validate() {
    this.dirty = true
    return this.validateEmail()
  },
  send() {
    this.sent = false
    this.processing = true
    this.errors.server = ''
    if (!this.validate()) {
      this.processing = false
      return
    }
    fetch('/api/v1/users/password/forgot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.email
        })
      })
      .then((response) => response.json())
      .then((data) => {
        // security: tell them if and only if real server error happen
        if (data.code >= 500 && data.error !== undefined && data.error !== '') {
          this.errors.server = 'Server Error: ' + data.error
          return
        }
        this.sent = true
      })
      .catch((err) => {
        this.errors.server = 'Server Error: ' + err
      })
      .finally(() => {
        this.processing = false
      })
  }
}