var scene = null;//主场景
var camera = null;//主摄像头
var renderer = null;//主渲染
var controls = null;//主摄像头控制
var Devices = null;//主摄像头陀螺仪控制
var clock = new THREE.Clock();//主时钟
var raycaster = null;//主拾取射线
var INTERSECTED = null;//主拾取对象
var mouse = null;//主鼠标

/*****************************************************

					显示篇

*****************************************************/

var global_VR = true;

function IsPC() {
	var userAgentInfo = navigator.userAgent;
	var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
	var flag = true;
	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
	}
	return flag;
}

var global_is_pc = IsPC();

function range(a, b) {
	var result = [];
	for (var i = a; i < b; i++) {
		result.push(i);
	}
	return result;
}

function list_rm(list, a) {
	for (var i = 0; i < list.length; i++) {
		if (list[i] === a) {
			list.splice(i, 1);
			break;
		}
	}
}

const global_qipan = range(2, 83);
const global_qizi0 = global_qipan[global_qipan.length - 1] + 1;
const global_qizi1 = global_qizi0 + 1;
const global_qiangh = global_qizi1 + 1;
const global_qiangs = global_qiangh + 1;
const global_delete = global_qiangs + 1;
const global_qianglist = [];

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, 0, 100);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	//var light = new THREE.PointLight(0xffffff);
	//light.position.set(0, 250, 0);
	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(-25, -25, 10);
	directionalLight.name = '-1';
	scene.add(directionalLight);
	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(25, 25, 10);
	directionalLight.name = '-2';
	scene.add(directionalLight);

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();


	if (global_is_pc) {
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		controls = new THREE.OrbitControls(camera);
		document.addEventListener('mousemove', function (event) {
			event.preventDefault();
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
			raycaster.setFromCamera(mouse, camera);
			document.addEventListener('click', _mouse_click, false);
		}, false);
	}
	else {
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		if (global_VR) {
			Devices = new THREE.DeviceOrientationControls(camera);
			Devices.connect();
			Devices.update();
		}

		document.addEventListener('touchmove', function (event) {
			event.preventDefault();
			mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
			raycaster.setFromCamera(mouse, camera);
		}, false);
		document.addEventListener('touchstart', function (event) {
			event.preventDefault();
			mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
			raycaster.setFromCamera(mouse, camera);
			__render_event();
			_mouse_click(event);
		}, false);
		document.addEventListener('touchend', _mouse_click, false);
	}
}
const block_size = 5;
const block_interval = 2 + block_size;
function init_map() {
	var geometry = new THREE.BoxGeometry(block_size, block_size, block_size);
	var material = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture('img/timg.jpg'),
		color: 0xffffff,
		wireframe: false,
		opacity: 0.5
	});
	for (var y = 0; y < 9; y++) {
		for (var x = 0; x < 9; x++) {
			var cube1 = new THREE.Mesh(geometry, material.clone());
			cube1.name = y * 9 + x;
			cube1.translateOnAxis(new THREE.Vector3(block_interval * (x - 4), block_interval * (y - 4), 0), 1);
			cube1.userData['used'] = false;
			scene.add(cube1);
		}
	}

	var sphere = new THREE.Mesh(new THREE.SphereGeometry(block_size / 2, 32, 32), new THREE.MeshPhongMaterial({ color: 0x00ff00, opacity: 0.5 }));
	sphere.name = global_qizi0; sphere.userData['on'] = -1; scene.add(sphere);
	sphere = new THREE.Mesh(new THREE.SphereGeometry(block_size / 2, 32, 32), new THREE.MeshPhongMaterial({ color: 0xff0000, opacity: 0.5 }));
	sphere.name = global_qizi1; sphere.userData['on'] = -1; scene.add(sphere);
	_set_qizi(global_qizi0, 4);
	_set_qizi(global_qizi1, 76);

	var cube = new THREE.Mesh(new THREE.BoxGeometry(block_interval + block_size, block_interval - block_size, block_size + block_size), material.clone());
	cube.name = global_qiangh; scene.add(cube);
	cube = new THREE.Mesh(new THREE.BoxGeometry(block_interval - block_size, block_interval + block_size, block_size + block_size), material.clone());
	cube.name = global_qiangs; scene.add(cube);
	_set_qiang(global_qiangh, -1);
	_set_qiang(global_qiangs, -2);

	// load font
	new THREE.FontLoader().load('fonts/SimHei_Regular.json', function (font) {
		var text = new THREE.Mesh(new THREE.TextGeometry('删除', {
			size: block_size,
			height: block_interval - block_size,
			curveSegments: 12,
			font: font
		}), new THREE.MeshPhongMaterial({ color: 0x00ff00 }));
		text.translateOnAxis(new THREE.Vector3(2.5 * block_size, -10.3 * block_size, block_size).sub(text.position), 1);
		text.name = global_delete; scene.add(text);
	});
}

