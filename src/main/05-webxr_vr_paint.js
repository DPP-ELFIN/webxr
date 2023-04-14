/** @format */

import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TubePainter } from "three/examples/jsm/misc/TubePainter";
import * as handControls from "../utils/handControls";

let cursor = new THREE.Vector3();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 5, 5);
scene.add(camera);

const hemisphereLight = new THREE.HemisphereLight(0x808080, 0xffffff);
scene.add(hemisphereLight);
const directionalLight = new THREE.DirectionalLight(0x808080);
directionalLight.position.set(0, 1.6, 5);
scene.add(directionalLight);

/** */
const floor = new THREE.PlaneGeometry(15, 15);
const floorMateial = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.7, metalness: 0.1, side: THREE.DoubleSide });
const floorMesh = new THREE.Mesh(floor, floorMateial);
floorMesh.rotation.x = -Math.PI / 2;
scene.add(floorMesh);

/** */

const renderer = new THREE.WebGLRenderer();
renderer.xr.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));
const controls = new OrbitControls(camera, renderer.domElement);

const controler = renderer.xr.getController(0);
controler.addEventListener("selectstart", handControls.onSelectstart);
controler.addEventListener("selectend", handControls.onSelectEnd);
controler.addEventListener("squeezestart", onSqueezestart);
controler.addEventListener("squeezeend", onSqueezeend);
scene.add(controler);

/** */
// 创建画笔对象
const painter = new TubePainter();
controler.userData.painter = painter;
scene.add(painter.mesh);
// 创建画笔
const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 5);
geometry.rotateX(-Math.PI / 2);
const material = new THREE.MeshStandardMaterial({ flatShading: true });
const mesh = new THREE.Mesh(geometry, material);
const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.01, 3));
pivot.name = "pivot";
pivot.position.z = -0.05;
// mesh.rotateX(-Math.PI / 2);
mesh.add(pivot);
controler.add(mesh.clone());
console.log(controler);
/** */

renderer.setAnimationLoop(render);

/** */
function render() {
  const userData = controler.userData;
  const painter = userData.painter;
  const pivot = controler.getObjectByName("pivot");

  if (userData.isSqueeze) {
    const delta = (controller.position.y - userData.positionAtSqueezeStart) * 5;
    const scale = Math.max(0.1, userData.scaleAtSqueezeStart + delta);
    pivot.scale.setScalar(scale);
    painter.setSize(scale);
    console.log(painter);
  }
  cursor.setFromMatrixPosition(pivot.matrixWorld);
  if (userData.isSelecting === true) {
    painter.lineTo(cursor);
    painter.update();
  } else {
    painter.moveTo(cursor);
  }
  renderer.render(scene, camera);
}
function onSqueezestart(e) {
  this.userData.isSqueeze = true;
  this.userData.positionAtSqueezeStart = this.position.y;
  this.userData.scaleAtSqueezeStart = this.scale.x;
}
function onSqueezeend(e) {
  this.userData.isSqueezing = false;
}
/** */

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);
});
