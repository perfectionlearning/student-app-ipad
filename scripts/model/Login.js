//============================================================
// Login model
//
//============================================================
;(function()
{

	app.Login = Backbone.Model.extend({
		defaults: {
			email: '',
			pw: '',
			book_id: app.book_id
		},

		resetPassword: function() {
			this.url = app.loginPath + '/../password/reset';
		},

		createAccount: function() {
			this.url = app.loginPath + '/../../users'
		},

		login: function() {
			this.url = app.loginPath;
		},

		register: function() {
			this.url = app.registerPath;
		},

		checkLogin: function() {
			this.url = app.loginPath + '/../status';
		},

		changeEmail: function() {
			this.url = app.loginPath + '/../email';
		},

		changePassword: function() {
			this.url = app.loginPath + '/../password';
		},

		logout: function() {
			this.url = app.loginPath + '/../logout'; // ?
		}

	});

	app.loginResults = new app.Login();

})();
