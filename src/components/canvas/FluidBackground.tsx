import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Extend JSX.IntrinsicElements to fix TypeScript errors for R3F components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      planeGeometry: any;
      primitive: any;
    }
  }
}

// Also extend React's JSX namespace to ensure compatibility with different TS configs
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      planeGeometry: any;
      primitive: any;
    }
  }
}

// Custom Shader Material for Liquid/Smoke effect
const LiquidShaderMaterial = {
  uniforms: {
    u_time: { value: 0 },
    u_mouse: { value: new THREE.Vector2(0, 0) },
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_colorA: { value: new THREE.Color('#0a0a0a') },
    u_colorB: { value: new THREE.Color('#1a1a2e') },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    uniform vec3 u_colorA;
    uniform vec3 u_colorB;
    varying vec2 vUv;

    // Simplex noise function (simplified)
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 st = vUv;
      
      // Mouse interaction
      vec2 mouse = u_mouse * 0.5 + 0.5;
      float dist = distance(st, mouse);
      float interaction = smoothstep(0.5, 0.0, dist);
      
      // Flowing noise
      float noiseVal = snoise(st * 3.0 + u_time * 0.1 + interaction * 0.5);
      float noiseVal2 = snoise(st * 6.0 - u_time * 0.15);
      
      float finalNoise = mix(noiseVal, noiseVal2, 0.5);
      
      // Color mixing
      vec3 color = mix(u_colorA, u_colorB, finalNoise + 0.5);
      
      // Add grain
      float grain = fract(sin(dot(st.xy * u_time, vec2(12.9898,78.233))) * 43758.5453);
      color += grain * 0.05;

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

const BackgroundMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { mouse, viewport } = useThree();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.getElapsedTime();
      // Smoothly interpolate mouse position
      materialRef.current.uniforms.u_mouse.value.lerp(new THREE.Vector2(mouse.x, mouse.y), 0.1);
    }
  });

  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial(LiquidShaderMaterial), []);

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[2, 2]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
};

const FluidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <BackgroundMesh />
      </Canvas>
      {/* Cinematic Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
};

export default FluidBackground;