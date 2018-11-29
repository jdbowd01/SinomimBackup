anime.timeline({
  autoplay: true
}).add({
  targets: document.getElementById('supported').children[0],
  opacity: {
    value: 1,
    duration: 1700
  }
}).add({
  targets: '#exploreBtn',
  marginTop: {
    value: '15%',
    duration: 1000
  },
  opacity: {
    value: 1,
    duration: 1700
  },
  offset: '-=1000'
});


// var leavePage = anime.timeline({
//   autoplay: false
// })
// .add({
//   targets: '#exploreBtn',
//   color: {
//     value: '#00c97c',
//     duration: 300
//   }
// }).add({
//   targets: '#exploreBtn',
//   borderRadius: {
//     value: '100%',
//     duration: 1000
//   },
//   height: {
//     value: document.getElementById('exploreBtn').style.width,
//     duration: 900
//   },
//   offset: '-=50',
//   complete: function() {
//     console.log('done');
//   }
// });


// document.getElementById('exploreBtn').addEventListener('click', function() {
//   leavePage.play();
// });