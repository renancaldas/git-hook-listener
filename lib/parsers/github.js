module.exports = function(body) {
    console.log('github');
    var repo = null;
    
    // Body "application/x-www-form-urlencoded"" has a payload property
    if (body.payload) {
        body = JSON.parse(body.payload);
    }
    
    if(body.ref) {
        repo = {
            branch: body.ref.split('/')[body.ref.split('/').length-1],
            name: body.repository.name,
            url: body.repository.html_url
        };
    }

    return repo;
}