var Colors = {
  red: 0xf25346,
  white: 0xffffff,
  brown: 0x59332e,
  pink: 0xF5986E,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
  green: 0x62a000,
};

window.addEventListener('load', init, false);

function init() {
  createScene();
  createLights();
  createPlane();
  createSea();
  createSky();
  
  document.addEventListener('mousemove', handleMouseMove,false);

  loop();
}

var scene, camera, fieldOfView, aspectRatio, nearPlane,
  farPlane, HEIGHT, WIDTH, renderer, container;

function createScene() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  //create the scene
  scene = new THREE.Scene();

  scene.fog = new THREE.Fog(0x41b5f4, 100, 950);

  //creates the camera
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  renderer = new THREE.WebGLRenderer({
    alpha: true, antialias: true
  });

  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;


  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);

}

function handleWindowResize() {
  // update height and width of the renderer and the camera
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}
var hemisphereLight, shadowLight;

function createLights() {
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaf,0x000000, .9)
	
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);
	shadowLight.position.set(150, 300, 350);
	shadowLight.castShadow = true;

	//visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
  
  	ambientLight = new THREE.AmbientLight(0xdc8874, .5);
   scene.add(ambientLight);
	// to activate the lights
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}

Sea = function(){
	var geom = new THREE.CylinderGeometry(600,600,800,40,10);
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

	// to let waves continue
  geom.mergeVertices();
  
	var l = geom.vertices.length;
	this.waves = [];

	for (var i=0; i<l; i++){
		var v = geom.vertices[i];
		this.waves.push({y:v.y,
			x:v.x,
			z:v.z,
			// a random angle
			ang:Math.random()*Math.PI*2,
			// a random distance
			amp:5 + Math.random()*15,
			// a random speed between 0.016 and 0.048 radians / frame
			speed:0.016 + Math.random()*0.032
			});
	};
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.green,
		transparent:true,
		opacity:.8,
		shading:THREE.FlatShading,
	});

	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.receiveShadow = true;

}

Sea.prototype.moveWaves = function (){
	
	// get the vertices
	var verts = this.mesh.geometry.vertices;
	var l = verts.length;
	
	for (var i=0; i<l; i++){
		var v = verts[i];
		var vprops = this.waves[i];
		v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
		v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
		vprops.ang += vprops.speed;

	}
	this.mesh.geometry.verticesNeedUpdate=true;
	sea.mesh.rotation.z += .005;
}

var sea;

function createSea(){
	sea = new Sea();
	sea.mesh.position.y = -600;
	scene.add(sea.mesh);
}

Cloud = function(){
	// Create an empty container
	this.mesh = new THREE.Object3D();
	
	var geom = new THREE.BoxGeometry(20,20,20);
	
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.white,  //its a cloud
	});
	
	//we make the cloud by duplicating a cube a random number of times
	var nBlocs = 5+Math.floor(Math.random()*3);
	for (var i=0; i<nBlocs; i++ ){
		var m = new THREE.Mesh(geom, mat); 
		
		// set the position and the rotation of each cube randomly
		m.position.x = i*15;
		m.position.y = Math.random()*10;
		m.position.z = Math.random()*10;
		m.rotation.z = Math.random()*Math.PI*2;
		m.rotation.y = Math.random()*Math.PI*2;
		
		// set the size of the cube randomly
		var s = .1 + Math.random()*.9;
		m.scale.set(s,s,s);
	
		m.castShadow = true;
		m.receiveShadow = true;
		this.mesh.add(m);
	} 
}

Sky = function(){

	this.mesh = new THREE.Object3D();
	this.numberOfClouds = 20;

  //since the sky is curved we distribute the clouds along a curve
	var stepAngle = Math.PI*2 / this.numberOfClouds;
	
	// create the clouds
	for(var i=0; i<this.numberOfClouds; i++){
		var c = new Cloud();
	 
		// set the rotation and the position of each cloud;
		var a = stepAngle*i;
		var h = 850 + Math.random()*200; // this is the distance between the center of the axis and the cloud itself

		// converting polar coordinates into Cartesian coordinates (x, y)
		c.mesh.position.y = Math.sin(a)*h;
		c.mesh.position.x = Math.cos(a)*h;
		c.mesh.rotation.z = a + Math.PI/2;

		// clouds are at random depths inside of the scene
		c.mesh.position.z = -400-Math.random()*400;
		
		var s = 1+Math.random()*2;
		c.mesh.scale.set(s,s,s);
		this.mesh.add(c.mesh);  
	}  
}

