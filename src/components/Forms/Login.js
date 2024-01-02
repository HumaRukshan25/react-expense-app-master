import React, { Component } from 'react';
import fire from '../../config/Fire';
import './Login.css';

class Login extends Component {
  state = {
    email: '',
    password: '',
    fireErrors: '',
    resetEmail: '',
    resetPasswordSuccess: '',
    showResetForm: false, // Add a state variable to control the visibility of the reset password form
  };

  login = (e) => {
    e.preventDefault();
    fire
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .catch((error) => {
        this.setState({ fireErrors: error.message });
      });
  };

  handleResetPassword = (e) => {
    e.preventDefault();
    const { resetEmail } = this.state;

    fire
      .auth()
      .sendPasswordResetEmail(resetEmail)
      .then(() => {
        this.setState({
          resetPasswordSuccess: 'Password reset email sent. Check your inbox.',
        });
      })
      .catch((error) => {
        this.setState({ fireErrors: error.message });
      });
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  toggleResetForm = () => {
    this.setState((prevState) => ({ showResetForm: !prevState.showResetForm }));
  };

  render() {
    let errorNotification = this.state.fireErrors ? (
      <div className="Error"> {this.state.fireErrors} </div>
    ) : null;

    let resetPasswordSuccessMessage = this.state.resetPasswordSuccess ? (
      <div className="Success"> {this.state.resetPasswordSuccess} </div>
    ) : null;

    return (
      <>
        {errorNotification}
        {resetPasswordSuccessMessage}
        <form>
          <input
            type="text"
            className="regField"
            placeholder="Email"
            value={this.state.email}
            onChange={this.handleChange}
            name="email"
          />
          <input
            className="regField"
            placeholder="Password"
            value={this.state.password}
            onChange={this.handleChange}
            name="password"
            type="password"
          />
          <input
            className="submitBtn"
            type="submit"
            onClick={this.login}
            value="Login"
          />
        </form>

        {/* Add a link to toggle the visibility of the reset password form */}
        <p onClick={this.toggleResetForm} style={{ cursor: 'pointer', color: 'blue' }}>
          Forgot Password?
        </p>

        {this.state.showResetForm && (
          <form>
            <input
              type="text"
              className="regField"
              placeholder="Email"
              value={this.state.resetEmail}
              onChange={this.handleChange}
              name="resetEmail"
            />
            <input
              className="submitBtn"
              type="submit"
              onClick={this.handleResetPassword}
              value="Reset Password"
            />
          </form>
        )}
      </>
    );
  }
}

export default Login;
