(function() {
	
	Physijs.scripts.worker = './js/physijs_worker.js';
	// somehow using the full path for ammo.js doesn't work - this does
    Physijs.scripts.ammo = 'ammo.js';
	
	var camera, renderer, scene;
	var ballJSON, ballModel, bowlingBall;
	var pinJSON, bowlingPin;
	var loader;
	
	function init() {
		/* OBSOLETE - Loading JSON models + applying physics to them is too experimental atm.
		
		// load JSON models
		$.when(
			$.getJSON('models/bowlingBall.json', function(data){
				ballJSON = data;
			}),
			$.getJSON('models/bowlingPin.json', function(data){
				pinJSON = data;
			})
		).then( setupScene );		// start scene setup after successful model loading
		
		*/
		
		setupScene();
		
		function setupScene() {
			
			// *** basic scene setup ***
			
			// renderer
			renderer = new THREE.WebGLRenderer( { antialias : true } );		// create renderer, enable antialiasing
			renderer.setSize( window.innerWidth, window.innerHeight );
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;				// enable softer shadows
			document.body.appendChild( renderer.domElement );				// append canvas element to body

			// scene
			scene = new Physijs.Scene();						// create new Three.js scene
			scene.fog = new THREE.Fog( 0xcce0ff, 0, 500 );		// a bit o' fog
			
			// camera
			camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );	// a pretty basic camera
			camera.position.z = 5;		// set camera z axis position
	
	
			// *** lights ***
			
			// ambient
			var ambientLight = new THREE.AmbientLight( 0x000000 );		// create new ambient light (="sun")
			scene.add( ambientLight );									// add light to scene
			
			// spots
			
			// create an array of pointlights (= "bare lightbulbs")
			var lights = [];
			lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );			// parameters: (color, intensity, distance)
			lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
			lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

			// set light xyz positions
			lights[ 0 ].position.set( 0, 30, 30 );							
			lights[ 1 ].position.set( 40, 50, -20 );
			lights[ 2 ].position.set( -30, 60, -10 );
			
			// enable shadows for all lights 
			for(var i = 0; i < lights.length; i++) {
				lights[i].castShadow = true;
				lights[i].shadow.camera.near = true;
				scene.add(lights[i]);
			}

			
			// *** objects ***
			
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
			
			plane.receiveShadow = true;				// this does not seem to work yet? no shadows are cast to the plane
			plane.rotation.x = -Math.PI / 2;		// rotate plane
			plane.position.y = -1;					// set plane y position
			
			scene.add(plane);						// add plane to scene

			// bowling ball
			
			// define ball material
			var ballMaterial = new THREE.MeshStandardMaterial(
				{
					color : 0x93de,
					emissive : 0x0,
					roughness : 0.5,
					metalness : 0.38,
					shading : THREE.SmoothShading,
					vertexColors : THREE.NoColors
				}
			);
			
			bowlingBall = new Physijs.SphereMesh(
				// SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
				new THREE.SphereGeometry( 0.68, 100, 100 ),
				ballMaterial
			);
			
			bowlingBall.position.set(2, 0, 0);		// set ball xyz position
			// enable shadows on ball
			bowlingBall.castShadow = true;
			bowlingBall.receiveShadow = true;
			
			scene.add( bowlingBall );

			/* OBSOLETE.
			
			bowlingBall = loader.parse(ballJSON);		// use loader to parse JSON model to Object3D-object
			
			// define ball material
			var ballMaterial = new THREE.MeshStandardMaterial(
				{
					color : 0x93de,
					emissive : 0x0,
					roughness : 0.5,
					metalness : 0.38,
					shading : THREE.SmoothShading,
					vertexColors : THREE.NoColors
				}
			);
			
			// Object3D is composed of meshes
			// --> material must be added to all its children vertices
			bowlingBall.traverse(function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material = ballMaterial;
				}
			});
	
			bowlingBall.position.set(2, 0, 0);		// set ball xyz position
			// enable shadows on ball
			bowlingBall.castShadow = true;
			bowlingBall.receiveShadow = true;
			// add ball to scene
			scene.add(bowlingBall);
			
			// bowling pin
			
			bowlingPin = loader.parse(pinJSON);		// use loader to parse JSON model to Object3D-object
			bowlingPin.position.set(-3, 0, 0);		// set pin xyz position
			// enable shadows on pin
			bowlingPin.castShadow = true;
			bowlingPin.receiveShadow = true;
			// add pin to scene
			scene.add(bowlingPin);
			
			*/
			
		}
	}
	
	var render = function () {
		// check for undefined variables to suppress errors while initializing
		if(scene) {
			scene.simulate();		// run physics
		}
		
		/*
		if(bowlingBall) {
			bowlingBall.rotation.x += 0.01;
			bowlingBall.rotation.y += 0.01;
		}
		
		if(bowlingPin) {
			bowlingPin.rotation.x += 0.01;
			bowlingPin.rotation.y += 0.01;
			bowlingPin.rotation.z += 0.01;
		}
		*/
		
		if(renderer) {
			renderer.render(scene, camera);		// render the scene
		}
		
		requestAnimationFrame( render );
	};
	
	// window resize handler function
	function onWindowResize(){
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	init();
	render();
	
	window.addEventListener( 'resize', onWindowResize, false );
	
})();
