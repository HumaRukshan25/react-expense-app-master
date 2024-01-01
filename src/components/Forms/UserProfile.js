import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import fire from '../../config/Fire';
import firebase from 'firebase/app';
import 'firebase/firestore'; // Import Firestore

import './UserProfile.css';

class UserProfile extends Component {
    state = {
        userName: '',
        userEmail: '',
        userBio: '',
        userContact: '',
        editMode: false,
        newEmail: '',
        registrationSuccess: false,
    };

    componentDidMount() {
        this.authListener();
        this.fetchUserProfileData();
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

    async fetchUserProfileData() {
        const user = fire.auth().currentUser;

        if (user) {
            const db = firebase.firestore();
            const userRef = db.collection('users').doc(user.uid);

            try {
                const doc = await userRef.get();

                if (doc.exists) {
                    const userData = doc.data();
                    this.setState({
                        userName: userData.userName || '',
                        userEmail: userData.userEmail || '',
                        userBio: userData.userBio || '',
                        userContact: userData.userContact || '',
                    });
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching user profile data:', error);
            }
        }
    }

    toggleEditMode = () => {
        this.setState((prevState) => ({ editMode: !prevState.editMode }));
    };

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    saveChanges = async () => {
        const user = fire.auth().currentUser;

        if (user) {
            const db = firebase.firestore();
            const userRef = db.collection('users').doc(user.uid);

            if (this.state.newEmail && this.state.newEmail !== this.state.userEmail) {
                await user.updateEmail(this.state.newEmail);
                this.setState({ userEmail: this.state.newEmail, newEmail: '' });
            }

            await userRef.set({
                userName: this.state.userName,
                userEmail: this.state.userEmail,
                userBio: this.state.userBio,
                userContact: this.state.userContact,
            });

            await user.updateProfile({
                displayName: this.state.userName,
            });

            this.toggleEditMode();
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
