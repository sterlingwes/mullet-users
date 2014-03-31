var Promise = require('es6-promise').Promise,
    _ = require('underscore'),
    bcrypt = require('bcrypt-nodejs'),
    crypto = require('crypto');

module.exports = function(server, User, utils) {
    
    /*
     * ## User API Routes
     */
    
    /*
     * ### /users
     * 
     * Requires auth, performs session check.
     */ 
    server.get('/', server.forceAuth, function(req,res) {
        res.json({
            ok:     true,
            user:   req.currentSession.user
        });
    });
    
    /*
     * ### /users/logout
     */
    server.get('/logout', function(req,res) {
        if(req.currentSession && req['session_'+req.currentSession.name])
            req['session_'+req.currentSession.name] = {};
        else
            return res.json({ ok: false, reason: !!req.currentSession ? 'No session found.' : 'No currentSession found.' });
        
        res.json({ ok: true });
    });
    
    /*
     * ### /users/login
     */
    server.post('/login', function(req,res) {
        
        if(!req.body.session)
            return res.json({
                ok: false,
                reason: 'No valid session identifier provided.'
            });
        
        var promise = utils.findUser({ $or: [{ username: req.body.user }, { "emails.address": req.body.user }] });
        
        // with our user recs... run hash checks and pass along valid user
        
        promise.then(function(recs) {
            if(!recs || !recs.length)
                res.json(200, {
                    ok:     false,
                    reason: 'Your username / password combination was invalid.',
                    code:   1
                });
            
            var passchecks = _.map(recs, function(usr) {
                return new Promise(function(yup,nope) {
                    var service = (usr.get('services') || {})[req.body.session];
                    if(!service)    return yup(false);
                    bcrypt.compare(req.body.pass, service.hash, function(err,res) {
                        if(err) nope(err);
                        else    yup(res ? usr : false);
                    });
                });
            });
            
            return Promise.all(passchecks);

        })
        
        // set session cookie for valid user, store that and return it
        
        .then(function(checks) {
            var user = _.find(checks, function(chk) { return chk; });
            
            if(user) {
                var sessionKey = crypto.createHash('sha1').update(user.get('username')).digest('hex');
                user.set('services.'+req.body.session+'.key', sessionKey);
                user.save(function(err,usr) {
                    req['session_'+req.body.session].key = sessionKey;
                    req['session_'+req.body.session].id = usr.id;
                    
                    if(err) console.error(err);
                    res.json({
                        ok:     !err,
                        user:   usr
                    });
                });
            }
            else {
                res.json({
                    ok:     false,
                    reason: 'Your username / password combination was invalid.',
                    code:   2
                });
            }
        })
        .catch(function(err) {
            console.error(err);
        });
    });
    
    /*
     * ### /users/register
     * 
     * Creates a user account. Expects `session` id, `user` and `pass` in the request body.
     * 
     * Responds with a JSON object.
     * 
     * - ok {Boolean}
     * - reason {String} if failed (ok=false)
     * - user {Object} if successfully created
     */
    server.post('/register', function(req,res) {
        
        if(!req.body.session)
            return res.json({
                ok: false,
                reason: 'No valid session identifier provided.'
            });
        
        var session = {};
        session[req.body.session] = {};
        
        var payload = _.extend({
            created:    new Date(),
            services:   session
        }, req.body);
        
        if(!payload.user)
            return res.json({ ok:false, reason:'Invalid request parameters' });
        
        var promise = utils.findUser({ username: payload.user.toLowerCase() });
        
        promise.then(function(users) {
        
            if(users.length)
                return res.json({
                    ok: false,
                    reason: 'Username already taken'
                });
            
            // generate hash
            
            bcrypt.hash(req.body.pass, null, null, function(err, hash) {
            
                if(err)
                    return res.json(500, { ok: false, reason: 'Could not generate hash.' });
                
                payload.services[req.body.session].hash = hash;
                
                var usr = new User(payload);

                usr.save(function(err,usr) {
                    res.json({
                        ok:     !err,
                        reason: err ? err.toString() : undefined,
                        user:   _.omit(usr.get(),'services')
                    });
                });
            });
        });

    });

};