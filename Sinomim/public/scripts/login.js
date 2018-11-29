document.getElementById('logIn').addEventListener('click', function(){
  loginCheck();  
});

document.getElementById('loginArea').addEventListener('onfocus', function(event) {
  console.log(event);
  capsCheck(event);
});

document.getElementById('loginArea').addEventListener('keyup', function(event) {
  capsCheck(event);
  if (event.keyCode === 13) {
    loginCheck();
  }
});

function capsCheck(event) {
  if(event.getModifierState('CapsLock')) {
    document.getElementById('capsWarn').style.display = 'flex';
  } else {
    document.getElementById('capsWarn').style.display = 'none';
  }
}

function loginCheck() {
  while (document.getElementById('errorField').hasChildNodes()) {
    document.getElementById('errorField').removeChild(document.getElementById('errorField').lastChild);
  }

  var userText = document.getElementById('usernameFill').value.replace(/^\s+/, '').replace(/\s+$/, '') != '';
  var passText = document.getElementById('passwordFill').value.replace(/^\s+/, '').replace(/\s+$/, '') != '';
  var emailText = true;
  var emailValid = true;
  var confirmText = true;
  var confirmSame = true;
  if(document.body.contains(document.getElementById('emailFill'))) {
    emailText = document.getElementById('emailFill').value.replace(/^\s+/, '').replace(/\s+$/, '') != '';
    emailValid = /.+\@.{2,}\..{2,}/.exec(document.getElementById('emailFill').value);
    confirmText = document.getElementById('confirmFill').value.replace(/^\s+/, '').replace(/\s+$/, '') != '';
    confirmSame = document.getElementById('confirmFill').value == document.getElementById('passwordFill').value;
  }
  
  if(!userText) {
    document.getElementById('usernameFill').style.backgroundColor = '#fbb';
    var p = document.createElement('p');
    p.className = 'errorMsg';
    p.innerText = 'Username is empty.'
    document.getElementById('errorField').appendChild(p);
  } else {
    document.getElementById('usernameFill').style.backgroundColor = '#fff';
  }
  if(!passText) {
    document.getElementById('passwordFill').style.backgroundColor = '#fbb';
    var p = document.createElement('p');
    p.className = 'errorMsg';
    p.innerText = 'Password is empty.'
    document.getElementById('errorField').appendChild(p);
  } else {
    document.getElementById('passwordFill').style.backgroundColor = '#fff';
  }
  if(document.body.contains(document.getElementById('emailFill'))) {
    if(!emailText) {
      document.getElementById('emailFill').style.backgroundColor = '#fbb';
      var p = document.createElement('p');
      p.className = 'errorMsg';
      p.innerText = 'Email is empty.'
      document.getElementById('errorField').appendChild(p);
    } else {
      if(!emailValid) {
        document.getElementById('emailFill').style.backgroundColor = '#fbb';
        var p = document.createElement('p');
        p.className = 'errorMsg';
        p.innerText = 'Email is not valid.'
        document.getElementById('errorField').appendChild(p);
      } else {
        document.getElementById('emailFill').style.backgroundColor = '#fff';
      }
    }
    if(!confirmText) {
      document.getElementById('confirmFill').style.backgroundColor = '#fbb';
      var p = document.createElement('p');
      p.className = 'errorMsg';
      p.innerText = 'Password confirm is empty.'
      document.getElementById('errorField').appendChild(p);
    } else {
      if(!confirmSame) {
        document.getElementById('confirmFill').style.backgroundColor = '#fbb';
        var p = document.createElement('p');
        p.className = 'errorMsg';
        p.innerText = 'Password confirm does not match password.'
        document.getElementById('errorField').appendChild(p);
      } else {
        document.getElementById('confirmFill').style.backgroundColor = '#fff';
      }
    }
  }
  if(passText && userText && emailText && emailValid && confirmText) {
    document.getElementById('loginArea').submit();
  }
}