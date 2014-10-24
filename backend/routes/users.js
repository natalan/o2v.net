/**
 * /users endpoint
 */
var getUsers = function(req, res) {
    res.send("respond with a resource");
};

var getSignedInUser = function(req, res) {
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(403).json({error: "Not authenticated"});
    }
};

exports.getUsers = getUsers;
exports.getSignedInUser = getSignedInUser;
