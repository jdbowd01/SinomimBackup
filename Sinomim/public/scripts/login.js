document.getElementById('logIn').addEventListener('keyup', function(evt) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById('logIn').click();
  }
})