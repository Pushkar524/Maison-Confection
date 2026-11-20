let cachedSoftwareGl: boolean | null = null;

/**
 * Probes WebGL once per session to detect software renderers (SwiftShader/llvmpipe/WARP).
 * Avoids spinning up redundant probe WebGL contexts across multiple 3D canvases.
 */
export function isSoftwareWebGL(): boolean {
  if (cachedSoftwareGl !== null) return cachedSoftwareGl;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      cachedSoftwareGl = true;
      return true;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    cachedSoftwareGl = true;
  }
  return cachedSoftwareGl;
}

export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024);
}

export function getOptimalPixelRatio(
  isSoftwareGl: boolean,
  isMobile: boolean,
  maxDesktop = 1.75,
  maxMobile = 1.25
): number {
  if (isSoftwareGl) return 1;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  return Math.min(dpr, isMobile ? maxMobile : maxDesktop);
}
