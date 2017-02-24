(function() {

  Physijs.scripts.worker = './js/physijs_worker.js';
  // using the full path for ammo.js doesn't work
  Physijs.scripts.ammo = 'ammo.js';

  var camera, renderer, scene;
  var ballJSON, ballModel, bowlingBall;
  var boxes;
  var pinJSON, bowlingPin;
  var movingLight;
  var objectLoader, textureLoader;
  var sky;

  function init() {

    /* basic scene setup */

    // create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // positioning
    camera.position.x = -2;
    camera.position.y = 5;
    camera.position.z = 4;
    // target
    camera.lookAt(new THREE.Vector3(4, -2, -10));

    // create renderer, enable antialiasing + setup softer shadows
    renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);

    // shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // enable softer shadows

    // append canvas element to <body>
    document.body.appendChild(renderer.domElement);

    // scene
    scene = new Physijs.Scene(); // create new physics-enabled scene
    scene.fog = new THREE.Fog(0xcce0ff, 0, 500); // a bit o' fog
    scene.setGravity(new THREE.Vector3(0, -20, 0)); // gravity tweaking

    // instantiate object & texture loaders
    objectLoader = new THREE.ObjectLoader();
    textureLoader = new THREE.TextureLoader();

    createLights();
    createSkydome();
    createPlane();
    addObjects();
  }

  function createLights() {
    // ambient
    var ambientLight = new THREE.AmbientLight(0x222233, 7); // create new ambient light (="sun")
    scene.add(ambientLight); // add light to scene

    // spots

    // create an array of pointlights (= "bare lightbulbs")
    var lights = [];
    lights[0] = new THREE.PointLight(0x05d954, 0.3, 0); // parameters: (color, intensity, distance)
    lights[1] = new THREE.PointLight(0xc53db3, 0.8, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);
    lights[3] = new THREE.PointLight(0xf8d669, 0.4, 0);

    // set light xyz positions

    lights[0].position.set(-20, 40, -80);
    lights[1].position.set(50, 80, -500);
    lights[2].position.set(0, 60, 30);
    lights[3].position.set(80, 40, -80);

    // enable shadows for all lights 
    for (var i = 0; i < lights.length; i++) {
      //lights[i].castShadow = true;
      lights[i].shadow.mapSize.width =
        lights[i].shadow.mapSize.height = 2048; // default 512
      lights[i].shadow.camera.near = 1; // default 0.5
      lights[i].shadow.camera.far = 700; // default 500
      lights[i].shadow.bias = 0.001;
      scene.add(lights[i]);
    }

    // cool demo-esque moving light just for kicks :D
    movingLight = new THREE.PointLight(0x356dfc, 0.5);
    movingLight.castShadow = true;
    movingLight.shadow.mapSize.width =
      movingLight.shadow.mapSize.height = 4096; // default 512
    movingLight.shadow.camera.near = 1; // default 0.5
    movingLight.shadow.camera.far = 700; // default 500
    movingLight.shadow.bias = 0.001;
    scene.add(movingLight);
  }

  function createPlane() {
    // load plane texture from file
    var planeTexture = textureLoader.load(
      './textures/stone.jpg'
    );

    // setup repeated texture wrapping
    planeTexture.wrapS = THREE.RepeatWrapping;
    planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat = new THREE.Vector2(4, 50);
    planeTexture.anisotropy = renderer.getMaxAnisotropy(); // setup texture anisotropy

    var planeBumpMap = textureLoader.load(
      './textures/stone-bump.jpg'
    );

    // setup identical repeated bump map wrapping
    planeBumpMap.wrapS = THREE.RepeatWrapping;
    planeBumpMap.wrapT = THREE.RepeatWrapping;
    planeBumpMap.repeat = new THREE.Vector2(4, 50);

    // define plane material
    var planeMaterial = Physijs.createMaterial(
      new THREE.MeshPhongMaterial({
        color: 0x222222,
        specular: 0xd3d3d3,
        shininess: 30,
        shading: THREE.FlatShading,
        map: planeTexture,
        bumpMap: planeBumpMap,
        bumpScale: 0.01,
        name: "Ground"
      }),
      0.9, // friction
      0.2 // restitution
    );

    // create plane geometry
    var planeGeometry = new THREE.PlaneGeometry(40, 500);

    // create the plane mesh using geometry & material
    var plane = new Physijs.BoxMesh(
      planeGeometry,
      planeMaterial,
      0 // zero mass means this is a static object
    );

    plane.receiveShadow = true; // objects cast shadows on the plane
    plane.rotation.x = -Math.PI / 2; // rotate plane
    plane.position.y = -1; // set plane y position

    scene.add(plane); // add plane to scene
  }

  function createSkydome(loader) {
    // create geometry
    var skyGeo = new THREE.SphereGeometry(1000, 32, 15);
    // load texture
    var texture = textureLoader.load('./textures/space.jpg');
    // create material
    var material = new THREE.MeshPhongMaterial({
      map: texture,
    });
    // create the mesh
    sky = new THREE.Mesh(skyGeo, material);
    // set mesh material to appear on the inside of the sphere
    sky.material.side = THREE.BackSide;
    // add skydome to scene
    scene.add(sky);
  }

  function addBall() {
    // bowling ball

    // texture
    var ballTexture = textureLoader.load('./textures/bowlingball.png');

    // material
    var ballMaterial = Physijs.createMaterial(
      new THREE.MeshStandardMaterial({
        roughness: 0.25,
        metalness: 0.42,
        map: ballTexture
      }),
      0.3, // friction
      0.3 // restitution
    );

    bowlingBall = new Physijs.SphereMesh(
      // SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
      new THREE.SphereGeometry(0.68, 100, 100),
      ballMaterial,
      3 // mass
    );

    // set ball xyz position
    bowlingBall.position.set(2, 0, 0);
    // enable shadows on ball
    bowlingBall.castShadow = true;
    bowlingBall.receiveShadow = true;
    // collision event logging
    bowlingBall.addEventListener('collision', function(other_object, relative_velocity, relative_rotation, contact_normal) {
      console.log("Ball has collided with %s", other_object.material.name);
    });

    scene.add(bowlingBall);
  }

  function resetBall() {
    bowlingBall.removeEventListener('collision');
    scene.remove(bowlingBall);
    addBall();
  }

  function addObjects() {
    addBall();
    // init box mesh array
    boxes = [];
    // texture
    var boxTexture = textureLoader.load('./textures/wood.jpg');
    // init z axis position
    var z = -5;

    for (var i = 0; i < 15; i++) {
      var name = "Pin " + i;
      // material
      var boxMaterial = Physijs.createMaterial(
        new THREE.MeshStandardMaterial({
          roughness: 0.9,
          metalness: 0.0,
          map: boxTexture,
          name: name
        }),
        0.3, // friction
        0.6 // restitution
      );

      boxes[i] = new Physijs.SphereMesh(
        new THREE.BoxGeometry(0.5, 1, 0.5),
        boxMaterial,
        1 // mass
      );

      var x = Math.floor((Math.random() * 3) + 1);
      boxes[i].position.set(x, 0, z);
      boxes[i].castShadow = true;
      boxes[i].receiveShadow = true;
      scene.add(boxes[i]);
      z -= 2;
    }
  }

  function launchBall() {
    var force = new THREE.Vector3(0, 0, -150);
    bowlingBall.applyCentralImpulse(force);
  }

  var render = function() {
    var timer = 0.0001 * Date.now();
    // check for undefined variables to suppress errors while initializing
    if (scene) {
      scene.simulate(); // run physics
    }

    if (renderer) {
      renderer.render(scene, camera); // render the scene
    }

    if (movingLight) {
      // move the spotlight
      movingLight.position.x = Math.sin(timer * 7) * 100;
      movingLight.position.y = Math.abs(Math.cos(timer * 5) * 400);
      movingLight.position.z = -200 + Math.cos(timer * 3) * 100;
    }

    // advance to next frame
    requestAnimationFrame(render);
  };

  // window resize handler function
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }



  /* MAIN */

  init();
  render();



  /* event listeners */

  // window resize
  window.addEventListener('resize', onWindowResize, false);

  // buttons
  document.getElementById("launchBallButton")
    .addEventListener("click", function() {
      launchBall();
    });

  document.getElementById("reset")
    .addEventListener("click", function() {
      // remove & repopulate all objects
      for (let box of boxes) {
        scene.remove(box);
      }
      scene.remove(bowlingBall);
      addObjects();
    });

  document.getElementById("resetBall")
    .addEventListener("click", function() {
      resetBall();
    });

})();