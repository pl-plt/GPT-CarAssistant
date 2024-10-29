import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import GUI from 'lil-gui'

let camera, scene, renderer;
let raycaster = new THREE.Raycaster();

let gui; 

let controls;

let ambientLight, directionalLight;

new THREE.Vector3()

let leftSidePoints = {
    tireFrontLeft: new THREE.Vector3(-1.736832655034161,0.4193258564415763,0.9660315017712464),
    wheelFrontLeft: new THREE.Vector3(-1.736832655034161,0.8222460783065693,0.9660315017712464),
    tireBackLeft: new THREE.Vector3(1.329805474280586,0.4193258564415763,0.9982086026157494),
    wheelBackLeft: new THREE.Vector3(1.2960303605901669,0.8222460783065693,1.0588953611235477),
    frontDoorLeft: new THREE.Vector3(-0.496658497040001,1.0319896424484671,0.9703452387740942),
    backDoorLeft: new THREE.Vector3(0.5623336397747498,1.0319896424484671,0.9564414608937183),
    frontWindowLeft: new THREE.Vector3(-0.24396055287420232,1.3240709513630295,0.8594894700445035),
    backWindowLeft: new THREE.Vector3(0.2816356956089511,1.3240709513630295,0.8455856921641276),
    mirrorLeft: new THREE.Vector3(-0.7746696906399291,1.2714107155678525,1.1549595327714548)
};

let rightSidePoints = {
    tireBackRight: new THREE.Vector3(1.329805474280586,0.4193258564415763,-0.9818556255696399),
    wheelBackRight: new THREE.Vector3(1.329805474280586,0.8222460783065693,-0.9818556255696399),
    tireFrontRight: new THREE.Vector3(-1.7396315114978136,0.4193258564415763,-0.9696840482454787),
    wheelFrontRight: new THREE.Vector3(-1.7396315114978136,0.8222460783065693,-0.9696840482454787),
    frontDoorRight: new THREE.Vector3(-0.496658497040001,1.0319896424484671,-0.9703452387740942),
    backDoorRight: new THREE.Vector3(0.5623336397747498,1.0319896424484671,-0.9564414608937183),
    frontWindowRight: new THREE.Vector3(-0.24396055287420232,1.3240709513630295,-0.8594894700445035),
    backWindowRight: new THREE.Vector3(0.2816356956089511,1.3240709513630295,-0.8455856921641276),
    mirrorRight: new THREE.Vector3(-0.7746696906399291,1.2714107155678525,-1.1549595327714548)
};

let backPoints = {
    backLightLeft: new THREE.Vector3(2.3328988594931865,1.1141392578669254,0.7563009792627873),
    backLightRight: new THREE.Vector3(2.3328988594931865,1.1141392578669254,-0.7563009792627873),
    backWindow: new THREE.Vector3(2.3328988594931865,1.1141392578669254,0)
};

let frontPoints = {
    frontLightRight: new THREE.Vector3(-2.261371354273182,0.9676685339921159,-0.8155520318778674),
    frontLightLeft: new THREE.Vector3(-2.261371354273182,0.9676685339921159,0.8155520318778674),
    frontCarHood: new THREE.Vector3(-2.2927203293168628,1.257326330868079,0),
    frontWindow: new THREE.Vector3(-0.9189403734174525,1.4423069762620995,0)
};

let carChipPoints = []
let carState = {}


init();
//setupGui();
render();

