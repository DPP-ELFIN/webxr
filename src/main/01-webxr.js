/** @format */

import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";
import { onWindowResize } from "../utils/index";
import * as handControls from "../utils/handControls";
// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
// 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 10);
scene.add(camera);
// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

const sphere = new THREE.SphereGeometry(1, 20, 20);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
const mesh = new THREE.Mesh(sphere, material);
scene.add(mesh);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
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

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});

window.addEventListener("resize", onWindowResize(camera, renderer));
