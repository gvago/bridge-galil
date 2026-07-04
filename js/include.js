/* header/footer משותפים. ponytail: JS injection במקום build step */
(function(){
  var root = document.currentScript.getAttribute('data-root') || '';
  var page = document.body.getAttribute('data-page') || '';
  function act(p){ return page===p ? ' class="active"' : ''; }
  var header =
  '<div class="nav">'+
    '<a class="logo" href="'+root+'index.html"><span class="suits">♠♥♦♣</span> ברידג\' גליל</a>'+
    '<button class="menu-btn" aria-label="תפריט" onclick="document.getElementById(\'navlinks\').classList.toggle(\'open\')">☰</button>'+
    '<ul class="nav-links" id="navlinks">'+
      '<li><a href="'+root+'index.html"'+act('home')+'>בית</a></li>'+
      '<li><a href="'+root+'learn/index.html"'+act('learn')+'>מרכז הידע</a></li>'+
      '<li><a href="'+root+'practice/index.html"'+act('practice')+'>תרגול</a></li>'+
      '<li><a href="'+root+'courses.html"'+act('courses')+'>קורסים</a></li>'+
      '<li><a href="'+root+'about.html"'+act('about')+'>אודות נפתלי</a></li>'+
      '<li><a class="nav-cta" href="'+root+'contact.html">הרשמה לקורס</a></li>'+
    '</ul>'+
  '</div>';
  var footer =
  '<div class="footer-grid" style="grid-template-columns:2fr 1fr 1fr 1fr">'+
    '<div><h4>ברידג\' גליל · נפתלי קריספיס</h4>'+
    '<p>לימוד ברידג\' בעברית, בגובה העיניים. שיעורים פרונטליים בגליל המערבי ותוכן מקוון לכל הארץ.</p></div>'+
    '<div><h4>ניווט</h4><ul>'+
      '<li><a href="'+root+'learn/index.html">מרכז הידע</a></li>'+
      '<li><a href="'+root+'learn/glossary.html">מילון מונחים</a></li>'+
      '<li><a href="'+root+'practice/index.html">תרגול אינטראקטיבי</a></li>'+
      '<li><a href="'+root+'practice/tools.html">אתגר יומי ומחולל חלוקות</a></li>'+
      '<li><a href="'+root+'courses.html">קורסים</a></li>'+
      '<li><a href="'+root+'contact.html">יצירת קשר</a></li>'+
    '</ul></div>'+
    '<div><h4>ברידג\' באזור שלכם</h4><ul>'+
      '<li><a href="'+root+'local/bridge-nahariya.html">ברידג\' בנהריה</a></li>'+
      '<li><a href="'+root+'local/bridge-akko.html">ברידג\' בעכו</a></li>'+
      '<li><a href="'+root+'local/bridge-karmiel.html">ברידג\' בכרמיאל</a></li>'+
      '<li><a href="'+root+'local/bridge-haifa.html">ברידג\' בחיפה</a></li>'+
      '<li><a href="'+root+'local/bridge-galil.html">ברידג\' בגליל המערבי</a></li>'+
    '</ul></div>'+
    '<div><h4>יצירת קשר</h4><ul>'+
      '<li>📞 <a href="tel:+972500000000">050-000-0000</a></li>'+ /* TODO real */
      '<li>✉️ <a href="mailto:naftali@example.com">naftali@example.com</a></li>'+ /* TODO real */
      '<li>📍 הגליל המערבי</li>'+
    '</ul></div>'+
  '</div>'+
  '<div class="footer-bottom">© '+new Date().getFullYear()+' ברידג\' גליל · נפתלי קריספיס · כל הזכויות שמורות</div>';
  document.querySelectorAll('.site-header').forEach(function(el){el.innerHTML=header;});
  document.querySelectorAll('.site-footer').forEach(function(el){el.innerHTML=footer;});
})();
