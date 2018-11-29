window.onload = function() {
  anime.timeline({
    autoplay: true
  }).add({
    targets: '#loginPromptText',
    opacity: {
      value: 1,
      duration: 1700
    }
  }).add({
    targets: '#login',
    marginTop: {
      value: ['15%', '30%'],
      duration: 1000
    },
    opacity: {
      value: 1,
      duration: 1700
    },
    offset: '-=1000',
  });
}

if(document.body.contains(document.getElementById('bargainsSubmit'))) {
  document.getElementById('bargainsSubmit').addEventListener('click', function() {
    checkForm();
  });
  document.getElementById('bargainsSubmitBottom').addEventListener('click', function() {
    checkForm();    
  });
}

function checkForm() {
  var statuses = document.getElementsByClassName('bargainBox');
  var approvals = [];
  for(var i = 0; i < statuses.length; i++) {
    if(statuses[i].children[3].children[0].children[0].checked) {
      approvals.push({name: statuses[i].children[0].innerText, num: i});
    }
  }
  var good = true;
  for(var j = 0; j < document.getElementsByClassName('bargainBox').length; j++) {
    document.getElementsByClassName('bargainBox')[j].style.backgroundColor = '#00e8ab';
  }
  for(var i = 0; i < statuses.length; i++) {
    var allName = approvals.filter(status => status.name == statuses[i].children[0].innerText);
    if(allName != undefined) {
      if(allName.length > 1) {
        good = false;
        document.getElementById('errorText').style.display = 'flex';
        allName.forEach(status => {
          document.getElementsByClassName('bargainBox')[status.num].style.backgroundColor = '#c55';
        });
      }
    }
  }
  if(good) { document.getElementById('bargainAccept').submit(); }
}