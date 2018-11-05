const selectAll = document.getElementById('selectAll');
const selectNone = document.getElementById('selectNone');
const selectPics = document.getElementsByClassName('imageSelectHold');
const nameHolder = document.getElementById('nameSelect');
const names = document.getElementsByClassName('usernameSale');
const oldNameHolder = document.getElementById('nameSelect').innerHTML;

// make the nameHolder a color that mathces the selected picture (like a tab), and make a box around the filtering options
selectAll.addEventListener('click', function() {
  highlightborder('all');
});
selectNone.addEventListener('click', function() {
  highlightborder('none');
});
selectPics[0].addEventListener('click', function() {
  highlightborder(0);
});
selectPics[1].addEventListener('click', function() {
  highlightborder(1);
});
selectPics[2].addEventListener('click', function() {
  highlightborder(2);
});
selectPics[3].addEventListener('click', function() {
  highlightborder(3);
});
for(var i = 0; i < names.length; i++) {
  names[i].children[0].addEventListener('mouseover', displayNameDetail);
  names[i].children[0].addEventListener('mouseout', deleteNameDetail);
}

function highlightborder(borders) {
  if(borders === 'all') {
    for(var i = 0; i < selectPics.length; i++) {
      selectPics[i].style.backgroundColor = 'rgb(129, 239, 135)';
    }
  } else if(borders === 'none') {
    for(var i = 0; i < selectPics.length; i++) {
      selectPics[i].style.backgroundColor = 'rgba(255, 255, 255, 0)';
    }
  } else {
    if(selectPics[borders].style.backgroundColor == 'rgb(129, 239, 135)') {
      selectPics[borders].style.backgroundColor = 'rgba(255, 255, 255, 0)';
    } else {
      selectPics[borders].style.backgroundColor = 'rgb(129, 239, 135)';
    }
  }
}

function sortPage(nameOptions) {
  var nameOptions = document.getElementsByClassName('nameOrderOption');

  if(nameOptions[0].children[0].checked) {
    nameDisplays = Array.from(document.getElementsByClassName('usernameSale'));
    nameDisplays.sort(function(a, b) {
      var alc = JSON.parse(a.dataset.json).nickname.toLowerCase();
      var blc = JSON.parse(b.dataset.json).nickname.toLowerCase();
      return alc > blc ? 1 : alc < blc ? -1 : 0;
    });
  } else if(nameOptions[1].children[0].checked) {
    nameDisplays = Array.from(document.getElementsByClassName('usernameSale'));
    nameDisplays.sort(function(a, b) {
      var alc = JSON.parse(a.dataset.json).lastActivity;
      var blc = JSON.parse(b.dataset.json).lastActivity;
      return alc > blc ? 1 : alc < blc ? -1 : 0;
    });
  } else {
    nameDisplays = Array.from(document.getElementsByClassName('usernameSale'));
    nameDisplays.sort(function(a, b) {
      var alc = JSON.parse(a.dataset.json).platform;
      var blc = JSON.parse(b.dataset.json).platform;
      return alc > blc ? 1 : alc < blc ? -1 : 0;
    });
  }
  return nameDisplays;
}

function givePageResults() {
  var searchText = document.getElementById('nameSearch').children[1].value;
  var bidbuy = document.getElementsByClassName('bidbuyOption');
  var bb = null;
  var matchingUsers = [];

  for(var i = 0; i < users; i++) {
    if(nameDisplays.length > 0) {
      if(bidbuy[1].children[0].checked) { bb = false }
      if(bidbuy[2].children[0].checked) { bb = true }
      if(JSON.parse(nameDisplays[i].dataset.json).nickname.includes(searchText) && 
      (JSON.parse(nameDisplays[i].dataset.json).buy == bb || bb == null)) {
        matchingUsers.push(i);
      }
    } else {
      if(bidbuy[1].children[0].checked) { bb = false }
      if(bidbuy[2].children[0].checked) { bb = true }
      if(JSON.parse(nameHolder.children[i].children[0].dataset.json).nickname.includes(searchText) 
      && (JSON.parse(nameHolder.children[i].children[0].dataset.json).buy == bb || bb == null)) {
        matchingUsers.push(i);
      }
    }
  }
  return matchingUsers;
}

