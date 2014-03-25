var net = typeof window === 'object' ? require('imports?win=>window!libs/ajax') : {ajax:function(){}},
    cookies = require('./cookies');

module.exports = {
    
    componentWillMount: function() {
        net.ajax({
            url:        '/api/users/',
            complete:   function(res) {
                if(res.ok && res.user) {
                    res.user.logout = this.logout;
                    this.replaceState({ user: res.user });
                }
            }.bind(this)
        });
    },
    
    logout: function() {
        if(res.ok)  this.setState({ user: undefined });
        $.Evts('flash').pub('Logging Out...');
        net.ajax({
            url:        '/api/users/logout',
            complete:   function(res) {
                $.Evts('flash').pub('Logged Out.');
            }.bind(this)
        });
    }
    
};