function init() {
    const container = document.getElementById('app');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x808080);
    scene.fog = new THREE.Fog(0x808080, 20, 50);

    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 200);
    camera.position.set( 0, 5, 10 );

    // Lights
    ambientLight = new THREE.AmbientLight(0x808080, 7.0);

    directionalLight = new THREE.DirectionalLight(0xffffff, 10.0);
    directionalLight.position.set( 0, 20, 0 );
    //directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;

    scene.add(ambientLight);
    scene.add(directionalLight);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // GUI
    gui = new GUI();
    gui.add({ 'Get budget': getBudget}, 'Get budget');

    const budgetFolder = gui.addFolder('Budget Output');
    budgetFolder.open();
    window.budgetFolder = budgetFolder;

    // EVENTS
    window.addEventListener( 'resize', onWindowResize );
  
    // Controls
    controls = new OrbitControls(camera, container);
    controls.enableDamping = true;
    controls.dampingFactor = 0.5;
    controls.addEventListener('change', render);



    // Texture map
    // TODO

    // Reflection map
    // TODO



    // Floor
    const planeGeometry = new THREE.PlaneGeometry( 2000, 2000 );
    planeGeometry.rotateX( - Math.PI / 2 );
    //const planeMaterial = new THREE.ShadowMaterial( { color: 0x000000, opacity: 0.2 } );
    const planeMaterial = new THREE.MeshStandardMaterial( {color: 0xffffff} );

    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = -0.01;
    plane.receiveShadow = true;
    scene.add( plane );

    // Grid helper
    const helper = new THREE.GridHelper( 200, 100 );
    helper.position.y = 0;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    scene.add( helper );

    // Load model
    const loader = new GLTFLoader();
    //const dracoLoader = new DRACOLoader();
    
    //loader.setDRACOLoader(dracoLoader);
    loader.load('/medias/models/ford_explorer/scene.gltf', function(gltf) {
        gltf.scene.traverse(function(node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        scene.add(gltf.scene);
        }, undefined, function(error) {
            console.error(error);
        }
    );

    // Create spheres
    initCarPoints();
}

function render() {
    renderer.render(scene, camera);
}
function setupGui() {
//    const gui = new GUI();
}

function createSphereFromPoint(iPoint3) {
    const radius = 0.1;
    const widthSegments = 8;
    const heightSegments = 8;

    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshBasicMaterial({color: 0xa0a0a0});

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(iPoint3);

    scene.add(sphere);
    render();
    return sphere;
}

function updatePoint(point) {
    // TODO
}

function importCar() {
    // TODO
}

function initCarPoints() {
    for (const key in leftSidePoints) {
        const sphere = createSphereFromPoint(leftSidePoints[key]);
        sphere.name = key;
        carChipPoints.push(sphere);
        carState[key] = "OK";
    }
    for (const key in rightSidePoints) {
        const sphere = createSphereFromPoint(rightSidePoints[key]);
        sphere.name = key;
        carChipPoints.push(sphere);
        carState[key] = "OK";
    }
    for (const key in backPoints) {
        const sphere = createSphereFromPoint(backPoints[key]);
        sphere.name = key;
        carChipPoints.push(sphere);
        carState[key] = "OK";
    }
    for (const key in frontPoints) {
        const sphere = createSphereFromPoint(frontPoints[key]);
        sphere.name = key;
        carChipPoints.push(sphere);
        carState[key] = "OK";
    }
}

function updateCar() {
    // TODO
}

function onWindowResize() {
    renderer.setSize( window.innerWidth, window.innerHeight );

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    render();
}
function getIntersectFromClick(event) {
    const mousePosition = { x: 0, y: 0 };
    
    mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mousePosition, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        //console.log(intersects[0].point);
    }
    return intersects;
}


function onPointSelected(oObject) {
    const objectColor = oObject.material.color.getHex();

    if (objectColor === 0xa0a0a0) {
        oObject.material.color.setHex(0xffc814);
        carState[oObject.name] = "minorDamage";
    }
    else if (objectColor === 0xffc814) {
        oObject.material.color.setHex(0xc93a3a);
        carState[oObject.name] = "majorDamage";
    }
    else if (objectColor === 0xc93a3a) {
        oObject.material.color.setHex(0x333333);
        carState[oObject.name] = "broken";
    }
    else if (objectColor === 0x333333) {
        oObject.material.color.setHex(0xa0a0a0);
        carState[oObject.name] = "OK";
    } 
    render();
}

document.addEventListener('auxclick', function(e) {
    if (e.target.id === 'app' && e.button === 2) {
        const point3 = getIntersectFromClick(e)[0].point;
        if (point3.y > 0) {
            createSphereFromPoint(point3)
        }
    }
});

document.addEventListener('click', function(e) {
    if (e.target.id === 'app') {
        const intersect = getIntersectFromClick(e)[0];
        if (intersect.object && carChipPoints.includes(intersect.object)) {
            onPointSelected(intersect.object);
        }
    }
});

async function getBudget() {
    try {
        const response = await fetch('/diagnose', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ carState })
        });

        const data = await response.json();

        if (response.ok) {
            window.budgetFolder.destroy();
            window.budgetFolder = gui.addFolder('Budget Output');
            window.budgetFolder.open();

            window.budgetFolder.add({ 'Total Cost': data.total_cost }, 'Total Cost');

            data.parts.forEach((part, index) => {
                const partFolder = window.budgetFolder.addFolder(`Part ${index + 1}`);
                partFolder.add({ 'Part Name': part.part_name }, 'Part Name');
                partFolder.add({ 'Damage Level': part.damage_level }, 'Damage Level');
                partFolder.add({ 'Cost': part.cost }, 'Cost');
            });

        } else {
            alert(data.error || 'An error occurred while processing your request.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
}

export { carState }