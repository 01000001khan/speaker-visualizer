import { Scene, PerspectiveCamera, ACESFilmicToneMapping, WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WebGLPathTracer, GradientEquirectTexture } from 'three-gpu-pathtracer'
//import { ParallelMeshBVHWorker } from 'three-mesh-bvh/src/workers/ParallelMeshBVHWorker.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


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
renderer.toneMapping = THREE.AgXToneMapping
document.body.appendChild(renderer.domElement)

//const settings = getScaledSettings()
const pathTracer = new WebGLPathTracer(renderer)
pathTracer.renderScale = 1.0
pathTracer.tiles.setScalar(1)
pathTracer.renderDelay = 0;
pathTracer.fadeDuration = 0;
//pathTracer.setBVHWorker( new ParallelMeshBVHWorker() );
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
