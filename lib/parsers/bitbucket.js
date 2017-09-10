module.exports = function(body) {
    var repo = null;

    if(body.push.changes.length == 1) {
        var changes = body.push.changes[0];
        repo = {
            branch: changes.new ? changes.new.name : changes.old.name,
            name: changes.new ? changes.new.repository.name : changes.old.repository.name,
            url: changes.new ? changes.new.links.html.href : changes.old.links.html.href
        };
    }

    return repo;
}