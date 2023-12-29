import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import fire from '../../config/Fire';
import './UserProfile.css';

class UserProfile extends Component {
    state = {
        userName: '',
        userEmail: '',
        userBio: '',
        userContact: '',
        editMode: false,
        newEmail: '',
        registrationSuccess: false, // Track user registration success
    };

    componentDidMount() {
        this.authListener();
    }

    authListener() {
        fire.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({
                    userName: user.displayName || '',
                    userEmail: user.email || '',
                    userBio: '',
                    userContact: '',
                });
            } else {
                // User is not logged in, redirect to login or handle accordingly
                // You can use react-router-dom for navigation
            }
        });
    }

    toggleEditMode = () => {
        this.setState((prevState) => ({ editMode: !prevState.editMode }));
    };

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    saveChanges = () => {
        const user = fire.auth().currentUser;
        if (user) {
            // Check if newEmail is not empty and different from the current email
            if (this.state.newEmail && this.state.newEmail !== this.state.userEmail) {
                user.updateEmail(this.state.newEmail)
                    .then(() => {
                        // Email update successful
                        this.setState({ userEmail: this.state.newEmail, newEmail: '' });
                    })
                    .catch((error) => {
                        // Handle error
                        console.error('Error updating email:', error);
                    });
            }

            user.updateProfile({
                displayName: this.state.userName,
                // Update other profile details as needed
            })
                .then(() => {
                    // Update successful
                    this.toggleEditMode();
                })
                .catch((error) => {
                    // Handle error
                    console.error('Error updating profile:', error);
                });
        }
    };

    handleSignOut = () => {
        fire.auth().signOut();
    };

    render() {
        const isProfileIncomplete =
            !this.state.userName || !this.state.userEmail || !this.state.userBio || !this.state.userContact;

        return (
            <div>
                <h6>User Profile</h6>

                {/* Profile Icon */}
                <FontAwesomeIcon icon={faUserCircle} onClick={this.toggleEditMode} />

                {isProfileIncomplete && (
                    <div className="profile-incomplete-message">
                        <p>Your profile is incomplete. Please fill in all required fields.</p>
                    </div>
                )}

                {this.state.editMode ? (
                    <>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="userName"
                            value={this.state.userName}
                            onChange={this.handleInputChange}
                        />
                        <label>Email:</label>
                        <input
                            type="email"
                            name="newEmail"
                            value={this.state.newEmail}
                            onChange={this.handleInputChange}
                        />
                        <label>Bio:</label>
                        <textarea
                            name="userBio"
                            value={this.state.userBio}
                            onChange={this.handleInputChange}
                        />
                        <label>Contact:</label>
                        <input
                            type="text"
                            name="userContact"
                            value={this.state.userContact}
                            onChange={this.handleInputChange}
                        />
                        <button onClick={this.saveChanges}>Save Changes</button>
                    </>
                ) : (
                    <>
                        <p>{this.state.userEmail}</p>
                        <button onClick={this.toggleEditMode}>Edit Profile</button>
                    </>
                )}
            </div>
        );
    }
}

export default UserProfile;
