/** @jsx React.DOM */

var React = require('react/addons')
  , Form = require('libs/forms')
  , Alert = require('libs/alert/index.jsx')
;

module.exports = React.createClass({
    
    mixins: [Form],
    
    displayName:    'LoginForm',
    
    getInitialState: function() {
        return {
            message: {
            }
        };
    },
    
    formDone: function(name, data) {
        this.props.login(data);
    },
    
    render: function() {
                             
        return this.transferPropsTo(
            <div>
                <h1>Login</h1>
                <Alert message={this.state.message.text} type={this.state.message.type} />
                <form className="jvForm" id="login">
                    <fieldset>
                        <input type="text" name="user" id="user" placeholder="E-mail" className="jv" autofocus required />
                    </fieldset>
                    <fieldset>
                        <input type="password" name="pass" id="pass" placeholder="Password" className="jv" required />
                    </fieldset>
                    <fieldset>
                        <input type="submit" name="login" value={this.props.action=='login' ? 'Login' : 'Create Account'} />
                    </fieldset>
                </form>
            </div>
        );
    }
    
});