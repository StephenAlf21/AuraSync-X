(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var toggle = item.querySelector('.faq-toggle');
      var answer = item.querySelector('.faq-answer');
      if (!toggle) return;

      toggle.addEventListener('click', function () {
        var isActive = item.classList.contains('active');

        items.forEach(function (it) {
          it.classList.remove('active');
          var ans = it.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = '0px';
        });

        if (!isActive) {
          item.classList.add('active');
          if (answer) {
            // Use scrollHeight so the animation matches content height
            answer.style.maxHeight = answer.scrollHeight + 'px';
          }
        }
      });
    });
  });
})();
