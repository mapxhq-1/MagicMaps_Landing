import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uUseTricolor;
uniform vec3 uColorSaffron;
uniform vec3 uColorWhite;
uniform vec3 uColorGreen;
uniform float uBlendWidth;
uniform float uShowChakra;
uniform vec3 uChakraBlue;
uniform float uChakraRadius;
uniform float uChakraStrength;
uniform float uAmplitude;
uniform float uDistance;
uniform float uLineWidth;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

/* Equal thirds (1/3, 2/3) with soft blends so waves stay smooth across band edges */
vec3 threadColorAt(vec2 uv) {
    if (uUseTricolor < 0.5) {
        return uColor;
    }

    float x = uv.x;
    float e = uBlendWidth;
    float third = 1.0 / 3.0;

    float saffronToWhite = smoothstep(third - e, third + e, x);
    float whiteToGreen = smoothstep(2.0 * third - e, 2.0 * third + e, x);

    vec3 c = mix(uColorSaffron, uColorWhite, saffronToWhite);
    return mix(c, uColorGreen, whiteToGreen);
}

/* Ashoka Chakra–style wheel: circular, 24 spokes, centered in the white band */
float chakraWheelMask(vec2 uv) {
    float third = 1.0 / 3.0;
    float bandEdge = uBlendWidth * 2.0;
    float inWhite = smoothstep(third + bandEdge, third + bandEdge * 2.5, uv.x)
                  * (1.0 - smoothstep(2.0 * third - bandEdge * 2.5, 2.0 * third - bandEdge, uv.x));

    vec2 aspect = vec2(iResolution.x / max(iResolution.y, 1.0), 1.0);
    vec2 p = (uv - vec2(0.5, 0.5)) * aspect;
    float dist = length(p);
    float angle = atan(p.y, p.x);

    float outerDisc = 1.0 - smoothstep(uChakraRadius - 0.006, uChakraRadius, dist);
    float innerHole = smoothstep(uChakraRadius * 0.2, uChakraRadius * 0.26, dist);
    float ring = outerDisc * innerHole;

    float spokes = 0.28 + 0.72 * abs(cos(angle * 12.0));
    float hub = 1.0 - smoothstep(0.0, uChakraRadius * 0.08, dist);

    float wheel = max(ring * spokes, hub * 0.85);
    wheel *= inWhite;
    wheel *= 1.0 - smoothstep(uChakraRadius * 0.88, uChakraRadius, dist) * 0.15;

    return clamp(wheel, 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            uLineWidth * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }

    float colorVal = 1.0 - line_strength;
    vec3 rgb = threadColorAt(uv);

    if (uShowChakra > 0.5) {
        float chakra = chakraWheelMask(uv);
        float chakraMix = clamp(chakra * uChakraStrength * colorVal * 1.35, 0.0, 1.0);
        rgb = mix(rgb, uChakraBlue, chakraMix);
    }

    fragColor = vec4(rgb * colorVal, colorVal);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

/* Indian flag–style defaults: saffron | white | green in equal horizontal bands */
const DEFAULT_TRICOLOR = [
  [1.0, 0.6, 0.2],       // #FF9933 saffron
  [1.0, 1.0, 1.0],       // white
  [0.075, 0.533, 0.031], // #138808 green
];

const DEFAULT_CHAKRA_BLUE = [0.02, 0.08, 0.62]; // navy chakra, slightly brighter for visibility

const Threads = ({
  color = [1, 1, 1],
  tricolor = false,
  colorBands = DEFAULT_TRICOLOR,
  blendWidth = 0.040,
  chakra,
  chakraColor = DEFAULT_CHAKRA_BLUE,
  chakraRadius = 0.120,
  chakraStrength = 1.5,
  amplitude = 0,
  distance = 0,
  lineWidth = 8,
  enableMouseInteraction = false,
  ...rest
}) => {
  const showChakra = chakra !== undefined ? chakra : tricolor;
  const containerRef = useRef(null);
  const animationFrameId = useRef();

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const renderer = new Renderer({ alpha: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    container.appendChild(gl.canvas);
    gl.canvas.style.display = 'block';
    gl.canvas.style.pointerEvents = enableMouseInteraction ? 'auto' : 'none';

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        uColor: { value: new Color(...color) },
        uUseTricolor: { value: tricolor ? 1 : 0 },
        uColorSaffron: { value: new Color(...(colorBands[0] ?? DEFAULT_TRICOLOR[0])) },
        uColorWhite: { value: new Color(...(colorBands[1] ?? DEFAULT_TRICOLOR[1])) },
        uColorGreen: { value: new Color(...(colorBands[2] ?? DEFAULT_TRICOLOR[2])) },
        uBlendWidth: { value: blendWidth },
        uShowChakra: { value: showChakra ? 1 : 0 },
        uChakraBlue: { value: new Color(...chakraColor) },
        uChakraRadius: { value: chakraRadius },
        uChakraStrength: { value: chakraStrength },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uLineWidth: { value: lineWidth },
        uMouse: { value: new Float32Array([0.5, 0.5]) }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.iResolution.value.r = clientWidth;
      program.uniforms.iResolution.value.g = clientHeight;
      program.uniforms.iResolution.value.b = clientWidth / clientHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];

    function handleMouseMove(e) {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMouse = [x, y];
    }
    function handleMouseLeave() {
      targetMouse = [0.5, 0.5];
    }
    if (enableMouseInteraction) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    let isVisible = true;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(container);

    function update(t) {
      if (!isVisible) {
        animationFrameId.current = requestAnimationFrame(update);
        return;
      }

      if (enableMouseInteraction) {
        const smoothing = 0.05;
        currentMouse[0] += smoothing * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += smoothing * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }
      program.uniforms.iTime.value = t * 0.001;

      renderer.render({ scene: mesh });
      animationFrameId.current = requestAnimationFrame(update);
    }
    animationFrameId.current = requestAnimationFrame(update);

    return () => {
      visibilityObserver.disconnect();
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resize);

      if (enableMouseInteraction) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    color,
    tricolor,
    colorBands,
    blendWidth,
    showChakra,
    chakraColor,
    chakraRadius,
    chakraStrength,
    amplitude,
    distance,
    lineWidth,
    enableMouseInteraction,
  ]);

  return <div ref={containerRef} className="w-full h-full relative" {...rest} />;
};

export default Threads;
