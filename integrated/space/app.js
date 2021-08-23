window.gltfLoader = new THREE.GLTFLoader();

class Reticle extends THREE.Object3D {
    constructor() {
        super();

        this.loader = new THREE.GLTFLoader();
        this.loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", (gltf) => {
            this.add(gltf.scene);
        })

        this.visible = false;
    }
}
// https://immersive-web.github.io/webxr-samples/media/gltf/space/space.gltf"
window.gltfLoader.load("https://yewchong2207.github.io/EduAR/Models/dog/scene.gltf", function(gltf) {
    const flower = gltf.scene.children.find(c => c.name === 'sunflower')
    // flower.castShadow = true;
    window.sunflower = gltf.scene;
});

window.DemoUtils = {
    /**
     * Creates a THREE.Scene containing lights that case shadows,
     * and a mesh that will receive shadows.
     *
     * @return {THREE.Scene}
     */
    createLitScene() {
      const scene = new THREE.Scene();

  
      // The materials will render as a black mesh
      // without lights in our scenes. Let's add an ambient light
      // so our material can be visible, as well as a directional light
      // for the shadow.
      const light = new THREE.AmbientLight(0xffffff, 1);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
      directionalLight.position.set(10, 15, 10);
  
      // We want this light to cast shadow.
      directionalLight.castShadow = true;
  
      // Make a large plane to receive our shadows
      const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
      // Rotate our plane to be parallel to the floor
      planeGeometry.rotateX(-Math.PI / 2);
  
      // Create a mesh with a shadow material, resulting in a mesh
      // that only renders shadows once we flip the `receiveShadow` property.
    //   const shadowMesh = new THREE.Mesh(planeGeometry, new THREE.ShadowMaterial({
    //     color: 0x111111,
    //     opacity: 0.2,
    //   }));
  
      // Give it a name so we can reference it later, and set `receiveShadow`
      // to true so that it can render our model's shadow.
    //   shadowMesh.name = 'shadowMesh';
    //   shadowMesh.receiveShadow = true;
    //   shadowMesh.position.y = 10000;
  
      // Add lights and shadow material to scene.
    //   scene.add(shadowMesh);
      scene.add(light);
      scene.add(directionalLight);
  
      return scene;
    },
  
    /**
     * Creates a THREE.Scene containing cubes all over the scene.
     *
     * @return {THREE.Scene}
     */
  };

let count = 0;
let clone = "";

