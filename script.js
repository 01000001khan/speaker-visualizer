import { Scene, PerspectiveCamera, AgXToneMapping, WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WebGLPathTracer, GradientEquirectTexture } from 'three-gpu-pathtracer'
import { ParallelMeshBVHWorker } from './ParallelMeshBVHWorker.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


function getScaledSettings() {

	let tiles = 3;
	let renderScale = Math.max( 1 / window.devicePixelRatio, 0.5 );

	// adjust performance parameters for mobile
	const aspectRatio = window.innerWidth / window.innerHeight;
	if ( aspectRatio < 0.65 ) {

		tiles = 4;
		renderScale = 0.5 / window.devicePixelRatio;

	}

	return { tiles, renderScale };

}

// init scene, renderer, camera, controls, etc
const scene = new Scene()

// set the environment map
const texture = new GradientEquirectTexture()
texture.bottomColor.set(0xffffff)
texture.bottomColor.set(0x666666)
texture.update()
scene.environment = texture
scene.background = texture

const [ gltf ] = await Promise.all( [
    new GLTFLoader().loadAsync( "./scene.glb" )
] );

scene.add( gltf.scene );

const camera = new PerspectiveCamera()


const renderer = new WebGLRenderer({ antialias: true })
renderer.toneMapping = AgXToneMapping
document.body.appendChild(renderer.domElement)

const { tiles, renderScale } = getScaledSettings();

const pathTracer = new WebGLPathTracer(renderer)
pathTracer.setBVHWorker( new ParallelMeshBVHWorker() );
pathTracer.renderScale = renderScale;
pathTracer.tiles.set( tiles, tiles );
pathTracer.renderDelay = 100;
pathTracer.fadeDuration = 0;
pathTracer.minSamples = 1; 
pathTracer.setScene(scene, camera)


let controls = new OrbitControls( camera, renderer.domElement );
controls.target.y = 10;
controls.addEventListener( 'change', () => pathTracer.updateCamera() );
controls.update();



onResize()

animate()

window.addEventListener('resize', onResize)

function animate() {
    // if the camera position changes call "ptRenderer.reset()"
    requestAnimationFrame(animate)

    // update the camera and render one sample
    pathTracer.renderSample()
}

function onResize() {
    // update rendering resolution
    const w = window.innerWidth
    const h = window.innerHeight

    renderer.setSize(w, h)
    renderer.setPixelRatio(window.devicePixelRatio)

    const aspect = w / h
    camera.aspect = aspect
    camera.updateProjectionMatrix()

    pathTracer.setScene(scene, camera)
}
