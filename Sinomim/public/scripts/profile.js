const deleteAcc = document.getElementById('deleteAccount');

window.addEventListener('click', function(event) {
  var enable = true;
  if((!document.getElementById('emailChangeForm').contains(event.target) 
  && !document.getElementById('passChangeForm').contains(event.target) 
  && !document.getElementById('addNameForm').contains(event.target)) && (document.getElementById('passChangeForm').style.display == 'flex' 
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
  document.getElementsByTagName('header')[0].style.opacity = '.2';
}

function reverseTranslucent() {
  document.getElementById('userHold').style.opacity = '1';
  document.getElementById('dangerousOptions').style.opacity = '1';
  document.getElementsByTagName('header')[0].style.opacity = '1';
}