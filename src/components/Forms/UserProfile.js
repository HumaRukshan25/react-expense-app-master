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
            <div className="user-profile-container">
                {/* Profile Icon */}        
                <FontAwesomeIcon icon={faUserCircle} onClick={this.toggleEditMode}
  className="profile-icon"
  size="3x"  style={{ color: 'purple' }}// You can adjust the size attribute, e.g., "2x", "3x", "4x", etc.
/>

                {isProfileIncomplete && (
                    <div className="alert alert-danger profile-incomplete-message">
                        <p>Your profile is incomplete. Please fill in all required fields.</p>
                    </div>
                )}

                {this.state.editMode ? (
                    <>
                   <label className="mt-2">Name:</label>
<input
    type="text"
    name="userName"
    value={this.state.userName}
    onChange={this.handleInputChange}
    className="form-control"
/>

<label className="mt-2">Bio:</label>
<textarea
    name="userBio"
    value={this.state.userBio}
    onChange={this.handleInputChange}
    className="form-control"
/>

<label className="mt-2">Contact:</label>
<input
    type="text"
    name="userContact"
    value={this.state.userContact}
    onChange={this.handleInputChange}
    className="form-control"
/>

                        <br></br>
                        <button onClick={this.saveChanges} className="btn btn-primary">
                            Save Changes
                        </button>
                    </>
                ) : (
                    <>
                        <p><b>{this.state.userEmail}</b></p>
                        
                        <button onClick={this.toggleEditMode} className="btn btn-secondary btn-sm">
    Edit Profile
</button>

                    </>
                )}
            </div>
        );
    }
}

export default UserProfile;
