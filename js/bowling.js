(function() {
	var camera, renderer, scene;
	var ballJSON, ballModel, bowlingBall;
	var pinJSON, bowlingPin;
	var loader;
	
	function init() {
		// load JSON models
		$.when(
		$.getJSON('models/bowlingBall.json', function(data){
			ballJSON = data;
			}),
			$.getJSON('models/bowlingPin.json', function(data){
			pinJSON = data;
			})
		).then( setupScene );
		
		function setupScene() {
			// renderer
			renderer = new THREE.WebGLRenderer( { antialias : true } );
			renderer.setSize( window.innerWidth, window.innerHeight );
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			document.body.appendChild( renderer.domElement );

			// scene
			scene = new THREE.Scene();
			scene.fog = new THREE.Fog( 0xcce0ff, 0, 500 );
			
			// camera
			camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
			camera.position.z = 5;
	
			// lights
			
			// ambient
			var ambientLight = new THREE.AmbientLight( 0x000000 );
			scene.add( ambientLight );
			
			// spots
			var lights = [];
			lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
			lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
			lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

			lights[ 0 ].position.set( 0, 30, 30 );
			lights[ 1 ].position.set( 40, 50, -20 );
			lights[ 2 ].position.set( -30, 60, -10 );
			
			for(var i = 0; i < lights.length; i++) {
				lights[i].castShadow = true;
				lights[i].shadow.camera.near = true;
				scene.add(lights[i]);
			}

			// objects
			
			var loader = new THREE.ObjectLoader();
			
			// plane
			var planeTexture = new THREE.TextureLoader().load(
				'textures/bw_checkered.jpg'
			);
			planeTexture.wrapS = THREE.RepeatWrapping;
			planeTexture.wrapT = THREE.RepeatWrapping;
			planeTexture.repeat = new THREE.Vector2(50, 50);
			planeTexture.anisotropy = renderer.getMaxAnisotropy();
			
			var planeMaterial = new THREE.MeshPhongMaterial({
				color: 0x222222,
				specular: 0xffffff,
				shininess: 20,
				shading: THREE.FlatShading,
				map: planeTexture
			});
			var planeGeometry = new THREE.PlaneGeometry(500, 500);
			var plane = new THREE.Mesh(planeGeometry, planeMaterial);
			
			plane.receiveShadow = true;
			plane.rotation.x = -Math.PI / 2;
			plane.position.y = -1;
			
			scene.add(plane);

			// bowling ball			
			bowlingBall = loader.parse(ballJSON);
			
			// define ball material
			var ballMaterial = new THREE.MeshStandardMaterial(
				{
					color : 0x93de,
					emissive : 0x0,
					roughness : 0.5,
					metalness : 0.38,
					shading : THREE.SmoothShading,
					vertexColors : THREE.NoColors,
					fog : true
				}
			);
			
			// Object3D is composed of meshes
			// --> material must be added to all its children
			bowlingBall.traverse(function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material = ballMaterial;
				}
			});
			
			bowlingBall.position.set(2, 0, 0);
			bowlingBall.castShadow = true;
			bowlingBall.receiveShadow = true;
			
			scene.add(bowlingBall);
			
			// bowling pin		
			bowlingPin = loader.parse(pinJSON);
			
			bowlingPin.position.set(-3, 0, 0);
			bowlingPin.castShadow = true;
			bowlingPin.receiveShadow = true;
			
			scene.add(bowlingPin);
		}
	}
	
	var render = function () {
		requestAnimationFrame( render );

		if(bowlingBall) {
			bowlingBall.rotation.x += 0.01;
			bowlingBall.rotation.y += 0.01;
		}
		
		if(bowlingPin) {
			bowlingPin.rotation.x += 0.01;
			bowlingPin.rotation.y += 0.01;
			bowlingPin.rotation.z += 0.01;
		}
		
		if(renderer) {
			renderer.render(scene, camera);
		}
	};
	
	function onWindowResize(){
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	init();
	render();
	
	window.addEventListener( 'resize', onWindowResize, false );
	
})();