var sky;

function createSky(){
	sky = new Sky();
	sky.mesh.position.y = -600;
	scene.add(sky.mesh);
}
var AirPlane = function() {
	
	this.mesh = new THREE.Object3D();
	
	// Create the cabin
	var geomCockpit = new THREE.BoxGeometry(60,50,50,1,1,1);
	var matCockpit = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
  
  geomCockpit.vertices[4].y-=10;
  geomCockpit.vertices[4].z+=20;
  geomCockpit.vertices[5].y-=10;
  geomCockpit.vertices[5].z-=20;
  geomCockpit.vertices[6].y+=30;
  geomCockpit.vertices[6].z+=20;
  geomCockpit.vertices[7].y+=30;
  geomCockpit.vertices[7].z-=20;
  var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
	cockpit.castShadow = true;
	cockpit.receiveShadow = true;
	this.mesh.add(cockpit);
	
	// Create the engine
	var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
	var matEngine = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
	var engine = new THREE.Mesh(geomEngine, matEngine);
	engine.position.x = 40;
	engine.castShadow = true;
	engine.receiveShadow = true;
	this.mesh.add(engine);
	
	// Create the tail
	var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
	var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
	var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
	tailPlane.position.set(-35,25,0);
	tailPlane.castShadow = true;
	tailPlane.receiveShadow = true;
	this.mesh.add(tailPlane);
	
	// Create the wing
	var geomSideWing = new THREE.BoxGeometry(40,8,150,1,1,1);
	var matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
	var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
	sideWing.castShadow = true;
	sideWing.receiveShadow = true;
	this.mesh.add(sideWing);
	
	// propeller
	var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
	var matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
	this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
	this.propeller.castShadow = true;
	this.propeller.receiveShadow = true;
	
	// blades
	var geomBlade = new THREE.BoxGeometry(1,100,20,1,1,1);
	var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
	
	var blade = new THREE.Mesh(geomBlade, matBlade);
	blade.position.set(8,0,0);
	blade.castShadow = true;
	blade.receiveShadow = true;
	this.propeller.add(blade);
	this.propeller.position.set(50,0,0);
	this.mesh.add(this.propeller);
};

var airplane;

function createPlane(){ 
	airplane = new AirPlane();
	airplane.mesh.scale.set(.25,.25,.25);
	airplane.mesh.position.y = 100;
	scene.add(airplane.mesh);
}



var mousePos={x:0, y:0};

// handling the mousemove event

function handleMouseMove(event) {

	// here we are converting the mouse position value received 
	// to a normalized value varying between -1 and 1 for the horizontal axis
	
  var tx = -1 + (event.clientX / WIDTH)*2;
  // verical axis
	var ty = 1 - (event.clientY / HEIGHT)*2;
	mousePos = {x:tx, y:ty};

}

//animation loop
function loop(){
	sea.mesh.rotation.z += .005;
	sky.mesh.rotation.z += .01;

	// update the plane on each frame
	updatePlane();
	sea.moveWaves()
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

function updatePlane(){
	var targetY = normalize(mousePos.y,-.75,.75,25, 175);
	var targetX = normalize(mousePos.x,-.75,.75,-100, 100);

	airplane.mesh.position.y += (targetY-airplane.mesh.position.y)*0.1;
	airplane.mesh.rotation.z = (targetY-airplane.mesh.position.y)*0.0128;
	airplane.mesh.rotation.x = (airplane.mesh.position.y-targetY)*0.0064;

	airplane.propeller.rotation.x += 0.3;
}

function normalize(v,vmin,vmax,tmin, tmax){

	var nv = Math.max(Math.min(v,vmax), vmin);
	var dv = vmax-vmin;
	var pc = (nv-vmin)/dv;
	var dt = tmax-tmin;
	var tv = tmin + (pc*dt);
	return tv;

}



