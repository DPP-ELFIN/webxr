/** @format */
import * as THREE from "three";

export function onSelectstart(e) {
  this.userData.isSelecting = true;
  console.log(this, "onSelectstart");
}
export function onSelectEnd(e) {
  this.userData.isSelecting = false;
  console.log(this, "onSelectEnd");
}
export function onConnected(e) {
  this.add(buildController(e.data));
  console.log(this, "onConnected");
}
export function onDisconnected(e) {
  this.remove(this.children[0]);
  console.log(this, "onDisconnected");
}

function buildController(data) {
  let geometry, material;
  switch (data.targetRayMode) {
    case "tracked-pointer":
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3));
      geometry.setAttribute("color", new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));
      material = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });
      return new THREE.Line(geometry, material);
    case "gaze":
      geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
      material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
      return new THREE.Mesh(geometry, material);
  }
}
