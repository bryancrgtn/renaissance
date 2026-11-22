/* Salon de coiffure Renaissance — comportements de la page.
   Sans dépendance, hors Lenis (défilement fluide, fichier local js/vendor/lenis.min.js). */
(function () {
  "use strict";

  window.__salonPret = true;

  var racine = document.documentElement;
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var entete = document.getElementById("entete");
  var progression = document.getElementById("progression");

  /* ======================================================================
     1. Défilement fluide (Lenis) et ancres
     ====================================================================== */
  var lenis = null;
  if (!reduit && typeof window.Lenis === "function") {
    try {
      lenis = new window.Lenis({
        autoRaf: true,
        lerp: 0.085,
        smoothWheel: true
      });
    } catch (e) {
      lenis = null;
    }
  }

  function allerA(cible) {
    var decalage = entete && window.innerWidth >= 900 ? -70 : -56;
    if (lenis) {
      lenis.scrollTo(cible, { offset: decalage, duration: 1.8, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    } else {
      cible.scrollIntoView({ behavior: reduit ? "auto" : "smooth", block: "start" });
    }
  }

  document.addEventListener("click", function (e) {
    var lien = e.target.closest('a[href^="#"]');
    if (!lien) return;
    var id = lien.getAttribute("href");
    if (id.length < 2) return;
    var cible = document.querySelector(id);
    if (!cible) return;
    e.preventDefault();
    fermerMenu();
    allerA(cible);
    if (history.replaceState) history.replaceState(null, "", id);
    cible.setAttribute("tabindex", "-1");
    cible.focus({ preventScroll: true });
  });

  /* ======================================================================
     2. Menu plein écran (mobile)
     ====================================================================== */
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("menu");

  function menuOuvert() {
    return racine.classList.contains("menu-ouvert");
  }

  function ouvrirMenu() {
    racine.classList.add("menu-ouvert");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Fermer le menu");
    if (lenis) lenis.stop();
    var premier = menu.querySelector("a");
    if (premier) setTimeout(function () { premier.focus({ preventScroll: true }); }, 350);
  }

  function fermerMenu() {
    if (!burger || !menuOuvert()) return;
    racine.classList.remove("menu-ouvert");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Ouvrir le menu");
    if (lenis) lenis.start();
  }

  if (burger && menu) {
    burger.addEventListener("click", function () {
      if (menuOuvert()) fermerMenu();
      else ouvrirMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (!menuOuvert()) return;
      if (e.key === "Escape") {
        fermerMenu();
        burger.focus();
      }
      if (e.key === "Tab") {
        var liens = [].slice.call(menu.querySelectorAll("a"));
        liens.unshift(burger);
        var premier = liens[0];
        var dernier = liens[liens.length - 1];
        if (e.shiftKey && document.activeElement === premier) {
          e.preventDefault();
          dernier.focus();
        } else if (!e.shiftKey && document.activeElement === dernier) {
          e.preventDefault();
          premier.focus();
        }
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900) fermerMenu();
    });
  }

  /* ======================================================================
     3. Titre « Renaissance » découpé en lettres
     ====================================================================== */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var texte = el.textContent;
    el.textContent = "";
    el.setAttribute("aria-hidden", "true");
    for (var i = 0; i < texte.length; i++) {
      var lettre = document.createElement("span");
      lettre.className = "lettre";
      lettre.style.setProperty("--l", i);
      lettre.textContent = texte.charAt(i);
      el.appendChild(lettre);
    }
  });

  /* ======================================================================
     4. Apparitions au défilement
     ====================================================================== */
  var elementsRevele = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window) || !racine.classList.contains("anim")) {
    elementsRevele.forEach(function (el) { el.classList.add("est-visible"); });
  } else {
    // Les images masquées par clip-path ne « croisent » jamais l'écran pour l'observateur :
    // on observe donc leur conteneur et on révèle l'image correspondante.
    var cibles = new Map();
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          var cible = cibles.get(entree.target) || entree.target;
          cible.classList.add("est-visible");
          observateur.unobserve(entree.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    elementsRevele.forEach(function (el) {
      var observe = el.getAttribute("data-reveal") === "image" ? el.parentElement : el;
      cibles.set(observe, el);
      observateur.observe(observe);
    });
  }

  /* ======================================================================
     5. Parallaxe douce des photos, en-tête, barre de progression
     ====================================================================== */
  var parallaxes = reduit ? [] : [].slice.call(document.querySelectorAll("[data-parallax]"));
  var dernierY = window.pageYOffset;
  var attente = false;

  function majParallaxe() {
    var vh = window.innerHeight;
    parallaxes.forEach(function (el) {
      var cadre = el.parentElement.getBoundingClientRect();
      if (cadre.bottom < -100 || cadre.top > vh + 100) return;
      var progres = (cadre.top + cadre.height / 2 - vh / 2) / vh;
      var max = cadre.height * 0.08;
      var k = parseFloat(el.getAttribute("data-parallax")) || 1;
      var y = Math.max(-max, Math.min(max, -progres * max * 1.6 * k));
      el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)";
    });
  }

  function majDefilement() {
    attente = false;
    var y = window.pageYOffset;
    var hauteur = racine.scrollHeight - window.innerHeight;

    if (progression && hauteur > 0) {
      progression.style.setProperty("--p", Math.min(1, y / hauteur).toFixed(4));
    }

    if (entete) {
      entete.classList.toggle("est-defile", y > 40);
      if (!menuOuvert()) {
        if (y > 420 && y > dernierY + 4) entete.classList.add("est-cache");
        else if (y < dernierY - 4 || y <= 420) entete.classList.remove("est-cache");
      }
    }
    dernierY = y;
    majParallaxe();
  }

  function surDefilement() {
    if (!attente) {
      attente = true;
      window.requestAnimationFrame(majDefilement);
    }
  }

  window.addEventListener("scroll", surDefilement, { passive: true });
  window.addEventListener("resize", surDefilement);
  majDefilement();

  /* ======================================================================
     6. Horaires : jour courant et statut ouvert / fermé (heure de Paris)
     ====================================================================== */
  // Plages en minutes depuis minuit, clé = jour (0 = dimanche … 6 = samedi).
  var HORAIRES = {
    0: [],
    1: [[540, 1140]],
    2: [[540, 1140]],
    3: [],
    4: [[540, 780]],
    5: [[540, 1140]],
    6: [[510, 1020]]
  };
  var NOMS_JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var CODES_JOURS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function formaterHeure(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return m === 0 ? h + " h" : h + " h " + (m < 10 ? "0" + m : m);
  }

  function maintenantAParis() {
    try {
      var parties = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Paris",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
      }).formatToParts(new Date());
      var jour = 0, heure = 0, minute = 0;
      parties.forEach(function (p) {
        if (p.type === "weekday") jour = CODES_JOURS[p.value];
        if (p.type === "hour") heure = parseInt(p.value, 10) % 24;
        if (p.type === "minute") minute = parseInt(p.value, 10);
      });
      return { jour: jour, minutes: heure * 60 + minute };
    } catch (e) {
      var d = new Date();
      return { jour: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function messageStatut(jour, minutes) {
    var plages = HORAIRES[jour];
    var i;
    for (i = 0; i < plages.length; i++) {
      if (minutes >= plages[i][0] && minutes < plages[i][1]) {
        return { ouvert: true, texte: "Ouvert actuellement · jusqu’à " + formaterHeure(plages[i][1]) };
      }
    }
    for (i = 0; i < plages.length; i++) {
      if (minutes < plages[i][0]) {
        return { ouvert: false, texte: "Fermé · ouvre aujourd’hui à " + formaterHeure(plages[i][0]) };
      }
    }
    for (var n = 1; n <= 7; n++) {
      var j = (jour + n) % 7;
      if (HORAIRES[j].length) {
        var quand = n === 1 ? "demain" : NOMS_JOURS[j];
        return { ouvert: false, texte: "Fermé · ouvre " + quand + " à " + formaterHeure(HORAIRES[j][0][0]) };
      }
    }
    return { ouvert: false, texte: "Fermé" };
  }

  var maintenant = maintenantAParis();

  var ligne = document.querySelector('#horaires tr[data-jour="' + maintenant.jour + '"]');
  if (ligne) {
    ligne.classList.add("est-aujourdhui");
    ligne.setAttribute("aria-current", "date");
  }

  var statut = document.getElementById("statut");
  var statutTexte = document.getElementById("statut-texte");
  if (statut && statutTexte) {
    var etat = messageStatut(maintenant.jour, maintenant.minutes);
    statutTexte.textContent = etat.texte;
    statut.classList.add(etat.ouvert ? "statut--ouvert" : "statut--ferme");
    statut.hidden = false;
  }

  /* ======================================================================
     7. Visionneuse photo (précédent / suivant, clavier, glissement)
     ====================================================================== */
  var boite = document.getElementById("lightbox");
  var items = [].slice.call(document.querySelectorAll(".galerie__item"));

  if (boite && items.length && typeof boite.showModal === "function") {
    var image = document.getElementById("lightbox-image");
    var legende = document.getElementById("lightbox-legende");
    var compteur = document.getElementById("lightbox-compteur");
    var index = 0;
    var declencheur = null;
    var departX = null;

    function afficher(i, animer) {
      index = (i + items.length) % items.length;
      var item = items[index];
      var charger = function () {
        image.src = item.dataset.grand;
        image.alt = item.dataset.alt || "";
        legende.textContent = item.dataset.legende || "";
        compteur.textContent = (index + 1) + " / " + items.length;
        image.classList.remove("est-change");
      };
      if (animer) {
        image.classList.add("est-change");
        setTimeout(charger, 280);
      } else {
        charger();
      }
    }

    function fermerVisionneuse() {
      boite.close();
    }

    items.forEach(function (item, i) {
      item.addEventListener("click", function () {
        declencheur = item;
        afficher(i, false);
        boite.showModal();
        if (lenis) lenis.stop();
      });
    });

    document.getElementById("lightbox-fermer").addEventListener("click", fermerVisionneuse);
    document.getElementById("lightbox-prec").addEventListener("click", function () { afficher(index - 1, true); });
    document.getElementById("lightbox-suiv").addEventListener("click", function () { afficher(index + 1, true); });

    boite.addEventListener("click", function (e) {
      if (e.target === boite) fermerVisionneuse();
    });

    boite.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") afficher(index - 1, true);
      if (e.key === "ArrowRight") afficher(index + 1, true);
    });

    boite.addEventListener("touchstart", function (e) {
      departX = e.changedTouches[0].clientX;
    }, { passive: true });

    boite.addEventListener("touchend", function (e) {
      if (departX === null) return;
      var dx = e.changedTouches[0].clientX - departX;
      departX = null;
      if (Math.abs(dx) > 50) afficher(index + (dx < 0 ? 1 : -1), true);
    }, { passive: true });

    boite.addEventListener("close", function () {
      image.removeAttribute("src");
      if (lenis) lenis.start();
      if (declencheur) declencheur.focus({ preventScroll: true });
    });
  }
})();