function animate() {
	requestAnimationFrame(animate);
	_render();
	_update();
}
function _update() {
	// delta = change in time since last call (in seconds)
	var delta = clock.getDelta();
	if (global_is_pc) {
		controls.update();
	} else if (global_VR) {
		Devices.update();
	}

}

function _render() {
	renderer.render(scene, camera);
	__render_event();
}

function __render_event() {
	switch (mouse_state) {
		case state_normal:
		case state_move:
			var intersects = raycaster.intersectObjects(scene.children);
			if (intersects.length > 0) {
				if (INTERSECTED != intersects[0].object) {
					if (INTERSECTED)
						if (_is_qipan_kong(INTERSECTED.name) && mouse_state == state_move)
							INTERSECTED.material.transparent = false;
					INTERSECTED = intersects[0].object;
					if (_is_qipan_kong(INTERSECTED.name) && mouse_state == state_move)
						INTERSECTED.material.transparent = true;
				}
			} else {
				if (INTERSECTED)
					if (_is_qipan_kong(INTERSECTED.name) && mouse_state == state_move)
						INTERSECTED.material.transparent = false;
				INTERSECTED = null;
			}
			break;
		case state_qiang:
			scene.children[mouse_choose].translateOnAxis(
				__qiang_move(
					raycaster.ray.origin.sub(raycaster.ray.direction.multiplyScalar(raycaster.ray.origin.z * 1.0 / raycaster.ray.direction.z))
				).sub(scene.children[mouse_choose].position), 1);
			break;
		case state_delete:
			var intersects = raycaster.intersectObjects(global_qianglist);
			if (intersects.length > 0) {
				if (INTERSECTED != intersects[0].object) {
					if (INTERSECTED)
						INTERSECTED.material.transparent = false;
					INTERSECTED = intersects[0].object;
					INTERSECTED.material.transparent = true;
				}
			} else {
				if (INTERSECTED)
					INTERSECTED.material.transparent = false;
				INTERSECTED = null;
			}
			break;
		default:
	}
}

function __qiang_move(postion) {
	result = postion.clone();
	result.z = block_size / 2.0;
	if (Math.abs(result.x) < block_interval * 4 && Math.abs(result.y) < block_interval * 4) {
		result.x = (Math.floor(result.x / block_interval) + 0.5) * block_interval;
		result.y = (Math.floor(result.y / block_interval) + 0.5) * block_interval;
		bool_qiang = true;
	}
	else
		bool_qiang = false;
	return result;
}

function _set_qizi(qizi, qipan) {
	qipan_y = Math.floor(qipan / 9);
	qipan_x = qipan - qipan_y * 9;
	var tmp = scene.children[qizi].userData['on'];
	if (tmp > -1) scene.children[tmp + global_qipan[0]].userData['used'] = false;
	scene.children[qizi].translateOnAxis(new THREE.Vector3(block_interval * (qipan_x - 4), block_interval * (qipan_y - 4), block_size).sub(scene.children[qizi].position), 1);
	scene.children[qizi].userData['on'] = qipan;
	scene.children[qipan + global_qipan[0]].userData['used'] = true;
}

function _set_qiang(qiqiang, qipan) {
	if (qipan == -1) {
		scene.children[qiqiang].translateOnAxis(new THREE.Vector3(-4 * block_size, -10 * block_size, block_size).sub(scene.children[qiqiang].position), 1);
	}
	else if (qipan == -2) {
		scene.children[qiqiang].translateOnAxis(new THREE.Vector3(0, -10 * block_size, block_size).sub(scene.children[qiqiang].position), 1);
	}
}


