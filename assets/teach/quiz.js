/* 可复用测验组件。用法：
   <div class="quiz"><script type="application/json">
   {"q": "问题", "options": ["甲","乙","丙","丁"], "answer": 0, "why": "解析"}
   </script></div> */
(function () {
  document.querySelectorAll('.quiz').forEach(function (box) {
    var data;
    try {
      data = JSON.parse(box.querySelector('script[type="application/json"]').textContent);
    } catch (e) { return; }
    var q = document.createElement('div');
    q.className = 'q';
    q.textContent = data.q;
    box.appendChild(q);
    var why = document.createElement('div');
    why.className = 'why';
    data.options.forEach(function (text, i) {
      var btn = document.createElement('button');
      btn.className = 'opt';
      btn.textContent = text;
      btn.addEventListener('click', function () {
        if (box.classList.contains('done')) return;
        box.classList.add('done');
        box.querySelectorAll('.opt').forEach(function (b, j) {
          b.disabled = true;
          if (j === data.answer) b.classList.add('correct');
        });
        if (i !== data.answer) btn.classList.add('wrong');
        why.textContent = (i === data.answer ? '✓ 答对了。' : '✗ 再想想——') + data.why;
      });
      box.appendChild(btn);
    });
    box.appendChild(why);
  });
})();
