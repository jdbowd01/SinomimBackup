const deleteAcc = document.getElementById('deleteAccount');

var timer = window.setTimeout(function() {
  window.location.reload(true);
}, 1800000);

window.addEventListener('click', function(event) {
  var enable = true;
  if((!document.getElementById('emailChangeForm').contains(event.target) 
  && !document.getElementById('addNameForm').contains(event.target)
  && !document.getElementById('passChangeForm').contains(event.target)) && (document.getElementById('passChangeForm').style.display == 'flex' 
  || document.getElementById('addNameForm').style.display == 'flex'
  || document.getElementById('emailChangeForm').style.display == 'flex')) {
    document.getElementById('passChangeForm').style.display = 'none';
    document.getElementById('addNameForm').style.display = 'none';
    document.getElementById('emailChangeForm').style.display = 'none';
    reverseTranslucent();
    enable = false;
  }
  if(enable) {
    if(document.getElementById('passChange').contains(event.target)) {
      document.getElementById('passChangeForm').style.display = 'flex';
      makeTranslucent();
    }
    if(document.getElementById('emailChange').contains(event.target)) {
      document.getElementById('emailChangeForm').style.display = 'flex';
      makeTranslucent();
    }
    if(document.getElementById('addName').contains(event.target)) {
      document.getElementById('addNameForm').style.display = 'flex';
      makeTranslucent();
    }
  }
});

function makeTranslucent() {
  document.getElementById('userHold').style.opacity = '.2';
  document.getElementById('dangerousOptions').style.opacity = '.2';
  document.getElementById('notificationBox').style.opacity = '.2';
  document.getElementsByTagName('header')[0].style.opacity = '.2';
}

function reverseTranslucent() {
  document.getElementById('userHold').style.opacity = '1';
  document.getElementById('dangerousOptions').style.opacity = '1';
  document.getElementById('notificationBox').style.opacity = '1';
  document.getElementsByTagName('header')[0].style.opacity = '1';
  document.getElementById('errorField').style.display = 'none';
}

document.getElementById('emailChangeSubmit').addEventListener('click', function() {
  while (document.getElementById('errorField').hasChildNodes()) {
    document.getElementById('errorField').removeChild(document.getElementById('errorField').lastChild);
  }
  var emailText = document.getElementsByClassName('emailInput')[0].value.replace(/^\s+/, '').replace(/\s+$/, '') != '';
  var emailValid = /.+\@.{2,}\..{2,}/.exec(document.getElementsByClassName('emailInput')[0].value);
  if(!emailText) {
    var p = document.createElement('p');
    p.className = 'errorMsg';
    p.innerText = 'Email is empty.'
    document.getElementById('errorField').appendChild(p);
    document.getElementById('errorField').style.display = 'flex';
  } else {
    if(!emailValid) {
      var p = document.createElement('p');
      p.className = 'errorMsg';
      p.innerText = 'Email is not valid.'
      document.getElementById('errorField').appendChild(p);
      document.getElementById('errorField').style.display = 'flex';
    } else {
      document.getElementById('emailChangeForm').submit();
    }
  }
});

document.getElementById('addNameSubmit').addEventListener('click', function() {
  var inputs = document.getElementsByClassName('addNameInput');
  if(inputs[0].checked) {
    //76561198079619100
    if(parseInt(inputs[1].value.substring(5)) > 198000000000 || parseInt(inputs[1].value.substring(5)) < 202000000000) {
      document.getElementById('addNameForm').submit();
    } else {
      document.getElementById('errorField').innerHTML = 'Please enter a valid Steam ID.';
      document.getElementById('errorField').style.display = 'flex';
      setTimeout(function() {
        document.getElementById('errorField').style.display = 'none';
      }, 5000);
    }
  }
});

function changeAddForm() {
  if(document.getElementById('sellRadio').checked) {
    document.getElementById('auctionPart').style.display = 'none';
    document.getElementById('sellPart').style.display = 'flex';
  } else {
    document.getElementById('auctionPart').style.display = 'flex';
    document.getElementById('sellPart').style.display = 'none';
  }
}