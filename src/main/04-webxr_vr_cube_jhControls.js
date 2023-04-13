/** @format */

import * as THREE from "three";
import { MeshBasicMaterial } from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import * as handControls from "../utils/handControls";
import { onWindowResize } from "../utils/index";

const clock = new THREE.Clock();
const geometries = [
  new THREE.BoxGeometry(0.2, 0.2, 0.2),
  new THREE.ConeGeometry(0.2, 0.2, 64),
  new THREE.CylinderGeometry(0.2, 0.2, 0.2, 64),
  new THREE.IcosahedronGeometry(0.2, 8),
  new THREE.TorusGeometry(0.2, 0.04, 64, 32),
];
const raycaster = new THREE.Raycaster();
const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
const line = new THREE.Line(geometry);
line.name = "line";
line.scale.z = 5;
let tempMatrix = new THREE.Matrix4();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x505050);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 50);
camera.position.set(0, 1.6, 3);
scene.add(camera);

const hemisphereLight = new THREE.HemisphereLight(0x808080, 0x606060);
scene.add(hemisphereLight);
const directionalLight = new THREE.DirectionalLight(0xff00ff);
directionalLight.position.set(0, 6, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.near = 0.5; //近端
directionalLight.shadow.camera.far = 50; //远端
directionalLight.shadow.mapSize.set(4096, 4096);
scene.add(directionalLight);

/**/
const floor = new THREE.PlaneGeometry(4, 4);
const floorMateial = new MeshBasicMaterial({ color: 0xeeeeee });
const floorMesh = new THREE.Mesh(floor, floorMateial);
floorMesh.receiveShadow = true;
floorMesh.rotation.x = -Math.PI / 2;
scene.add(floorMesh);

const group = new THREE.Group();
scene.add(group);
for (let index = 0; index < 50; index++) {
  const geometry = geometries[Math.floor(Math.random() * geometries.length)];
  const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, roughness: 0.5, metalness: 0.1 });
  const obj = new THREE.Mesh(geometry, material);
  obj.position.set(Math.random() * 4 - 2, Math.random() * 2, Math.random() * 4 - 2);
  obj.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);
  obj.castShadow = true;
  group.add(obj);
}
/**/

/**/
const renderer = new THREE.WebGLRenderer();
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.xr.enabled = true;
renderer.shadowMap.enabled = true;
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));
// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
const controler = renderer.xr.getController(0);
controler.addEventListener("selectstart", onSelectstart);
controler.addEventListener("selectend", onSelectEnd);
controler.add(line.clone());
scene.add(controler);
const controllerModelFactory = new XRControllerModelFactory();
const controlerModel = renderer.xr.getControllerGrip(0);
controlerModel.add(controllerModelFactory.createControllerModel(controlerModel));
scene.add(controlerModel);

/**/

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(devicePixelRatio);
});

/**/
const intersected = [];
let intersection = null;
renderer.setAnimationLoop(render);

function render() {
  cleanIntersected();
  intersectObjects(controler);
  renderer.render(scene, camera);
}
/**/

/* */
function intersectObjects(controller) {
  if (controller.userData.selected !== undefined) return;
  const line = controller.getObjectByName("line");
  const intersections = getIntersections(controller);
  if (intersections.length > 0) {
    const intersection = intersections[0];
    const object = intersection.object;
    object.material.emissive.r = 1;
    intersected.push(object);
    line.scale.z = intersection.distance;
  } else {
    line.scale.z = 5;
  }
}
function cleanIntersected() {
  while (intersected.length) {
    const object = intersected.pop();
    object.material.emissive.r = 0;
  }
}
function getIntersections(controler) {
  tempMatrix.identity().extractRotation(controler.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controler.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  const res = raycaster.intersectObjects(group.children, false);
  return res;
}
function onSelectstart(e) {
  const controller = e.target;
  const intersections = getIntersections(controller);
  if (intersections.length > 0) {
    const intersection = intersections[0];
    const object = intersection.object;
    object.material.emissive.b = 1;
    controller.attach(object);
    controller.userData.selected = object;
  }
}
function onSelectEnd(e) {
  const controller = e.target;
  if (controller.userData.selected !== undefined) {
    const object = controller.userData.selected;
    object.material.emissive.b = 0;
    group.attach(object);
    controller.userData.selected = undefined;
  }
}
/* */