function changePage() {
  nameHolder.innerHTML = oldNameHolder;

  var easy = document.getElementById('pageNum').options[document.getElementById('pageNum').selectedIndex].text;
  var page = document.getElementById('namePaginationMove').children[0].value;
  var nameDisplays = [];
  var matchingUsers = [];
  var seenUsers = 0;
  var unseenUsers = 0;

  nameDisplays = sortPage();
  matchingUsers = givePageResults();

  if(easy == 20) {
    if(matchingUsers.length < 2) {
      nameHolder.style.columnCount = matchingUsers.length;
    } else {
      nameHolder.style.columnCount = 2;
    }
  } else if (easy == 50) {
    if(matchingUsers.length < 5) {
      nameHolder.style.columnCount = matchingUsers.length;
    } else {
      nameHolder.style.columnCount = 5;
    }
  } else {
    nameHolder.style.columnCount = 1;
  }

  nameHolder.innerHTML = '';

  for(var i = 0; i < users; i++) {
    if(matchingUsers.includes(i) && seenUsers < easy) {
      seenUsers++;
    } else if(matchingUsers.includes(i) && seenUsers == easy) {
      unseenUsers++;
    }
  }
  var pages = Math.ceil((unseenUsers + seenUsers) / easy);
  if(pages == 0) { pages = 1 }
  if(page > pages) { page = pages }
  else if(page <= 0) { page = 1 }

  for(var i = 0; i < users; i++) {
    var a = document.createElement('a');
    a.setAttribute('href', '/nameDetails/' + JSON.parse(nameDisplays[i].dataset.json)._id);
    a.innerText = JSON.parse(nameDisplays[i].dataset.json).nickname;
    var section = document.createElement('section');
    section.setAttribute('data-json', nameDisplays[i].dataset.json)
    section.addEventListener('mouseover', displayNameDetail);
    section.addEventListener('mouseout', deleteNameDetail);
    if(matchingUsers.includes(i) && matchingUsers.findIndex(function(user) { return user == i }) >= (page - 1) * easy &&
    matchingUsers.findIndex(function(user) { return user == i }) < page * easy) {
      section.className = 'usernameSale';
    } else if(matchingUsers.includes(i)) {
      section.className = 'usernameSale notOnPage';
    } else {
      section.className = 'usernameSale notOnPage';
    }
    section.appendChild(a);
    document.getElementById('nameSelect').appendChild(section);
  }
  
  document.getElementById('namePaginationMove').children[0].value = page;
  document.getElementById('namePaginationMove').children[0].max = pages;
  document.getElementById('namePaginationMove').children[1].innerHTML = `<p>of ${pages}</p>`;
}

function displayNameDetail(evt) {
  var userData;
  try {
    userData = JSON.parse(evt.path[1].dataset.json);
  } catch {
    userData = JSON.parse(evt.path[0].dataset.json);
  }
  var lastActivity = new Date(userData.lastActivity).toLocaleString();
  var nickname = userData.nickname;
  var platform = userData.platform;
  var price = userData.price.toFixed(2);
  try {
    var minRaise = userData.minRaise.toFixed(2);
    var highBid = userData.highBid.toFixed(2);
  } catch (e) { }
  
  if(userData.buy) {
    document.getElementById('nameDetail').innerHTML = `<h2 class='importantText center-text'>Purchase</h2><h3></h3>
    <h4 class='importantText center-text'>Platform</h4><p class='center-text'>${platform}</p>    
    <h4 class='importantText center-text'>Name</h4><p class='center-text'>${nickname}</p><h4 class='importantText center-text'>Last Activity</h4>
    <p class='center-text'>${lastActivity}</p><h4 class='importantText center-text'>Price</h4><p class='center-text'>${price}</p>`;
  } else {
    document.getElementById('nameDetail').innerHTML = `<h2 class='importantText center-text'>Auction</h2><h3></h3>
    <h4 class='importantText center-text'>Platform</h4><p class='center-text'>${platform}</p>
    <h4 class='importantText center-text'>Name</h4><p class='center-text'>${nickname}</p><h4 class='importantText center-text'>Last Activity</h4>
    <p class='center-text'>${lastActivity}</p><h4 class='importantText center-text'>Buyout Price</h4><p class='center-text'>${price}</p>
    <h4 class='importantText center-text'>Current Bid</h4><p class='center-text'>${highBid}</p>
    <h4 class='importantText center-text'>Minimum Raise</h4><p class='center-text'>${minRaise}</p>`;
  }
}

function deleteNameDetail(evt) {
  document.getElementById('nameDetail').innerHTML = '';
}

changePage();