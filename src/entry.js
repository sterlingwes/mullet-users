var net = typeof window === 'object' ? require('imports?win=>window!libs/ajax') : {ajax:function(){}},
    cookies = require('./cookies');

module.exports = {
    
    componentWillMount: function() {
        return;
        
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
    
    login: function(creds) {
        
        return this.setState({
            user:   { username: 'wes' }
        });
        
        net.ajax({
            url:    '/api/users',
            type:   'POST',
            data:   creds,
            complete: function() {
                
            }
        })
    },
    
    logout: function() {
        this.setState({ user: undefined });
        $.Evts('flash').pub('Logging Out...');
        
        return;
        
        net.ajax({
            url:        '/api/users/logout',
            complete:   function(res) {
                $.Evts('flash').pub('Logged Out.');
            }.bind(this)
        });
    }
    
};