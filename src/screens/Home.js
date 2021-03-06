'use-strict';

import React, { Component } from 'react';

import { 
	AppRegistry,
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Navigator,
	Image,
	AsyncStorage,
	ActivityIndicator,
	TextInput
} from 'react-native';

import {
	rootRef,
	authRef
} from './Login';

// Components
var Button = require('../components/Button');
var HomeOrLogin = require('./HomeOrLogin');
var Menu = require('../components/Menu');
var MainContent = require('../components/MainContent');
var AppStyles = require('../styles/AppStyles');

// 3rd Party Components
var NavigationBar = require('react-native-navbar');
var SideMenu = require('react-native-side-menu');
var AppConfig = require('../config/AppConfig');

// Custom navbar title
var NavbarTitle = React.createClass({
	render: function() {
		return (
			<Text style={[AppStyles.baseText, AppStyles.strong, AppStyles.navbarTitle]}>{this.props.title}</Text>
		);
	}
});

// Custom navbar button component
var NavbarButton = React.createClass({
	onPress: function() {
		if (this.props.onPress) this.props.onPress();
	},

	render: function() {
		return (
			<TouchableOpacity onPress={this.onPress} activeOpacity={0.6}>
				<Image source={this.props.image} style={AppStyles.navbarButton} />
			</TouchableOpacity>
		)
	}
});

/**
 *	THIS CLASS IS YOUR ENTRY POINT INTO THE APP
 *  ALL SUBSEQUENT NAVIGATION ROUTES WILL BE PUSHED
 *  ONTO THIS LAYER
 **/
class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			userEmail: null,
			userId: null,
			displayName: null,
			menuIsOpen: false
		};
	}

	navigate(title, link) {
		this.setState({
			menuIsOpen: !this.state.menuIsOpen
		});
		// Navigate to screen
		this.refs.rootNavigator.replace({
			title: title,
			component: link,
			navigator: this.refs.rootNavigator,
		});
	}

	// Generate custom navbar
	renderScene(route, navigator) {
		var self = this;
		var Component = route.component;

		// Default navbar title
		var title = AppConfig.appTitle;
		if (route.title) title = route.title;

		// Determine which icon component - hamburger or back?
		var leftButton = (
			<NavbarButton
				image={require('../images/icons/hamburger.png')}
				onPress={() => self.setState({ menuIsOpen: true })} />
		);

		if (route.index > 0) {
			leftButton = (
				<NavbarButton 
					image={require('../images/icons/back_button.png')}
					onPress={self.refs.rootNavigator.pop} />
			);
		}

		return (
			<View style={AppStyles.appContainer, AppStyles.container}>
				<NavigationBar
					title={<NavbarTitle title={title} />}
					statusBar={{ style: 'light-content', hidden: false }}
					style={AppStyles.navbar}
					tintColor={AppConfig.navbarBgColor}
					leftButton={leftButton} />
				<Component navigator={navigator} route={route} {...route.passProps} />
			</View>
		)
	}

	logout() {
		authRef.signOut(); // Invalidate firebase session
		AsyncStorage.removeItem('user_data'); // Remove any local user_data stored
		this.props.navigator.immediatelyResetRouteStack([{
			component: HomeOrLogin
		}]);
	}

	componentWillMount() {
		AsyncStorage.getItem('user_data').then((user_data_json) => {
			let user_data = JSON.parse(user_data_json);
			console.log("AsyncStorage user_data:");
			console.log(user_data);
			this.setState({
				userEmail: user_data.email,
				userId: user_data.uid,
				displayName: user_data.displayName
			});
		});
		var user = authRef.currentUser;
		// console.log("Current Firebase session user is:");
		// console.log(user);
	}

	render() {
		if (!this.state.userEmail) {
			return (
				<ActivityIndicator
        			animating={this.state.isLoading}
        			style={[AppStyles.processingAnimation, {height: 80}]}
        			size="large" />
        	);
		}

		return (
			<SideMenu 
				menu={<Menu navigate={this.navigate.bind(this)} logout={this.logout.bind(this)} />}
				isOpen={this.state.menuIsOpen}>

				<Navigator 
					ref="rootNavigator"
					style={[AppStyles.appContainer]}
					renderScene={this.renderScene.bind(this)}
					initialRoute={{
						component: MainContent,
						index: 0,
						navigator: this.refs.rootNavigator,
					}} />

			</SideMenu>
		)
	}
}

module.exports = Home;