function _is_qizi(a) {
	return (a == global_qizi0 || a == global_qizi1);
}

function _is_qipan_kong(a) {
	if (a > -1 && a < global_qizi0)
		return !scene.children[a + global_qipan[0]].userData['used'];
	return false;
}

function _is_qiang(a) {
	return (a == global_qiangh || a == global_qiangs);
}

function _is_qiang_kong(obj) {
	if (obj.userData['hs'] == global_qiangh) {
		for (var i = 0; i < global_qianglist.length - 1; i++) {
			if (Math.abs(Math.round(global_qianglist[i].position.y - obj.position.y)) < block_interval) {
				if (Math.abs(Math.round(global_qianglist[i].position.x - obj.position.x)) < block_interval
					|| (Math.abs(Math.round(global_qianglist[i].position.x - obj.position.x)) < 2 * block_interval
						&& obj.userData['hs'] == global_qianglist[i].userData['hs']))
					return false;
			}
		}
	}
	else if (obj.userData['hs'] == global_qiangs) {
		for (var i = 0; i < global_qianglist.length - 1; i++) {
			if (Math.abs(Math.round(global_qianglist[i].position.x - obj.position.x)) < block_interval) {
				if (Math.abs(Math.round(global_qianglist[i].position.y - obj.position.y)) < block_interval
					|| (Math.abs(Math.round(global_qianglist[i].position.y - obj.position.y)) < 2 * block_interval
						&& obj.userData['hs'] == global_qianglist[i].userData['hs']))
					return false;
			}
		}
	}
	else {
		console.error('userData[\'hs\'] unknow');
	}
	return true;
}

function _is_delete(a) {
	return (a == global_delete);
}

const state_normal = 0;
const state_move = 1;
const state_qiang = 2;
const state_delete = 3;
var mouse_state = state_normal;
var mouse_choose = null;
var bool_qiang = false;

function _mouse_click(event) {
	switch (mouse_state) {
		case state_normal:
			if (INTERSECTED != null) {
				if (_is_qizi(INTERSECTED.name)) {
					INTERSECTED.material.transparent = true;
					mouse_choose = INTERSECTED.name;
					mouse_state = state_move;
				}
				else if (_is_qiang(INTERSECTED.name)) {
					var obj = new THREE.Mesh(INTERSECTED.geometry, INTERSECTED.material.clone()).copy(INTERSECTED);
					obj.material.transparent = true;
					obj.name = scene.children.length;
					mouse_choose = obj.name;
					obj.userData['hs'] = INTERSECTED.name;
					scene.add(obj);
					global_qianglist.push(obj);
					bool_qiang = false;
					mouse_state = state_qiang;
				}
				else if (_is_delete(INTERSECTED.name)) {
					INTERSECTED.material.color.set(0xff0000);
					mouse_state = state_delete;
				}
			}
			break;
		case state_move:
			if (INTERSECTED != null && _is_qipan_kong(INTERSECTED.name)) {
				_set_qizi(mouse_choose, INTERSECTED.name);
				scene.children[mouse_choose].material.transparent = false;
				INTERSECTED.material.transparent = false;
				mouse_choose = null;
				mouse_state = state_normal;
			}
			else {
				scene.children[mouse_choose].material.transparent = false;
				mouse_choose = null;
				mouse_state = state_normal;
			}
			break;
		case state_qiang:
			if (bool_qiang && _is_qiang_kong(scene.children[mouse_choose])) {
				scene.children[mouse_choose].material.transparent = false;
				mouse_choose = null;
				mouse_state = state_normal;
			}
			else {
				list_rm(global_qianglist, scene.children[mouse_choose]);
				list_rm(scene.children, scene.children[mouse_choose]);
				mouse_state = state_normal;
			}
			break;
		case state_delete:
			if (INTERSECTED != null) {
				list_rm(global_qianglist, INTERSECTED);
				list_rm(scene.children, INTERSECTED);
			}
			scene.children[global_delete].material.color.set(0x00ff00);
			mouse_state = state_normal;

			break;
		default:
	}
}



/*****************************************************

					算法篇

*****************************************************/


