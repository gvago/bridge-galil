/* header/footer משותפים + mobile CTA. JS injection במקום build step */
(function(){
  var root = document.currentScript.getAttribute('data-root') || '';
  var page = document.body.getAttribute('data-page') || '';
  var PHONE='04-9915521', MOBILE='052-5212799', EMAIL='naftali.krispis@gmail.com';
  var TEL_M='tel:+972525212799', WA='https://wa.me/972525212799?text=%D7%A9%D7%9C%D7%95%D7%9D%20%D7%A0%D7%A4%D7%AA%D7%9C%D7%99%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%9C%20%D7%A7%D7%95%D7%A8%D7%A1%D7%99%20%D7%94%D7%91%D7%A8%D7%99%D7%93%D7%92%27';
  function act(p){ return page===p ? ' class="active"' : ''; }
  var header =
  '<div class="nav">'+
    '<a class="logo" href="'+root+'index.html"><span class="suits">♠♥♦♣</span> ברידג\' גליל</a>'+
    '<button class="menu-btn" aria-label="תפריט" aria-expanded="false" onclick="var n=document.getElementById(\'navlinks\');n.classList.toggle(\'open\');this.setAttribute(\'aria-expanded\',n.classList.contains(\'open\'))">☰</button>'+
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
  '<div class="footer-grid">'+
    '<div><h4>ברידג\' גליל · נפתלי קריספיס</h4>'+
    '<p>מורה מוסמך של ההתאגדות הישראלית לברידג\'. שיעורים פרונטליים בעכו והגליל המערבי, ותוכן מקוון לכל הארץ.</p></div>'+
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
      '<li>📱 <a href="'+TEL_M+'">'+MOBILE+'</a></li>'+
      '<li>📞 <a href="tel:+97249915521">'+PHONE+'</a></li>'+
      '<li>💬 <a href="'+WA+'">וואטסאפ</a></li>'+
      '<li>✉️ <a href="mailto:'+EMAIL+'">'+EMAIL+'</a></li>'+
      '<li>📍 עכו והגליל המערבי</li>'+
    '</ul></div>'+
  '</div>'+
  '<div class="footer-bottom">© '+new Date().getFullYear()+' ברידג\' גליל · נפתלי קריספיס · כל הזכויות שמורות</div>';
  document.querySelectorAll('.site-header').forEach(function(el){el.innerHTML=header;});
  document.querySelectorAll('.site-footer').forEach(function(el){el.innerHTML=footer;});
  // ponytail: sticky mobile CTA בכל עמוד חוץ מיצירת קשר; CSS מציג רק במובייל
  if(page!=='contact'){
    document.body.insertAdjacentHTML('beforeend',
      '<div class="mobile-cta">'+
      '<a class="mc-wa" href="'+WA+'">💬 וואטסאפ</a>'+
      '<a class="mc-call" href="'+TEL_M+'">📱 חייגו לנפתלי</a>'+
      '</div>');
    document.body.classList.add('has-mobile-cta');
  }
})();