function onNoXRDevice() {
    document.body.classList.add('unsupported');
}


    (async function() {
        const isArSessionSupported = navigator.xr && navigator.xr.isSessionSupported && await navigator.xr.isSessionSupported("immersive-ar");
        if (isArSessionSupported) {
        document.getElementById("enter-ar").addEventListener("click", window.app.activateXR)
        } else {
        onNoXRDevice();
        }
    })();

    class App {
    /**
     * Run when the Start AR button is pressed.
     */
        
        activateXR = async () => {
        try {
            // Initialize a WebXR session using "immersive-ar".
            this.xrSession = await navigator.xr.requestSession("immersive-ar", {
            requiredFeatures: ['hit-test', 'dom-overlay'],
            domOverlay: { root: document.body }
            });
    
            // Create the canvas that will contain our camera's background and our virtual scene.
            this.createXRCanvas();
    
            // With everything set up, start the app.
            await this.onSessionStarted();
        } catch(e) {
            console.log(e);
            onNoXRDevice();
        }
        }
    
        createXRCanvas() {
            this.canvas = document.createElement("canvas");
            document.body.appendChild(this.canvas);
            this.gl = this.canvas.getContext("webgl", {xrCompatible: true});
        
            this.xrSession.updateRenderState({
                baseLayer: new XRWebGLLayer(this.xrSession, this.gl)
            });
        }
    
        onSessionStarted = async () => {
            // Add the `ar` class to our body, which will hide our 2D components
            document.body.classList.add('ar');
        
            // To help with working with 3D on the web, we'll use three.js.
            this.setupThreeJs();
        
            // Setup an XRReferenceSpace using the "local" coordinate system.
            this.localReferenceSpace = await this.xrSession.requestReferenceSpace('local');
        
            // Create another XRReferenceSpace that has the viewer as the origin.
            this.viewerSpace = await this.xrSession.requestReferenceSpace('viewer');
            // Perform hit testing using the viewer as origin.
            this.hitTestSource = await this.xrSession.requestHitTestSource({ space: this.viewerSpace });
        
            // Start a rendering loop using this.onXRFrame.
            this.xrSession.requestAnimationFrame(this.onXRFrame);
        
            this.xrSession.addEventListener("select", this.onSelect);

            
        }
  
        
    onSelect = () => {
        if (window.sunflower) {
            if (count === 0) {
                clone = window.sunflower.clone();
                clone.position.copy(this.reticle.position);
                this.scene.add(clone)
                count = 1;
            } else {
                clone.position.copy(this.reticle.position);
            }
            
            // this.renderer.render(this.scene, this.camera)


            // const shadowMesh = this.scene.children.find(c => c.name === 'shadowMesh');
            // shadowMesh.position.y = clone.position.y;
        }
    }
  
    /**
     * Called on the XRSession's requestAnimationFrame.
     * Called with the time and XRPresentationFrame.
     */
    onXRFrame = (time, frame) => {
      // Queue up the next draw request.
      this.xrSession.requestAnimationFrame(this.onXRFrame);
  
      // Bind the graphics framebuffer to the baseLayer's framebuffer.
      const framebuffer = this.xrSession.renderState.baseLayer.framebuffer
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
      this.renderer.setFramebuffer(framebuffer);
  
      // Retrieve the pose of the device.
      // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
      const pose = frame.getViewerPose(this.localReferenceSpace);
      if (pose) {
        // In mobile AR, we only have one view.
        const view = pose.views[0];
  
        const viewport = this.xrSession.renderState.baseLayer.getViewport(view);
        this.renderer.setSize(viewport.width, viewport.height)
  
        // Use the view's transform matrix and projection matrix to configure the THREE.camera.
        this.camera.matrix.fromArray(view.transform.matrix)
        this.camera.projectionMatrix.fromArray(view.projectionMatrix);
        this.camera.updateMatrixWorld(true);
  
        // Conduct hit test.
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
  
        // If we have results, consider the environment stabilized.
        if (!this.stabilized && hitTestResults.length > 0) {
          this.stabilized = true;
          document.body.classList.add('stabilized');
        }
        if (hitTestResults.length > 0) {
          const hitPose = hitTestResults[0].getPose(this.localReferenceSpace);
  
          // Update the reticle position
          this.reticle.visible = true;
          this.reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
          this.reticle.updateMatrixWorld(true);
        }
  
        // Render the scene with THREE.WebGLRenderer.
        this.renderer.render(this.scene, this.camera)
      }
    }
  
    /**
     * Initialize three.js specific rendering code, including a WebGLRenderer,
     * a demo scene, and a camera for viewing the 3D content.
     */
    setupThreeJs() {
        // To help with working with 3D on the web, we'll use three.js.
        // Set up the WebGLRenderer, which handles rendering to our session's base layer.
        this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        preserveDrawingBuffer: true,
        canvas: this.canvas,
        context: this.gl
        });
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Initialize our demo scene.
        this.scene = DemoUtils.createLitScene();
        this.reticle = new Reticle();
        this.scene.add(this.reticle);

        // We'll update the camera matrices directly from API, so
        // disable matrix auto updates so three.js doesn't attempt
        // to handle the matrices independently.
        this.camera = new THREE.PerspectiveCamera();
        this.camera.matrixAutoUpdate = false;
    }
  };
  
    window.app = new App();
  