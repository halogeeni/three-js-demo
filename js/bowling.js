(function() {

  Physijs.scripts.worker = './js/physijs_worker.js';
  // somehow using the full path for ammo.js doesn't work - this does
  Physijs.scripts.ammo = 'ammo.js';

  var camera, renderer, scene;
  var ballJSON, ballModel, bowlingBall;
  var boxes;
  var pinJSON, bowlingPin;
  var movingLight;
  var loader;

  function init() {

    setupScene();

    function setupScene() {

      /* basic scene setup */

      // camera
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.x = -1; // set camera z axis position
      camera.position.z = 3; // set camera z axis position
      camera.lookAt(new THREE.Vector3( 1, 0, 0 ));
      // renderer
      renderer = new THREE.WebGLRenderer({
        antialias: true
      }); // create renderer, enable antialiasing
      renderer.setSize(window.innerWidth, window.innerHeight);
      // shadows
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap; // enable softer shadows
      /*
      renderer.shadowMapBias = 0.0039;
      renderer.shadowMapDarkness = 0.5;
      renderer.shadowMapWidth = 1024;
      renderer.shadowMapHeight = 1024;
      renderer.shadowCameraNear = 100;
      renderer.shadowCameraFar = 500;
      renderer.shadowCameraFov = 75;
      */
      document.body.appendChild(renderer.domElement); // append canvas element to body

      // scene
      scene = new Physijs.Scene(); // create new Three.js scene
      scene.fog = new THREE.Fog(0xcce0ff, 0, 500); // a bit o' fog

      /* lights */

      // ambient
      var ambientLight = new THREE.AmbientLight(0x000000); // create new ambient light (="sun")
      scene.add(ambientLight); // add light to scene

      // spots

      // create an array of pointlights (= "bare lightbulbs")
      var lights = [];
      lights[0] = new THREE.PointLight(0xffffff, 1, 0); // parameters: (color, intensity, distance)
      lights[1] = new THREE.PointLight(0xffffff, 1, 0);
      lights[2] = new THREE.PointLight(0xffffff, 1, 0);

      // set light xyz positions
      lights[0].position.set(0, 30, 30);
      lights[1].position.set(40, 50, -20);
      lights[2].position.set(-30, 60, -10);

      // enable shadows for all lights 
      for (var i = 0; i < lights.length; i++) {
        lights[i].castShadow = true;
        lights[i].shadow.mapSize.width = 2048;  // default 512
        lights[i].shadow.mapSize.height = 2048; // default 512
        lights[i].shadow.camera.near = 100;       // default 0.5
        lights[i].shadow.camera.far = 700;      // default 500
        scene.add(lights[i]);
      }

      // cool demo-esque moving light just for kicks :D
      movingLight = new THREE.PointLight(0xff0000, 1);
      movingLight.castShadow = true;
      movingLight.shadow.mapSize.width = 2048;  // default 512
      movingLight.shadow.mapSize.height = 2048; // default 512
      movingLight.shadow.camera.near = 1;       // default 0.5
      movingLight.shadow.camera.far = 700;      // default 500
      scene.add(movingLight);

      /* objects */

      // instantiate object loader for JSON models
      var loader = new THREE.ObjectLoader();

      // plane

      // load plane texture from file
      var planeTexture = new THREE.TextureLoader().load(
        './textures/bw_checkered.jpg'
      );

      // setup repeated texture wrapping
      planeTexture.wrapS = THREE.RepeatWrapping;
      planeTexture.wrapT = THREE.RepeatWrapping;
      planeTexture.repeat = new THREE.Vector2(50, 50);
      planeTexture.anisotropy = renderer.getMaxAnisotropy(); // setup texture anisotropy

      // define plane material
      var planeMaterial = new THREE.MeshPhongMaterial({
        color: 0x222222,
        specular: 0xffffff,
        shininess: 20,
        shading: THREE.FlatShading,
        map: planeTexture
      });

      // create plane geometry
      var planeGeometry = new THREE.PlaneGeometry(500, 500);

      // create the plane mesh using geometry & material
      var plane = new Physijs.BoxMesh(planeGeometry, planeMaterial);

      plane.receiveShadow = true; // this does not seem to work yet? no shadows are cast to the plane
      plane.rotation.x = -Math.PI / 2; // rotate plane
      plane.position.y = -1; // set plane y position

      scene.add(plane); // add plane to scene

      addObjects();

    }
  }

  function addBall() {
    // bowling ball

    // material
    var ballMaterial = new THREE.MeshStandardMaterial({
      color: 0x93de,
      emissive: 0x0,
      roughness: 0.5,
      metalness: 0.38,
      shading: THREE.SmoothShading,
      vertexColors: THREE.NoColors
    });

    bowlingBall = new Physijs.SphereMesh(
      // SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
      new THREE.SphereGeometry(0.68, 100, 100),
      ballMaterial
    );

    bowlingBall.position.set(2, 0, 0); // set ball xyz position
    bowlingBall.castShadow = true; // enable shadows on ball
    bowlingBall.receiveShadow = true;

    scene.add(bowlingBall);
  }

  function resetBall() {
    scene.remove(bowlingBall);
    addBall();
  }

  function addObjects() {
    addBall();

    // boxes

    // using an array if we want to do something with the boxes later on
    boxes = [];
    
    // material
    var boxMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x0,
      roughness: 0.5,
      metalness: 0.38,
      shading: THREE.SmoothShading,
      vertexColors: THREE.NoColors
    });

    var z = -5;
    
    for(var i = 0; i < 15; i++) {
      boxes[i] = new Physijs.SphereMesh(new THREE.BoxGeometry(0.5, 1, 0.5), boxMaterial);
      var x = Math.floor((Math.random() * 3) + 1); 
      boxes[i].position.set( x, 0, z );
      boxes[i].castShadow = true;
      boxes[i].receiveShadow = true;
      scene.add(boxes[i]);
      z -= 2;
    }

  }

  function launchBall() {
    var force = new THREE.Vector3(0, 0, -100);
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
      movingLight.position.x = Math.sin(timer * 7) * 100;
      movingLight.position.y = Math.abs(Math.cos(timer * 5) * 400);
      movingLight.position.z = -200 + Math.cos(timer * 3) * 100;
    }

    requestAnimationFrame(render);
  };

  // window resize handler function
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  init();
  render();

  /* event listeners */

  // window resize
  window.addEventListener('resize', onWindowResize, false);

  // button click
  document.getElementById("launchBallButton").addEventListener("click", function() {
    launchBall();
  });

  document.getElementById("reset").addEventListener("click", function() {
    // remove all objects from scene
    for(let box of boxes) {
      scene.remove(box);
    }
    
    scene.remove(bowlingBall);

    // add new objects
    addObjects();
  });

  document.getElementById("resetBall").addEventListener("click", function() {
    resetBall();
  });

})();