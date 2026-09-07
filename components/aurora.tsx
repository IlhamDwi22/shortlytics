"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { cn } from "@/lib/utils";

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback, { passive: true });
  return () => window.removeEventListener("resize", callback);
}

function getSnapshot() {
  if (typeof window === "undefined") return true;
  const isNarrow = window.innerWidth < 768;
  const prefersReduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const isTouch =
    window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const isMobileAgent =
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent,
    );
  return isNarrow || prefersReduced || (isTouch && isMobileAgent);
}

function getServerSnapshot() {
  return true;
}

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uLightMode;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  
  vec3 auroraColor = intensity * rampColor;
  
  if (uLightMode > 0.5) {
    float energy = clamp(max(intensity, 0.0), 0.0, 1.0);
    float coverage = clamp(auroraAlpha * (0.55 + 0.45 * energy), 0.0, 0.86);
    vec3 chroma = pow(clamp(rampColor, 0.0, 1.0), vec3(1.2));
    float chromaPeak = max(chroma.r, max(chroma.g, chroma.b));
    chroma /= max(chromaPeak, 0.0001);
    fragColor = vec4(mix(vec3(1.0), chroma, min(coverage * 1.08, 0.94)), 1.0);
  } else {
    fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
  }
}
`;

export interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
  lightMode?: boolean;
  className?: string;
}

export default function Aurora(props: AuroraProps) {
  const {
    colorStops = ["#5227FF", "#7cff67", "#5227FF"],
    amplitude = 1.0,
    blend = 0.5,
    lightMode = false,
    className,
  } = props;
  const isMobileOrReduced = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const propsRef = useRef<AuroraProps>(props);
  const ctnDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    propsRef.current = props;
  });

  useEffect(() => {
    if (isMobileOrReduced) return;

    const ctn = ctnDom.current;
    if (!ctn) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: false, // false is faster and perceptually identical for ambient glow
        dpr: Math.min(
          typeof window !== "undefined" ? window.devicePixelRatio : 1,
          1.5,
        ),
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    if (!gl) return;

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = "transparent";
    gl.canvas.style.position = "absolute";
    gl.canvas.style.top = "0";
    gl.canvas.style.left = "0";
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.pointerEvents = "none";

    function resize() {
      if (!ctn || !renderer) return;
      const width = ctn.offsetWidth || ctn.clientWidth || window.innerWidth || 1200;
      const height = ctn.offsetHeight || ctn.clientHeight || window.innerHeight || 800;
      if (width > 0 && height > 0) {
        renderer.setSize(width, height);
        if (program) {
          program.uniforms.uResolution.value = [width, height];
        }
      }
    }
    window.addEventListener("resize", resize);

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(ctn);

    // Pause WebGL rendering loop when not visible in viewport to save CPU/GPU
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible = entry.isIntersecting;
        }
      },
      { rootMargin: "120px" },
    );
    intersectionObserver.observe(ctn);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) {
      delete geometry.attributes.uv;
    }

    const activeStops =
      colorStops.length >= 3 ? colorStops : ["#5227FF", "#7cff67", "#5227FF"];
    const colorStopsArray = activeStops.slice(0, 3).map((hex) => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    });

    const initWidth =
      ctn.offsetWidth || ctn.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 1200);
    const initHeight =
      ctn.offsetHeight || ctn.clientHeight || (typeof window !== "undefined" ? window.innerHeight : 800);

    const program: Program | undefined = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStopsArray },
        uResolution: { value: [initWidth, initHeight] },
        uBlend: { value: blend },
        uLightMode: { value: lightMode ? 1 : 0 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctn.appendChild(gl.canvas);

    let animateId = 0;
    const update = (t: number) => {
      animateId = requestAnimationFrame(update);
      if (!isVisible) return; // Skip rendering calculation when scrolled out of view

      const { time = t * 0.01, speed = 1.0 } = propsRef.current;
      if (program && ctn) {
        const curW = ctn.offsetWidth || ctn.clientWidth;
        const curH = ctn.offsetHeight || ctn.clientHeight;
        if (curW > 0 && curH > 0 && (renderer.width !== curW || renderer.height !== curH)) {
          renderer.setSize(curW, curH);
          program.uniforms.uResolution.value = [curW, curH];
        }

        program.uniforms.uTime.value = time * speed * 0.1;
        program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? 1.0;
        program.uniforms.uBlend.value = propsRef.current.blend ?? blend;
        program.uniforms.uLightMode.value = (propsRef.current.lightMode ?? lightMode) ? 1 : 0;
        const currentStops = propsRef.current.colorStops ?? colorStops;
        const validStops = currentStops.length >= 3 ? currentStops : ["#5227FF", "#7cff67", "#5227FF"];
        program.uniforms.uColorStops.value = validStops.slice(0, 3).map((hex: string) => {
          const c = new Color(hex);
          return [c.r, c.g, c.b];
        });
        renderer.render({ scene: mesh });
      }
    };
    animateId = requestAnimationFrame(update);

    resize();

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener("resize", resize);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [amplitude, blend, colorStops, lightMode, isMobileOrReduced]);

  if (isMobileOrReduced) {
    return (
      <div
        ref={ctnDom}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 w-full h-full overflow-hidden pointer-events-none",
          className,
        )}
      >
        {/* High-performance CSS-only ambient glow for mobile / reduced motion (zero GPU/WebGL overhead) */}
        <div
          className="absolute -top-[10%] -left-[15%] h-[75%] w-[130%] opacity-80 blur-3xl transform-gpu"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 35% 25%, rgba(124, 255, 103, 0.18) 0%, rgba(180, 151, 207, 0.12) 40%, rgba(82, 39, 255, 0.08) 70%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-[20%] -right-[20%] h-[60%] w-[90%] opacity-70 blur-3xl transform-gpu"
          style={{
            background:
              "radial-gradient(circle 50% at 65% 35%, rgba(82, 39, 255, 0.14) 0%, rgba(124, 255, 103, 0.08) 50%, transparent 80%)",
          }}
        />
      </div>
    );
  }

  return <div ref={ctnDom} className={cn("absolute inset-0 w-full h-full overflow-hidden", className)} />;
}

export { Aurora };
