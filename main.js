/*
 * # Users
 * 
 * User / auth tools.
 * 
 * @exports {Object} schema instance of User
 * @exports {Function} list current users
 */

// TODO: proper namespacing / database selection on a per entry app basis (or simply app basis with selection done in schemas over on global DB connection)

var _ = require('underscore');

module.exports = function(server, db, sessions) {
    
    var User = db.schema('users', {
            fields: {
                username: {
                    type:       String,
                    transform:  ['toLowerCase'],
                    synonyms:   ['user'],
                    safe:       true
                },
                emails:  {
                    type:       [Object],
                    safe:       true
                },
                created: {
                    type:   Date
                },
                services: { // session_ident (client-side session), facebook, twitter, SRP, etc.
                    type:   Object
                }
            }
        });
    
    var utils = require('./utils')(User);
    require('./routes.js')(server, User, utils);
    
    /*
     * ## Verify session event
     * 
     * Emitted by routes that use server.forceAuth middleware, acts like middleware
     * CALL NEXT() to allow passthru
     * 
     * - Checks whether currentSession is set on request (from serverBoot sessionState)
     * - If set, tries to find user by [id] and token [key]
     * - If found, authorized. If not, unauthorized.
     */
    
    //TODO: expire tokens separately from cookies?
        
    sessions.on('verify', function(req,res,next) {

        if(!req.currentSession || _.intersection(_.keys(req.currentSession), ['name','key','id']).length<3)
            res.json(401, {
                ok:     false,
                reason: 'Unauthorized'
            });
        else // find user
        {
            findUser({ 
                _id: req.currentSession.id
            })
            .then(function(usrs) {
                var usr = _.find(usrs, function(u) {
                    var uf = u.get(),
                        sesh = uf.services && uf.services[req.currentSession.name];

                    return sesh && sesh.key && sesh.key === req.currentSession.key;
                });
                if(!usr)
                    return res.json(401, {
                        ok:     false,
                        reason: 'Unauthorized session'
                    });
                
                req.currentSession.user = usr.toSafe();
                next();
            });
        }
    });
        
    return {
        schema: User,
        
        list: function() {
            return utils.findUser({});
        }
    };
    
};