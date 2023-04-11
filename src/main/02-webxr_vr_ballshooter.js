/** @format */

import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry";
import { onWindowResize } from "../utils/index";
import * as handControls from "../utils/handControls";
let count = 0;
const radius = 0.08;
let normal = new THREE.Vector3();
const relativeVelocity = new THREE.Vector3();
const clock = new THREE.Clock();
// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x505050);
// 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 10);
scene.add(camera);
// 添加坐标轴辅助器
// const axesHelper = new THREE.AxesHelper(10);
// scene.add(axesHelper);

// 添加房间
const room = new THREE.LineSegments(new BoxLineGeometry(6, 6, 6, 10, 10, 10), new THREE.LineBasicMaterial({ color: 0x808080 }));
room.geometry.translate(0, 3, 0);
scene.add(room);
// 添加灯光
const hemisphereLight = new THREE.HemisphereLight(0x606060, 0x404040);
scene.add(hemisphereLight);
const directionalLight = new THREE.DirectionalLight(0xffffff);
scene.add(directionalLight);

// 添加缓存几何体
const geometry = new THREE.IcosahedronGeometry(0.08);
const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
// 添加200个
for (let index = 0; index < 10; index++) {
  const obj = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
  obj.position.x = Math.random() * 4 - 2;
  obj.position.y = Math.random() * 4;
  obj.position.z = Math.random() * 4 - 2;
  obj.userData.velocity = new THREE.Vector3();
  obj.userData.velocity.x = Math.random() * 0.01 - 0.005;
  obj.userData.velocity.y = Math.random() * 0.01 - 0.005;
  obj.userData.velocity.z = Math.random() * 0.01 - 0.005;
  room.add(obj);
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));
renderer.xr.enabled = true;

// 手柄控制器
const controller1 = renderer.xr.getController(0);
controller1.addEventListener("selectstart", handControls.onSelectstart);
controller1.addEventListener("selectend", handControls.onSelectEnd);
controller1.addEventListener("connected", handControls.onConnected);
controller1.addEventListener("disconnected", handControls.onDisconnected);
scene.add(controller1);
// 控制器模型
const controllerModelFactory = new XRControllerModelFactory();
const controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
scene.add(controllerGrip1);
console.log(room.children);
renderer.setAnimationLoop(render);
function render() {
  handleController(controller1);
  //

  const delta = clock.getDelta() * 0.8; // 运行时间

  const range = 3 - radius;

  for (let i = 0; i < room.children.length; i++) {
    const object = room.children[i];
    object.position.x += object.userData.velocity.x * delta;
    object.position.y += object.userData.velocity.y * delta;
    object.position.z += object.userData.velocity.z * delta;

    // keep objects inside room

    if (object.position.x < -range || object.position.x > range) {
      object.position.x = THREE.MathUtils.clamp(object.position.x, -range, range);
      object.userData.velocity.x = -object.userData.velocity.x;
    }

    if (object.position.y < radius || object.position.y > 6) {
      object.position.y = Math.max(object.position.y, radius);

      object.userData.velocity.x *= 0.98;
      object.userData.velocity.y = -object.userData.velocity.y * 0.8;
      object.userData.velocity.z *= 0.98;
    }

    if (object.position.z < -range || object.position.z > range) {
      object.position.z = THREE.MathUtils.clamp(object.position.z, -range, range);
      object.userData.velocity.z = -object.userData.velocity.z;
    }

    // for (let j = i + 1; j < room.children.length; j++) {
    //   const object2 = room.children[j];

    //   normal.copy(object.position).sub(object2.position);

    //   const distance = normal.length();

    //   if (distance < 2 * radius) {
    //     normal.multiplyScalar(0.5 * distance - radius);
    //     object.position.sub(normal);
    //     object2.position.add(normal);
    //     normal.normalize();
    //     relativeVelocity.copy(object.userData.velocity).sub(object2.userData.velocity);
    //     normal = normal.multiplyScalar(relativeVelocity.dot(normal));
    //     object.userData.velocity.sub(normal);
    //     object2.userData.velocity.add(normal);
    //   }
    // }
    // object.userData.velocity.y -= 9.8 * delta;
  }
  renderer.render(scene, camera);
}
function handleController(controller) {
  if (controller.userData.isSelecting) {
    const object = room.children[count++];
    object.position.copy(controller.position);
    object.userData.velocity.x = (Math.random() - 0.5) * 3;
    object.userData.velocity.y = (Math.random() - 0.5) * 3;
    object.userData.velocity.z = Math.random() - 9;
    object.userData.velocity.applyQuaternion(controller.quaternion);

    if (count === room.children.length) count = 0;
  }
}

window.addEventListener("resize", onWindowResize(camera, renderer));
