const header = document.querySelector('.scrollHidden');
var prevScrollPos = window.pageYOffset;

window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;

  if (currentScrollPos == 0) {
    header.classList.remove("hidden"); // 当滚动到顶部时，默认显示
  } else if (prevScrollPos > currentScrollPos) {
    header.classList.remove("hidden"); // 向上滚动，显示 div
  } else {
    header.classList.add("hidden"); // 向下滚动，隐藏 div
  }

  prevScrollPos = currentScrollPos;
}

