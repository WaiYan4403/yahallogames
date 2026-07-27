import * as THREE from "three";


// Scene
const scene = new THREE.Scene();


// Camera
const camera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    0,
    1
);


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("shader"),
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


// Load shader file
const fragmentShader = await fetch("./shaders/background.glsl")
    .then(response => {

        console.log("Shader loaded:", response.status);

        return response.text();

    });

// Variables sent to shader
const uniforms = {

    iTime: {
        value: 0
    },

    iResolution: {
        value: new THREE.Vector3(
            window.innerWidth,
            window.innerHeight,
            1
        )
    }

};


// Create shader material
const material = new THREE.ShaderMaterial({

    fragmentShader: fragmentShader,

    vertexShader: `

        void main(){

            gl_Position = vec4(position, 1.0);

        }

    `,

    uniforms: uniforms

});


// Full screen rectangle
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2,2),
    material
);

scene.add(plane);


// Animation
const clock = new THREE.Clock();


function animate(){

    requestAnimationFrame(animate);

    uniforms.iTime.value = clock.getElapsedTime();

    renderer.render(
        scene,
        camera
    );

}


animate();


// Resize handling
window.addEventListener("resize", ()=>{

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    uniforms.iResolution.value.set(
        window.innerWidth,
        window.innerHeight,
        1
    );

});