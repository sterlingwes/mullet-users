var Promise = require('es6-promise').Promise;

module.exports = function(User) {
    
    /*
     * ## findUser
     * 
     * @param {Object} selector passed to db.find() via User schema
     * @return {Object} Promise resolves to an array of user records (User instances)
     * @api private
     */
    function findUser(selector) {
        return new Promise(function(resolve,reject) {
            // find user
            User.find(selector, function(err, recs) {
                if(err) return reject(err);
                resolve(_.map(recs, function(rec) { return new User(rec); }));
            });
        });
    }
    
    return {
        findUser:   findUser
    };
}