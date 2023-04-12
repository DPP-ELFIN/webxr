/** @format */

import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry";
import { onWindowResize } from "../utils/index";
import * as handControls from "../utils/handControls";

const clock = new THREE.Clock();
const tempMatrix = new THREE.Matrix4();
// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x505050);
// 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 10);
scene.add(camera);
// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

// 灯光
const hemisphereLight = new THREE.HemisphereLight(0x606060, 0x404040);
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(1, 1, 1).normalize();
scene.add(light);
scene.add(hemisphereLight);
scene.add(light);

// room
const room = new THREE.LineSegments(new BoxLineGeometry(6, 6, 6, 10, 10, 10).translate(0, 3, 0), new THREE.LineBasicMaterial({ color: 0x808080 }));
scene.add(room);

// cube
const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
for (let index = 0; index < 200; index++) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
  mesh.position.set(Math.random() * 4 - 2, Math.random() * 4, Math.random() * 4 - 2);
  mesh.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);
  mesh.scale.set(Math.random() + 0.5, Math.random() + 0.5, Math.random() + 0.5);
  mesh.userData.velocity = new THREE.Vector3();
  mesh.userData.velocity.x = Math.random() * 0.01 - 0.005;
  mesh.userData.velocity.y = Math.random() * 0.01 - 0.005;
  mesh.userData.velocity.z = Math.random() * 0.01 - 0.005;
  room.add(mesh);
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));
renderer.xr.enabled = true;

// 手柄控制器
const control1 = renderer.xr.getController(0);
control1.addEventListener("selectstart", handControls.onSelectstart);
control1.addEventListener("selectend", handControls.onSelectEnd);
control1.addEventListener("connected", handControls.onConnected);
control1.addEventListener("disconnected", handControls.onDisconnected);
scene.add(control1);
// 控制器模型
const controllerModelFactory = new XRControllerModelFactory();
const controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
scene.add(controllerGrip1);

// 镭射交互
const raycaster = new THREE.Raycaster();

renderer.setAnimationLoop(render);
console.log(room.children[0]);
let INTERSECTED;
function render() {
  const delta = clock.getDelta() * 60;
  console.log(delta);
  if (control1.userData.isSelecting === true) {
    const cube = room.children[0];
    // room.remove(cube);
    cube.position.copy(control1.position);
    cube.userData.velocity.x = (Math.random() - 0.5) * 0.02 * delta;
    cube.userData.velocity.y = (Math.random() - 0.5) * 0.02 * delta;
    cube.userData.velocity.z = (Math.random() * 0.01 - 0.05) * delta;
    cube.userData.velocity.applyQuaternion(control1.quaternion);
    room.add(cube);
  }
  //   设置镭射交互的位置与方向
  tempMatrix.identity().extractRotation(control1.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(control1.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  const res = raycaster.intersectObjects(room.children, false);
  if (res.length > 0) {
    if (INTERSECTED != res[0].object) {
      if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
      INTERSECTED = res[0].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex(0xff0000);
    }
  } else {
    if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
    INTERSECTED = undefined;
  }
  for (let i = 0; i < room.children.length; i++) {
    const cube = room.children[i];

    cube.userData.velocity.multiplyScalar(1 - 0.001 * delta);

    cube.position.add(cube.userData.velocity);

    if (cube.position.x < -3 || cube.position.x > 3) {
      cube.position.x = THREE.MathUtils.clamp(cube.position.x, -3, 3);
      cube.userData.velocity.x = -cube.userData.velocity.x;
    }

    if (cube.position.y < 0 || cube.position.y > 6) {
      cube.position.y = THREE.MathUtils.clamp(cube.position.y, 0, 6);
      cube.userData.velocity.y = -cube.userData.velocity.y;
    }

    if (cube.position.z < -3 || cube.position.z > 3) {
      cube.position.z = THREE.MathUtils.clamp(cube.position.z, -3, 3);
      cube.userData.velocity.z = -cube.userData.velocity.z;
    }

    cube.rotation.x += cube.userData.velocity.x * 2 * delta;
    cube.rotation.y += cube.userData.velocity.y * 2 * delta;
    cube.rotation.z += cube.userData.velocity.z * 2 * delta;
  }
  renderer.render(scene, camera);
}

window.addEventListener("resize", onWindowResize(camera, renderer));
