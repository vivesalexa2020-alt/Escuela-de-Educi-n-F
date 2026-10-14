(function () {
  "use strict";

  var contenedor = document.getElementById("cerdito-3d");
  if (!contenedor || !window.THREE || !window.WebGLRenderingContext) return;

  var THREE = window.THREE;
  var sinMovimiento =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function medir() {
    return {
      w: Math.max(1, contenedor.clientWidth || 480),
      h: Math.max(1, contenedor.clientHeight || 420)
    };
  }

  var dim = medir();

  var escena = new THREE.Scene();

  var camara = new THREE.PerspectiveCamera(40, dim.w / dim.h, 0.1, 100);
  camara.position.set(0, 2.6, 8.4);
  camara.lookAt(0, 1.7, 0);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(dim.w, dim.h);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  contenedor.appendChild(renderer.domElement);

  // ---------- Luces ----------
  escena.add(new THREE.AmbientLight(0xdfe7ff, 0.6));

  var luzPrincipal = new THREE.DirectionalLight(0xffffff, 2.1);
  luzPrincipal.position.set(5, 9, 6);
  luzPrincipal.castShadow = true;
  luzPrincipal.shadow.mapSize.set(1024, 1024);
  luzPrincipal.shadow.camera.near = 1;
  luzPrincipal.shadow.camera.far = 30;
  luzPrincipal.shadow.camera.left = -5;
  luzPrincipal.shadow.camera.right = 5;
  luzPrincipal.shadow.camera.top = 6;
  luzPrincipal.shadow.camera.bottom = -3;
  luzPrincipal.shadow.radius = 4;
  escena.add(luzPrincipal);

  var luzTurquesa = new THREE.PointLight(0x00d2c6, 40, 24, 2);
  luzTurquesa.position.set(-4.5, 2.5, 3.5);
  escena.add(luzTurquesa);

  var luzRosa = new THREE.PointLight(0xff6fb0, 22, 22, 2);
  luzRosa.position.set(2.5, -1, -4);
  escena.add(luzRosa);

  // ---------- Materiales ----------
  var matRosa = new THREE.MeshStandardMaterial({ color: 0xf7a8d0, roughness: 0.5, metalness: 0.08 });
  var matRosaOscuro = new THREE.MeshStandardMaterial({ color: 0xe87bb6, roughness: 0.55, metalness: 0.06 });
  var matOjos = new THREE.MeshStandardMaterial({ color: 0x241f33, roughness: 0.3, metalness: 0.1 });
  var matBrillo = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0 });
  var matRanura = new THREE.MeshStandardMaterial({ color: 0x3a2b52, roughness: 0.6, metalness: 0.3 });
  var matOro = new THREE.MeshStandardMaterial({ color: 0xffcf4a, roughness: 0.25, metalness: 0.95 });

  // ---------- Grupo del cerdito ----------
  var cerdito = new THREE.Group();

  // Cuerpo
  var cuerpo = new THREE.Mesh(new THREE.SphereGeometry(1.3, 48, 32), matRosa);
  cuerpo.scale.set(1.25, 1.0, 1.06);
  cuerpo.position.y = 1.55;
  cuerpo.castShadow = true;
  cuerpo.receiveShadow = true;
  cerdito.add(cuerpo);

  // Hocico
  var hocico = new THREE.Mesh(new THREE.SphereGeometry(0.52, 32, 24), matRosaOscuro);
  hocico.scale.set(1.05, 0.82, 0.72);
  hocico.position.set(0, 1.35, 1.5);
  hocico.castShadow = true;
  cerdito.add(hocico);

  // Fosas nasales
  [-0.17, 0.17].forEach(function (x) {
    var fosa = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.16, 16), matOjos);
    fosa.rotation.x = Math.PI / 2;
    fosa.position.set(x, 1.42, 1.9);
    cerdito.add(fosa);
  });

  // Ojos con brillo
  [-0.52, 0.52].forEach(function (x) {
    var ojo = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 16), matOjos);
    ojo.position.set(x, 1.95, 1.12);
    cerdito.add(ojo);

    var brillo = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), matBrillo);
    brillo.position.set(x + 0.05, 2.0, 1.24);
    cerdito.add(brillo);
  });

  // Orejas
  [-1, 1].forEach(function (s) {
    var oreja = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.72, 24), matRosaOscuro);
    oreja.position.set(0.62 * s, 2.78, 0.15);
    oreja.rotation.z = -0.32 * s;
    oreja.rotation.x = -0.42;
    oreja.castShadow = true;
    cerdito.add(oreja);
  });

  // Patas
  [-0.78, 0.78].forEach(function (x) {
    [-0.62, 0.62].forEach(function (z) {
      var pata = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.28, 0.6, 20), matRosa);
      pata.position.set(x, 0.3, z);
      pata.castShadow = true;
      pata.receiveShadow = true;
      cerdito.add(pata);
    });
  });

  // Cola rizada
  var cola = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 12, 28, Math.PI * 1.5), matRosaOscuro);
  cola.position.set(0, 1.95, -1.45);
  cola.rotation.set(0.5, 0.4, 0);
  cerdito.add(cola);

  // Ranura de monedas
  var ranura = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 0.24), matRanura);
  ranura.position.set(0, 2.78, 0.12);
  ranura.rotation.x = -0.05;
  cerdito.add(ranura);

  escena.add(cerdito);

  // ---------- Sombra en el suelo ----------
  var suelo = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 26),
    new THREE.ShadowMaterial({ opacity: 0.24 })
  );
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.y = 0;
  suelo.receiveShadow = true;
  escena.add(suelo);

  // ---------- Monedas ----------
  var monedas = [];
  var acumulador = 0;
  var intervalo = 0.9;

  function crearMoneda() {
    var moneda = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 36), matOro);
    moneda.castShadow = true;
    moneda.position.set(
      (Math.random() - 0.5) * 0.18,
      4.7,
      0.12 + (Math.random() - 0.5) * 0.1
    );
    moneda.rotation.y = Math.random() * Math.PI;
    moneda.userData = { vy: 0, estado: "cayendo", vida: 0 };
    escena.add(moneda);
    monedas.push(moneda);
  }

  function actualizarMonedas(dt) {
    for (var i = monedas.length - 1; i >= 0; i--) {
      var m = monedas[i];
      if (m.userData.estado === "cayendo") {
        m.userData.vy += 14 * dt;
        m.position.y -= m.userData.vy * dt;
        m.rotation.y += dt * 6;
        if (m.position.y <= 2.98) {
          m.userData.estado = "entrando";
          m.userData.vida = 0;
        }
      } else {
        m.userData.vida += dt;
        var f = Math.max(0, 1 - m.userData.vida / 0.28);
        m.scale.setScalar(f);
        m.position.y -= dt * 1.8;
        if (f <= 0.02) {
          escena.remove(m);
          m.geometry.dispose();
          monedas.splice(i, 1);
        }
      }
    }
  }

  // ---------- Bucle de animación ----------
  var reloj = new THREE.Clock();
  var tiempo = 0;
  var corriendo = true;

  function animar() {
    if (!corriendo) return;
    requestAnimationFrame(animar);

    var dt = Math.min(reloj.getDelta(), 0.05);
    tiempo += dt;

    cerdito.position.y = Math.sin(tiempo * 1.4) * 0.06;
    cerdito.rotation.y = Math.sin(tiempo * 0.35) * 0.28;

    acumulador += dt;
    if (acumulador >= intervalo) {
      acumulador = 0;
      intervalo = 0.75 + Math.random() * 0.5;
      crearMoneda();
    }
    actualizarMonedas(dt);

    renderer.render(escena, camara);
  }

  if (sinMovimiento) {
    crearMoneda();
    monedas[0].position.y = 3.6;
    renderer.render(escena, camara);
  } else {
    animar();
  }

  // ---------- Redimensionar ----------
  function ajustar() {
    var d = medir();
    camara.aspect = d.w / d.h;
    camara.updateProjectionMatrix();
    renderer.setSize(d.w, d.h);
    if (sinMovimiento) renderer.render(escena, camara);
  }

  if (window.ResizeObserver) {
    new ResizeObserver(ajustar).observe(contenedor);
  } else {
    window.addEventListener("resize", ajustar);
  }

  // ---------- Pausar cuando no está visible ----------
  document.addEventListener("visibilitychange", function () {
    if (sinMovimiento) return;
    if (document.hidden) {
      corriendo = false;
    } else if (!corriendo) {
      corriendo = true;
      reloj.getDelta();
      animar();
    }
  });

  if (window.IntersectionObserver) {
    new IntersectionObserver(
      function (entradas) {
        if (sinMovimiento) return;
        var visible = entradas[0].isIntersecting;
        if (!visible && corriendo) {
          corriendo = false;
        } else if (visible && !corriendo && !document.hidden) {
          corriendo = true;
          reloj.getDelta();
          animar();
        }
      },
      { threshold: 0.05 }
    ).observe(contenedor);
  }

  window.__finanzalabPiggy = {
    renderer: renderer,
    escena: escena,
    camara: camara,
    cerdito: cerdito,
    monedas: monedas
  };
})();
