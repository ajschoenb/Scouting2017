var dropbox = require('dropbox');
var fs = require('fs');

var dbx = new dropbox({ accessToken: '1pl9xfweXqAAAAAAAAAAC8str-yKvep7sO0O6Ytvm8Fn9MCo8BHZZFEd7qmuttB5' });
dbx.sharingGetSharedLinkFile({ url: 'https://www.dropbox.com/s/uc8v64bgtrkd79c/MVI_7790.MP4?dl=0' })
  .then(function(data) {
    fs.writeFile(data.name, data.fileBinary, 'binary', function(err) {
      if(err) { console.log(err); }
      console.log('File: ' + data.name + ' saved.');
    })
    .catch(function(err) {
      console.log(err);
    });
});
